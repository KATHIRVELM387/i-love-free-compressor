import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
const A = '00000000-0000-4000-8000-000000000001';
const B = '00000000-0000-4000-8000-000000000002';
const C = '00000000-0000-4000-8000-000000000003';
const q = (sql, params = []) => db.query(sql, params);
const rows = async (sql, params = []) => (await q(sql, params)).rows;
async function as(id, role = 'authenticated') {
  await db.exec('reset role');
  await q("select set_config('request.jwt.claim.sub',$1,false)", [id || '']);
  await db.exec('set role ' + role);
}
async function denied(sql, params = [], pattern = /permission|policy|access|unavailable|full|incomplete|quota|5 MB|administrator/i) {
  await assert.rejects(q(sql, params), pattern);
}
const reserve = async (size = 100) => (await rows("select * from public.reserve_account_file('photo.png','image/png',$1,'compress')", [size]))[0];
const insert = async (owner, file, size) => q("insert into storage.objects(bucket_id,name,metadata) values('account-files',$1,$2)", [`${owner}/${file.id}`, JSON.stringify(size === null ? {} : { size })]);
try {
  // Supabase provides these schemas. All application functions/policies below
  // are the production migration, executed by PostgreSQL, not mocked SQL.
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated;
    grant execute on function auth.uid() to anon,authenticated;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid() primary key,bucket_id text,name text,metadata jsonb,unique(bucket_id,name));
    alter table storage.objects enable row level security;
    grant select,insert,update,delete on storage.objects to authenticated;`);
  await db.exec(await readFile(new URL('../supabase/migrations/202610040001_accounts.sql', import.meta.url), 'utf8'));
  for (const id of [A,B,C]) await q("insert into auth.users(id,email,raw_user_meta_data) values($1,$2,'{\"role\":\"admin\",\"full_name\":\"Member\"}')",[id,id+'@example.test']);
  await as(null, 'anon');
  await denied('select * from public.account_profiles');
  await denied("select public.reserve_account_file('x','image/png',1,'compress')");
  await as(A);
  assert.equal((await rows('select * from public.account_profiles')).length,1);
  assert.equal((await rows('select role from public.account_profiles'))[0].role,'member');
  await denied("update public.account_profiles set role='admin'");
  await denied('update public.account_profiles set quota_bytes=99999999');
  await denied("update public.account_profiles set status='active'");
  await denied('select * from public.admin_account_list()');
  await denied('update account_private.limits set storage_bytes=800000000');
  assert.equal((await q("update public.account_profiles set display_name='intrusion' where id=$1",[B])).affectedRows,0);
  await q("update public.account_profiles set display_name='My name' where id=$1",[A]);
  console.log('PASS guest isolation, profile ownership, forged metadata, and role/quota escalation blocked');
  await denied("select public.reserve_account_file('x','image/png',5000001,'compress')");
  const file = await reserve();
  await denied('select public.complete_account_file($1)',[file.id]);
  await denied("insert into storage.objects(bucket_id,name,metadata) values('account-files',$1,'{\"size\":100}')",[`${B}/${file.id}`]);
  await denied("insert into storage.objects(bucket_id,name,metadata) values('account-files',$1,'{\"size\":100}')",[`${A}/${C}`]);
  await denied("insert into storage.objects(bucket_id,name,metadata) values('account-files',$1,'{\"size\":101}')",[`${A}/${file.id}`]);
  await insert(A,file,100);
  await q('select public.complete_account_file($1)',[file.id]);
  await denied('select public.release_account_file($1)',[file.id],/Remove the stored file/);
  assert.equal((await q("update storage.objects set metadata='{\"size\":1}'")).affectedRows,0);
  await as(B);
  assert.equal((await rows('select * from public.account_files')).length,0);
  assert.equal((await rows('select * from storage.objects')).length,0);
  assert.equal((await q('delete from storage.objects')).affectedRows,0);
  await denied('select public.complete_account_file($1)',[file.id]);
  await q('select public.release_account_file($1)',[file.id]);
  await as(A);
  assert.equal((await rows('select * from public.account_files')).length,1);
  // Even when Storage initially has no metadata, a full 5 MB reservation is
  // charged until exact actual bytes are verified on finalization.
  const incomplete = await reserve(1); await insert(A,incomplete,null);
  await denied('select public.complete_account_file($1)',[incomplete.id]);
  await reserve(); await reserve();
  await denied("select public.reserve_account_file('x','image/png',1,'compress')");
  await q('delete from storage.objects');
  for (const f of await rows('select id from public.account_files')) await q('select public.release_account_file($1)',[f.id]);
  assert.equal((await rows('select * from public.account_files')).length,0);
  console.log('PASS private storage, reserved paths, exact upload size, quota charging, and safe release');
  for (let i=0;i<105;i++) await q("select public.record_account_activity('resize',$1)",[String(i)]);
  assert.equal((await rows('select count(*)::integer as n from public.account_history'))[0].n,100);
  await q("update public.account_profiles set preferences='{\"history\":false}'");
  await q("select public.record_account_activity('resize','not recorded')");
  assert.equal((await rows("select * from public.account_history where details='not recorded'")).length,0);
  await as(B); assert.equal((await rows('select * from public.account_history')).length,0);
  await db.exec('reset role'); await q("update public.account_profiles set role='admin' where id=$1",[C]);
  await as(C);
  assert.equal((await rows('select * from public.admin_account_list()')).length,3);
  await denied('select public.admin_update_account($1,$2,$3,$4)',[C,'member','active',20000000],/own access/);
  await denied('select public.begin_account_deletion()',[],/another active administrator/);
  await q('select public.admin_storage_limit(5000000)');
  await as(B); const b = await reserve();
  await as(A); await denied("select public.reserve_account_file('x','image/png',1,'compress')",[],/Site storage/);
  await as(C);
  assert.equal((await rows('select * from public.account_files')).length,0);
  assert.equal((await rows('select * from storage.objects')).length,0);
  await q('select public.admin_update_account($1,$2,$3,$4)',[B,'member','suspended',20000000]);
  await as(B);
  assert.equal((await rows('select * from public.account_files')).length,0);
  await denied("select public.record_account_activity('resize','no')");
  await denied("select public.reserve_account_file('x','image/png',1,'compress')");
  await q('select public.begin_account_deletion()');
  assert.equal((await rows('select status from public.account_profiles'))[0].status,'deleting');
  await as(C); await q('select public.admin_update_account($1,$2,$3,$4)',[A,'admin','active',20000000]);
  await as(A); await q('select public.admin_update_account($1,$2,$3,$4)',[C,'member','active',20000000]);
  await as(C); await denied('select * from public.admin_account_list()');
  assert.equal((await rows('select * from public.account_audit')).length,0);
  await as(A); assert.ok((await rows('select * from public.account_audit')).length>=4);
  await db.exec('reset role'); await q('delete from auth.users where id=$1',[B]);
  assert.equal((await rows('select * from public.account_files where id=$1',[b.id])).length,0);
  console.log('PASS bounded/optional history, admin audit, live role revocation, suspension, last-admin protection, and deletion cascade');
} finally { await db.close(); }
