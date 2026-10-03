// Opt-in hosted acceptance check. Creates disposable users without sending mail,
// exercises real Auth/Storage/Edge permissions, and removes only those users.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { accountConfig } from '../public/account-config.js';
import { imagesToPdf } from '../public/pdf.js';
import { makeZip } from '../public/zip.js';
const ref = process.argv[2];
if (!/^[a-z]{20}$/.test(ref || '') || accountConfig.url !== `https://${ref}.supabase.co`) throw new Error('Pass the project ref matching the public account config.');
if (!process.argv.includes('--confirm-live-test')) throw new Error('This creates/deletes disposable test users. Pass --confirm-live-test to run.');
const cli = process.env.SUPABASE_CLI || 'supabase';
const command = args => JSON.parse(execFileSync(cli, [...args, '--output-format', 'json'], {encoding:'utf8',stdio:['ignore','pipe','pipe']}));
const keys = command(['projects','api-keys','--project-ref',ref,'--reveal']).keys;
const secret = keys.find(k=>k.name==='service_role')?.api_key || keys.find(k=>k.type==='secret')?.api_key;
assert.ok(secret, 'A server credential is required for creating and cleaning up test users.');
const options = {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const service = createClient(accountConfig.url,secret,options);
const publicClient = () => createClient(accountConfig.url,accountConfig.publishableKey,{...options,global:{headers:{Origin:'https://ilovefreecompressor.vercel.app'}}});
const ok = result => { if(result.error)throw new Error(result.error.message);return result.data; };
const users=[];let originalLimit, admin;
const query = sql => command(['db','query','--linked','--project-ref',ref,sql]).rows;
async function disposable() {
  const password=randomUUID()+randomUUID(), email=`ilfc-check-${randomUUID()}@example.com`;
  const {user}=ok(await service.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:'Disposable account check'}}));
  users.push(user.id);const client=publicClient();ok(await client.auth.signInWithPassword({email,password}));return {id:user.id,client};
}
try {
  const a=await disposable(),b=await disposable();admin=await disposable();
  assert.match(admin.id,/^[0-9a-f-]{36}$/);
  query(`update public.account_profiles set role='admin' where id='${admin.id}'::uuid`);
  originalLimit=ok(await admin.client.rpc('admin_storage_usage')).limit_bytes;
  assert.ok((await publicClient().from('account_profiles').select('*')).error);
  assert.equal(ok(await a.client.from('account_profiles').select('*')).length,1);
  assert.ok((await a.client.from('account_profiles').update({role:'admin'}).eq('id',a.id)).error);
  assert.ok((await a.client.rpc('admin_account_list')).error);
  console.log('PASS hosted anonymous isolation, profile ownership, and role escalation protection');
  const jpeg=execFileSync('python3',['-c',"from PIL import Image; import io,sys; b=io.BytesIO(); Image.new('RGB',(2,2),(90,40,150)).save(b,format='JPEG'); sys.stdout.buffer.write(b.getvalue())"]);
  const jpg=new Blob([jpeg],{type:'image/jpeg'});
  const text=new Blob(['#5a2896\n'],{type:'text/plain'});
  const pdf=imagesToPdf([{blob:jpg,width:2,height:2}]);
  const zip=await makeZip([{name:'photo.jpg',blob:jpg}]);
  for(const [name,blob,tool] of [['photo.jpg',jpg,'compress'],['palette.txt',text,'palette'],['photos.pdf',pdf,'pdf'],['photos.zip',zip,'batch']]) {
    const f=ok(await a.client.rpc('reserve_account_file',{p_name:name,p_mime:blob.type,p_size:blob.size,p_tool:tool}).single());
    ok(await a.client.storage.from('account-files').upload(`${a.id}/${f.id}`,blob,{contentType:blob.type,upsert:false}));
    ok(await a.client.rpc('complete_account_file',{p_id:f.id}));
    const downloaded=ok(await a.client.storage.from('account-files').download(`${a.id}/${f.id}`));
    assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()),Buffer.from(await blob.arrayBuffer()));
    assert.ok((await b.client.storage.from('account-files').download(`${a.id}/${f.id}`)).error);
    assert.ok((await admin.client.storage.from('account-files').download(`${a.id}/${f.id}`)).error);
  }
  assert.equal(ok(await b.client.from('account_files').select('*')).length,0);
  assert.ok((await a.client.rpc('reserve_account_file',{p_name:'too-big.png',p_mime:'image/png',p_size:5000001,p_tool:'compress'})).error);
  if(query('select count(*)::int as n from auth.users')[0].n === users.length) {
    ok(await admin.client.rpc('admin_storage_limit',{p_bytes:0}));
    assert.ok((await b.client.rpc('reserve_account_file',{p_name:'full.png',p_mime:'image/png',p_size:1,p_tool:'compress'})).error);
    ok(await admin.client.rpc('admin_storage_limit',{p_bytes:originalLimit}));
  } else console.log('Skipped site-wide quota change: real users are present.');
  ok(await a.client.rpc('record_account_activity',{p_tool:'compress',p_details:'Live check'}));
  ok(await a.client.from('account_profiles').update({preferences:{history:false,format:'image/webp',targetKB:75}}).eq('id',a.id));
  ok(await a.client.rpc('record_account_activity',{p_tool:'compress',p_details:'Must not be recorded'}));
  assert.equal(ok(await a.client.from('account_history').select('*')).length,1);
  console.log('PASS hosted JPEG/PDF/ZIP/text save-download bytes, private access including admin, quotas, preferences, and history opt-out');
  ok(await admin.client.rpc('admin_update_account',{p_id:b.id,p_role:'member',p_status:'suspended',p_quota:20000000}));
  assert.ok((await b.client.rpc('record_account_activity',{p_tool:'resize',p_details:'blocked'})).error);
  const edge=accountConfig.url+'/functions/v1/delete-account';
  const unauth=await fetch(edge,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({confirmation:'DELETE'})});
  assert.equal(unauth.status,401);
  if(query("select count(*)::int as n from public.account_profiles where role='admin' and status='active'")[0].n === 1) {
    const lastAdmin=await admin.client.functions.invoke('delete-account',{body:{confirmation:'DELETE'}});
    assert.ok(lastAdmin.error);
    assert.equal(lastAdmin.error.context?.status,409);
  } else console.log('Skipped last-admin check: other active administrators are present.');
  const deleted=await a.client.functions.invoke('delete-account',{body:{confirmation:'DELETE',userId:b.id}});
  if(deleted.error){let reason=deleted.error.message;try{reason=(await deleted.error.context.json()).error||reason;}catch{}throw new Error(reason);}
  assert.equal(deleted.data.deleted,true);
  assert.equal(ok(await service.storage.from('account-files').list(a.id)).length,0);
  assert.ok((await service.auth.admin.getUserById(a.id)).error);
  assert.ok(ok(await service.auth.admin.getUserById(b.id)).user);
  assert.equal(query(`select count(*)::int as n from public.account_profiles where id='${a.id}'::uuid`)[0].n,0);
  console.log('PASS hosted suspension, authenticated deletion, last-admin protection, cleanup cascade, and forged deletion target ignored');
} finally {
  let failed=false;
  if(admin&&originalLimit!==undefined) {
    const restored=await admin.client.rpc('admin_storage_limit',{p_bytes:originalLimit});
    if(restored.error){failed=true;console.error('Storage limit restoration needs review.');}
  }
  for(const id of users) {
    const listed=await service.storage.from('account-files').list(id,{limit:1000});
    if(listed.error){failed=true;console.error('Could not list a disposable account for cleanup:',id);continue;}
    if(listed.data.length){const removed=await service.storage.from('account-files').remove(listed.data.map(f=>`${id}/${f.name}`));if(removed.error){failed=true;console.error('Could not remove disposable files:',id);continue;}}
    const existing=await service.auth.admin.getUserById(id);
    if(existing.data?.user){const removed=await service.auth.admin.deleteUser(id);if(removed.error){failed=true;console.error('Could not delete disposable account:',id);}}
  }
  if(failed)throw new Error('Disposable account cleanup needs review.');
  console.log('Removed disposable test users/files; no emails were sent.');
}
