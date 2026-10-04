// Real weights and browser inference: opt-in because downloads total about 1.02 GB.
// AI_MODELS_DIR contains verified pinned pack files under text/, entities/ and vision/.
import assert from 'node:assert/strict';
import {browserTest} from './browser-harness.mjs';
import {AI_MODELS} from '../public/ai-models.js';
const kind=process.argv.includes('--vision')?'vision':'text';
if(!process.env.AI_MODELS_DIR)throw Error('Set AI_MODELS_DIR to the verified local model fixture directory.');
const b=await browserTest({modelRoot:process.env.AI_MODELS_DIR});
const wait=async expression=>{let last='';for(let i=0;i<3600;i++){if(await b.evaluate(expression))return;if(i%40===0){const status=await b.evaluate("document.querySelector('.ai-page:not([hidden]) .studio-status')?.textContent");if(status!==last){console.log('Model progress:',status);last=status;}}await new Promise(r=>setTimeout(r,250));}throw Error('Model check timed out: '+await b.evaluate("document.querySelector('.ai-page:not([hidden]) .studio-status')?.textContent"));};
try{
 await b.evaluate("window.aiManifest=await import('./ai-models.js');window.aiCache=await caches.open(aiManifest.AI_CACHE)");
 for(const fixtureKind of kind==='text'?['text','entities']:['vision'])for(const file of AI_MODELS[fixtureKind].files){
  const result=await b.evaluate(`await (async()=>{const file=${JSON.stringify(file)},model=aiManifest.AI_MODELS[${JSON.stringify(fixtureKind)}];const response=await fetch('/__ai-fixtures/'+${JSON.stringify(fixtureKind)}+'/'+file.path);const blob=await response.blob();if(blob.size!==file.bytes)throw Error('Fixture size mismatch');await aiCache.put(aiManifest.modelURL(model,file),new Response(blob,{headers:{'content-length':String(file.bytes),'x-ilfc-sha256':file.sha256}}));return blob.size;})()`);
  assert.equal(result,file.bytes);console.log('Cached real fixture',fixtureKind,file.path);
 }
 if(kind==='vision'){
  await b.go('ai-image');await b.evaluate(`{const c=document.createElement('canvas');c.width=800;c.height=240;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,800,240);x.fillStyle='black';x.font='bold 70px Arial';x.fillText('HELLO WORLD',50,135);const dt=new DataTransfer();dt.items.add(new File([await new Promise(r=>c.toBlob(r))],'hello.png',{type:'image/png'}));document.getElementById('aiimage-file').files=dt.files;}`);
  for(const action of ['ocr','description','alt','filename']){
   await b.set('aiimage-action',action);await b.evaluate("document.getElementById('aiimage-run').click()");await wait("document.getElementById('ai-image-tool').getAttribute('aria-busy')==='false'");
   const value=await b.evaluate("document.querySelector('#aiimage-output textarea')?.value");if(!value)console.log('Diagnostics',b.logs);assert.ok(value,'No '+action+' result: '+await b.evaluate("document.getElementById('aiimage-status').textContent"));
   if(action==='ocr')assert.match(value,/HELLO.*WORLD/i);if(action==='filename')assert.match(value,/^[\p{L}\p{N}-]+\.png$/u);console.log('REAL VISION',action,value);
  }
 }else{
  await b.go('ai-document');await b.set('aidoc-text','Project Aurora launches on 12 October 2026. Priya Raman owns the launch checklist. The approved budget is 25000 dollars. The team must complete accessibility testing before launch.');
  for(const action of (process.argv.includes('--presentation-only')?[]:['summary','question','points','dates','names','actions','outline'])){
   await b.set('aidoc-action',action);await b.set('aidoc-question','Who owns the launch checklist?');await b.evaluate("document.getElementById('aidoc-run').click()");await wait("document.getElementById('ai-document-tool').getAttribute('aria-busy')==='false'");
   const value=await b.evaluate("document.querySelector('#aidoc-output textarea')?.value");if(!value)console.log('Diagnostics',b.logs);assert.ok(value,'No '+action+' result: '+await b.evaluate("document.getElementById('aidoc-status').textContent"));if(action==='question'||action==='names')assert.match(value,/Priya Raman/);if(action==='dates')assert.match(value,/12 October 2026/);if(action==='actions')assert.match(value,/accessibility testing/i);console.log('REAL DOCUMENT',action,value);
  }
  await b.set('aidoc-text','Quarter | Revenue\nJanuary | 1200\nFebruary | 1500');await b.set('aidoc-action','tables');await b.evaluate("document.getElementById('aidoc-run').click()");await wait("document.getElementById('ai-document-tool').getAttribute('aria-busy')==='false'");const table=await b.evaluate("document.querySelector('#aidoc-output textarea')?.value");assert.match(table||'',/January.*1200/);console.log('REAL TABLE',table);
  await b.evaluate("window.aiRaw=[];const NativeWorker=window.Worker;window.Worker=class extends NativeWorker{constructor(...args){super(...args);if(String(args[0]).includes('ai-worker'))this.addEventListener('message',e=>{if(e.data.result)aiRaw.push(e.data.result);});}};");await b.go('ai-presentation');await b.set('aippt-topic','Cloud computing basics');await b.set('aippt-audience','College students');await b.set('aippt-count','10');await b.evaluate("document.getElementById('aippt-run').click()");await wait("document.getElementById('ai-presentation-tool').getAttribute('aria-busy')==='false'");
  if(!await b.evaluate("document.querySelector('#aippt-output li')!==null"))console.log('Generation diagnostics',await b.evaluate('aiRaw.slice(-2)'));assert.equal(await b.evaluate("document.querySelectorAll('#aippt-output li').length"),10,await b.evaluate("document.getElementById('aippt-status').textContent"));await b.evaluate("document.getElementById('aippt-open').click()");await b.until("document.documentElement.dataset.activeTool==='presentations'");assert.match(await b.evaluate("document.getElementById('ppt-notes').value"),/Suggested image/);console.log('REAL PRESENTATION: ten generated slides opened in existing editor with speaker notes');
 }
 if(kind==='text'){
  await b.go('ai-document');await b.set('aidoc-text','Explain the benefits of accessible documents.');await b.set('aidoc-action','summary');await b.evaluate("document.getElementById('aidoc-run').click()");await wait("document.getElementById('aidoc-status').textContent.includes('Generating text locally')");await b.evaluate("document.getElementById('aidoc-cancel').click()");await wait("document.getElementById('ai-document-tool').getAttribute('aria-busy')==='false'");assert.match(await b.evaluate("document.getElementById('aidoc-status').textContent"),/Cancelled/);assert.equal(await b.evaluate("document.querySelector('#aidoc-output textarea')"),null);
  await b.evaluate("document.getElementById('aidoc-run').click()");await b.go('resize');await wait("document.getElementById('ai-document-tool').getAttribute('aria-busy')==='false'");console.log('PASS live inference cancellation and navigation cleanup');
 }
 assert.deepEqual(b.errors,[]);assert.deepEqual(b.external,[]);console.log('PASS real '+kind+' model in browser worker with cached weights, no external inference requests');
}finally{await b.close();}
