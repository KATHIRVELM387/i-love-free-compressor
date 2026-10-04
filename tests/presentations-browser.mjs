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
let acceptDialog=false;const dialogs=[];
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
    if(message.method==='Page.javascriptDialogOpening'){dialogs.push(message.params.message);cdp('Page.handleJavaScriptDialog',{accept:acceptDialog},session).catch(()=>{});}
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
  while (Date.now() - start < (process.env.ILFC_LIVE_URL?60000:20000)) {
    try { if (await evaluate(expression)) return; }
    catch(error) { if (!/Inspected target navigated or closed|Execution context was destroyed|Cannot find context/.test(error.message)) throw error; }
    await delay(50);
  }
  throw new Error(`Condition not met: ${expression}`);
}
async function screenshot(name) {
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, session);
  await writeFile(join(artifacts, name), Buffer.from(data, 'base64'));
}
function pass(message) { console.log(`PASS ${message}`); }

async function goTool(name) {
  await evaluate(String.raw`location.hash=${JSON.stringify(name ? '#/' + name : '#/')}`);
  await until(`document.documentElement?.dataset.activeTool===${JSON.stringify(name || 'home')}`);
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
 await cdp('Page.navigate',{url:process.env.ILFC_LIVE_URL||`http://127.0.0.1:${port}/`},session);await until("document.documentElement?.dataset.activeTool==='home'");

 await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
 const click=async id=>evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
 const set=async(id,value,event='input')=>evaluate(`{const n=document.getElementById(${JSON.stringify(id)});n.value=${JSON.stringify(value)};n.dispatchEvent(new Event(${JSON.stringify(event)},{bubbles:true}));}`);
 const put=async(id,expression)=>evaluate(`{const d=new DataTransfer();d.items.add(${expression});const n=document.getElementById(${JSON.stringify(id)});n.files=d.files;n.dispatchEvent(new Event('change',{bubbles:true}));}`);
 const selectSlide=async index=>evaluate(`document.querySelectorAll('#ppt-slides button')[${index}].click()`);
 await evaluate(`window.pc=await import('./presentation-core.js');window.fixture={};const c=document.createElement('canvas');c.width=640;c.height=360;const x=c.getContext('2d');x.fillStyle='#156b82';x.fillRect(0,0,640,360);x.fillStyle='white';x.font='40px Arial';x.fillText('Example project',50,150);fixture.image=new File([await new Promise(r=>c.toBlob(r))],'project.png',{type:'image/png'});`);
 await goTool('presentation-templates');await click('ppt-template-project');await until(`document.documentElement.dataset.activeTool==='presentations'`);assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),5);
 await set('ppt-deck-title','Team update');await set('ppt-slide-title','A clear story — தமிழ்');await set('ppt-notes','Private speaker notes <keep & review>');
 await click('ppt-add');await set('ppt-layout','image','change');await set('ppt-slide-title','Our work');await put('ppt-image','fixture.image');await until(`document.getElementById('ppt-status').textContent.includes('Image added')`);await set('ppt-image-alt','A teal project illustration');
 await click('ppt-add');await set('ppt-layout','quote','change');await set('ppt-body','Make the next step clear.');await click('ppt-add');await set('ppt-layout','columns','change');await set('ppt-body','Before\nRepeated work');await set('ppt-right','After\nShared decisions');
 assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),8);await click('ppt-duplicate');assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),9);await click('ppt-undo');assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),8);await click('ppt-redo');assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),9);await click('ppt-delete');assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),8);await click('ppt-earlier');await click('ppt-later');
 await click('ppt-save');await until(`document.getElementById('ppt-status').textContent.includes('Draft saved')`);assert.equal(await evaluate(`(await pc.drafts('list')).length`),1);await evaluate(`window.savedDeck=(await pc.drafts('list'))[0].deck;`);
 assert.equal(await evaluate(`savedDeck.slides.some(s=>s.image.startsWith('data:image/png;base64,'))`),true);assert.equal(await evaluate(`savedDeck.slides[0].notes`),'Private speaker notes <keep & review>');pass('Slide editing, normalized image upload, notes, duplication, order, undo/redo and local draft save');
 await selectSlide(0);await click('ppt-present');await until(`document.querySelector('#ppt-player canvas')`);assert.equal(await evaluate(`document.getElementById('ppt-player').open`),true);assert.equal(await evaluate(`document.querySelector('.presentation-speaker-notes').hidden`),true);await click('ppt-player-next');await until(`document.querySelector('#ppt-player .presentation-toolbar span').textContent.startsWith('2 /')`);await click('ppt-player-close');await until(`!document.getElementById('ppt-player').open`);
 await click('ppt-export');await until(`!!document.getElementById('ppt-pptx-download')||document.getElementById('ppt-status').classList.contains('error')`);assert.equal(await evaluate(`!!document.getElementById('ppt-pptx-download')`),true,await evaluate(`document.getElementById('ppt-status').textContent`));
 const readBlob=async expression=>evaluate(`await new Promise(async(resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=reject;try{r.readAsDataURL(${expression});}catch(e){reject(e);}})`);
 await click('ppt-pptx-download');const pptx=await readDownload('Team update.pptx');await writeFile(join(artifacts,'presentation-wide.pptx'),pptx);
 const {default:JSZip}=await import('jszip');const archive=await JSZip.loadAsync(pptx);const names=Object.keys(archive.files);assert.equal(names.filter(n=>/^ppt\/slides\/slide\d+\.xml$/.test(n)).length,8);assert.ok(names.some(n=>/^ppt\/media\/image/.test(n)));assert.ok(names.some(n=>/^ppt\/charts\/chart.*xml$/.test(n)));const xmls=await Promise.all(names.filter(n=>/^ppt\/slides\/slide\d+\.xml$/.test(n)).map(n=>archive.file(n).async('string')));assert.ok(xmls.some(xml=>xml.includes('தமிழ்')));assert.ok(xmls.some(xml=>xml.includes('<a:tbl>')));assert.ok((await archive.file('ppt/notesSlides/notesSlide1.xml').async('string')).includes('Private speaker notes &lt;keep &amp; review&gt;'));assert.ok((await archive.file('ppt/presentation.xml').async('string')).includes('cx="12192000" cy="6858000"'));pass('Actual PPTX contains eight editable slides, a native chart, table, image, Unicode text and escaped speaker notes');
 await click('ppt-pdf');await until(`!!document.getElementById('ppt-pdf-download')||document.getElementById('ppt-status').classList.contains('error')`);assert.equal(await evaluate(`!!document.getElementById('ppt-pdf-download')`),true,await evaluate(`document.getElementById('ppt-status').textContent`));await click('ppt-pdf-download');const pdf=await readDownload('Team update.pdf');const {PDFDocument}=await import('pdf-lib');assert.equal((await PDFDocument.load(pdf)).getPageCount(),8);
 await set('ppt-deck-title','Team update standard');await set('ppt-ratio','standard');await click('ppt-export');await until(`!!document.getElementById('ppt-pptx-download')||document.getElementById('ppt-status').classList.contains('error')`);assert.equal(await evaluate(`!!document.getElementById('ppt-pptx-download')`),true,await evaluate(`document.getElementById('ppt-status').textContent`));await click('ppt-pptx-download');const standard=await readDownload('Team update standard.pptx');const standardZip=await JSZip.loadAsync(standard);assert.ok((await standardZip.file('ppt/presentation.xml').async('string')).includes('cx="9144000" cy="6858000"'));await writeFile(join(artifacts,'presentation-standard.pptx'),standard);pass('PDF has one page per slide; standard PowerPoint has correct 4:3 dimensions');
 await click('ppt-save');await until(`document.getElementById('ppt-status').textContent.includes('Draft saved')`);await cdp('Page.reload',{},session);await until(`document.documentElement?.dataset.activeTool==='presentations'&&document.getElementById('ppt-add')`);await goTool('presentation-drafts');await until(`document.getElementById('ppt-draft-list').textContent.includes('Team update')`);await evaluate(`[...document.querySelectorAll('#ppt-draft-list button')].find(b=>b.textContent==='Open draft').click()`);await until(`document.documentElement.dataset.activeTool==='presentations'`);assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),8);assert.equal(await evaluate(`document.getElementById('ppt-ratio').value`),'standard');
 await evaluate(`window.pc=await import('./presentation-core.js');window.savedDeck=(await pc.drafts('list'))[0].deck;`);await goTool('presentation-drafts');await put('ppt-import',`new File([JSON.stringify(savedDeck)],'backup.ilfc.json',{type:'application/json'})`);await until(`document.documentElement.dataset.activeTool==='presentations'`);assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),8);pass('Saved draft survives reload; project backup import restores slides and images');
 await goTool('outline-presentation');await set('ppt-outline','# Next steps\n- Review\n- Launch');await click('ppt-outline-append');await until(`document.documentElement.dataset.activeTool==='presentations'`);assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),9);assert.equal(await evaluate(`document.getElementById('ppt-slide-title').value`),'Next steps');
 for(const expression of [`pc.fromOutline('Missing heading')`,`pc.chartData('Invalid | nope')`,`pc.tableData('One column')`,`pc.validateDeck({...pc.newDeck(),slides:Array.from({length:31},()=>pc.newSlide())})`,`pc.parseProject('{"version":99}')`,`pc.parseProject(JSON.stringify({...pc.newDeck(),slides:[{...pc.newSlide('image'),image:'https://example.com/photo.png'}]}))`])assert.equal(await evaluate(`try{${expression};false}catch(e){!!e.message}`),true);
 assert.equal(await evaluate(`try{pc.validateDeck({...pc.newDeck(),slides:[{...pc.newSlide('chart'),chartType:'pie',body:'Zero | 0'}]});false}catch(e){e.message.includes('positive')}`),true);
 // Each chart type exports a native chart; imported invalid chart data blocks export.
 for(const type of ['line','pie']){const encoded=await readBlob(`await pc.exportPPTX({...pc.newDeck(),slides:[{...pc.newSlide('chart'),chartType:${JSON.stringify(type)}}]})`);const z=await JSZip.loadAsync(Buffer.from(encoded,'base64'));assert.match(await z.file(Object.keys(z.files).find(n=>/^ppt\/charts\/chart.*\.xml$/.test(n))).async('string'),new RegExp('<c:'+type+'Chart'));}
 await set('ppt-layout','chart','change');await set('ppt-body','Bad | text');await click('ppt-export');await until(`document.getElementById('ppt-status').classList.contains('error')`);assert.equal(await evaluate(`!!document.getElementById('ppt-pptx-download')`),false);await set('ppt-body','Plan | 30\nBuild | 60');
 pass('Outline append, native line/pie charts, import limits, invalid chart/table data and stale download invalidation');

 await evaluate(`for(let i=0;i<4;i++)await pc.drafts('save',{id:'test-quota-'+i,updated:Date.now(),deck:pc.newDeck()});`);
 assert.equal(await evaluate(`try{await pc.drafts('save',{id:'sixth',updated:Date.now(),deck:pc.newDeck()});false}catch(e){e.message.includes('limit')}`),true);
 await evaluate(`await pc.drafts('save',{id:'test-quota-0',updated:Date.now(),deck:pc.newDeck()});for(let i=0;i<4;i++)await pc.drafts('delete','test-quota-'+i);`);
 assert.equal(await evaluate(`(await pc.drafts('list')).length`),1);
 await goTool('presentation-templates');acceptDialog=false;await click('ppt-template-meeting');await until(`document.documentElement.dataset.activeTool==='presentation-templates'`);assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),9);
 acceptDialog=true;await click('ppt-template-meeting');await until(`document.documentElement.dataset.activeTool==='presentations'`);assert.equal(await evaluate(`document.querySelectorAll('#ppt-slides li').length`),4);assert.ok(dialogs.some(t=>t.includes('Replace the current deck')));pass('Five-draft quota, overwrite/delete recovery, and unsaved replacement confirmation');
 for(const width of [1440,1024,768,390,320]){await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<1000},session);for(const route of ['presentations','presentation-templates','outline-presentation','presentation-drafts','guide/presentations']){await goTool(route);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,route+' overflows at '+width);}await goTool('presentations');await selectSlide(0);await until(`document.querySelector('#ppt-preview canvas')`);await screenshot('presentation-editor-'+width+'.png');await goTool('presentation-templates');await screenshot('presentation-templates-'+width+'.png');}
 assert.deepEqual(errors,[]);if(!process.env.ILFC_LIVE_URL)assert.deepEqual(externalRequests,[]);pass('All presentation pages fit desktop/tablet/mobile; no browser errors or remote processing');
} catch(error) { console.error('Browser errors:',errors);try{await screenshot('presentation-failure.png');}catch{}throw error;
} finally {
 browser.kill('SIGTERM');await new Promise(resolve=>server.close(resolve));await delay(500);for(const entry of pending.values())clearTimeout(entry.timer);await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
