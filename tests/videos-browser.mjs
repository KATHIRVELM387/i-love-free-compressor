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
    res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.vtt': 'text/vtt' })[extname(file)] || 'application/octet-stream', 'Content-Security-Policy': csp });
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
const mediaRequests = [];
const failedRequests = [];
browser.stdio[4].on('data', data => {
  buffer += data.toString();
  let end;
  while ((end = buffer.indexOf('\0')) >= 0) {
    const message = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id); clearTimeout(timer); pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error))); else resolve(message.result);
    }
    if(message.method==='Network.loadingFailed')failedRequests.push(message.params.errorText);
    if(message.method==='Log.entryAdded'&&message.params.entry.level==='error'&&/Content Security Policy|CORS/.test(message.params.entry.text))errors.push(message.params.entry.text);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.method === 'Network.requestWillBeSent') {
      const url = message.params.request.url;
      if(/\.mp4(?:$|\?)/.test(url))mediaRequests.push(url);
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
  while (Date.now() - start < (process.env.ILFC_LIVE_URL ? 60000 : 20000)) {
    try { if (await evaluate(expression)) return; }
    catch(error) { if (!/Inspected target navigated or closed|Execution context was destroyed|Cannot find context/.test(error.message)) throw error; }
    await delay(50);
  }
  await screenshot('video-check-failure.png');
  throw new Error(`Condition not met: ${expression}; network: ${failedRequests.join(', ')}; browser: ${errors.join(', ')}`);
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
 await cdp('Log.enable',{},session);await cdp('Page.enable',{},session);await cdp('Runtime.enable',{},session);await cdp('Network.enable',{},session);
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},session);
 const base=process.env.ILFC_LIVE_URL||`http://127.0.0.1:${port}/`;
 await cdp('Page.navigate',{url:base},session);await until("document.documentElement?.dataset.activeTool==='home' && !!document.getElementById('demo-video')");
 assert.equal(await evaluate("getComputedStyle(document.querySelector('.hero')).display"),'grid');
 assert.equal(await evaluate("document.querySelectorAll('.hero-stats>div').length===6 && document.getElementById('hero-guest').getClientRects().length>0"),true);
 assert.equal(mediaRequests.length,0,'Homepage must not download videos');
 await screenshot('redesign-home-desktop.png');
 await evaluate("document.querySelector('.watch-demo').click()");await until("document.documentElement.dataset.activeTool==='videos'");
 assert.equal(await evaluate("document.getElementById('demo-video').paused && !document.getElementById('demo-video').autoplay && document.getElementById('demo-video').preload==='none'"),true);
 assert.equal(mediaRequests.length,0,'Opening the gallery must not download a video until playback');
 assert.equal(await evaluate("document.querySelectorAll('.demo-choice').length"),3);
 await until("document.getElementById('demo-video').poster.endsWith('tour.jpg')");
 await screenshot('redesign-videos-desktop.png');
 for(const key of ['tour','compress','resize']){
  await evaluate(`document.querySelector('[data-demo=${key}]').click()`);
  assert.equal(await evaluate("document.querySelectorAll('.demo-choice[aria-pressed=true]').length"),1);
  assert.equal(await evaluate('location.hash'),'#/videos/'+key);
  assert.equal(await evaluate("document.querySelectorAll('.video-transcript li').length"),4);
  await evaluate("document.getElementById('demo-play').click()");
  await until("document.getElementById('demo-video').currentTime>1");
  assert.equal(await evaluate("!document.getElementById('demo-video').muted && document.getElementById('demo-video').volume===1 && document.getElementById('demo-video').webkitAudioDecodedByteCount>0"),true,'Narration must decode and start with sound');
  await evaluate("document.getElementById('demo-sound').click()");await until("document.getElementById('demo-sound').textContent==='Turn narration on'");assert.equal(await evaluate("document.getElementById('demo-video').muted"),true);
  await evaluate("document.getElementById('demo-sound').click();document.getElementById('demo-video').volume=0");await until("document.getElementById('demo-sound').textContent==='Turn narration on'");
  await evaluate("document.getElementById('demo-sound').click()");await until("!document.getElementById('demo-video').muted && document.getElementById('demo-video').volume===1 && document.getElementById('demo-sound').textContent==='Mute narration'");
  const state=await evaluate("(()=>{const v=document.getElementById('demo-video');return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.code||null};})()");
  assert.equal(state.width,1280);assert.equal(state.height,900);assert.equal(state.error,null);assert.ok(state.duration>29&&state.duration<31);
  await evaluate("document.getElementById('demo-video').pause();document.getElementById('demo-video').currentTime=20;document.getElementById('demo-video').textTracks[0].mode='hidden'");
  await until("document.getElementById('demo-video').readyState>=2 && !document.getElementById('demo-video').seeking && document.querySelector('#demo-video track').readyState===2");
  assert.equal(await evaluate("document.getElementById('demo-video').textTracks[0].cues.length"),4);
  assert.equal(await evaluate("document.querySelector('.video-actions a[download]').href.endsWith(location.hash.split('/').pop()+'-narrated.mp4')"),true);
  const response=await fetch(new URL(`videos/${key}-narrated.mp4`,base));assert.equal(response.status,200);assert.ok(response.headers.get('content-type')?.includes('video/mp4'));assert.ok((await response.arrayBuffer()).byteLength>10000);
 }
 pass('All three narrated MP4s decode audio, play with sound, mute/unmute, seek, load captions, and provide downloads');
 await evaluate("document.getElementById('demo-video').play()");await goTool('compress');assert.equal(await evaluate("document.getElementById('demo-video').paused"),true);
 assert.equal(await evaluate("document.getElementById('current-tool-video').getClientRects().length>0"),true);
 await evaluate("document.getElementById('current-tool-video').click()");await until("document.getElementById('demo-video').dataset.source.endsWith('/compress-narrated.mp4')");
 await evaluate('window.videoTestBeforeReload=true');await cdp('Page.reload',{},session);await until("window.videoTestBeforeReload!==true && document.documentElement?.dataset.activeTool==='videos' && document.getElementById('demo-video').dataset.source.endsWith('/compress-narrated.mp4')");
 assert.equal(await evaluate("document.getElementById('demo-video').paused"),true);
 await evaluate("document.getElementById('demo-video').src='videos/missing-demo.mp4';document.getElementById('demo-video').load();document.getElementById('demo-video').play().catch(()=>{})");
 await until("document.getElementById('video-status').textContent.includes('written walkthrough')");
 await evaluate("document.querySelector('[data-demo=resize]').click()");assert.equal(await evaluate("document.getElementById('video-status').textContent"),'');
 pass('Video loads only on Play, stops on navigation, deep links survive reload, and errors offer written help');
 for(const width of [1440,1280,1024,768,390,320]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<1000},session);
  for(const route of ['','compress','videos','about','signup']){await goTool(route);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`${route} overflows at ${width}`);}
  assert.equal(await evaluate("['header-login','header-signup'].every(id=>document.getElementById(id).getClientRects().length>0)"),true);
  await goTool('videos');if([1440,390].includes(width))await screenshot(`redesign-videos-${width}.png`);
  await goTool('');if([1440,390].includes(width))await screenshot(`redesign-home-${width}.png`);
 }
 const pages=await evaluate("Object.entries((await import('./navigation.js?v=14')).PAGES).map(([key,config])=>[key,config.view||'tool'])");
 for(const [key,view] of pages){
  await goTool(key);
  const colours=await evaluate(`(()=>{const section=document.getElementById(${JSON.stringify(view==='tool'?'tool':view+'-tool')});const heading=section.querySelector('h1');const banner=heading.closest('.workspace-heading,.info-heading')||heading;return {background:getComputedStyle(banner).backgroundImage,colour:getComputedStyle(heading).color,width:document.documentElement.scrollWidth};})()`);
  assert.ok(colours.background.includes('network.svg'),key+' must use shared blue banner');assert.equal(colours.colour,'rgb(255, 255, 255)',key+' heading contrast');assert.ok(colours.width<=320,key+' mobile overflow');
 }
 pass(`All ${pages.length} tool, account, information, and guide routes share the navy banner and fit mobile`);
 await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},session);
 assert.equal(await evaluate("getComputedStyle(document.querySelector('.tool-card')).transitionDuration"),'0s');
 assert.deepEqual(errors,[]);if(!process.env.ILFC_LIVE_URL)assert.deepEqual(externalRequests,[]);
 pass('Homepage, tools, video gallery, and account pages fit 320–1440px; reduced motion works; no browser errors');
}finally{
 browser.kill('SIGTERM');await new Promise(resolve=>server.close(resolve));await delay(500);for(const entry of pending.values())clearTimeout(entry.timer);await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
