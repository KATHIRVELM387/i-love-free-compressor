begin;
create schema if not exists account_private;
revoke all on schema account_private from public, anon, authenticated;

create table public.account_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (length(display_name)<=80),
  role text not null default 'member' check (role in ('member','admin')),
  status text not null default 'active' check (status in ('active','suspended','deleting')),
  quota_bytes bigint not null default 20000000 check (quota_bytes between 0 and 20000000),
  preferences jsonb not null default '{}'::jsonb check (jsonb_typeof(preferences)='object' and octet_length(preferences::text)<=8000),
  created_at timestamptz not null default now()
);
create table public.account_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.account_profiles(id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  mime text not null check (mime in ('image/jpeg','image/png','image/webp','application/pdf','application/zip','text/plain')),
  size_bytes bigint not null check (size_bytes between 1 and 5000000),
  tool text not null check (length(tool) between 1 and 40),
  state text not null default 'pending' check (state in ('pending','ready')),
  created_at timestamptz not null default now()
);
create index account_files_owner on public.account_files(user_id);
create table public.account_history (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.account_profiles(id) on delete cascade,
  tool text not null check (length(tool) between 1 and 40), details text not null check (length(details)<=500),
  created_at timestamptz not null default now()
);
create index account_history_owner_date on public.account_history(user_id,created_at desc);
create table public.account_audit (
  id bigint generated always as identity primary key, actor_id uuid, target_id uuid,
  action text not null, details jsonb not null default '{}', created_at timestamptz not null default now()
);
create table account_private.limits (id boolean primary key default true check(id), storage_bytes bigint not null check(storage_bytes between 0 and 800000000));
insert into account_private.limits values (true,800000000);
revoke all on account_private.limits from public,anon,authenticated;
alter table account_private.limits enable row level security;
revoke all on sequence public.account_audit_id_seq from public,anon,authenticated;

create function account_private.new_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.account_profiles(id,display_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'full_name',''),80));
  return new;
end $$;
create trigger create_account_profile after insert on auth.users for each row execute function account_private.new_profile();
insert into public.account_profiles(id,display_name) select id,left(coalesce(raw_user_meta_data->>'full_name',''),80) from auth.users on conflict do nothing;

create function account_private.active() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.account_profiles where id=auth.uid() and status='active')
$$;
create function account_private.admin() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.account_profiles where id=auth.uid() and role='admin' and status='active')
$$;
grant usage on schema account_private to authenticated;
grant execute on function account_private.active(),account_private.admin() to authenticated;

alter table public.account_profiles enable row level security;
alter table public.account_files enable row level security;
alter table public.account_history enable row level security;
alter table public.account_audit enable row level security;
revoke all on public.account_profiles,public.account_files,public.account_history,public.account_audit from public,anon,authenticated;
grant select on public.account_profiles,public.account_files,public.account_history,public.account_audit to authenticated;
grant update(display_name,preferences) on public.account_profiles to authenticated;
grant delete on public.account_history to authenticated;
create policy own_profile on public.account_profiles for select to authenticated using(id=auth.uid());
create policy edit_own_profile on public.account_profiles for update to authenticated using(id=auth.uid() and status='active') with check(id=auth.uid() and status='active');
create policy own_files on public.account_files for select to authenticated using(user_id=auth.uid() and account_private.active());
create policy own_history on public.account_history for select to authenticated using(user_id=auth.uid() and account_private.active());
create policy clear_own_history on public.account_history for delete to authenticated using(user_id=auth.uid() and account_private.active());
create policy admin_audit on public.account_audit for select to authenticated using(account_private.admin());

create function public.record_account_activity(p_tool text,p_details text) returns void language plpgsql security definer set search_path='' as $$
begin
  if not account_private.active() then raise exception 'Account unavailable'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,1));
  if coalesce((select preferences->>'history' from public.account_profiles where id=auth.uid()),'true')='false' then return; end if;
  insert into public.account_history(user_id,tool,details) values(auth.uid(),p_tool,p_details);
  delete from public.account_history where user_id=auth.uid() and id not in(select id from public.account_history where user_id=auth.uid() order by created_at desc,id desc limit 100);
