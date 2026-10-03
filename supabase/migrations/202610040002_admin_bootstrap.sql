begin;
-- A trusted project owner may preapprove exactly one email. Clients cannot read
-- or write this table. Promotion requires Auth's server-managed confirmation,
-- never a browser claim or user-editable metadata. Consumed approvals stay used.
create table account_private.admin_bootstrap (
  id boolean primary key default true check(id),
  approved_email text not null check(approved_email=lower(approved_email) and length(approved_email) between 3 and 254),
  consumed_at timestamptz,
  consumed_by uuid references auth.users(id) on delete set null
);
revoke all on account_private.admin_bootstrap from public,anon,authenticated;
alter table account_private.admin_bootstrap enable row level security;
create function account_private.bootstrap_verified_admin() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.email_confirmed_at is null then return new; end if;
  perform pg_advisory_xact_lock(841201);
  perform 1 from account_private.admin_bootstrap
    where id and consumed_at is null and approved_email=lower(new.email) for update;
  if not found then return new; end if;
  update public.account_profiles set role='admin' where id=new.id and status='active';
  if not found then return new; end if;
  update account_private.admin_bootstrap set consumed_at=now(),consumed_by=new.id where id;
  insert into public.account_audit(actor_id,target_id,action,details)
    values(new.id,new.id,'owner_bootstrap','{"method":"preapproved_verified_email"}');
  return new;
end $$;
revoke all on function account_private.bootstrap_verified_admin() from public,anon,authenticated;
-- PostgreSQL executes same-event triggers alphabetically: the account profile
-- must exist before this trigger runs on a newly created, verified Auth user.
create trigger z_bootstrap_verified_admin after insert or update of email,email_confirmed_at on auth.users
  for each row execute function account_private.bootstrap_verified_admin();
commit;
