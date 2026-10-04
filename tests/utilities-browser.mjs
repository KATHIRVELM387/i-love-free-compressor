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
  while (Date.now() - start < (process.env.ILFC_LIVE_URL?60000:20000)) { if (await evaluate(expression)) return; await delay(50); }
  throw new Error(`Condition not met: ${expression}`);
}
async function screenshot(name) {
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, session);
  await writeFile(join(artifacts, name), Buffer.from(data, 'base64'));
}
function pass(message) { console.log(`PASS ${message}`); }

async function goTool(name) {
  await evaluate(String.raw`location.hash=${JSON.stringify(name ? '#/' + name : '#/')}`);
  await until(`document.documentElement.dataset.activeTool===${JSON.stringify(name || 'home')}`);
}
async function input(id, value, change = false) {
  assert.equal(await evaluate(String.raw`!document.getElementById(${JSON.stringify(id)}).matches(':disabled') && document.getElementById(${JSON.stringify(id)}).getClientRects().length>0`),true,`${id} must be a usable visible control`);
  await evaluate(String.raw`{const el=document.getElementById(${JSON.stringify(id)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));${change ? "el.dispatchEvent(new Event('change',{bubbles:true}));" : ''}}`);
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
 await cdp('Page.navigate',{url:process.env.ILFC_LIVE_URL||`http://127.0.0.1:${port}/`},session);await until("document.documentElement.dataset.activeTool==='home'");
 await evaluate(String.raw`window.fixture={}; const lib=await import('./vendor/pdf-lib.js');const doc=await lib.PDFDocument.create();for(let i=1;i<=3;i++){const p=doc.addPage([300,400]);p.drawText('Page '+i,{x:20,y:350});}fixture.pdf=new File([await doc.save()],'sample.pdf',{type:'application/pdf'});const c=document.createElement('canvas');c.width=300;c.height=200;const x=c.getContext('2d');x.fillStyle='#ff0000';x.fillRect(0,0,300,200);fixture.image=new File([await new Promise(r=>c.toBlob(r))],'red.png',{type:'image/png'});fixture.second=new File([fixture.image],'second.png',{type:'image/png'});`);
 const put=async(id,expressions)=>evaluate(String.raw`{const dt=new DataTransfer();for(const f of [${expressions}])dt.items.add(f);const input=document.getElementById(${JSON.stringify(id)});input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));}`);
 const set=async(id,value)=>evaluate(String.raw`{const n=document.getElementById(${JSON.stringify(id)});n.value=${JSON.stringify(value)};n.dispatchEvent(new Event('input',{bubbles:true}));}`);
 const run=async key=>{await evaluate(String.raw`document.querySelector('#${key}-tool form').requestSubmit()`);await until(`!!document.getElementById('${key}-download')||document.querySelector('#${key}-tool .studio-status').classList.contains('error')`);assert.equal(await evaluate(String.raw`!!document.getElementById('${key}-download')`),true,await evaluate(String.raw`document.querySelector('#${key}-tool .studio-status').textContent`));};
 const blob=key=>`(await import('./account-bridge.js?v=1')).results.get('${key}-download').blob`;

 await evaluate(String.raw`window.utility=await import('./utility-core.js');`);
 assert.equal(await evaluate(String.raw`utility.formatJSON('{"id":900719925474099312345,"n":1.2300e+40,"s":"a : b, c","a":[]}', 'minify')`),'{"id":900719925474099312345,"n":1.2300e+40,"s":"a : b, c","a":[]}');
 assert.deepEqual(await evaluate(String.raw`utility.textStats('Hi 😀\nworld')`),{characters:10,words:3,lines:2});
 assert.equal(await evaluate(String.raw`utility.cleanText('  A   b  \n\n\n c ', 'spaces')`),'A b\n\nc');
 assert.equal(await evaluate(String.raw`utility.cleanText('A\nB\nA', 'lines')`),'A\nB');
 for(const [key,text,expected]of [['text-cleanup','  Hello    world  ','Hello world'],['json-format','{"x":9007199254740993123,"list":[1,2]}','9007199254740993123']]){
  await goTool(key);await set(key+'-text',text);await run(key);assert.ok((await evaluate(String.raw`await (${blob(key)}).text()`)).includes(expected));
 }
 await goTool('json-format');await set('json-format-text','{"broken":}');await evaluate(String.raw`document.querySelector('#json-format-tool form').requestSubmit()`);await until(`document.querySelector('#json-format-tool .studio-status').classList.contains('error')`);assert.equal(await evaluate(String.raw`!!document.getElementById('json-format-download')`),false);
 pass('Text cleanup and JSON formatting preserve Unicode and exact numbers, reject invalid input');
 await goTool('checksum');await put('checksum-input',`new File(['abc'],'abc.txt',{type:'text/plain'})`);await run('checksum');const hash='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';assert.equal(await evaluate(String.raw`await (${blob('checksum')}).text()`),hash);
 await set('checksum-expected',hash.toUpperCase());await run('checksum');assert.match(await evaluate(String.raw`document.querySelector('#checksum-tool .studio-output').textContent`),/Match:/);
 await set('checksum-expected','0'.repeat(64));await run('checksum');assert.match(await evaluate(String.raw`document.querySelector('#checksum-tool .studio-output').textContent`),/Mismatch:/);
 pass('SHA-256 matches the published abc vector and detects mismatches');
 await evaluate(String.raw`const p=await lib.PDFDocument.load(await fixture.pdf.arrayBuffer());p.setTitle('Original title');p.setAuthor('Camera owner');p.setKeywords(['secret']);const meta=p.context.stream('<metadata>original private information</metadata>');p.catalog.set(lib.PDFName.of('Metadata'),p.context.register(meta));fixture.privatePDF=new File([await p.save()],'private.pdf',{type:'application/pdf'});`);
 await goTool('pdf-properties');await put('pdf-properties-input','fixture.privatePDF');await evaluate(String.raw`[...document.querySelectorAll('#pdf-properties-tool button')].find(b=>b.textContent==='Read current properties').click()`);await until(`document.getElementById('pdf-properties-title').value==='Original title'`);await set('pdf-properties-title','Public title');await run('pdf-properties');assert.deepEqual(await evaluate(String.raw`{const d=await lib.PDFDocument.load(await (${blob('pdf-properties')}).arrayBuffer(),{updateMetadata:false});[d.getPageCount(),d.getTitle(),d.getAuthor(),d.catalog.has(lib.PDFName.of('Metadata'))]}`),[3,'Public title','Camera owner',false]);
 await set('pdf-properties-mode','clear');await run('pdf-properties');assert.deepEqual(await evaluate(String.raw`{const d=await lib.PDFDocument.load(await (${blob('pdf-properties')}).arrayBuffer(),{updateMetadata:false});[d.getPageCount(),d.getTitle()||'',d.getAuthor()||'',d.getKeywords()||'']}`),[3,'','','']);pass('PDF properties read/edit/clear preserve pages and remove document XMP');
 // Insert a PNG text chunk carrying metadata; check that only fresh pixel data is exported.
 await evaluate(String.raw`const original=new Uint8Array(await fixture.image.arrayBuffer());const data=new TextEncoder().encode('Author\0Camera owner GPS');const chunk=new Uint8Array(data.length+12);new DataView(chunk.buffer).setUint32(0,data.length);chunk.set(new TextEncoder().encode('tEXt'),4);chunk.set(data,8);let crc=0xffffffff;for(const b of chunk.slice(4,-4)){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}new DataView(chunk.buffer).setUint32(chunk.length-4,(crc^0xffffffff)>>>0);fixture.privateImage=new File([original.slice(0,33),chunk,original.slice(33)],'private.png',{type:'image/png'});`);
 await goTool('image-privacy');await put('image-privacy-input','fixture.privateImage');await run('image-privacy');assert.equal(await evaluate(String.raw`new TextDecoder().decode(await (${blob('image-privacy')}).arrayBuffer()).includes('Camera owner')`),false);
 assert.deepEqual(await evaluate(String.raw`{const b=await createImageBitmap(${blob('image-privacy')});const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d');x.drawImage(b,0,0);const v=[b.width,b.height,...x.getImageData(10,10,1,1).data];b.close();v}`),[300,200,255,0,0,255]);
 await goTool('image-dpi');await put('image-dpi-input','fixture.image');await set('image-dpi-dpi','300');await run('image-dpi');assert.deepEqual(await evaluate(String.raw`{const a=new Uint8Array(await (${blob('image-dpi')}).arrayBuffer());const v=new DataView(a.buffer);let p=8,r=[];while(p<a.length){const n=v.getUint32(p),t=String.fromCharCode(...a.slice(p+4,p+8));if(t==='pHYs'){let crc=0xffffffff;for(const b of a.slice(p+4,p+8+n)){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}r.push(v.getUint32(p+8),v.getUint32(p+12),a[p+16],v.getUint32(p+8+n)===(crc^0xffffffff)>>>0);}p+=n+12;}r}`),[11811,11811,1,true]);
 await evaluate(String.raw`const c=document.createElement('canvas');c.width=300;c.height=200;fixture.jpg=new File([await new Promise(r=>c.toBlob(r,'image/jpeg'))],'photo.jpg',{type:'image/jpeg'})`);await put('image-dpi-input','fixture.jpg');await set('image-dpi-dpi','72');await run('image-dpi');assert.deepEqual(await evaluate(String.raw`{const a=new Uint8Array(await (${blob('image-dpi')}).arrayBuffer());const b=await createImageBitmap(${blob('image-dpi')});const v=[a[13],(a[14]<<8)|a[15],(a[16]<<8)|a[17],b.width,b.height];b.close();v}`),[1,72,72,300,200]);pass('Metadata cleaner removes original PNG metadata; PNG/JPEG DPI and image dimensions verified');
 assert.equal(await evaluate(String.raw`try{await utility.processUtility('checksum',[{size:100000001}],{});false}catch(e){e.message.includes('100 MB')}`),true);
 assert.equal(await evaluate(String.raw`try{utility.formatJSON('x'.repeat(1000001));false}catch(e){e.message.includes('1 million')}`),true);
 assert.equal(await evaluate(String.raw`try{await utility.processUtility('image-dpi',[fixture.image],{dpi:0});false}catch(e){e.message.includes('1 to 1200')}`),true);
 assert.equal(await evaluate(String.raw`try{await utility.processUtility('pdf-properties',[new File(['broken'],'x.pdf',{type:'application/pdf'})],{});false}catch(e){e.message.includes('undamaged')}`),true);
 assert.equal(await evaluate(String.raw`try{await utility.processUtility('checksum',[new File(['abc'],'x')],{},()=>{throw Error('Cancelled');});false}catch(e){e.message==='Cancelled'}`),true);
 for(const width of [1440,390,320]){await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<1000},session);for(const key of await evaluate('utility.UTILITY_KEYS')){await goTool(key);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,key+' overflow');await goTool('guide/'+key);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,key+' guide overflow');}await goTool('text-cleanup');await screenshot('utilities-'+width+'.png');}
 assert.deepEqual(errors,[]);if(!process.env.ILFC_LIVE_URL)assert.deepEqual(externalRequests,[]);pass('Limits, cancellation, all six routes and guides at desktop/mobile widths; no external processing');
} finally {
 browser.kill('SIGTERM');await new Promise(resolve=>server.close(resolve));await delay(500);for(const entry of pending.values())clearTimeout(entry.timer);await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
