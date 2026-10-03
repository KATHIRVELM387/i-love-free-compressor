import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const root = await mkdtemp(join(tmpdir(),'account-config-'));
try {
  await mkdir(join(root,'scripts')); await mkdir(join(root,'public'));
  await copyFile(new URL('../scripts/configure-accounts.mjs',import.meta.url),join(root,'scripts/configure-accounts.mjs'));
  const files=['public/index.html','public/_headers','vercel.json'];
  for(const file of files) await writeFile(join(root,file),"connect-src 'none'; script-src 'self';");
  const run=(url,key)=>spawnSync(process.execPath,[join(root,'scripts/configure-accounts.mjs'),url,key],{encoding:'utf8'});
  for(const key of ['sb_secret_never_publish','header.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.sig']) assert.notEqual(run('https://example.supabase.co',key).status,0);
  assert.notEqual(run('http://example.supabase.co','sb_publishable_fixture').status,0);
  for(const file of files) assert.match(await readFile(join(root,file),'utf8'),/connect-src 'none'/);
  assert.equal(run('https://example.supabase.co','sb_publishable_fixture').status,0);
  for(const file of files) assert.equal(await readFile(join(root,file),'utf8'),"connect-src 'self' https://example.supabase.co; script-src 'self';");
  const config=await readFile(join(root,'public/account-config.js'),'utf8');
  assert.match(config,/sb_publishable_fixture/); assert.doesNotMatch(config,/sb_secret|service_role/);
  console.log('PASS public configuration rejects secret keys and updates only project-specific CSP connections');
} finally { await rm(root,{recursive:true,force:true}); }
