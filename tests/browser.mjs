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
  await cdp('Page.bringToFront', {}, session);
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

  await evaluate(`{
    document.getElementById('reset-edits').click();
    const crop=document.getElementById('crop-ratio');crop.value='1';crop.dispatchEvent(new Event('change'));
    const x=document.getElementById('crop-x');x.value='0';x.dispatchEvent(new Event('input'));
    document.getElementById('target').value='';document.getElementById('format').value='image/png';document.getElementById('settings-form').requestSubmit();
  }`);
  await until("!document.getElementById('settings').disabled && !document.getElementById('result').hidden && document.getElementById('result-image').naturalWidth===20");
  const imageCorners=()=>evaluate(`(()=>{const img=document.getElementById('result-image');const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d');x.drawImage(img,0,0);return [[2,2],[c.width-3,2],[2,c.height-3],[c.width-3,c.height-3]].map(([a,b])=>Array.from(x.getImageData(a,b,1,1).data).slice(0,3))})()`);
  assert.deepEqual(await imageCorners(),[red,red,blue,blue]);
  await evaluate("document.getElementById('rotate-right').click();document.getElementById('flip-horizontal').click();document.getElementById('settings-form').requestSubmit()");
  await until("!document.getElementById('settings').disabled && !document.getElementById('result').hidden && document.getElementById('result-image').complete && document.getElementById('result-image').naturalWidth===20");
  assert.deepEqual(await imageCorners(),[red,blue,red,blue]);
  await evaluate("document.getElementById('brightness').value='20';document.getElementById('brightness').dispatchEvent(new Event('input'))");
  assert.equal(await evaluate("document.getElementById('result').hidden && !document.getElementById('download').hasAttribute('href')"),true);
  await evaluate("document.getElementById('settings-form').requestSubmit()");
  await until("!document.getElementById('settings').disabled && !document.getElementById('result').hidden && document.getElementById('result-image').complete && document.getElementById('result-image').naturalWidth===20");
  assert.deepEqual(await imageCorners(),[[255,51,51],[51,51,255],[255,51,51],[51,51,255]]);
  await evaluate("document.getElementById('reset-adjustments').click();document.getElementById('dimension-preset').value='1080x1920';document.getElementById('dimension-preset').dispatchEvent(new Event('change'));document.getElementById('settings-form').requestSubmit()");
  await until("!document.getElementById('settings').disabled && !document.getElementById('result').hidden && document.getElementById('result-image').naturalWidth===1080");
  assert.equal(await evaluate("document.getElementById('result-image').naturalHeight"),1920);
  assert.equal(await evaluate("document.getElementById('auto-resize').checked"),false);
  assert.equal(await evaluate("document.getElementById('crop-ratio').value"),'0.5625');
  await evaluate("document.getElementById('width').value='540';document.getElementById('width').dispatchEvent(new Event('input',{bubbles:true}))");
  assert.equal(await evaluate("document.getElementById('height').value"),'960');
  assert.equal(await evaluate("document.getElementById('dimension-preset').value"),'');
  for(const width of [768,390,320]){
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true},session);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,`Crop editor overflow at ${width}px`);
  }
  await screenshot('mobile-crop.png');
  await evaluate("document.getElementById('reset-edits').click()");
  assert.equal(await evaluate("document.getElementById('crop-ratio').value"),'0');
  assert.equal(await evaluate("document.getElementById('brightness').value"),'0');
  assert.equal(await evaluate("document.getElementById('crop-zoom').value"),'100');
  assert.deepEqual(await evaluate("['width','height'].map(id=>document.getElementById(id).value)"),['40','20']);
  pass('Crop UI survives rotate/flip, adjustments invalidate downloads, story preset exports at 1080×1920, crop ratio lock, reset, and mobile layouts');

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
  await evaluate(`{
    const set=(id,value)=>{const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}))};
    set('watermark-text','My brand');set('watermark-color','#ff0000');set('watermark-position','bottom-right');set('watermark-opacity','100');set('watermark-size','10');
    set('background-color','#0000ff');document.getElementById('background-enabled').click();
    set('format','image/png');set('target','');set('output-name','my-artwork.jpg');
    document.getElementById('settings-form').requestSubmit();
  }`);
  await until("!document.getElementById('settings').disabled && !document.getElementById('result').hidden && document.getElementById('result-image').naturalWidth===800");
  assert.equal(await evaluate("document.getElementById('download').download"),'my-artwork.png');
  const previewMatches=await evaluate(`(()=>{
    const preview=document.getElementById('edit-preview');const p=preview.getContext('2d').getImageData(preview.width-2,2,1,1).data;
    const image=document.getElementById('result-image');const c=document.createElement('canvas');c.width=800;c.height=400;const x=c.getContext('2d');x.drawImage(image,0,0);
    const right=x.getImageData(790,10,1,1).data;
    return {preview:Array.from(p),result:Array.from(right)};
  })()`);
  assert.deepEqual(previewMatches,{preview:[0,0,255,255],result:[0,0,255,255]});
  const beforeRename=await evaluate("document.getElementById('download').href");
  await evaluate("document.getElementById('output-name').value='brand-final';document.getElementById('output-name').dispatchEvent(new Event('input',{bubbles:true}))");
  assert.equal(await evaluate("document.getElementById('download').href"),beforeRename);
  assert.equal(await evaluate("document.getElementById('result').hidden"),false);
  assert.equal(await evaluate("document.getElementById('download').download"),'brand-final.png');
  await evaluate("document.getElementById('download').click()");
  const branded=await readDownload('brand-final.png');
  await writeFile(join(artifacts,'watermarked.png'),branded);
  assert.equal(branded.readUInt32BE(0),0x89504e47);
  await evaluate("document.getElementById('remove-watermark').click()");
  assert.equal(await evaluate("document.getElementById('watermark-text').value"),'');
  assert.equal(await evaluate("document.getElementById('result').hidden"),true);
  await evaluate("document.getElementById('background-enabled').click();document.getElementById('settings-form').requestSubmit()");
  await until("!document.getElementById('settings').disabled && !document.getElementById('result').hidden && document.getElementById('result-image').complete && document.getElementById('result-image').naturalWidth===800");
  const restoredAlpha=await evaluate("(()=>{const c=document.createElement('canvas');c.width=800;c.height=400;const x=c.getContext('2d');x.drawImage(document.getElementById('result-image'),0,0);return x.getImageData(790,10,1,1).data[3]})()");
  assert.equal(restoredAlpha,0);
  await evaluate("document.getElementById('size-mode').value='exact';document.getElementById('size-mode').dispatchEvent(new Event('input',{bubbles:true}))");
  assert.equal(await evaluate("document.getElementById('download').download"),'brand-final.jpg');
  await evaluate("document.querySelectorAll('.edit-section').forEach(section=>section.open=true)");
  for(const width of [768,390,320]){
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true},session);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,`Export controls overflow at ${width}px`);
  }
  await screenshot('mobile-watermark.png');
  await evaluate("document.getElementById('reset-edits').click()");
  assert.equal(await evaluate("document.getElementById('background-enabled').checked"),false);
  assert.equal(await evaluate("document.getElementById('watermark-text').value"),'');
  pass('Watermark/background UI, matching preview, actual named PNG download, rename without reprocessing, transparency restoration, and mobile layout');
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
