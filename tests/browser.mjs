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
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' })[extname(file)] || 'application/octet-stream', 'Content-Security-Policy': csp });
    res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const browser = spawn(process.env.CHROME_BIN || '/usr/bin/google-chrome', ['--headless=new', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run', '--no-default-browser-check', '--remote-debugging-pipe', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
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

try {
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
  ({ sessionId: session } = await cdp('Target.attachToTarget', { targetId, flatten: true }));
  await cdp('Page.enable', {}, session);
  await cdp('Runtime.enable', {}, session);
  await cdp('Network.enable', {}, session);
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false }, session);
  await cdp('Page.navigate', { url: `http://127.0.0.1:${port}` }, session);
  await until("document.readyState === 'complete' && !!document.getElementById('demo')");
  assert.equal(await evaluate("document.getElementById('settings').disabled"), true);
  await screenshot('desktop.png');
  pass('Initial screen and disabled controls');

  await evaluate("document.getElementById('demo').click()");
  await until("!document.getElementById('settings').disabled");
  assert.equal(await evaluate("document.getElementById('width').value"), '1600');
  assert.equal(await evaluate("document.getElementById('height').value"), '1100');
  await evaluate("document.getElementById('width').value = '800'; document.getElementById('width').dispatchEvent(new Event('input', {bubbles:true}))");
  assert.equal(await evaluate("document.getElementById('height').value"), '550');
  await evaluate("document.getElementById('settings-form').requestSubmit()");
  await until("!document.getElementById('result').hidden && !document.getElementById('settings').disabled");
  assert.match(await evaluate("document.getElementById('result-checks').textContent"), /Within 100 KB/);
  await until("document.getElementById('result-image').naturalWidth === 800");
  pass('Sample image, aspect ratio, target-size compression, and preview');

  await cdp('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  await evaluate("document.getElementById('download').click()");
  let files = [];
  for (let i = 0; i < 100; i++) { files = await readdir(downloads); if (files.some(name => name.endsWith('.jpg'))) break; await delay(50); }
  const filename = files.find(name => name.endsWith('.jpg'));
  assert.equal(filename, 'a-little-escape-ready.jpg');
  const bytes = await readFile(join(downloads, filename));
  assert.equal(bytes[0], 0xff); assert.equal(bytes[1], 0xd8); assert.ok(bytes.length <= 100000);
  pass('Actual JPG download and byte-size limit');
  await screenshot('desktop-result.png');

  for (const width of [768, 390, 320]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true }, session);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Horizontal overflow at ${width}px`);
    if (width === 390) await screenshot('mobile-result.png');
  }
  pass('Responsive layouts at 320, 390 and 768 pixels');

  const core = await evaluate(`(async () => {
    const { prepareImage } = await import('./image-tools.js');
    const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 800;
    const ctx = canvas.getContext('2d'); const pixels = ctx.createImageData(1000,800);
    let seed = 42; for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0; pixels.data[i]=seed&255; pixels.data[i+1]=(seed>>>8)&255; pixels.data[i+2]=(seed>>>16)&255; pixels.data[i+3]=255;} ctx.putImageData(pixels,0,0);
    const options = {width:1000,height:800,type:'image/jpeg',target:100000,allowResize:false};
    const jpg = await prepareImage(canvas,options);
    const png = await prepareImage(canvas,{...options,type:'image/png',target:1000});
    const smaller = await prepareImage(canvas,{...options,target:1000,allowResize:true});
    const webp = await prepareImage(canvas,{...options,type:'image/webp',target:50000,allowResize:true});
    const noLimit = await prepareImage(canvas,{...options,target:null});
    let invalid = false; try {await prepareImage(canvas,{...options,width:4096,height:4096})} catch {invalid=true}
    const transparent = document.createElement('canvas'); transparent.width=10; transparent.height=10;
    const white = await prepareImage(transparent,{...options,width:10,height:10,target:null});
    const alpha = await prepareImage(transparent,{...options,width:10,height:10,type:'image/png',target:null});
    const inspect = async blob => {const image=await createImageBitmap(blob); const c=document.createElement('canvas'); c.width=c.height=10; const x=c.getContext('2d'); x.drawImage(image,0,0); const value=Array.from(x.getImageData(0,0,1,1).data); image.close(); return value};
    const blob = await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    const transfer = new DataTransfer(); transfer.items.add(new File([blob],'<img onerror=alert(1)>.png',{type:'image/png'})); document.getElementById('file-input').files=transfer.files; document.getElementById('file-input').dispatchEvent(new Event('change'));
    return {jpg:{size:jpg.blob.size,width:jpg.width,meets:jpg.meetsTarget},png:{size:png.blob.size,meets:png.meetsTarget},smaller:{size:smaller.blob.size,width:smaller.width,meets:smaller.meetsTarget},webp:{size:webp.blob.size,type:webp.blob.type,meets:webp.meetsTarget},noLimit:noLimit.meetsTarget,invalid,white:await inspect(white.blob),alpha:await inspect(alpha.blob)};
  })()`);
  assert.ok(core.jpg.size <= 100000 && core.jpg.meets); assert.equal(core.jpg.width, 1000);
  assert.ok(core.png.size > 1000 && !core.png.meets);
  assert.ok(core.smaller.size <= 1000 && core.smaller.meets && core.smaller.width < 1000);
  assert.ok(core.webp.size <= 50000 && core.webp.meets); assert.equal(core.webp.type, 'image/webp');
  assert.ok(core.noLimit && core.invalid);
  assert.deepEqual(core.white, [255,255,255,255]); assert.equal(core.alpha[3], 0);
  pass('Real encoders: noisy images, unreachable PNG size, optional resizing, WebP, transparency, and bounds');

  await until("document.getElementById('original-name').textContent === '<img onerror=alert(1)>.png'");
  assert.equal(await evaluate("document.getElementById('original-name').children.length"), 0);
  await evaluate("document.getElementById('target').value='1'; document.getElementById('format').value='image/png'; document.getElementById('format').dispatchEvent(new Event('input',{bubbles:true})); document.getElementById('settings-form').requestSubmit()");
  await until("!document.getElementById('result').hidden && !document.getElementById('settings').disabled");
  assert.match(await evaluate("document.getElementById('result-checks').textContent"), /Above 1 KB/);
  assert.match(await evaluate("document.getElementById('download').textContent"), /Download anyway/);
  assert.equal(await evaluate("document.getElementById('result-warning').hidden"), false);
  await evaluate("document.querySelector('[data-size=\"200\"]').click()");
  assert.equal(await evaluate("document.getElementById('result').hidden"), true);
  assert.equal(await evaluate("document.getElementById('download').hasAttribute('href')"), false);
  pass('Unsafe filenames remain text, failure is explicit, and edited settings invalidate the download');

  for (const [name, type, content, expected] of [['bad.txt','text/plain','hello','Please choose a JPG'],['broken.jpg','image/jpeg','not an image','could not be opened']]) {
    await evaluate(`{ const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(content)}],${JSON.stringify(name)},{type:${JSON.stringify(type)}})); const input=document.getElementById('file-input'); input.files=dt.files; input.dispatchEvent(new Event('change')); }`);
    await until(`document.getElementById('status').textContent.includes(${JSON.stringify(expected)})`);
    assert.equal(await evaluate("document.getElementById('settings').disabled"), false);
  }
  pass('Unsupported and corrupt files show errors without losing the current photo');

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

  await until("document.getElementById('original-name').textContent === 'small-25kb.jpg'");
  await evaluate("document.getElementById('size-mode').value='exact'; document.getElementById('size-mode').dispatchEvent(new Event('input',{bubbles:true})); document.getElementById('target').value='50'; document.getElementById('target').dispatchEvent(new Event('input',{bubbles:true})); document.getElementById('settings-form').requestSubmit()");
  await until("!document.getElementById('result').hidden && !document.getElementById('settings').disabled");
  assert.match(await evaluate("document.getElementById('result-checks').textContent"),/Exactly 50 KB/);
  assert.equal(await evaluate("document.getElementById('format').disabled"),true);
  assert.equal(await evaluate("document.getElementById('format').value"),'image/jpeg');
  assert.equal(await evaluate("document.getElementById('size-note').hidden"),false);
  assert.match(await evaluate("document.getElementById('result-summary').textContent"),/25.0 KB → 50.0 KB/);
  await until("document.getElementById('result-image').naturalWidth === 100");
  await evaluate("document.getElementById('download').click()");
  const readDownload=async name=>{
    for(let attempt=0;attempt<100;attempt++){try{return await readFile(join(downloads,name))}catch{await delay(50)}}
    throw new Error('Download missing: '+name);
  };
  const increased=await readDownload('small-25kb-ready.jpg');
  assert.equal(increased.length,50000);
  // Read this real downloaded file back into the tool, then make it smaller.
  await evaluate(`{const data=Uint8Array.from(atob(${JSON.stringify(increased.toString('base64'))}),char=>char.charCodeAt(0));const transfer=new DataTransfer();transfer.items.add(new File([data],'big-50kb.jpg',{type:'image/jpeg'}));const input=document.getElementById('file-input');input.files=transfer.files;input.dispatchEvent(new Event('change'));}`);
  await until("document.getElementById('original-name').textContent === 'big-50kb.jpg'");
  await evaluate("document.getElementById('target').value='25'; document.getElementById('target').dispatchEvent(new Event('input',{bubbles:true})); document.getElementById('settings-form').requestSubmit()");
  await until("!document.getElementById('result').hidden && !document.getElementById('settings').disabled");
  assert.match(await evaluate("document.getElementById('result-checks').textContent"),/Exactly 25 KB/);
  assert.match(await evaluate("document.getElementById('result-summary').textContent"),/50.0 KB → 25.0 KB/);
  await evaluate("document.getElementById('download').click()");
  const decreased=await readDownload('big-50kb-ready.jpg');
  assert.equal(decreased.length,25000);
  await writeFile(join(artifacts,'exact-50kb.jpg'),increased);
  await writeFile(join(artifacts,'exact-25kb.jpg'),decreased);
  await screenshot('mobile-exact-size.png');
  await evaluate("document.getElementById('target').value=''; document.getElementById('target').dispatchEvent(new Event('input',{bubbles:true}))");
  assert.equal(await evaluate("document.getElementById('target').validity.valueMissing"),true);
  assert.equal(await evaluate("document.getElementById('result').hidden"),true);
  await evaluate("document.getElementById('size-mode').value='maximum'; document.getElementById('size-mode').dispatchEvent(new Event('input',{bubbles:true}))");
  assert.equal(await evaluate("document.getElementById('format').disabled"),false);
  assert.equal(await evaluate("document.getElementById('target').required"),false);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
  pass('Actual 25 KB → 50 KB → 25 KB upload/download flow, required target, mode switching, and mobile layout');

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
  await until("document.getElementById('original-name').textContent === 'quadrants.png'");
  await evaluate("document.getElementById('rotate-right').click(); document.getElementById('flip-horizontal').click()");
  assert.deepEqual(await evaluate("['width','height'].map(id=>document.getElementById(id).value)"),['20','40']);
  assert.equal(await evaluate("document.getElementById('edit-preview').hidden"),false);
  await evaluate("document.getElementById('width').value='10';document.getElementById('width').dispatchEvent(new Event('input',{bubbles:true}))");
  assert.equal(await evaluate("document.getElementById('height').value"),'20');
  await evaluate("document.querySelector('[data-scale=\"2\"]').click();document.getElementById('format').value='image/png';document.getElementById('settings-form').requestSubmit()");
  await until("!document.getElementById('result').hidden && !document.getElementById('settings').disabled && document.getElementById('result-image').naturalWidth===40");
  assert.equal(await evaluate("document.getElementById('result-image').naturalHeight"),80);
  const uiPixels=await evaluate(`(()=>{const c=document.createElement('canvas');c.width=40;c.height=80;const x=c.getContext('2d');x.drawImage(document.getElementById('result-image'),0,0);return [[2,2],[37,2],[2,77],[37,77]].map(([a,b])=>Array.from(x.getImageData(a,b,1,1).data).slice(0,3))})()`);
  assert.deepEqual(uiPixels,[red,blue,green,yellow]);
  await evaluate("document.getElementById('reset-edits').click()");
  assert.deepEqual(await evaluate("['width','height'].map(id=>document.getElementById(id).value)"),['40','20']);
  assert.equal(await evaluate("document.getElementById('edit-preview').hidden && document.getElementById('result').hidden"),true);
  pass('Decoded rotation/flip pixels, rotated aspect ratio, 200% resizing, edited preview, and reset');

  await evaluate(`{
    const dt=new DataTransfer();
    dt.items.add(new File([window.featureFixture],'été.png',{type:'image/png'}));
    dt.items.add(new File([window.featureFixture],'été.png',{type:'image/png'}));
    dt.items.add(new File(['broken'],'bad.jpg',{type:'image/jpeg'}));
    const input=document.getElementById('batch-input');input.files=dt.files;input.dispatchEvent(new Event('change'));
    document.getElementById('batch-target').value='';document.getElementById('batch-edge').value='10';document.getElementById('batch-format').value='image/png';document.getElementById('batch-form').requestSubmit();
  }`);
  await until("!document.getElementById('batch-settings').disabled && !document.getElementById('batch-zip').hidden");
  assert.match(await evaluate("document.getElementById('batch-summary').textContent"),/2 prepared.*1 failed/);
  assert.equal(await evaluate("document.querySelectorAll('#batch-results a').length"),2);
  assert.match(await evaluate("document.getElementById('batch-results').textContent"),/10 × 5 px/);
  await evaluate("document.getElementById('batch-zip').click()");
  const archive=await readDownload('i-love-free-compressor.zip');
  assert.equal(archive.readUInt32LE(0),0x04034b50);
  await writeFile(join(artifacts,'batch-results.zip'),archive);
  for(const width of [768,390,320]){
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true},session);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,`Batch overflow at ${width}px`);
  }
  await screenshot('mobile-batch.png');
  await evaluate("document.getElementById('batch-target').value='1';document.getElementById('batch-target').dispatchEvent(new Event('input',{bubbles:true}))");
  assert.equal(await evaluate("document.getElementById('batch-zip').hidden && !document.getElementById('batch-zip').hasAttribute('href')"),true);
  await evaluate(`{
    const dt=new DataTransfer();for(let i=0;i<21;i++)dt.items.add(new File([window.featureFixture],'photo.png',{type:'image/png'}));
    const input=document.getElementById('batch-input');input.files=dt.files;input.dispatchEvent(new Event('change'));
  }`);
  assert.match(await evaluate("document.getElementById('batch-status').textContent"),/up to 20 photos/);
  // Cancel after starting: the first image finishes, subsequent images are skipped.
  await evaluate("document.getElementById('batch-form').requestSubmit();document.getElementById('batch-cancel').click()");
  await until("!document.getElementById('batch-settings').disabled");
  assert.match(await evaluate("document.getElementById('batch-status').textContent"),/Batch stopped/);
  assert.match(await evaluate("document.getElementById('batch-summary').textContent"),/1 prepared/);
  assert.equal(await evaluate("document.querySelectorAll('#batch-results li').length"),1);
  pass('Batch compression, duplicate Unicode names, corrupt-file isolation, real ZIP download, limits, cancellation, and responsive results');

  await evaluate(`(async()=>{
    const c=document.createElement('canvas');c.width=100;c.height=80;const x=c.getContext('2d');const pixels=x.createImageData(100,80);
    let seed=17;for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;pixels.data[i]=seed&255;pixels.data[i+1]=(seed>>>8)&255;pixels.data[i+2]=(seed>>>16)&255;pixels.data[i+3]=255}x.putImageData(pixels,0,0);
    const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));const dt=new DataTransfer();dt.items.add(new File([blob],'noise.png',{type:'image/png'}));
    const input=document.getElementById('batch-input');input.files=dt.files;input.dispatchEvent(new Event('change'));
    document.getElementById('batch-edge').value='4096';document.getElementById('batch-resize').checked=false;document.getElementById('batch-form').requestSubmit();
  })()`);
  await until("!document.getElementById('batch-settings').disabled && !document.getElementById('batch-zip').hidden");
  assert.match(await evaluate("document.getElementById('batch-summary').textContent"),/1 above the size limit/);
  assert.match(await evaluate("document.getElementById('batch-results').textContent"),/100 × 80 px.*Above size limit.*Download anyway/);
  pass('Batch never enlarges photos and clearly flags unreachable size limits');
  assert.deepEqual(errors, []); assert.deepEqual(externalRequests, []);
  pass('No uncaught browser errors or external network requests');
  console.log('All browser integration checks passed.');
} finally {
  browser.kill('SIGTERM');
  await new Promise(resolve => server.close(resolve));
  await delay(500);
  for (const entry of pending.values()) clearTimeout(entry.timer);
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
