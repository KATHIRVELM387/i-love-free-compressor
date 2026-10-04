import assert from 'node:assert/strict';
import {browserTest} from './browser-harness.mjs';
const b=await browserTest();
try{
 assert.equal(await b.evaluate("document.querySelectorAll('.tool-card').length"),53);
 await b.go('ai-document');await b.set('nav-search','AI document');assert.equal(await b.evaluate("[...document.querySelectorAll('#side-links a')].filter(a=>a.getClientRects().length).some(a=>a.hash==='#/ai-document')"),true);await b.set('nav-search','');
 await b.set('aidoc-text','Project Aurora launches on 12 October 2026.');await b.evaluate("document.getElementById('aidoc-run').click()");await b.until("document.getElementById('aidoc-status').textContent.includes('Download and verify')");
 assert.equal(b.external.length,0,'Opening AI and running without a pack must never download a model or transmit input');
 await b.evaluate(`{const {PDFDocument,StandardFonts}=await import('./vendor/pdf-lib.js');const doc=await PDFDocument.create(),page=doc.addPage();page.drawText('Project Aurora launches in October.',{x:40,y:700,size:18,font:await doc.embedFont(StandardFonts.Helvetica)});const dt=new DataTransfer();dt.items.add(new File([await doc.save()],'selectable.pdf',{type:'application/pdf'}));const input=document.getElementById('aidoc-file');input.files=dt.files;input.dispatchEvent(new Event('change'));document.getElementById('aidoc-read').click();}`);
 await b.until("document.getElementById('aidoc-status').textContent.startsWith('Text loaded locally')");assert.match(await b.evaluate("document.getElementById('aidoc-text').value"),/Project Aurora/);
 await b.evaluate(`{const {PDFDocument}=await import('./vendor/pdf-lib.js');const doc=await PDFDocument.create();doc.addPage();const dt=new DataTransfer();dt.items.add(new File([await doc.save()],'scan.pdf',{type:'application/pdf'}));document.getElementById('aidoc-file').files=dt.files;document.getElementById('aidoc-read').click();}`);
 await b.until("document.getElementById('aidoc-status').textContent.includes('no selectable text')");
 const image=await b.evaluate(`await (async()=>{const {imageInput}=await import('./ai-input.js');const c=document.createElement('canvas');c.width=2048;c.height=1000;const file=new File([await new Promise(r=>c.toBlob(r))],'test.png',{type:'image/png'});const image=await imageInput(file);return {width:image.width,height:image.height,alpha:image.pixels[3]};})()`);assert.deepEqual(image,{width:1024,height:500,alpha:255});
 await b.go('ai-presentation');await b.set('aippt-topic','Cloud computing');await b.set('aippt-count','11');await b.evaluate("document.getElementById('aippt-run').click()");await b.until("document.getElementById('aippt-status').textContent.includes('2 to 10')");
 await b.go('presentations');await b.set('ppt-deck-title','Existing unsaved deck');await b.evaluate("window.confirm=()=>false;window.newAI=await import('./presentation-core.js');window.aiEditor=await import('./presentations.js');window.accepted=aiEditor.openGeneratedPresentation({...newAI.newDeck(),title:'AI replacement'});");assert.equal(await b.evaluate('accepted'),false);assert.equal(await b.evaluate("document.getElementById('ppt-deck-title').value"),'Existing unsaved deck');
 await b.evaluate("window.confirm=()=>true;aiEditor.openGeneratedPresentation({...newAI.newDeck(),title:'AI accepted'});");assert.equal(await b.evaluate("document.getElementById('ppt-deck-title').value"),'AI accepted');
 for(const route of ['ai-document','ai-image','ai-presentation']){await b.go(route);for(const width of [320,390,768,1440]){await b.cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<1000});assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true,route+' '+width);}}
 const cacheChecks=await b.evaluate(`await (async()=>{
  const {AI_MODELS,modelURL}=await import('./ai-models.js'),api=await import('./ai-cache.js');const original=AI_MODELS.text,fetchBefore=window.fetch;let requests=0;
  AI_MODELS.text={...original,bytes:3,files:[{path:'test-integrity.bin',bytes:3,sha256:'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'}]};
  try{
   const stop=new AbortController();stop.abort();let cancelled=false;try{await api.downloadPack('text',{signal:stop.signal});}catch(e){cancelled=e.name==='AbortError';}
   window.fetch=async(url,options)=>{requests++;if(options.credentials!=='omit'||options.referrerPolicy!=='no-referrer')throw Error('Unsafe model download');return new Response('bad');};
   let integrity=false;try{await api.downloadPack('text');}catch(e){integrity=e.message.includes('integrity');}
   const before=(await api.packStatus('text')).ready;
   window.fetch=async()=>{requests++;return new Response('abc');};await api.downloadPack('text');const installed=(await api.packStatus('text')).ready;await api.removePack('text');const removed=!(await api.packStatus('text')).ready;
   return {cancelled,integrity,before,installed,removed,requests};
  }finally{await api.removePack('text');AI_MODELS.text=original;window.fetch=fetchBefore;}
 })()`);assert.deepEqual(cacheChecks,{cancelled:true,integrity:true,before:false,installed:true,removed:true,requests:2});
 const memory=await b.evaluate(`await (async()=>{const own=Object.getOwnPropertyDescriptor(navigator,'deviceMemory');Object.defineProperty(navigator,'deviceMemory',{value:2,configurable:true});try{const {downloadPack}=await import('./ai-cache.js');const {LocalAIProvider}=await import('./ai-provider.js');let download=false,inference=false;try{await downloadPack('text');}catch(e){download=e.message.includes('less than 4 GB');}try{await new LocalAIProvider().generate({});}catch(e){inference=e.message.includes('less than 4 GB');}return {download,inference};}finally{if(own)Object.defineProperty(navigator,'deviceMemory',own);else delete navigator.deviceMemory;}})()`);assert.deepEqual(memory,{download:true,inference:true});
 await b.go('ai-document');await b.set('aidoc-text','Launch on 12 October 2026.');await b.set('aidoc-action','dates');await b.evaluate("document.getElementById('aidoc-run').click()");await b.until("document.querySelector('#aidoc-output textarea')!==null");
 await b.evaluate("window.dispatchEvent(new CustomEvent('workspace-identity',{detail:{signedIn:true,owner:'ai-test-owner'}}))");assert.equal(await b.evaluate("document.getElementById('aidoc-text').value"),'');assert.equal(await b.evaluate("document.getElementById('aidoc-output').childElementCount"),0);assert.equal(await b.evaluate("(await import('./account-bridge.js?v=1')).results.has('ai-document-download')"),false);
 await b.evaluate("window.dispatchEvent(new CustomEvent('workspace-identity',{detail:{signedIn:false}}))");await b.go('ai-presentation');
 console.log('PASS low-memory refusal and account-identity input/result isolation');
 console.log('PASS Model download cancellation, credential omission, SHA-256 rejection, verified cache installation and removal (small fault fixtures)');
 await b.screenshot('ai-studio-desktop.png');assert.deepEqual(b.errors,[]);assert.deepEqual(b.external,[]);
 console.log('PASS AI routes/search/layout, no automatic downloads, PDF text/scan handling, bounded images, validation and existing editor replacement protection');
}finally{await b.close();}
