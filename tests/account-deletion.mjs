import assert from 'node:assert/strict';
import { deleteAccountHandler } from '../supabase/functions/_shared/delete-account.js';
const owner = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
const origin = 'https://ilovefreecompressor.vercel.app';
let verified = true, frozen = false, failRemove = false, lastAdmin = false, deleted = [], removed = [], objects = [other], calls = [];
const handler = deleteAccountHandler({ url: 'https://example.supabase.co', publicKey: 'public', serviceKey: 'secret', allowedOrigins: [origin],
  createClient: (_url,key,options) => {
    calls.push(key);
    if (key === 'public') {
      assert.equal(options.global.headers.Authorization, 'Bearer valid-token');
      return { auth: { getUser: async token => { assert.equal(token,'valid-token'); return verified ? {data:{user:{id:owner}}} : {error:{message:'bad token'}}; } },
        rpc: async name => { assert.equal(name,'begin_account_deletion'); frozen = !lastAdmin; return lastAdmin ? {error:{message:'Assign another active administrator before deleting your account'}} : {}; } };
    }
    assert.ok(frozen, 'Privileged cleanup only starts after account freeze');
    return { storage: { from: name => { assert.equal(name,'account-files'); return {
      list: async (prefix,opts) => { assert.equal(prefix,owner); assert.equal(opts.offset,0); return {data:objects.map(name=>({name}))}; },
      remove: async paths => { if (failRemove) return {error:{}}; removed.push(...paths); objects=[]; return {}; }
    }; } }, auth: {admin:{deleteUser:async id=>{assert.equal(objects.length,0);deleted.push(id);return {};}}} };
  }
});
const request = (body = {confirmation:'DELETE'}, options={}) => new Request(origin+'/delete', {method:options.method||'POST',headers:{origin:options.origin||origin,...(options.noAuth?{}:{authorization:'Bearer valid-token'}),'content-type':'application/json'},...(options.method==='GET'||options.method==='OPTIONS'?{}:{body:JSON.stringify(body)})});
assert.equal((await handler(request({}, {method:'GET'}))).status,405);
assert.equal((await handler(request({}, {noAuth:true}))).status,401);
assert.equal((await handler(request({}, {origin:'https://evil.example'}))).status,403);
assert.equal((await handler(request({confirmation:'no'}))).status,400);
assert.equal((await handler(request({confirmation:'DELETE',padding:'x'.repeat(1100)}))).status,413);
assert.equal(calls.length,0);
const preflight = await handler(request({}, {method:'OPTIONS'})); assert.equal(preflight.status,204); assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),origin);
verified=false; assert.equal((await handler(request())).status,401); assert.ok(!calls.includes('secret'));
verified=true; lastAdmin=true; assert.equal((await handler(request())).status,409); assert.ok(!calls.includes('secret'));
lastAdmin=false; failRemove=true;
assert.equal((await handler(request())).status,503); assert.deepEqual(deleted,[]); assert.equal(frozen,true);
failRemove=false;
assert.equal((await handler(request({confirmation:'DELETE',userId:other}))).status,200);
assert.deepEqual(deleted,[owner]); assert.deepEqual(removed,[`${owner}/${other}`]);
console.log('PASS deletion requires verified identity, explicit confirmation, allowed origin, and bounded request');
console.log('PASS last-admin protection, cleanup-before-auth deletion, retry after storage failure, and forged target ignored');