end $$;

create function public.reserve_account_file(p_name text,p_mime text,p_size bigint,p_tool text) returns public.account_files language plpgsql security definer set search_path='' as $$
declare result public.account_files; quota bigint;
begin
  perform pg_advisory_xact_lock(841201);
  select quota_bytes into quota from public.account_profiles where id=auth.uid() and status='active';
  if quota is null then raise exception 'Account unavailable'; end if;
  if p_size is null or p_size<1 or p_size>5000000 then raise exception 'Save files up to 5 MB'; end if;
  if (select count(*) from public.account_files where user_id=auth.uid())>=100 then raise exception 'Maximum 100 saved files; delete files first'; end if;
  if (select coalesce(sum(case when state='pending' then 5000000 else size_bytes end),0) from public.account_files where user_id=auth.uid() )+5000000>quota then raise exception 'Your storage is full; delete files first'; end if;
  if (select coalesce(sum(case when state='pending' then 5000000 else size_bytes end),0) from public.account_files )+5000000>(select storage_bytes from account_private.limits where id) then raise exception 'Site storage is full; local downloads are still available'; end if;
  insert into public.account_files(user_id,name,mime,size_bytes,tool) values(auth.uid(),p_name,p_mime,p_size,p_tool) returning * into result;
  return result;
end $$;

-- Pending uploads reserve the full bucket limit until finalization verifies actual bytes.
-- Every object must have a charged reservation, and may be inserted once only.
-- The same transaction lock serializes insertion with reservation release/deletion.
create function account_private.storage_allowed(object_name text, object_metadata jsonb, writing boolean) returns boolean language plpgsql volatile security definer set search_path='' as $$
begin
  if writing then perform pg_advisory_xact_lock(841201); end if;
  return account_private.active() and exists (
    select 1 from public.account_files f where f.user_id=auth.uid() and object_name=f.user_id::text||'/'||f.id::text
    and (not writing or (f.state='pending' and coalesce((object_metadata->>'size')::bigint,0)<=f.size_bytes))
  );
end $$;
grant execute on function account_private.storage_allowed(text,jsonb,boolean) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('account-files','account-files',false,5000000,array['image/jpeg','image/png','image/webp','application/pdf','application/zip','text/plain']) on conflict(id) do update set public=false,file_size_limit=5000000,allowed_mime_types=excluded.allowed_mime_types;
create policy account_object_read on storage.objects for select to authenticated using(bucket_id='account-files' and account_private.storage_allowed(name,metadata,false));
create policy account_object_insert on storage.objects for insert to authenticated with check(bucket_id='account-files' and account_private.storage_allowed(name,metadata,true));
create policy account_object_delete on storage.objects for delete to authenticated using(bucket_id='account-files' and account_private.storage_allowed(name,metadata,false));

