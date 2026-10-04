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
const csp = (await readFile(join(root, 'public/_headers'), 'utf8')).split('\n').find(line => line.includes('Content-Security-Policy:')).split('Content-Security-Policy: ')[1];
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, 'public', `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(join(root, 'public') + '/')) { res.writeHead(403).end(); return; }
    const data = pathname === '/account-config.js' ? Buffer.from("export const accountConfig = { url: '', publishableKey: '' };") : await readFile(file);
    res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml' })[extname(file)] || 'application/octet-stream', 'Content-Security-Policy': csp });
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
    if(message.method==='Log.entryAdded'&&message.params.entry.level==='error'&&/Content Security Policy|CORS/.test(message.params.entry.text))errors.push(message.params.entry.text);
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
  const response = await cdp('Runtime.evaluate', { expression, awaitPromise: true, replMode: true, returnByValue: true, userGesture: true }, session);
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression) {
  const start = Date.now();
  while (Date.now() - start < 20000) { if (await evaluate(expression)) return; await delay(50); }
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
}try {
 const {targetId}=await cdp('Target.createTarget',{url:'about:blank'});({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true}));
 await cdp('Log.enable',{},session);await cdp('Page.enable',{},session);await cdp('Runtime.enable',{},session);await cdp('Network.enable',{},session);
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},session);
 const base=process.env.ILFC_LIVE_URL||`http://127.0.0.1:${port}/`;
 await cdp('Page.navigate',{url:base},session);await until("document.documentElement?.dataset.activeTool==='home' && !!document.getElementById('current-tool-guide')");
 assert.equal(await evaluate("document.querySelectorAll('.tool-card').length"),50);
 const guides=await evaluate("Object.keys((await import('./guide-data.js')).GUIDES)");assert.equal(guides.length,57);
 for(const width of [1440,1280,1024,768,390,320]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<1000},session);
  assert.equal(await evaluate("['header-login','header-signup'].every(id=>document.getElementById(id).getClientRects().length>0)"),true,`Account links visible at ${width}`);
  assert.equal(await evaluate("[...document.querySelectorAll('.primary-navigation>a')].every(a=>a.getClientRects().length>0)"),true,`Header links visible at ${width}`);
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`Header overflow at ${width}`);
  assert.equal(await evaluate("(()=>{const r=[...document.querySelectorAll('.site-header>.brand,.site-header>.primary-navigation,.site-header>.header-account')].map(n=>n.getBoundingClientRect());return r.every((a,i)=>r.slice(i+1).every(b=>a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top));})()"),true,`Header items overlap at ${width}`);
 }
 pass('Top navigation and Login/Sign up remain visible from 320px to desktop');
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},session);
 await evaluate("document.querySelector('#tool-categories [data-category=PDF]').click()");
 assert.equal(await evaluate("document.querySelectorAll('.tool-card:not([hidden])').length"),10);
 await input('tool-search','merge');assert.deepEqual(await evaluate("[...document.querySelectorAll('.tool-card:not([hidden])')].map(a=>a.hash)"),['#/merge-pdf']);
 await evaluate("document.getElementById('tool-search-clear').click()");assert.equal(await evaluate("document.querySelectorAll('.tool-card:not([hidden])').length"),50);
 await goTool('features');assert.equal(await evaluate("document.querySelectorAll('.guide-card').length"),57);
 await input('guide-search','watermark');assert.equal(await evaluate("document.querySelectorAll('.guide-card:not([hidden])').length>=3"),true);
 await evaluate("[...document.querySelectorAll('#features-tool .category-filters button')].find(b=>b.textContent==='PDF').click()");assert.deepEqual(await evaluate("[...document.querySelectorAll('.guide-card:not([hidden])')].map(c=>c.dataset.guide)"),['pdf-watermark']);
 await input('guide-search','no-such-feature');assert.equal(await evaluate("document.querySelector('#features-tool .help-empty').hidden"),false);
 await evaluate("[...document.querySelectorAll('#features-tool button')].find(b=>b.textContent==='Clear filters').click()");assert.equal(await evaluate("document.querySelectorAll('.guide-card:not([hidden])').length"),57);
 pass('Tool categories, combined searching, guide filters, and empty-state recovery');
 for(const key of guides){
  await goTool('guide/'+key);
  assert.equal(await evaluate(`document.getElementById('guide/${key}-tool').querySelectorAll('ol li').length`),3,`${key} has specific steps`);
  assert.equal(await evaluate(`document.activeElement.id`),'guide/'+key+'-heading');
  assert.equal(await evaluate(`document.getElementById('guide/${key}-tool').querySelector('.guide-actions a').hash`),'#/'+key);
  assert.equal(await evaluate("document.getElementById('tool').hidden && document.getElementById('home-view').hidden && document.getElementById('workspace-nav').hidden"),true);
 }
 pass('All 57 feature guides open independently, focus their headings, and link to the matching feature');
 await goTool('compress');assert.equal(await evaluate("document.getElementById('current-tool-guide').hash"),'#/guide/compress');
 await evaluate("document.getElementById('current-tool-guide').click()");await until("document.documentElement.dataset.activeTool==='guide/compress'");
 await evaluate("window.originalClipboardWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(Error('Unavailable'));[...document.getElementById('guide/compress-tool').querySelectorAll('button')].find(b=>b.textContent==='Copy guide link').click()");
 await until("!!document.getElementById('guide/compress-tool').querySelector('input[readonly]')");
 assert.equal(await evaluate("document.getElementById('guide/compress-tool').querySelector('input[readonly]').value"),base+'#/guide/compress');
 await evaluate("navigator.clipboard.writeText=window.originalClipboardWrite;window.printCount=0;window.print=()=>window.printCount++;[...document.getElementById('guide/compress-tool').querySelectorAll('button')].find(b=>b.textContent==='Print guide').click()");assert.equal(await evaluate('window.printCount'),1);
 await cdp('Emulation.setEmulatedMedia',{media:'print'},session);assert.equal(await evaluate("document.querySelector('.site-header').getClientRects().length===0 && document.getElementById('guide/compress-tool').getClientRects().length>0"),true);await cdp('Emulation.setEmulatedMedia',{media:''},session);
 await cdp('Page.reload',{},session);await until("document.documentElement?.dataset.activeTool==='guide/compress'");
 pass('Contextual help, copy fallback, focused print styling, and direct-link reload');
 await goTool('faq');await input('faq-search','OCR');assert.equal(await evaluate("document.querySelectorAll('.help-question:not([hidden])').length"),1);
 await goTool('signup');await until("document.getElementById('signup-content').textContent.length>0");assert.equal(await evaluate("document.getElementById('signup-heading').textContent"),'Create your free account');
 assert.equal(await evaluate("document.getElementById('account-tool').hidden && !document.getElementById('signup-tool').hidden"),true);
 await goTool('resize');await goTool('');await evaluate("[...document.querySelectorAll('.guided-finder button')].find(b=>b.textContent==='Clear recent tools').click()");assert.deepEqual(await evaluate("JSON.parse(localStorage.getItem('ilfc-recent-tools'))"),[]);
 pass('FAQ search, separate signup route, and recent-tool clearing');
 for(const width of [1440,390,320]){await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<1000},session);for(const route of ['about','how-to-use','features','faq','privacy','signup','guide/merge-pdf','guide/files']){await goTool(route);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`${route} overflow at ${width}`);}await goTool('features');assert.equal(await evaluate("[...document.querySelectorAll('.footer-links a')].every(a=>a.getClientRects().length>0)"),true);await screenshot(`help-directory-${width}.png`);await goTool('guide/compress');assert.equal(await evaluate("document.getElementById('guide/compress-tool').querySelector('.guide-breadcrumb a').getClientRects().length>0"),true);await screenshot(`help-guide-${width}.png`);}
 assert.deepEqual(errors,[]);if(!process.env.ILFC_LIVE_URL)assert.deepEqual(externalRequests,[]);
 pass('Information pages and guides fit mobile and desktop without browser errors');
}finally{
 browser.kill('SIGTERM');await new Promise(resolve=>server.close(resolve));await delay(500);for(const entry of pending.values())clearTimeout(entry.timer);await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
