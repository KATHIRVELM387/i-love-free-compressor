import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifacts = join(root, 'test-artifacts');
await mkdir(artifacts, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), 'ready-to-upload-browser-'));
const downloads = join(profile, 'downloads');
await mkdir(downloads);
let mockConfigured = false;
const mockHost = 'https://accounts-test.supabase.co';
const csp = (await readFile(join(root, 'public/_headers'), 'utf8')).split('\n').find(line => line.includes('Content-Security-Policy:')).split('Content-Security-Policy: ')[1].replace(/connect-src [^;]+/, "connect-src 'none'");
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, 'public', `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(join(root, 'public') + '/')) { res.writeHead(403).end(); return; }
    let data = pathname === '/account-config.js' ? Buffer.from("export const accountConfig = { url: '', publishableKey: '' };") : await readFile(file);
    const policy = mockConfigured ? csp.replace("connect-src 'none'", 'connect-src ' + mockHost) : csp;
    if (mockConfigured && pathname === '/account-config.js') data = `export const accountConfig={url:'${mockHost}',publishableKey:'sb_publishable_fixture'};`;
    if (mockConfigured && file.endsWith('index.html')) data = data.toString().replace(/connect-src [^;]+/, 'connect-src ' + mockHost);
    res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml' })[extname(file)] || 'application/octet-stream', 'Content-Security-Policy': policy });
    res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const browser = spawn(process.env.CHROME_BIN || '/usr/bin/google-chrome', ['--headless=new', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--no-first-run', '--no-default-browser-check', '--remote-debugging-pipe', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
let log = '';
browser.stderr.on('data', data => { log += data; });
let sequence = 0;
let buffer = '';
const pending = new Map();
const errors = [];
const externalRequests = [];
browser.stdio[4].on('data', data => {
  buffer += data.toString();
  let end;
  while ((end = buffer.indexOf('\0')) >= 0) {
    const message = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id); clearTimeout(timer); pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error))); else resolve(message.result);
    }
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error' && /CORS|Content Security Policy/.test(message.params.entry.text)) errors.push(message.params.entry.text);
    if (message.method === 'Fetch.requestPaused') respond(message).catch(error => { errors.push(error.message); });
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.method === 'Network.requestWillBeSent') {
      const url = message.params.request.url;
      if (!url.startsWith(`http://127.0.0.1:${port}`) && !url.startsWith('blob:') && !url.startsWith('data:')) externalRequests.push(url);
    }
  }
});
function cdp(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}\n${log.slice(-2000)}`)); }, 30000);
    pending.set(id, { resolve, reject, timer });
    browser.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0');
  });
}
let session;
async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }, session);
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression) {
  const start = Date.now();
  while (Date.now() - start < 20000) { if (await evaluate(expression)) return; await delay(50); }
  console.error('Account state:', await evaluate("({notice:document.getElementById('account-notice')?.textContent,content:document.querySelector('.account-page:not([hidden])')?.textContent,stored:!!localStorage.getItem('sb-accounts-test-auth-token')})"), requests.map(r=>r.method+' '+r.path), errors);
  throw new Error(`Condition not met: ${expression}`);
}
async function screenshot(name) {
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, session);
  await writeFile(join(artifacts, name), Buffer.from(data, 'base64'));
}
function pass(message) { console.log(`PASS ${message}`); }

async function goTool(name) {
  await evaluate(`location.hash=${JSON.stringify(name ? '#/' + name : '#/')}`);
  await until(`document.documentElement.dataset.activeTool===${JSON.stringify(name || 'home')}`);
}
async function input(id, value, change = false) {
  assert.equal(await evaluate(`!document.getElementById(${JSON.stringify(id)}).matches(':disabled') && document.getElementById(${JSON.stringify(id)}).getClientRects().length>0`),true,`${id} must be a usable visible control`);
  await evaluate(`{const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));${change ? "el.dispatchEvent(new Event('change',{bubbles:true}));" : ''}}`);
}
async function prepare() {
  await evaluate("document.getElementById('settings-form').requestSubmit()");
  await until("!document.getElementById('settings').disabled && !document.getElementById('result').hidden && document.getElementById('result-image').complete && document.getElementById('result-image').naturalWidth>0");
}
async function readDownload(name) {
  for(let attempt=0;attempt<100;attempt++){
    try { return await readFile(join(downloads,name)); } catch { await delay(50); }
  }
  throw new Error('Missing download: '+name);
}
async function dimensions() {
  return evaluate("[document.getElementById('result-image').naturalWidth,document.getElementById('result-image').naturalHeight]");
}

// The browser uses the real bundled SDK against deterministic intercepted API
// responses. This validates UI/request behavior, not a real Google OAuth login.
const memberId = '00000000-0000-4000-8000-000000000001';
const otherId = '00000000-0000-4000-8000-000000000002';
const mockUser = { id: memberId, email: 'member@example.test', aud: 'authenticated', role: 'authenticated', app_metadata:{provider:'google'}, user_metadata:{} };
let mockProfile = {id:memberId,display_name:'Example member',role:'member',status:'active',quota_bytes:20000000,preferences:{},created_at:new Date().toISOString()};
let mockGoogleEnabled=false;
let files=[], activity=[], uploads=0, deletes=0, requests=[], failUpload=false, revokeAdmin=false;
let idSequence=10;
const nextId=()=>`00000000-0000-4000-8000-${String(idSequence++).padStart(12,'0')}`;
async function respond(event) {
  const {requestId,request} = event.params;
  const url=new URL(request.url); const path=url.pathname;
  const headers=[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:`http://127.0.0.1:${port}`},{name:'Access-Control-Allow-Headers',value:Object.entries(request.headers).find(([key])=>key.toLowerCase()==='access-control-request-headers')?.[1] || 'authorization,apikey,content-type,x-client-info,x-upsert,prefer,accept,accept-profile,content-profile,x-retry-count,x-supabase-api-version'},{name:'Access-Control-Allow-Methods',value:'GET,POST,PATCH,DELETE,OPTIONS'}];
  const reply=(body,status=200)=>cdp('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:headers,body:Buffer.from(JSON.stringify(body)).toString('base64')},session);
  if(request.method==='OPTIONS')return reply({});
  requests.push({path,method:request.method,body:request.postData,headers:request.headers});
  let body={};try{body=JSON.parse(request.postData||'{}');}catch{}
  if(path==='/auth/v1/settings')return reply({external:{google:mockGoogleEnabled}});
  if(path==='/auth/v1/authorize') {
    assert.equal(url.searchParams.get('provider'),'google');
    assert.equal(url.searchParams.get('redirect_to'),`http://127.0.0.1:${port}/`);
    assert.equal(url.searchParams.get('code_challenge_method'),'s256');
    assert.ok(url.searchParams.get('code_challenge'));
    return cdp('Fetch.fulfillRequest',{requestId,responseCode:302,responseHeaders:[{name:'Location',value:`http://127.0.0.1:${port}/?code=fixture-code`}],body:''},session);
  }
  if(path==='/auth/v1/token') {
    assert.equal(url.searchParams.get('grant_type'),'pkce');
    assert.equal(body.auth_code,'fixture-code');assert.ok(body.code_verifier);
    const expires=Math.floor(Date.now()/1000)+3600;
    const access=[{alg:'HS256',typ:'JWT'},{sub:memberId,aud:'authenticated',role:'authenticated',exp:expires,iat:expires-3600}].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')+'.fixture';
    return reply({access_token:access,refresh_token:'fixture-refresh',expires_in:3600,expires_at:expires,token_type:'bearer',user:mockUser});
  }
  if(path==='/auth/v1/user')return reply(mockUser);
  if(path==='/auth/v1/logout')return reply({});
  if(path==='/rest/v1/account_profiles'){
    if(request.method==='PATCH')Object.assign(mockProfile,body);
    return reply(mockProfile);
  }
  if(path==='/rest/v1/rpc/site_announcement')return reply({body:'',revision:0});
  if(path==='/rest/v1/rpc/admin_set_announcement')return reply(null);
  if(path==='/rest/v1/rpc/admin_workspace_stats')return reply({total:2,active:2,suspended:0,admins:1,files:files.length});
  if(path==='/rest/v1/rpc/update_account_file'){const f=files.find(f=>f.id===body.p_id);Object.assign(f,{name:body.p_name,folder:body.p_folder});return reply(null);}
  if(path==='/rest/v1/account_files')return reply(files);
  if(path==='/rest/v1/account_history'){
    if(request.method==='DELETE')activity=[];
    return reply(activity);
  }
  if(path==='/rest/v1/account_audit')return reply([{id:1,actor_id:memberId,target_id:otherId,action:'account_updated',details:{role:'member'},created_at:new Date().toISOString()}]);
  if(path==='/rest/v1/rpc/reserve_account_file'){
    const f={id:nextId(),user_id:memberId,name:body.p_name,mime:body.p_mime,size_bytes:body.p_size,tool:body.p_tool,state:'pending',created_at:new Date().toISOString()};files.push(f);
    const singular=Object.entries(request.headers).some(([key,value])=>key.toLowerCase()==='accept'&&value.includes('vnd.pgrst.object'));
    return reply(singular?f:[f]);
  }
  if(path==='/rest/v1/rpc/complete_account_file'){files.find(f=>f.id===body.p_id).state='ready';return reply(null);}
  if(path==='/rest/v1/rpc/release_account_file'){files=files.filter(f=>f.id!==body.p_id);return reply(null);}
  if(path==='/rest/v1/rpc/record_account_activity'){activity.unshift({id:nextId(),tool:body.p_tool,details:body.p_details,created_at:new Date().toISOString()});return reply(null);}
  if(path==='/rest/v1/rpc/admin_account_list'){
    if(revokeAdmin)return reply({message:'Administrator access required'},403);
    return reply([mockProfile,{...mockProfile,id:otherId,email:'other@example.test',display_name:'Other member',role:'member'}]);
  }
  if(path==='/rest/v1/rpc/admin_storage_usage')return reply({used_bytes:100,limit_bytes:800000000});
  if(path==='/rest/v1/rpc/admin_update_account'||path==='/rest/v1/rpc/admin_storage_limit')return reply(null);
  if(path.startsWith('/storage/v1/object/account-files/')&&request.method==='GET')return cdp('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[...headers.filter(h=>h.name!=='Content-Type'),{name:'Content-Type',value:'image/png'}],body:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1kAAAAASUVORK5CYII='},session);
  if(path.startsWith('/storage/v1/object/account-files/')){
    if(request.method==='POST'){uploads++;return failUpload?reply({message:'Upload interrupted'},503):reply({Key:path.split('/object/')[1]});}
    return reply({});
  }
  if(path==='/storage/v1/object/account-files'&&request.method==='DELETE'){deletes++;return reply([]);}
  if(path==='/functions/v1/delete-account')return reply({deleted:true});
  errors.push('Unexpected fixture request '+request.method+' '+path);return reply({message:'Unexpected request'},500);
}
const clickText=async(text,scope='.account-page:not([hidden])')=>evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(scope+' button')})).find(n=>n.textContent===${JSON.stringify(text)}).click()`);
async function authenticate(role='member') {
  mockProfile.role=role;
  const exp=Math.floor(Date.now()/1000)+3600;
  const jwt=[{alg:'HS256',typ:'JWT'},{sub:memberId,aud:'authenticated',role:'authenticated',exp,iat:exp-3600}].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')+'.fixture';
  await evaluate(`localStorage.setItem('sb-accounts-test-auth-token',${JSON.stringify(JSON.stringify({access_token:jwt,refresh_token:'fixture-refresh',expires_in:3600,expires_at:exp,token_type:'bearer',user:mockUser}))})`);
  await cdp('Page.reload',{ignoreCache:true},session);
  await until("document.getElementById('account-nav')?.textContent.startsWith('♡ My account')");
}
try {
  const {targetId}=await cdp('Target.createTarget',{url:'about:blank'});
  ({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true}));
  await cdp('Log.enable',{},session);await cdp('Page.enable',{},session);await cdp('Runtime.enable',{},session);await cdp('Network.enable',{},session);
  await cdp('Fetch.enable',{patterns:[{urlPattern:mockHost+'/*'}]},session);
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},session);
  await cdp('Page.navigate',{url:`http://127.0.0.1:${port}/#/account`},session);
  await until("document.getElementById('account-content')?.textContent.includes('being set up')");
  for(const route of ['account','signup','dashboard','files','history','profile','admin']){
    await goTool(route);
    assert.equal(await evaluate(`!document.getElementById('${route}-tool').hidden&&document.getElementById('tool').hidden&&document.getElementById('home-view').hidden`),true);
    assert.match(await evaluate(`document.getElementById('${route}-content').textContent`),/being set up/);
  }
  assert.equal(requests.length,0);
  pass('All seven account routes safely explain missing setup; no remote requests or guest login requirement');
  mockConfigured=true;await goTool('account');await cdp('Page.reload',{ignoreCache:true},session);
  await until("document.getElementById('account-content').textContent.includes('Google sign-in is being set up')");
  await goTool('signup');await until("document.getElementById('signup-content').textContent.includes('being set up')");
  mockGoogleEnabled=true; await clickText('Check again');
  await until("document.querySelector('#signup-content button')?.textContent==='Continue with Google'");
  assert.match(await evaluate("document.getElementById('signup-content').textContent"),/Member account/);
  assert.equal(await evaluate("!document.getElementById('header-login').hidden&&!document.getElementById('header-signup').hidden"),true);
  await screenshot('account-sign-in.png');
  await cdp('Page.navigate',{url:`http://127.0.0.1:${port}/index.html#/account`},session);
  await until("document.querySelector('#account-content button')?.textContent==='Continue with Google'");
  await clickText('Continue with Google');
  await until("document.documentElement?.dataset.activeTool==='dashboard' && document.getElementById('account-nav')?.textContent.startsWith('♡ My account')");
  assert.equal(await evaluate('location.search'),'');
  assert.equal(await evaluate("document.getElementById('header-login').hidden&&document.getElementById('header-signup').hidden&&!document.getElementById('header-dashboard').hidden"),true);
  pass('Real SDK PKCE redirect, code exchange, callback cleanup, and dashboard landing with intercepted OAuth service');
  await authenticate();await goTool('dashboard');
  await until("document.getElementById('dashboard-content').textContent.includes('Welcome, Example member')");
  assert.equal(uploads,0);
  await goTool('admin');assert.match(await evaluate("document.getElementById('admin-content').textContent"),/Administrator access is required/);
  assert.equal(requests.filter(r=>r.path.includes('admin_account_list')).length,0);
  await goTool('profile');
  await evaluate(`{const f=document.querySelector('#profile-content form');f.querySelector('input[type=text]').value='<img src=x onerror=alert(1)>';f.querySelector('input[type=number]').value='75';f.querySelector('select').value='image/webp';f.querySelector('.favorite-options input').checked=true;f.requestSubmit();}`);
  await until("document.getElementById('account-notice').textContent==='Settings saved.'");
  assert.equal(mockProfile.preferences.targetKB,75);assert.equal(mockProfile.preferences.format,'image/webp');
  assert.deepEqual(mockProfile.preferences.favorites,['compress']);
  await goTool('dashboard');await until("document.getElementById('dashboard-content').textContent.includes('<img src=x')");
  assert.equal(await evaluate("document.querySelector('#dashboard-content img')"),null);
  await goTool('compress');await evaluate("document.getElementById('demo').click()");await until("!document.getElementById('settings').disabled");
  assert.equal(await evaluate("document.getElementById('target').value"),'75');
  assert.equal(await evaluate("document.getElementById('format').value"),'image/webp');
  await prepare();await until("!!document.getElementById('download-save')");
  assert.equal(uploads,0,'Result generation must not upload files');
  await until("document.getElementById('download-save').textContent==='Save to My Files'");
  await evaluate("document.getElementById('download-save').click()");
  await until("document.getElementById('download-save').textContent==='Saved ✓'");
  assert.equal(uploads,1);assert.equal(files[0].state,'ready');assert.ok(activity.length);
  await goTool('files');await until("document.getElementById('files-content').textContent.includes('a-little-escape')");
  await evaluate("[...document.querySelectorAll('#files-content label')].find(l=>l.textContent==='New folder').querySelector('input').value='Website'");
  await clickText('Create folder');await until("document.querySelector('#files-content select') && document.getElementById('files-content').textContent.includes('Website')");
  assert.deepEqual(mockProfile.preferences.folders,['Website']);
  await clickText('Rename / move');await until("!!document.querySelector('.file-preview-dialog[open]')");
  await evaluate("{const d=document.querySelector('.file-preview-dialog');d.querySelectorAll('input')[0].value='renamed.webp';d.querySelectorAll('input')[1].value='Website';}");
  await clickText('Save file details','.file-preview-dialog');await until("document.getElementById('files-content').textContent.includes('renamed.webp')");
  assert.equal(files[0].folder,'Website');assert.equal(files[0].name,'renamed.webp');
  await clickText('Preview & details');await until("!!document.querySelector('.file-preview-dialog[open]')");
  await until("document.querySelector('.file-preview-dialog img').naturalWidth===1");
  await clickText('Close','.file-preview-dialog');
  await clickText('Select visible');
  assert.equal(await evaluate("document.querySelector('#files-content input[type=checkbox]').checked"),true);
  await clickText('Clear selection');
  await screenshot('account-files.png');
  await evaluate('window.confirm=()=>true');await clickText('Delete file');await until("document.getElementById('files-content').textContent.includes('No matching files')");
  assert.equal(deletes,1);assert.equal(files.length,0);
  pass('Real SDK requests: optional explicit save, private library deletion, activity, saved defaults/favorites, and text-safe rendering');
  await goTool('history');await until("document.getElementById('history-content').textContent.includes('bytes prepared')");
  await clickText('Clear history');await until("document.getElementById('history-content').textContent.includes('No activity')");
  await goTool('compress');await prepare();failUpload=true;
  await evaluate("document.getElementById('download-save').click()");
  await until("document.getElementById('account-notice').textContent.includes('unfinished upload')");failUpload=false;
  await goTool('files');await until("document.getElementById('files-content').textContent.includes('Unfinished upload')");
  await clickText('Delete file');await until("document.getElementById('files-content').textContent.includes('No matching files')");
  await authenticate('admin');await goTool('admin');await until("document.getElementById('admin-content').textContent.includes('Other member')");
  assert.equal(await evaluate("document.querySelectorAll('#admin-content .admin-row select').length"),2);
  await evaluate('window.confirm=()=>true');await clickText('Save access changes');await until("document.getElementById('account-notice').textContent==='Member access updated.'");
  assert.ok(requests.some(r=>r.path.endsWith('admin_update_account')));
  await clickText('Publish announcement');await until("document.getElementById('account-notice').textContent==='Announcement updated.'");
  assert.ok(requests.some(r=>r.path.endsWith('admin_set_announcement')));
  await screenshot('account-admin.png');
  revokeAdmin=true;await goTool('dashboard');await goTool('admin');await until("document.getElementById('admin-content').textContent.includes('Could not load')");revokeAdmin=false;
  await goTool('profile');await cdp('Emulation.setDeviceMetricsOverride',{width:320,height:800,deviceScaleFactor:1,mobile:true},session);
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  assert.equal(await evaluate("Array.from(document.querySelectorAll('#profile-tool .account-tabs a:not([hidden])')).every(a=>a.getClientRects().length>0)"),true);
  await screenshot('account-mobile-settings.png');
  await clickText('Delete my account permanently');assert.equal(requests.some(r=>r.path.endsWith('/delete-account')),false);
  await evaluate("document.querySelector('.account-danger input').value='DELETE'");await clickText('Delete my account permanently');
  await until("document.getElementById('account-nav').textContent==='♡ Sign in / My account' && document.documentElement.dataset.activeTool==='account'");
  assert.equal(await evaluate("['files','history','profile','admin'].every(n=>{const page=document.getElementById(n+'-content');return !page.querySelector('form,.account-row,.admin-row,.account-danger')&&!/member@example.test|Other member|bytes prepared/.test(page.textContent)})"),true);
  assert.equal(await evaluate("localStorage.getItem('sb-accounts-test-auth-token')"),null);
  assert.equal(await evaluate("!document.getElementById('header-login').hidden&&!document.getElementById('header-signup').hidden&&document.getElementById('header-dashboard').hidden"),true);
  pass('Interrupted upload recovery, admin controls and server rejection, mobile layout, explicit deletion, and private data cleared on sign-out');
  assert.deepEqual(errors,[]);
} finally {
  browser.kill('SIGTERM');await new Promise(resolve=>server.close(resolve));await delay(500);
  for(const entry of pending.values())clearTimeout(entry.timer);
  await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