create function public.complete_account_file(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
  perform pg_advisory_xact_lock(841201);
  if not account_private.active() then raise exception 'Account unavailable'; end if;
  update public.account_files f set state='ready' where f.id=p_id and f.user_id=auth.uid() and exists(select 1 from storage.objects o where o.bucket_id='account-files' and o.name=f.user_id::text||'/'||f.id::text and (o.metadata->>'size')::bigint=f.size_bytes);
  if not found then raise exception 'Upload is incomplete; remove it from My files and retry'; end if;
end $$;
create function public.release_account_file(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
  perform pg_advisory_xact_lock(841201);
  if not account_private.active() then raise exception 'Account unavailable'; end if;
  if exists(select 1 from storage.objects where bucket_id='account-files' and name=auth.uid()::text||'/'||p_id::text) then raise exception 'Remove the stored file before releasing its quota'; end if;
  delete from public.account_files where id=p_id and user_id=auth.uid();
end $$;

create function public.admin_account_list() returns table(id uuid,display_name text,email text,role text,status text,quota_bytes bigint,used_bytes bigint,created_at timestamptz) language plpgsql security definer set search_path='' as $$
begin
  if not account_private.admin() then raise exception 'Administrator access required'; end if;
  return query select p.id,p.display_name,u.email::text,p.role,p.status,p.quota_bytes,coalesce((select sum(case when f.state='pending' then 5000000 else f.size_bytes end)::bigint from public.account_files f where f.user_id=p.id),0),p.created_at from public.account_profiles p join auth.users u on u.id=p.id order by p.created_at desc limit 500;
end $$;
create function public.admin_update_account(p_id uuid,p_role text,p_status text,p_quota bigint) returns void language plpgsql security definer set search_path='' as $$
declare old_row public.account_profiles;
begin
  perform pg_advisory_xact_lock(841201);
  if not account_private.admin() then raise exception 'Administrator access required'; end if;
  if p_id=auth.uid() then raise exception 'An administrator cannot change their own access'; end if;
  select * into old_row from public.account_profiles where id=p_id for update;
  if not found or old_row.status='deleting' then raise exception 'Account unavailable'; end if;
  if p_role not in ('member','admin') or p_status not in ('active','suspended') or p_quota is null or p_quota<0 or p_quota>20000000 then raise exception 'Invalid account settings'; end if;
  update public.account_profiles set role=p_role,status=p_status,quota_bytes=p_quota where id=p_id;
  insert into public.account_audit(actor_id,target_id,action,details) values(auth.uid(),p_id,'account_updated',jsonb_build_object('old_role',old_row.role,'role',p_role,'old_status',old_row.status,'status',p_status,'quota_bytes',p_quota));
end $$;
create function public.admin_storage_limit(p_bytes bigint) returns void language plpgsql security definer set search_path='' as $$
begin
  perform pg_advisory_xact_lock(841201);
  if not account_private.admin() then raise exception 'Administrator access required'; end if;
  if p_bytes is null or p_bytes<0 or p_bytes>800000000 then raise exception 'Use a limit from 0 to 800 MB'; end if;
  update account_private.limits set storage_bytes=p_bytes where id;
  insert into public.account_audit(actor_id,action,details) values(auth.uid(),'storage_limit_updated',jsonb_build_object('bytes',p_bytes));
end $$;
create function public.admin_storage_usage() returns jsonb language plpgsql security definer set search_path='' as $$
begin
  if not account_private.admin() then raise exception 'Administrator access required'; end if;
  return jsonb_build_object('used_bytes',(select coalesce(sum(case when state='pending' then 5000000 else size_bytes end),0) from public.account_files),'limit_bytes',(select storage_bytes from account_private.limits where id));
end $$;

-- Only the authenticated user can request deletion. The Edge Function then
-- removes their bucket objects before deleting Auth, which cascades app data.
create function public.begin_account_deletion() returns void language plpgsql security definer set search_path='' as $$
begin
  perform pg_advisory_xact_lock(841201);
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if exists(select 1 from public.account_profiles where id=auth.uid() and role='admin' and status='active') and not exists(select 1 from public.account_profiles where id<>auth.uid() and role='admin' and status='active') then raise exception 'Assign another active administrator before deleting your account'; end if;
  update public.account_profiles set status='deleting' where id=auth.uid();
end $$;

-- No implicit PUBLIC execution grants, including helper functions.
revoke all on all functions in schema account_private from public,anon;
revoke all on function public.record_account_activity(text,text),public.reserve_account_file(text,text,bigint,text),public.complete_account_file(uuid),public.release_account_file(uuid),public.admin_account_list(),public.admin_update_account(uuid,text,text,bigint),public.admin_storage_limit(bigint),public.admin_storage_usage(),public.begin_account_deletion() from public,anon;
grant execute on function public.record_account_activity(text,text),public.reserve_account_file(text,text,bigint,text),public.complete_account_file(uuid),public.release_account_file(uuid),public.admin_account_list(),public.admin_update_account(uuid,text,text,bigint),public.admin_storage_limit(bigint),public.admin_storage_usage(),public.begin_account_deletion() to authenticated;
commit;
