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
}
try {
 const {targetId}=await cdp('Target.createTarget',{url:'about:blank'});({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true}));
 await cdp('Log.enable',{},session);await cdp('Page.enable',{},session);await cdp('Runtime.enable',{},session);await cdp('Network.enable',{},session);await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},session);
 await cdp('Page.navigate',{url:`http://127.0.0.1:${port}`},session);await until("document.documentElement.dataset.activeTool==='home'");
 await evaluate(`window.fixture={}; const lib=await import('./vendor/pdf-lib.js');const doc=await lib.PDFDocument.create();for(let i=1;i<=3;i++){const p=doc.addPage([300,400]);p.drawText('Page '+i,{x:20,y:350});}fixture.pdf=new File([await doc.save()],'sample.pdf',{type:'application/pdf'});const c=document.createElement('canvas');c.width=300;c.height=200;const x=c.getContext('2d');x.fillStyle='#ff0000';x.fillRect(0,0,300,200);fixture.image=new File([await new Promise(r=>c.toBlob(r))],'red.png',{type:'image/png'});fixture.second=new File([fixture.image],'second.png',{type:'image/png'});`);
 const put=async(id,expressions)=>evaluate(`{const dt=new DataTransfer();for(const f of [${expressions}])dt.items.add(f);const input=document.getElementById(${JSON.stringify(id)});input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));}`);
 const set=async(id,value)=>evaluate(`{const n=document.getElementById(${JSON.stringify(id)});n.value=${JSON.stringify(value)};n.dispatchEvent(new Event('input',{bubbles:true}));}`);
 const run=async key=>{await evaluate(`document.querySelector('#${key}-tool form').requestSubmit()`);await until(`!!document.getElementById('${key}-download')||document.querySelector('#${key}-tool .studio-status').classList.contains('error')`);assert.equal(await evaluate(`!!document.getElementById('${key}-download')`),true,await evaluate(`document.querySelector('#${key}-tool .studio-status').textContent`));};
 const blob=key=>`(await import('./account-bridge.js?v=1')).results.get('${key}-download').blob`;
 for(const key of ['merge-pdf','split-pdf','pdf-images','organize-pdf','pdf-watermark','pdf-numbers','pdf-text','text-pdf']){
  await goTool(key);
  if(key==='text-pdf')await set(key+'-text','A useful document\nSecond line');else{await put(key+'-input',key==='merge-pdf'?'fixture.pdf,fixture.pdf':'fixture.pdf');await until(`document.querySelector('#${key}-tool .studio-files').textContent.includes('sample.pdf')`);}
  if(key==='split-pdf')await set(key+'-pages','1,3');
  if(key==='pdf-watermark')await set(key+'-text','DRAFT');
  if(key==='organize-pdf'){await until("document.querySelectorAll('#organize-pdf-tool .page-card').length===3");await evaluate("[...document.querySelectorAll('#organize-pdf-tool button')].find(b=>b.textContent==='Remove page').click()");}
  await run(key);
  if(!['pdf-images','pdf-text'].includes(key)){const count=await evaluate(`(await (await import('./vendor/pdf-lib.js')).PDFDocument.load(await (${blob(key)}).arrayBuffer())).getPageCount()`);assert.equal(count,key==='merge-pdf'?6:['split-pdf','organize-pdf'].includes(key)?2:key==='text-pdf'?1:3);}
  if(key==='pdf-text')assert.match(await evaluate(`await (${blob(key)}).text()`),/Page 3/);
  if(key==='pdf-images')assert.equal(await evaluate(`new DataView(await (${blob(key)}).arrayBuffer()).getUint32(0,true)`),0x04034b50);
  pass(key+' produces a valid result');
 }
 for(const key of ['redact','annotate','logo-watermark','contact-sheet','stitch','expand','favicon','base64']){
  await goTool(key);await put(key+'-input',['contact-sheet','stitch'].includes(key)?'fixture.image,fixture.second':'fixture.image');await until(`document.querySelector('#${key}-tool .studio-files').textContent.includes('red.png')`);
  if(['redact','annotate'].includes(key))await evaluate(`[...document.querySelectorAll('#${key}-tool button')].find(b=>b.textContent==='Add mark using coordinates').click()`);
  if(key==='logo-watermark')await put(key+'-logo','fixture.second');
  if(key==='expand'){await set(key+'-width','400');await set(key+'-height','300');}
  await run(key);
  if(key==='redact')assert.deepEqual(await evaluate(`{const b=await createImageBitmap(${blob(key)});const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.drawImage(b,0,0);b.close();Array.from(x.getImageData(40,30,1,1).data)}`),[0,0,0,255]);
  if(key==='base64')assert.match(await evaluate(`await (${blob(key)}).text()`),/^data:image\/png;base64,/);
  if(key==='stitch')assert.deepEqual(await evaluate(`{const b=await createImageBitmap(${blob(key)});const d=[b.width,b.height];b.close();d}`),[1808,600]);
  pass(key+' produces a valid result');
 }
 await goTool('gradient');await set('gradient-width','400');await set('gradient-height','300');await run('gradient');
 await goTool('qr');await set('qr-text','https://example.com/test');await run('qr');await evaluate(`fixture.qr=new File([${blob('qr')}],'code.png',{type:'image/png'})`);
 await goTool('qr-reader');await put('qr-reader-input','fixture.qr');await until("document.querySelector('#qr-reader-tool .studio-files').textContent.includes('code.png')");await run('qr-reader');assert.equal(await evaluate(`await (${blob('qr-reader')}).text()`),'https://example.com/test');pass('QR round trip and gradient');
 await goTool('signature');const rect=await evaluate("(()=>{const r=document.querySelector('#signature-tool canvas').getBoundingClientRect();return {x:r.x+40,y:r.y+40}})()");await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:rect.x,y:rect.y,button:'left',clickCount:1},session);await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:rect.x+100,y:rect.y+40,button:'left',buttons:1},session);await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:rect.x+100,y:rect.y+40,button:'left',clickCount:1},session);await run('signature');pass('Signature drawing and transparent export');
 await goTool('workflow');await put('workflow-file','fixture.image');await set('workflow-name','Website');await evaluate("document.getElementById('workflow-save').click()");await until("document.getElementById('workflow-list').textContent.includes('Website')");await evaluate("document.getElementById('workflow-form').requestSubmit()");await until("!!document.getElementById('workflow-download')");pass('Saved workflow executes');
 await goTool('adjust');await evaluate("document.getElementById('demo').click()");await until("!document.getElementById('settings').disabled");await set('brightness','35');await evaluate("document.getElementById('photo-undo').click()");assert.equal(await evaluate("document.getElementById('brightness').value"),'0');await evaluate("document.getElementById('photo-redo').click()");assert.equal(await evaluate("document.getElementById('brightness').value"),'35');pass('Original photo editor undo and redo restore settings');
 const keys=await evaluate("Object.keys((await import('./studio-catalog.js')).EXTRA_TOOLS)");
 for(const width of [1440,390,320]){await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<1000},session);for(const key of keys){await goTool(key);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`${key} overflows at ${width}`);}await goTool('');await screenshot(`release-home-${width}.png`);}
 assert.deepEqual(errors,[]);assert.deepEqual(externalRequests,[]);pass('All new screens fit desktop/mobile; no runtime errors or external requests');
} finally {
 browser.kill('SIGTERM');await new Promise(resolve=>server.close(resolve));await delay(500);for(const entry of pending.values())clearTimeout(entry.timer);await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
