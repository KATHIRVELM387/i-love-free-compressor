begin;
-- Metadata-only operations never alter ownership, storage paths, or quotas.
alter table public.account_files add column folder text not null default '' check(length(folder)<=60);
create function public.update_account_file(p_id uuid,p_name text,p_folder text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not account_private.active() then raise exception 'Active account required'; end if;
 if length(trim(p_name)) not between 1 and 120 or p_name ~ '[\x00-\x1f/\\]' or length(p_folder)>60 then raise exception 'Invalid file or folder name'; end if;
 update public.account_files set name=trim(p_name),folder=trim(p_folder) where id=p_id and user_id=auth.uid();
 if not found then raise exception 'File not found'; end if;
end $$;
create table account_private.announcement(id boolean primary key default true check(id),body text not null default '' check(length(body)<=500),revision bigint not null default 0);
insert into account_private.announcement(id) values(true);
alter table account_private.announcement enable row level security;
revoke all on account_private.announcement from public,anon,authenticated;
create function public.site_announcement() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('body',body,'revision',revision) from account_private.announcement where id;
$$;
create function public.admin_set_announcement(p_body text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not account_private.admin() then raise exception 'Admin required'; end if;
 if p_body is null or length(p_body)>500 then raise exception 'Use up to 500 characters'; end if;
 update account_private.announcement set body=trim(p_body),revision=revision+1 where id;
 insert into public.account_audit(actor_id,action,details) values(auth.uid(),'announcement_updated',jsonb_build_object('length',length(trim(p_body))));
end $$;
create function public.admin_workspace_stats() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not account_private.admin() then raise exception 'Admin required'; end if;
 return jsonb_build_object('total',(select count(*) from public.account_profiles),'active',(select count(*) from public.account_profiles where status='active'),'suspended',(select count(*) from public.account_profiles where status='suspended'),'admins',(select count(*) from public.account_profiles where role='admin' and status='active'),'files',(select count(*) from public.account_files));
end $$;
revoke all on function public.update_account_file(uuid,text,text),public.site_announcement(),public.admin_set_announcement(text),public.admin_workspace_stats() from public,anon,authenticated;
grant execute on function public.site_announcement() to anon,authenticated;
grant execute on function public.update_account_file(uuid,text,text),public.admin_set_announcement(text),public.admin_workspace_stats() to authenticated;

commit;
