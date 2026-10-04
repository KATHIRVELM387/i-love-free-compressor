import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifacts = join(root, 'test-artifacts/demo-frames');
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
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, session);
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
try {
 const {targetId}=await cdp('Target.createTarget',{url:'about:blank'});({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true}));
 await cdp('Page.enable',{},session);await cdp('Runtime.enable',{},session);
 await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false},session);
 await cdp('Page.navigate',{url:`http://127.0.0.1:${port}/`},session);await until("document.documentElement?.dataset.activeTool==='home' && !!document.getElementById('current-tool-guide')");
 const shot=async(name,selector)=>{if(selector)await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);await delay(250);await screenshot(name+'.png');};
 await shot('tour-1');
 await input('tool-search','compress');await shot('tour-2','#tool-menu');
 await goTool('compress');await shot('tour-3','#tool');
 await goTool('guide/compress');await shot('tour-4');
 await goTool('compress');await shot('compress-1','#tool');
 await evaluate("document.getElementById('demo').click()");await until("!document.getElementById('settings').disabled");
 await input('target','100');await input('format','image/jpeg',true);await shot('compress-2','#settings-form');
 await prepare();await shot('compress-3','#result');await shot('compress-4','#result');
 await goTool('resize');await shot('resize-1','#tool');
 await input('width','800');await shot('resize-2','#settings-form');
 await prepare();await shot('resize-3','#result');await shot('resize-4','#result');
 await goTool('presentation-templates');await shot('presentations-1','.presentation-gallery');
 await evaluate("document.getElementById('ppt-template-project').click()");await until("document.documentElement.dataset.activeTool==='presentations'");
 await input('ppt-slide-title','Our next chapter');await shot('presentations-2','.presentation-workspace');
 await evaluate("document.getElementById('ppt-present').click()");await until("!!document.querySelector('#ppt-player canvas')");await shot('presentations-3');
 await evaluate("document.getElementById('ppt-player-close').click();document.getElementById('ppt-export').click()");await until("!!document.getElementById('ppt-pptx-download')");await shot('presentations-4','.presentation-export');
 await goTool('');await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1050,deviceScaleFactor:1,mobile:false},session);await shot('home-desktop');
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:true},session);await shot('home-mobile');
 console.log('Captured real website scenes for all four demos.');
}finally{
 browser.kill('SIGTERM');await new Promise(resolve=>server.close(resolve));await delay(500);for(const entry of pending.values())clearTimeout(entry.timer);await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
