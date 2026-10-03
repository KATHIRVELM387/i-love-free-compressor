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
    if(message.method==='Page.javascriptDialogOpening'&&message.params.type==='beforeunload')cdp('Page.handleJavaScriptDialog',{accept:true},session).catch(()=>{});
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
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }));
  await cdp('Page.enable', {}, session);
  await cdp('Page.bringToFront', {}, session);
  await cdp('Runtime.enable', {}, session);
  await cdp('Network.enable', {}, session);
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false }, session);
  await cdp('Page.navigate', { url: `http://127.0.0.1:${port}` }, session);
  await until("document.readyState === 'complete' && !!document.getElementById('demo')");
  await until("document.documentElement.dataset.activeTool==='home'");
  assert.equal(await evaluate("document.querySelectorAll('.tool-card').length"),40);
  assert.equal(await evaluate("document.getElementById('tool').hidden && document.getElementById('batch-tool').hidden"),true);
  await until("document.querySelectorAll('#side-links [data-route]').length===41");
  assert.equal(await evaluate("!document.getElementById('sidebar').hidden&&document.getElementById('app-shell').getBoundingClientRect().left>=248"),true);
  assert.equal(await evaluate("document.querySelector('#side-links [aria-current=page]').dataset.route"),'home');
  await input('nav-search','BORDER');
  assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('#side-links [data-route]:not([hidden])')).map(a=>a.dataset.route)"),['home','frame']);
  await evaluate("document.getElementById('nav-clear').click()");
  await input('tool-search','PDF');
  assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.tool-card:not([hidden])')).map(a=>a.getAttribute('href'))"),['#/pdf','#/merge-pdf','#/split-pdf','#/pdf-images','#/organize-pdf','#/pdf-watermark','#/pdf-numbers','#/pdf-text','#/text-pdf']);
  await input('tool-search','no-such-tool');
  assert.match(await evaluate("document.getElementById('tool-search-status').textContent"),/No matching/);
  await evaluate("document.getElementById('tool-search-clear').click()");
  assert.equal(await evaluate("document.querySelectorAll('.tool-card:not([hidden])').length"),40);
  await screenshot('desktop-home.png');
  for(const width of [768,390,320]){
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true},session);
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
    assert.equal(await evaluate("(()=>{const rects=[...document.querySelectorAll('.site-header>.brand,.site-header>.primary-navigation,.site-header>.header-account')].map(n=>n.getBoundingClientRect());return rects.every((a,i)=>rects.slice(i+1).every(b=>a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top));})()"),true,`Header items overlap at ${width}px`);
  }
  await screenshot('mobile-home.png');
  await evaluate("document.getElementById('menu-toggle').click()");
  assert.equal(await evaluate("!document.getElementById('sidebar').hidden&&document.getElementById('app-shell').inert&&document.activeElement.id==='nav-search'"),true);
  await input('nav-search','rounded');
  await screenshot('mobile-navigation.png');
  await evaluate("document.querySelector('#side-links [data-route=rounded]').click()");
  await until("document.documentElement.dataset.activeTool==='rounded'");
  assert.equal(await evaluate("document.getElementById('sidebar').hidden&&!document.getElementById('app-shell').inert&&document.activeElement.id==='tool-title'"),true);
  await evaluate("document.getElementById('menu-toggle').click();document.getElementById('nav-clear').click()");
  await evaluate("[...document.querySelectorAll('#sidebar a,#sidebar button,#sidebar input')].filter(n=>!n.disabled&&n.getClientRects().length).at(-1).focus()");
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},session);
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},session);
  assert.equal(await evaluate("document.activeElement.className"),'sidebar-logo');
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},session);
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},session);
  assert.equal(await evaluate("document.getElementById('sidebar').hidden&&document.activeElement.id==='menu-toggle'&&!document.getElementById('app-shell').inert"),true);
  await evaluate("document.getElementById('menu-toggle').click();document.getElementById('menu-backdrop').click()");
  assert.equal(await evaluate("document.getElementById('sidebar').hidden"),true);
  await goTool('');
  await goTool('frame');
  await evaluate("document.querySelector('.skip-link').click()");
  assert.equal(await evaluate("document.documentElement.dataset.activeTool==='frame'&&document.activeElement.id==='main-content'"),true);
  await evaluate("document.getElementById('menu-toggle').click()");
  await goTool('rounded');
  assert.equal(await evaluate("document.getElementById('sidebar').hidden&&!document.getElementById('app-shell').inert&&document.activeElement.id==='tool-title'"),true);
  await evaluate("document.getElementById('menu-toggle').click()");
  await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:844,deviceScaleFactor:1,mobile:false},session);
  await until("!document.getElementById('app-shell').inert&&!document.getElementById('sidebar').hidden");
  await goTool('');
  pass('Desktop sidebar, current route, both tool searches, mobile drawer selection, focus trap, Escape, and backdrop');

  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false},session);
  await evaluate("document.getElementById('menu-heading').focus()");
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},session);
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},session);
  for(const category of ['All','Images','PDF','Creative','Web']){
    assert.equal(await evaluate("document.activeElement.dataset.category"),category);
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},session);
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},session);
  }
  assert.equal(await evaluate("document.activeElement.getAttribute('href')"),'#/compress');
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},session);
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},session);
  await until("document.documentElement.dataset.activeTool==='compress'");
  assert.equal(await evaluate("document.getElementById('settings').disabled"),true);
  assert.equal(await evaluate("document.activeElement.id"),'tool-title');
  assert.equal(await evaluate("document.getElementById('home-view').hidden"),true);
  pass('Tool menu, mobile layouts, keyboard selection, and focused heading');
  await evaluate("document.getElementById('demo').click()");
  await until("!document.getElementById('settings').disabled");
  await prepare();
  assert.match(await evaluate("document.getElementById('result-checks').textContent"),/Within 100 KB/);
  await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
  await evaluate("document.getElementById('download').click()");
  const compressed=await readDownload('a-little-escape-ready.jpg');
  assert.ok(compressed.length<=100000);
  assert.equal(compressed.readUInt16BE(0),0xffd8);
  await screenshot('desktop-compress.png');
  await goTool('resize');
  assert.equal(await evaluate("document.getElementById('original-name').textContent"),'a-little-escape.png');
  assert.equal(await evaluate("document.getElementById('target').value"),'');
  await input('width','800');
  assert.equal(await evaluate("document.getElementById('height').value"),'550');
  await prepare();
  assert.deepEqual(await dimensions(),[800,550]);
  assert.match(await evaluate("document.getElementById('result-checks').textContent"),/No file-size limit/);
  await evaluate('history.back()');
  await until("document.documentElement.dataset.activeTool==='compress'");
  await evaluate('history.forward()');
  await until("document.documentElement.dataset.activeTool==='resize'");
  pass('Focused compression/download and resize flows, original-photo retention, and Back/Forward');

  // Run independent encoder cases as separate browser calls, so failures name
  // the encoder and each async canvas operation gets its own deadline.
  await evaluate(`{
    window.encoderFixture=document.createElement('canvas');encoderFixture.width=1000;encoderFixture.height=800;
    const ctx=encoderFixture.getContext('2d');const pixels=ctx.createImageData(1000,800);
    let seed=42;for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;pixels.data[i]=seed&255;pixels.data[i+1]=(seed>>>8)&255;pixels.data[i+2]=(seed>>>16)&255;pixels.data[i+3]=255}ctx.putImageData(pixels,0,0);
  }`);
  const core={};
  for(const [name,options] of Object.entries({jpg:{},png:{type:'image/png',target:1000},smaller:{target:1000,allowResize:true},webp:{type:'image/webp',target:50000,allowResize:true},noLimit:{target:null}})){
    try {
      core[name]=await evaluate(`(async()=>{const {prepareImage}=await import('./image-tools.js');const r=await prepareImage(encoderFixture,{width:1000,height:800,type:'image/jpeg',target:100000,allowResize:false,...${JSON.stringify(options)}});return {size:r.blob.size,width:r.width,type:r.blob.type,meets:r.meetsTarget}})()`);
    } catch(error) { throw new Error('Encoder case '+name+': '+error.message); }
  }
  core.noLimit=core.noLimit.meets;
  Object.assign(core,await evaluate(`(async()=>{
    const {prepareImage}=await import('./image-tools.js');
    let invalid=false;try{await prepareImage(encoderFixture,{width:4096,height:4096,type:'image/jpeg',target:null})}catch{invalid=true}
    const transparent=document.createElement('canvas');transparent.width=10;transparent.height=10;
    const inspect=async type=>{const result=await prepareImage(transparent,{width:10,height:10,type,target:null,allowResize:false});const image=await createImageBitmap(result.blob);const c=document.createElement('canvas');c.width=c.height=10;const x=c.getContext('2d');x.drawImage(image,0,0);image.close();return Array.from(x.getImageData(0,0,1,1).data)};
    return {invalid,white:await inspect('image/jpeg'),alpha:await inspect('image/png')};
  })()`));
  await evaluate(`(async()=>{
    const blob=await new Promise(resolve=>encoderFixture.toBlob(resolve,'image/png'));
    const transfer=new DataTransfer();transfer.items.add(new File([blob],'<img onerror=alert(1)>.png',{type:'image/png'}));document.getElementById('file-input').files=transfer.files;document.getElementById('file-input').dispatchEvent(new Event('change'));delete window.encoderFixture;
  })()`);
  assert.ok(core.jpg.size <= 100000 && core.jpg.meets); assert.equal(core.jpg.width, 1000);
  assert.ok(core.png.size > 1000 && !core.png.meets);
  assert.ok(core.smaller.size <= 1000 && core.smaller.meets && core.smaller.width < 1000);
  assert.ok(core.webp.size <= 50000 && core.webp.meets); assert.equal(core.webp.type, 'image/webp');
  assert.ok(core.noLimit && core.invalid);
  assert.deepEqual(core.white, [255,255,255,255]); assert.equal(core.alpha[3], 0);
  pass('Real encoders: noisy images, unreachable PNG size, optional resizing, WebP, transparency, and bounds');
  const exactChecks = await evaluate(`(async () => {
    const { prepareImage, padJpegToSize } = await import('./image-tools.js');
    const c=document.createElement('canvas'); c.width=100; c.height=80;
    const x=c.getContext('2d'); const pixels=x.createImageData(100,80);
    for(let i=0;i<pixels.data.length;i+=4){pixels.data[i]=i%251; pixels.data[i+1]=(i*7)%253; pixels.data[i+2]=(i*13)%255; pixels.data[i+3]=255} x.putImageData(pixels,0,0);
    const options={width:100,height:80,type:'image/jpeg',target:25000,allowResize:false,sizeMode:'exact'};
    const original=await prepareImage(c,{...options,target:null,sizeMode:'maximum'});
    const decodedPixels=async blob=>{const img=await createImageBitmap(blob); const copy=document.createElement('canvas');copy.width=img.width;copy.height=img.height;const ctx=copy.getContext('2d');ctx.drawImage(img,0,0);img.close();return ctx.getImageData(0,0,copy.width,copy.height).data};
    const expected=await decodedPixels(original.blob);
    for(const gap of [1,2,3,4,5,65536,65537,65538,65539,65540,150000]){
      const padded=await padJpegToSize(original.blob,original.blob.size+gap);
      if(padded.size!==original.blob.size+gap) throw new Error('Incorrect padding size');
      const actual=await decodedPixels(padded);
      if(actual.length!==expected.length || actual.some((byte,i)=>byte!==expected[i])) throw new Error('Padding altered decoded pixels');
    }
    const fixture=await prepareImage(c,options);
    const large=await prepareImage(c,{...options,target:1000});
    const resized=await prepareImage(c,{...options,target:1000,allowResize:true});
    let invalid=0;
    for(const overrides of [{type:'image/png'},{target:null},{target:Infinity}]){
      try{await prepareImage(c,{...options,...overrides})}catch{invalid++}
    }
    const tiny=document.createElement('canvas');tiny.width=tiny.height=25;
    const enlarged=await prepareImage(tiny,{...options,width:50,height:50,target:50000});
    const image=await createImageBitmap(enlarged.blob);const dimensions=[image.width,image.height];image.close();
    const transfer=new DataTransfer();transfer.items.add(new File([fixture.blob],'small-25kb.jpg',{type:'image/jpeg'}));
    const input=document.getElementById('file-input');input.files=transfer.files;input.dispatchEvent(new Event('change'));
    return {fixture:fixture.blob.size,invalid,dimensions,impossible:!large.meetsTarget && large.blob.size>1000 && large.paddedBytes===0,resized:resized.meetsTarget && resized.blob.size===1000};
  })()`);
  assert.equal(exactChecks.fixture,25000);
  assert.equal(exactChecks.invalid,3);
  assert.deepEqual(exactChecks.dimensions,[50,50]);
  assert.ok(exactChecks.impossible && exactChecks.resized);
  pass('Exact JPG size, comment boundaries, pixel preservation, impossible targets, and 25-to-50 pixel enlargement');
  const transformed = await evaluate(`(async () => {
    const { prepareImage } = await import('./image-tools.js');
    const c=document.createElement('canvas');c.width=40;c.height=20;
    const x=c.getContext('2d');
    for(const [color,px,py] of [['#ff0000',0,0],['#00ff00',20,0],['#0000ff',0,10],['#ffff00',20,10]]){x.fillStyle=color;x.fillRect(px,py,20,10)}
    const inspect=async options=>{
      const r=await prepareImage(c,{width:40,height:20,type:'image/png',target:null,allowResize:false,...options});
      const image=await createImageBitmap(r.blob);const copy=document.createElement('canvas');copy.width=image.width;copy.height=image.height;const ctx=copy.getContext('2d');ctx.drawImage(image,0,0);image.close();
      return [[2,2],[copy.width-3,2],[2,copy.height-3],[copy.width-3,copy.height-3]].map(([a,b])=>Array.from(ctx.getImageData(a,b,1,1).data).slice(0,3));
    };
    const right=await inspect({rotation:90,width:20,height:40});
    const flip=await inspect({flipX:true});
    const combined=await inspect({rotation:90,flipY:true,width:20,height:40});
    const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));
    window.featureFixture=blob;
    const dt=new DataTransfer();dt.items.add(new File([blob],'quadrants.png',{type:'image/png'}));const input=document.getElementById('file-input');input.files=dt.files;input.dispatchEvent(new Event('change'));
    return {right,flip,combined};
  })()`);
  const red=[255,0,0], green=[0,255,0], blue=[0,0,255], yellow=[255,255,0];
  assert.deepEqual(transformed.right,[blue,red,yellow,green]);
  assert.deepEqual(transformed.flip,[green,red,yellow,blue]);
  assert.deepEqual(transformed.combined,[yellow,green,blue,red]);
  pass('Rotated and flipped decoded pixels');
  const cropChecks = await evaluate(`(async()=>{
    const {prepareImage}=await import('./image-tools.js');
    const source=await createImageBitmap(window.featureFixture);
    const inspect=async (image,options)=>{
      const r=await prepareImage(image,{width:20,height:20,type:'image/png',target:null,allowResize:false,...options});
      const bitmap=await createImageBitmap(r.blob);const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const x=c.getContext('2d');x.drawImage(bitmap,0,0);bitmap.close();
      return {size:r.blob.size,pixels:[[2,2],[c.width-3,2],[2,c.height-3],[c.width-3,c.height-3]].map(([a,b])=>Array.from(x.getImageData(a,b,1,1).data))};
    };
    const left=await inspect(source,{cropRatio:1,cropX:0});
    const right=await inspect(source,{cropRatio:1,cropX:1});
    const zoom=await inspect(source,{cropRatio:1,cropZoom:2,cropX:1,cropY:1});
    const rotated=await inspect(source,{rotation:90,cropRatio:1,cropY:1});
    const exact=await inspect(source,{cropRatio:1,cropX:0,brightness:20,type:'image/jpeg',target:5000,sizeMode:'exact'});
    const c=document.createElement('canvas');c.width=c.height=20;const x=c.getContext('2d');x.fillStyle='rgb(100,100,100)';x.fillRect(0,0,20,20);
    const bright=await inspect(c,{brightness:20});const contrast=await inspect(c,{contrast:50});
    x.fillStyle='#ff0000';x.fillRect(0,0,20,20);const gray=await inspect(c,{grayscale:true});
    x.clearRect(0,0,20,20);const transparent=await inspect(c,{brightness:-100,contrast:100,grayscale:true});const white=await inspect(c,{brightness:-100,type:'image/jpeg'});
    let invalid=0;for(const options of [{cropRatio:-1},{cropX:2},{cropY:NaN},{cropZoom:0},{brightness:101},{contrast:Infinity}]){try{await inspect(source,options)}catch{invalid++}}
    source.close();return {left,right,zoom,rotated,exact,bright,contrast,gray,transparent,white,invalid};
  })()`);
  const rgba=rgb=>[...rgb,255];
  assert.deepEqual(cropChecks.left.pixels,[red,red,blue,blue].map(rgba));
  assert.deepEqual(cropChecks.right.pixels,[green,green,yellow,yellow].map(rgba));
  assert.deepEqual(cropChecks.zoom.pixels,[yellow,yellow,yellow,yellow].map(rgba));
  assert.deepEqual(cropChecks.rotated.pixels,[yellow,green,yellow,green].map(rgba));
  assert.equal(cropChecks.exact.size,5000);
  assert.deepEqual(cropChecks.bright.pixels[0],[151,151,151,255]);
  assert.deepEqual(cropChecks.contrast.pixels[0],[86,86,86,255]);
  assert.deepEqual(cropChecks.gray.pixels[0],[54,54,54,255]);
  assert.equal(cropChecks.transparent.pixels[0][3],0);
  assert.deepEqual(cropChecks.white.pixels[0],[255,255,255,255]);
  assert.equal(cropChecks.invalid,6);
  pass('Decoded crop/framing/zoom pixels, rotated crop, exact KB with edits, brightness, contrast, grayscale, transparency, and invalid bounds');
  const decorationChecks = await evaluate(`(async()=>{
    const {prepareImage,downloadName}=await import('./image-tools.js');
    const c=document.createElement('canvas');c.width=800;c.height=400;const x=c.getContext('2d');x.fillStyle='#000000';x.fillRect(0,0,800,400);
    const inspect=async(source,options={})=>{
      const r=await prepareImage(source,{width:800,height:400,type:'image/png',target:null,allowResize:false,...options});
      const image=await createImageBitmap(r.blob);const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);image.close();
      const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      let minX=canvas.width,minY=canvas.height,maxX=-1,maxY=-1,maxRed=0,count=0;
      for(let i=0;i<data.length;i+=4){maxRed=Math.max(maxRed,data[i]);if(data[i]>0 && data[i+1]===0 && data[i+2]===0){const pixel=i/4;const a=pixel%canvas.width,b=Math.floor(pixel/canvas.width);minX=Math.min(minX,a);maxX=Math.max(maxX,a);minY=Math.min(minY,b);maxY=Math.max(maxY,b);count++}}
      return {size:r.blob.size,bounds:[minX,minY,maxX,maxY],maxRed,count,left:Array.from(ctx.getImageData(10,10,1,1).data),right:Array.from(ctx.getImageData(canvas.width-11,10,1,1).data)};
    };
    const mark={watermarkText:'My Photo',watermarkColor:'#ff0000',watermarkSize:10,watermarkOpacity:1};
    const positions={};for(const position of ['top-left','top-right','center','bottom-left','bottom-right']) positions[position]=await inspect(c,{...mark,watermarkPosition:position});
    const faint=await inspect(c,{...mark,watermarkOpacity:.4});
    const invisible=await inspect(c,{...mark,watermarkOpacity:0});
    const long=await inspect(c,{...mark,watermarkText:'W'.repeat(80),watermarkPosition:'center'});
    const rotated=await inspect(c,{...mark,rotation:90,width:400,height:800,watermarkPosition:'top-left'});
    const exact=await inspect(c,{...mark,type:'image/jpeg',sizeMode:'exact',target:50000});
    x.clearRect(0,0,800,400);x.fillStyle='#ff0000';x.fillRect(0,0,100,400);
    const transparent=await inspect(c);const filled=await inspect(c,{background:'#0000ff'});const gray=await inspect(c,{background:'#0000ff',grayscale:true});
    const jpg=await inspect(c,{background:'#0000ff',type:'image/jpeg'});
    let invalid=0;for(const options of [{background:'red'},{watermarkText:'x'.repeat(81)},{watermarkPosition:'outside'},{watermarkSize:0},{watermarkOpacity:2},{watermarkColor:'invalid'}]){try{await inspect(c,options)}catch{invalid++}}
    const names=[downloadName('../a:b.png','photo','jpg'),downloadName('','original-ready','webp'),downloadName('CON','photo','png'),downloadName('été.png','photo','jpg')];
    const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));const dt=new DataTransfer();dt.items.add(new File([blob],'transparent-art.png',{type:'image/png'}));
    const input=document.getElementById('file-input');input.files=dt.files;input.dispatchEvent(new Event('change'));
    return {positions,faint,invisible,long,rotated,exact,transparent,filled,gray,jpg,invalid,names};
  })()`);
  for(const [position, result] of Object.entries(decorationChecks.positions)){
    assert.ok(result.count>100,`Missing watermark at ${position}`);
    const [x1,y1,x2,y2]=result.bounds;
    if(position.endsWith('left')) assert.ok(x2<400);
    if(position.endsWith('right')) assert.ok(x1>400);
    if(position.startsWith('top')) assert.ok(y2<200);
    if(position.startsWith('bottom')) assert.ok(y1>200);
    if(position==='center') assert.ok(x1<400 && x2>400 && y1<200 && y2>200);
  }
  assert.ok(decorationChecks.faint.maxRed>=100 && decorationChecks.faint.maxRed<=103);
  assert.equal(decorationChecks.invisible.count,0);
  assert.ok(decorationChecks.long.count>0 && decorationChecks.long.bounds[0]>=19 && decorationChecks.long.bounds[2]<=780);
  assert.deepEqual(decorationChecks.rotated.bounds,decorationChecks.positions['top-left'].bounds);
  assert.equal(decorationChecks.exact.size,50000);
  assert.equal(decorationChecks.transparent.right[3],0);
  assert.deepEqual(decorationChecks.filled.left,[255,0,0,255]);
  assert.deepEqual(decorationChecks.filled.right,[0,0,255,255]);
  assert.deepEqual(decorationChecks.gray.right,[0,0,255,255]);
  assert.ok(decorationChecks.jpg.right[2]>=253 && decorationChecks.jpg.right[0]<=2 && decorationChecks.jpg.right[1]<=2);
  assert.equal(decorationChecks.invalid,6);
  assert.deepEqual(decorationChecks.names,['_a_b.jpg','original-ready.webp','photo-CON.png','été.jpg']);
  pass('Watermark positions, opacity, long-text fitting, upright rotated text, exact KB, background composition, and filename safety');
  await until("document.getElementById('original-name').textContent==='transparent-art.png'");
  const controls=['target','width','crop-ratio','rotate-right','brightness','watermark-text','background-enabled','batch-target','collage-columns','pdf-paper','filter-style','frame-size','corner-radius','pixel-size','split-rows','palette-count','compare-before-choose','details-choose'];
  const expected={compress:['target'],exact:['target'],resize:['width'],crop:['width','crop-ratio'],rotate:['rotate-right'],convert:[],adjust:['brightness'],watermark:['watermark-text'],background:['background-enabled'],batch:['batch-target'],collage:['collage-columns'],pdf:['pdf-paper'],filters:['filter-style'],frame:['frame-size'],rounded:['corner-radius'],pixelate:['pixel-size'],split:['split-rows'],palette:['palette-count'],compare:['compare-before-choose'],details:['details-choose']};
  for(const [name, visible] of Object.entries(expected)){
    await goTool(name);
    const actual=await evaluate(`${JSON.stringify(controls)}.filter(id=>document.getElementById(id).getClientRects().length>0)`);
    assert.deepEqual(actual,visible,`${name} should show only its own controls`);
    assert.equal(await evaluate("document.getElementById('home-view').hidden"),true);
    for(const id of controls.filter(id=>!visible.includes(id) && !['batch-target','collage-columns','pdf-paper','split-rows','palette-count','compare-before-choose','details-choose'].includes(id))){
      if(!['batch','collage','pdf','split','palette','compare','details'].includes(name)) assert.equal(await evaluate(`document.getElementById(${JSON.stringify(id)}).matches(':disabled')`),true,`${id} must not validate or react in ${name}`);
    }
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  }
  pass('All twenty routes show only the required controls; unrelated form fields are disabled');

  await goTool('exact');
  await input('target','50');
  await prepare();
  assert.match(await evaluate("document.getElementById('result-checks').textContent"),/Exactly 50 KB/);
  assert.equal(await evaluate("document.getElementById('format').disabled"),true);
  await input('output-name','exact-new');
  await evaluate("document.getElementById('download').click()");
  assert.equal((await readDownload('exact-new.jpg')).length,50000);
  await input('target','25');
  await prepare();
  assert.match(await evaluate("document.getElementById('result-checks').textContent"),/Exactly 25 KB/);
  await input('target','');
  assert.equal(await evaluate("document.getElementById('target').validity.valueMissing"),true);
  await goTool('convert');
  assert.equal(await evaluate("document.getElementById('target').required"),false);
  await input('format','image/webp');
  await prepare();
  assert.deepEqual(await dimensions(),[800,400]);
  assert.match(await evaluate("document.getElementById('download').download"),/\.webp$/);
  pass('Exact-size tool and format conversion, including clearing hidden exact-size requirements');

  await goTool('watermark');
  await input('watermark-text','My brand');
  await input('watermark-color','#ff0000');
  await input('watermark-opacity','100');
  await input('watermark-size','10');
  await prepare();
  const watermarkCount=await evaluate(`(()=>{const c=document.createElement('canvas');c.width=800;c.height=400;const x=c.getContext('2d');x.drawImage(document.getElementById('result-image'),0,0);const d=x.getImageData(400,200,400,200).data;let count=0;for(let i=0;i<d.length;i+=4)if(d[i]>200&&d[i+3]>0)count++;return count})()`);
  assert.ok(watermarkCount>100);
  const href=await evaluate("document.getElementById('download').href");
  await input('output-name','my-watermark.jpg');
  assert.equal(await evaluate("document.getElementById('download').href"),href);
  assert.equal(await evaluate("document.getElementById('download').download"),'my-watermark.png');
  await evaluate("document.getElementById('download').click()");
  await writeFile(join(artifacts,'focused-watermark.png'),await readDownload('my-watermark.png'));
  await screenshot('desktop-watermark.png');
  await goTool('background');
  assert.equal(await evaluate("document.getElementById('watermark-text').value"),'');
  await evaluate("document.getElementById('background-enabled').click()");
  await input('background-color','#0000ff');
  await prepare();
  const bg=await evaluate(`(()=>{const c=document.createElement('canvas');c.width=800;c.height=400;const x=c.getContext('2d');x.drawImage(document.getElementById('result-image'),0,0);return Array.from(x.getImageData(790,10,1,1).data)})()`);
  assert.deepEqual(bg,[0,0,255,255]);
  await goTool('resize');
  assert.equal(await evaluate("document.getElementById('background-enabled').checked"),false);
  await input('width','400');
  await prepare();
  const alpha=await evaluate(`(()=>{const c=document.createElement('canvas');c.width=400;c.height=200;const x=c.getContext('2d');x.drawImage(document.getElementById('result-image'),0,0);return x.getImageData(390,190,1,1).data[3]})()`);
  assert.equal(alpha,0);
  pass('Watermark and background tools export correctly; switching clears hidden edits and custom filenames');

  await goTool('crop');
  await input('crop-ratio','1',true);
  await input('crop-x','0');
  await prepare();
  assert.deepEqual(await dimensions(),[400,400]);
  await input('dimension-preset','1080x1920',true);
  await prepare();
  assert.deepEqual(await dimensions(),[1080,1920]);
  await goTool('rotate');
  await evaluate("document.getElementById('rotate-right').click()");
  await prepare();
  assert.deepEqual(await dimensions(),[400,800]);
  await goTool('adjust');
  await evaluate("document.getElementById('grayscale').click()");
  await prepare();
  const gray=await evaluate(`(()=>{const c=document.createElement('canvas');c.width=800;c.height=400;const x=c.getContext('2d');x.drawImage(document.getElementById('result-image'),0,0);return Array.from(x.getImageData(10,10,1,1).data)})()`);
  assert.deepEqual(gray,[54,54,54,255]);
  assert.deepEqual(await dimensions(),[800,400]);
  pass('Focused crop/preset, rotation, and adjustment exports do not carry hidden operations across tools');

  await goTool('batch');
  await evaluate(`{
    const dt=new DataTransfer();dt.items.add(new File([window.featureFixture],'été.png',{type:'image/png'}));dt.items.add(new File([window.featureFixture],'été.png',{type:'image/png'}));dt.items.add(new File(['broken'],'bad.jpg',{type:'image/jpeg'}));
    const input=document.getElementById('batch-input');input.files=dt.files;input.dispatchEvent(new Event('change'));
  }`);
  await input('batch-target','');await input('batch-edge','10');await input('batch-format','image/png');
  await evaluate("document.getElementById('batch-form').requestSubmit()");
  await until("!document.getElementById('batch-settings').disabled&&!document.getElementById('batch-zip').hidden");
  assert.match(await evaluate("document.getElementById('batch-summary').textContent"),/2 prepared.*1 failed/);
  await evaluate("document.getElementById('batch-zip').click()");
  const archive=await readDownload('i-love-free-compressor.zip');
  assert.equal(archive.readUInt32LE(0),0x04034b50);
  await writeFile(join(artifacts,'batch-results.zip'),archive);
  await evaluate("document.getElementById('batch-form').requestSubmit();document.getElementById('batch-cancel').click()");
  await until("!document.getElementById('batch-settings').disabled");
  assert.match(await evaluate("document.getElementById('batch-status').textContent"),/Batch stopped/);
  pass('Separate batch screen, per-file error isolation, actual ZIP download, and cancellation');

  // Actual exported pixels and documents, with user-visible order and error recovery.
  await evaluate(`(async()=>{window.collectionFixtures=await (async()=>{
    const c=document.createElement('canvas');c.width=200;c.height=100;const x=c.getContext('2d');
    const result=[];for(const [name,color] of [['red.png','#ff0000'],['blue.png','#0000ff']]){
      x.fillStyle=color;x.fillRect(0,0,200,100);result.push(new File([await new Promise(r=>c.toBlob(r,'image/png'))],name,{type:'image/png'}));
    }return result;
  })()})()`);
  async function addCollection(kind, expression='window.collectionFixtures') {
    await evaluate(`{const d=new DataTransfer();for(const f of ${expression})d.items.add(f);const i=document.getElementById('${kind}-input');i.files=d.files;i.dispatchEvent(new Event('change'));}`);
  }
  async function buildCollection(kind) {
    await evaluate(`document.getElementById('${kind}-form').requestSubmit()`);
    await until(`!document.getElementById('${kind}-settings').disabled&&!document.getElementById('${kind}-result').hidden`);
  }
  async function collagePixels() {
    await until("document.getElementById('collage-preview').complete&&document.getElementById('collage-preview').naturalWidth>0");
    return evaluate(`(()=>{const image=document.getElementById('collage-preview');const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;const x=c.getContext('2d');x.drawImage(image,0,0);return {size:[c.width,c.height],pixels:[[10,10],[100,100],[270,540],[810,540]].map(p=>Array.from(x.getImageData(...p,1,1).data))}})()`);
  }
  await goTool('collage');
  await addCollection('collage');
  await input('collage-gap','0');await input('collage-color','#00ff00');await input('collage-format','image/png');
  await buildCollection('collage');
  let collage=await collagePixels();
  assert.deepEqual(collage.size,[1080,1080]);
  assert.deepEqual(collage.pixels,[[0,255,0,255],[0,255,0,255],[255,0,0,255],[0,0,255,255]]);
  await screenshot('desktop-collage.png');
  await input('collage-fit','cover');
  assert.equal(await evaluate("document.getElementById('collage-result').hidden"),true);
  await evaluate("document.querySelector('#collage-list li:last-child [data-action=up]').click()");
  assert.match(await evaluate("document.querySelector('#collage-list li').textContent"),/blue.png/);
  await buildCollection('collage');
  collage=await collagePixels();
  assert.deepEqual(collage.pixels,[[0,0,255,255],[0,0,255,255],[0,0,255,255],[255,0,0,255]]);
  await evaluate("document.getElementById('collage-download').click()");
  await writeFile(join(artifacts,'collage.png'),await readDownload('my-collage.png'));
  for (const type of ['image/jpeg','image/webp']) {
    await input('collage-format',type); await buildCollection('collage');
    await evaluate("document.getElementById('collage-download').click()");
    const bytes=await readDownload(type==='image/jpeg'?'my-collage.jpg':'my-collage.webp');
    if(type==='image/jpeg')assert.equal(bytes.readUInt16BE(0),0xffd8);else assert.equal(bytes.toString('ascii',8,12),'WEBP');
  }
  await addCollection('collage',"[new File(['bad'],'broken.jpg',{type:'image/jpeg'})]");
  await evaluate("document.getElementById('collage-form').requestSubmit()");
  await until("!document.getElementById('collage-settings').disabled&&document.getElementById('collage-status').textContent.includes('could not be opened')");
  assert.equal(await evaluate("document.getElementById('collage-result').hidden"),true);
  await evaluate("document.querySelector('#collage-list li:last-child [data-action=remove]').click()");
  await buildCollection('collage');
  await addCollection('collage','Array(8).fill(window.collectionFixtures[0])');
  assert.match(await evaluate("document.getElementById('collage-status').textContent"),/up to 9/);
  assert.equal(await evaluate("document.querySelectorAll('#collage-list li').length"),2);
  await addCollection('collage',"[new File(['bad'],'bad.txt',{type:'text/plain'})]");
  assert.match(await evaluate("document.getElementById('collage-status').textContent"),/choose JPG/);
  await addCollection('collage',"[new File([new Uint8Array(25000001)],'large.png',{type:'image/png'})]");
  assert.match(await evaluate("document.getElementById('collage-status').textContent"),/25 MB/);
  await evaluate("document.getElementById('collage-form').requestSubmit();document.getElementById('collage-cancel').click()");
  await until("!document.getElementById('collage-settings').disabled");
  assert.match(await evaluate("document.getElementById('collage-status').textContent"),/Stopped/);
  assert.equal(await evaluate("document.getElementById('collage-result').hidden"),true);
  pass('Collage fit/fill pixels, photo order, all three formats, corrupt-photo recovery, upload limits, and cancellation');

  await goTool('pdf');await addCollection('pdf');
  await evaluate("document.querySelector('#pdf-list li:last-child [data-action=up]').click()");
  await buildCollection('pdf');
  assert.match(await evaluate("document.getElementById('pdf-summary').textContent"),/2 pages.*A4.*Portrait/);
  await evaluate("document.getElementById('pdf-download').click()");
  const pdf=await readDownload('my-photos.pdf');
  assert.equal(pdf.toString('ascii',0,8),'%PDF-1.4');
  await writeFile(join(artifacts,'photos-a4.pdf'),pdf);
  await screenshot('desktop-pdf.png');
  await input('pdf-paper','letter');await input('pdf-orientation','landscape');
  assert.equal(await evaluate("document.getElementById('pdf-result').hidden"),true);
  await buildCollection('pdf');
  await evaluate("document.getElementById('pdf-download').download='letter.pdf';document.getElementById('pdf-download').click()");
  await writeFile(join(artifacts,'photos-letter.pdf'),await readDownload('letter.pdf'));
  await addCollection('pdf',"[new File(['bad'],'broken.jpg',{type:'image/jpeg'})]");
  await evaluate("document.getElementById('pdf-form').requestSubmit()");
  await until("!document.getElementById('pdf-settings').disabled&&document.getElementById('pdf-status').textContent.includes('could not be opened')");
  assert.equal(await evaluate("document.getElementById('pdf-result').hidden"),true);
  await evaluate("document.querySelector('#pdf-list li:last-child [data-action=remove]').click()");
  await buildCollection('pdf');
  await evaluate("window.originalToBlob=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(...args){setTimeout(()=>originalToBlob.apply(this,args),100)};document.getElementById('pdf-form').requestSubmit();location.hash='#/collage'");
  await until("document.documentElement.dataset.activeTool==='collage'&&!document.getElementById('pdf-settings').disabled");
  assert.equal(await evaluate("document.getElementById('pdf-result').hidden"),true);
  assert.match(await evaluate("document.getElementById('pdf-status').textContent"),/Stopped/);
  await evaluate('HTMLCanvasElement.prototype.toBlob=originalToBlob;delete window.originalToBlob');
  await goTool('pdf');
  await addCollection('pdf','Array(19).fill(window.collectionFixtures[0])');
  assert.match(await evaluate("document.getElementById('pdf-status').textContent"),/up to 20/);
  await evaluate("document.getElementById('pdf-clear').click()");
  assert.equal(await evaluate("document.querySelectorAll('#pdf-list li').length===0&&document.getElementById('pdf-process').disabled"),true);
  await addCollection('pdf','[window.collectionFixtures[0]]');await buildCollection('pdf');
  assert.match(await evaluate("document.getElementById('pdf-summary').textContent"),/1 page/);
  pass('PDF downloads, page ordering, paper/orientation choices, corrupt-photo recovery, clear/add, limits, and cancellation on navigation');

  await goTool('convert');
  for(const [name,type,content,expectedError] of [['bad.txt','text/plain','hello','Please choose a JPG'],['bad.jpg','image/jpeg','broken','could not be opened']]){
    await evaluate(`{const dt=new DataTransfer();dt.items.add(new File([${JSON.stringify(content)}],${JSON.stringify(name)},{type:${JSON.stringify(type)}}));const input=document.getElementById('file-input');input.files=dt.files;input.dispatchEvent(new Event('change'));}`);
    await until(`document.getElementById('status').textContent.includes(${JSON.stringify(expectedError)})`);
    assert.equal(await evaluate("document.getElementById('original-name').textContent"),'transparent-art.png');
  }
  // Force a pending encode so navigating away must reject its obsolete result.
  await evaluate("window.originalToBlob=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(...args){setTimeout(()=>originalToBlob.apply(this,args),50)};document.getElementById('settings-form').requestSubmit();location.hash='#/resize'");
  await until("document.documentElement.dataset.activeTool==='resize'&&!document.getElementById('settings').disabled");
  assert.equal(await evaluate("document.getElementById('result').hidden"),true);
  await evaluate('HTMLCanvasElement.prototype.toBlob=originalToBlob;delete window.originalToBlob');
  pass('Corrupt inputs retain the original; navigation during processing prevents stale results');

  const effectChecks=await evaluate(`(async()=>{
    const {prepareImage}=await import('./image-tools.js?v=6');
    const c=document.createElement('canvas');c.width=c.height=100;const x=c.getContext('2d');x.fillStyle='rgb(100,150,200)';x.fillRect(0,0,100,100);
    const inspect=async(options={})=>{
      const result=await prepareImage(c,{width:100,height:100,type:'image/png',target:null,allowResize:false,...options});
      const b=await createImageBitmap(result.blob);const out=document.createElement('canvas');out.width=out.height=100;const ctx=out.getContext('2d');ctx.drawImage(b,0,0);b.close();
      return [[0,0],[50,50],[5,50],[10,50],[18,50],[25,50]].map(p=>Array.from(ctx.getImageData(...p,1,1).data));
    };
    const result={};for(const filter of ['none','sepia','warm','cool','invert'])result[filter]=await inspect({filter});
    result.zero=await inspect({filter:'invert',filterStrength:0});result.half=await inspect({filter:'invert',filterStrength:50});
    result.frame=await inspect({frameSize:10,frameColor:'#00ff00'});
    result.rounded=await inspect({cornerRadius:30});result.jpg=await inspect({cornerRadius:30,type:'image/jpeg'});
    x.clearRect(0,0,100,100);result.transparent=await inspect({filter:'invert'});
    const pixels=x.createImageData(100,100);for(let i=0;i<pixels.data.length;i+=4){pixels.data[i]=(i/4%100)*2;pixels.data[i+1]=Math.floor(i/400)*2;pixels.data[i+2]=100;pixels.data[i+3]=255}x.putImageData(pixels,0,0);
    result.pixel=await inspect({pixelSize:20});result.pixelOff=await inspect({pixelSize:0});
    let invalid=0;for(const options of [{filter:'bad'},{filterStrength:101},{frameSize:-1},{frameColor:'red'},{cornerRadius:51},{pixelSize:21}]){try{await inspect(options)}catch{invalid++}}result.invalid=invalid;
    x.fillStyle='rgb(100,150,200)';x.fillRect(0,0,100,100);
    const blob=await new Promise(r=>c.toBlob(r,'image/png'));const dt=new DataTransfer();dt.items.add(new File([blob],'effects.png',{type:'image/png'}));const input=document.getElementById('file-input');input.files=dt.files;input.dispatchEvent(new Event('change'));
    return result;
  })()`);
  assert.deepEqual(effectChecks.invert[1],[155,105,55,255]);
  assert.deepEqual(effectChecks.warm[1],[130,158,180,255]);
  assert.deepEqual(effectChecks.cool[1],[80,158,230,255]);
  assert.ok(effectChecks.sepia[1][0]>effectChecks.sepia[1][1]&&effectChecks.sepia[1][1]>effectChecks.sepia[1][2]);
  assert.deepEqual(effectChecks.zero,effectChecks.none);
  assert.deepEqual(effectChecks.half[1],[128,128,128,255]);
  assert.deepEqual(effectChecks.frame[2],[0,255,0,255]);assert.deepEqual(effectChecks.frame[3],[100,150,200,255]);
  assert.equal(effectChecks.rounded[0][3],0);assert.deepEqual(effectChecks.rounded[1],[100,150,200,255]);
  // JPEG chroma subsampling can tint pixels near the curved edge.
  assert.ok(effectChecks.jpg[0].slice(0,3).every(v=>v>=235),JSON.stringify(effectChecks.jpg));
  assert.equal(effectChecks.jpg[0][3],255);
  assert.equal(effectChecks.transparent[1][3],0);
  assert.deepEqual(effectChecks.pixel[3],effectChecks.pixel[4]);assert.notDeepEqual(effectChecks.pixel[4],effectChecks.pixel[5]);
  assert.notDeepEqual(effectChecks.pixelOff[3],effectChecks.pixelOff[4]);assert.equal(effectChecks.invalid,6);
  await until("document.getElementById('original-name').textContent==='effects.png'");
  async function exportedPixels(){return evaluate(`(()=>{const im=document.getElementById('result-image');const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);return [[0,0],[50,50],[1,50]].map(p=>Array.from(x.getImageData(...p,1,1).data))})()`)}
  await goTool('filters');await input('filter-style','invert');await prepare();
  assert.deepEqual((await exportedPixels())[1],[155,105,55,255]);
  await input('output-name','filtered');await evaluate("document.getElementById('download').click()");
  assert.equal((await readDownload('filtered.png')).readUInt32BE(0),0x89504e47);
  await goTool('rounded');assert.equal(await evaluate("document.getElementById('format').value"),'image/png');await prepare();
  assert.equal((await exportedPixels())[0][3],0);assert.deepEqual((await exportedPixels())[1],[100,150,200,255]);
  await goTool('pixelate');await input('pixel-size','10');await prepare();
  assert.deepEqual(await dimensions(),[100,100]);
  await goTool('frame');await input('frame-color','#00ff00');await input('frame-size','10');await prepare();
  assert.deepEqual((await exportedPixels())[0],[0,255,0,255]);
  await screenshot('desktop-frame.png');
  const nextName=await evaluate("document.getElementById('download').download");
  await evaluate("document.getElementById('use-result').click()");
  await until("document.documentElement.dataset.activeTool==='home'&&!document.getElementById('continue-notice').hidden");
  await goTool('rounded');
  assert.equal(await evaluate("document.getElementById('original-name').textContent"),nextName);
  await prepare();
  const chained=await exportedPixels();assert.equal(chained[0][3],0);assert.deepEqual(chained[2],[0,255,0,255]);assert.deepEqual(chained[1],[100,150,200,255]);
  await input('output-name','framed-rounded');await evaluate("document.getElementById('download').click()");
  await writeFile(join(artifacts,'framed-rounded.png'),await readDownload('framed-rounded.png'));
  pass('Actual filter colors/strength, frame pixels, rounded transparency/JPG, pixel blocks, validation, focused exports, and chaining a result into another tool');

  await evaluate(`(async()=>{
    const c=document.createElement('canvas');c.width=101;c.height=67;const x=c.getContext('2d');
    for(const [color,px,py,w,h] of [['#ff0000',0,0,50,33],['#00ff00',50,0,51,33],['#0000ff',0,33,50,34],['#ffffff',50,33,51,34]]){x.fillStyle=color;x.fillRect(px,py,w,h)}
    x.clearRect(100,66,1,1);
    window.exploreSource=c;window.exploreFile=new File([await new Promise(r=>c.toBlob(r,'image/png'))],'four-colors.png',{type:'image/png'});
    window.comparisonFiles=[];
    for(const [color,w,h,name] of [['#ff0000',200,100,'before.png'],['#0000ff',100,200,'after.png']]){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,w,h);comparisonFiles.push(new File([await new Promise(r=>c.toBlob(r,'image/png'))],name,{type:'image/png'}))}
  })()`);
  async function chooseExplore(id, expression='window.exploreFile') {
    await evaluate(`{const dt=new DataTransfer();dt.items.add(${expression});const input=document.getElementById('${id}');input.files=dt.files;input.dispatchEvent(new Event('change'));}`);
  }
  await goTool('split');await chooseExplore('split-input');
  await until("!document.getElementById('split-run').disabled&&document.getElementById('split-file').textContent.includes('four-colors')");
  await input('split-rows','2');await input('split-columns','3');
  await evaluate("document.getElementById('split-run').click()");
  await until("!document.getElementById('split-options').disabled&&!document.getElementById('split-output').hidden");
  await evaluate("document.getElementById('split-download').click()");
  const tiles=await readDownload('photo-tiles.zip');await writeFile(join(artifacts,'photo-tiles.zip'),tiles);
  const tileParts=[];
  for(let offset=0;tiles.readUInt32LE(offset)===0x04034b50;){
    const length=tiles.readUInt32LE(offset+18),nameLength=tiles.readUInt16LE(offset+26),extra=tiles.readUInt16LE(offset+28);
    const name=tiles.toString('utf8',offset+30,offset+30+nameLength);const start=offset+30+nameLength+extra;
    tileParts.push({name,data:Array.from(tiles.subarray(start,start+length))});offset=start+length;
  }
  assert.equal(tileParts.length,6);assert.equal(tileParts[0].name,'row-01-col-01.png');assert.equal(tileParts[5].name,'row-02-col-03.png');
  const reconstruction=await evaluate(`(async()=>{const c=document.createElement('canvas');c.width=101;c.height=67;const x=c.getContext('2d');const sizes=[];for(const [index,part] of ${JSON.stringify(tileParts)}.entries()){
    const b=await createImageBitmap(new Blob([new Uint8Array(part.data)],{type:'image/png'}));const row=Math.floor(index/3),col=index%3;sizes.push([b.width,b.height]);x.drawImage(b,Math.floor(col*101/3),Math.floor(row*67/2));b.close();
  }const a=x.getImageData(0,0,101,67).data,b=exploreSource.getContext('2d').getImageData(0,0,101,67).data;return {sizes,equal:a.every((v,i)=>v===b[i])}})()`);
  assert.equal(reconstruction.equal,true);assert.deepEqual(reconstruction.sizes,[[33,33],[34,33],[34,33],[33,34],[34,34],[34,34]]);
  await screenshot('desktop-split.png');
  await input('split-rows','1');assert.equal(await evaluate("document.getElementById('split-output').hidden"),true);
  await evaluate("window.originalToBlob=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(...args){setTimeout(()=>originalToBlob.apply(this,args),100)};document.getElementById('split-run').click()");
  await goTool('palette');await until("!document.getElementById('split-options').disabled");await delay(200);
  assert.equal(await evaluate("document.getElementById('split-output').hidden"),true);
  await evaluate('HTMLCanvasElement.prototype.toBlob=originalToBlob;delete window.originalToBlob');
  await chooseExplore('palette-input');
  await until("!document.getElementById('palette-options').disabled&&!document.getElementById('palette-output').hidden");
  const colors=await evaluate("Array.from(document.querySelectorAll('#palette-swatches input')).map(i=>i.value).sort()");
  assert.deepEqual(colors,['#0000FF','#00FF00','#FF0000','#FFFFFF']);
  await evaluate("document.getElementById('palette-text').click();document.getElementById('palette-image').click()");
  assert.deepEqual((await readDownload('photo-palette.txt')).toString().trim().split('\n').sort(),colors);
  const palettePng=await readDownload('photo-palette.png');assert.equal(palettePng.readUInt32BE(16),640);assert.equal(palettePng.readUInt32BE(20),180);
  await writeFile(join(artifacts,'photo-palette.png'),palettePng);
  await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedHex=text}}});document.querySelector('#palette-swatches button').click()");
  await until("document.getElementById('palette-status').textContent.includes('copied')");
  assert.ok(colors.includes(await evaluate('window.copiedHex')));
  await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}});document.querySelector('#palette-swatches button').click()");
  await until("document.getElementById('palette-status').textContent.includes('selected')");
  assert.equal(await evaluate("document.activeElement.tagName==='INPUT'&&document.activeElement.selectionEnd-document.activeElement.selectionStart===7"),true);
  await evaluate("delete navigator.clipboard");
  await input('palette-count','4');await until("!document.getElementById('palette-options').disabled&&!document.getElementById('palette-output').hidden");
  await screenshot('desktop-palette.png');
  await chooseExplore('palette-input',"new File(['bad'],'bad.png',{type:'image/png'})");
  await until("document.getElementById('palette-status').textContent.includes('valid JPG')");
  assert.equal(await evaluate("document.getElementById('palette-output').hidden"),false);
  await evaluate(`(async()=>{const c=document.createElement('canvas');c.width=c.height=10;window.emptyPhoto=new File([await new Promise(r=>c.toBlob(r))],'empty.png',{type:'image/png'})})()`);
  await chooseExplore('palette-input','window.emptyPhoto');
  await until("!document.getElementById('palette-options').disabled&&document.getElementById('palette-status').textContent.includes('No visible colors')");
  assert.equal(await evaluate("document.getElementById('palette-output').hidden"),true);
  await chooseExplore('palette-input');await until("!document.getElementById('palette-output').hidden");
  pass('Split ZIP reconstructs odd-sized transparent image exactly; palette colors, text/PNG downloads, clipboard and fallback, corrupt/transparent uploads, and cancellation');

  await goTool('details');
  await chooseExplore('details-input',"new File([window.exploreFile],'reported.jpg',{type:'image/jpeg'})");
  await until("!document.getElementById('details-output').hidden");
  const details=await evaluate("Object.fromEntries(Array.from(document.querySelectorAll('#details-list dt')).map(dt=>[dt.textContent,dt.nextElementSibling.textContent]))");
  assert.equal(details.Format,'PNG');assert.equal(details.Dimensions,'101 × 67 px');assert.equal(details['Aspect ratio'],'101:67');assert.match(details.Transparency,/Yes/);
  await evaluate("document.getElementById('details-download').click()");
  assert.match((await readDownload('image-details.txt')).toString(),/Format: PNG/);
  await chooseExplore('details-input','window.comparisonFiles[0]');
  await until("document.getElementById('details-list').textContent.includes('200 × 100')&&!document.getElementById('details-options').disabled");
  assert.match(await evaluate("document.getElementById('details-list').textContent"),/No — every decoded pixel is opaque/);
  await chooseExplore('details-input',"new File([new Uint8Array(25000001)],'large.png',{type:'image/png'})");
  await until("document.getElementById('details-status').textContent.includes('25 MB')");
  assert.equal(await evaluate("document.getElementById('details-output').hidden"),false);
  await screenshot('desktop-details.png');
  await goTool('compare');
  await chooseExplore('compare-before-input','window.comparisonFiles[0]');
  await until("document.getElementById('compare-before-name').textContent.includes('before.png')");
  assert.equal(await evaluate("document.getElementById('compare-output').hidden"),true);
  await chooseExplore('compare-after-input','window.comparisonFiles[1]');
  await until("!document.getElementById('compare-output').hidden&&!document.getElementById('compare-swap').disabled");
  assert.match(await evaluate("document.getElementById('compare-status').textContent"),/aspect ratios differ/);
  async function comparisonPixels(){return evaluate("[[500,400],[700,400]].map(p=>Array.from(document.getElementById('compare-preview').getContext('2d').getImageData(...p,1,1).data))")}
  assert.deepEqual(await comparisonPixels(),[[255,0,0,255],[0,0,255,255]]);
  await input('compare-position','0');assert.deepEqual(await comparisonPixels(),[[0,0,255,255],[0,0,255,255]]);
  await input('compare-position','100');assert.deepEqual(await comparisonPixels(),[[255,0,0,255],[255,0,0,255]]);
  await input('compare-position','50');await evaluate("document.getElementById('compare-swap').click()");
  assert.deepEqual(await comparisonPixels(),[[0,0,255,255],[255,0,0,255]]);
  assert.match(await evaluate("document.getElementById('compare-before-name').textContent"),/after.png/);
  await screenshot('desktop-compare.png');
  await chooseExplore('compare-before-input',"new File(['bad'],'bad.png',{type:'image/png'})");
  await until("document.getElementById('compare-status').textContent.includes('valid JPG')");
  assert.deepEqual(await comparisonPixels(),[[0,0,255,255],[255,0,0,255]]);
  await evaluate("document.getElementById('compare-clear').click()");
  assert.equal(await evaluate("document.getElementById('compare-output').hidden&&document.getElementById('compare-swap').disabled"),true);
  pass('Detected file format, exact single-pixel transparency, opaque images, details export, size limits, comparison endpoints/swap/mismatched ratios, and corrupt-photo recovery');

  for(const name of Object.keys(expected)){
    await goTool(name);
    for(const width of [1280,1024,768,390,320]){
      await cdp('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true},session);
      assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`${name} overflow at ${width}`);
    }
  }
  await goTool('collage');await screenshot('mobile-collage.png');
  await goTool('pdf');await screenshot('mobile-pdf.png');
  await goTool('crop');await screenshot('mobile-focused-crop.png');
  await cdp('Page.reload',{},session);
  await until("document.readyState==='complete'&&document.documentElement.dataset.activeTool==='crop'&&document.getElementById('settings').disabled");
  assert.equal(await evaluate("document.getElementById('settings').disabled"),true);
  assert.equal(await evaluate("document.getElementById('home-view').hidden"),true);
  await evaluate("document.querySelector('#workspace-nav a').click()");
  await until("document.documentElement.dataset.activeTool==='home'");
  await evaluate("location.hash='#/unknown-tool'");
  await until("!document.getElementById('home-view').hidden");
  assert.equal(await evaluate("document.getElementById('tool').hidden&&document.getElementById('batch-tool').hidden"),true);
  await goTool('watermark');
  assert.equal(await evaluate("document.getElementById('settings').disabled"),true);
  pass('Every tool is responsive; direct links survive reload; All tools and unknown links return to the menu');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false},session);
  await goTool('details');
  assert.equal(await evaluate("(()=>{const nav=document.getElementById('side-links'),current=nav.querySelector('[aria-current=page]');const n=nav.getBoundingClientRect(),c=current.getBoundingClientRect();return nav.scrollHeight>nav.clientHeight&&c.top>=n.top-1&&c.bottom<=n.bottom+1&&document.getElementById('nav-search').getBoundingClientRect().top>=0})()"),true);
  for(const width of [390,320]){
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true},session);
    await evaluate("document.getElementById('menu-toggle').click()");
    assert.equal(await evaluate("document.getElementById('sidebar').scrollHeight<=document.getElementById('sidebar').clientHeight+1"),true);
    await input('nav-search','tiles');
    assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('#side-links [data-route]:not([hidden])')).map(a=>a.dataset.route)"),['home','split']);
    await screenshot('mobile-explore-menu.png');
    await evaluate("document.getElementById('nav-clear').click();document.getElementById('menu-close').click()");
    assert.equal(await evaluate("!document.getElementById('app-shell').inert&&document.activeElement.id==='menu-toggle'"),true);
  }
  pass('Long sidebar list scrolls independently, current tool stays visible, and search remains usable on mobile');
  assert.deepEqual(errors,[]);assert.deepEqual(externalRequests,[]);
  pass('No uncaught browser errors or external requests');
  console.log('All browser integration checks passed.');

} finally {
  browser.kill('SIGTERM');
  await new Promise(resolve => server.close(resolve));
  await delay(500);
  for (const entry of pending.values()) clearTimeout(entry.timer);
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
