import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { browserTest } from './browser-harness.mjs';
const b=await browserTest();const {evaluate,until,set,go}=b;
const put=expression=>evaluate(`{const dt=new DataTransfer();for(const f of [${expression}])dt.items.add(f);document.getElementById('workflow-file').files=dt.files;document.getElementById('workflow-file').dispatchEvent(new Event('change',{bubbles:true}));}`);
const click=id=>evaluate(`document.getElementById(${JSON.stringify(id)}).click()`);
const run=async()=>{await evaluate("document.getElementById('workflow-form').requestSubmit()");await until("document.getElementById('workflow-form').getAttribute('aria-busy')==='false'");};
try {
  await go('workflow');
  await evaluate(`window.fixture={};const c=document.createElement('canvas');c.width=900;c.height=600;const ctx=c.getContext('2d');const g=ctx.createLinearGradient(0,0,900,600);g.addColorStop(0,'red');g.addColorStop(1,'blue');ctx.fillStyle=g;ctx.fillRect(0,0,900,600);ctx.fillStyle='white';ctx.fillRect(30,30,200,100);fixture.image=new File([await new Promise(r=>c.toBlob(r))],'photo.png',{type:'image/png'});fixture.bad=new File(['bad data'],'broken.jpg',{type:'image/jpeg'});fixture.pdf=new File(['not an image'],'document.pdf',{type:'application/pdf'});window.bridge=await import('./account-bridge.js?v=1');window.core=await import('./workflow-core.js');window.runner=await import('./workflow-runner.js');`);
  await put('fixture.image');await set('workflow-step-0-edge','450');
  await click('workflow-preview');await until("document.getElementById('workflow-status').textContent.startsWith('Preview ready')");
  assert.equal(await evaluate("bridge.results.size"),0,'Preview must not register an account save or activity');
  assert.equal(await evaluate("document.querySelector('#workflow-output img').naturalWidth"),450);
  await run();assert.equal(await evaluate("bridge.results.get('workflow-download').blob.type"),'image/webp');
  assert.equal(await evaluate("bridge.results.get('workflow-download').blob.size<=200000"),true);
  assert.equal(await evaluate("!!document.getElementById('workflow-zip')"),true);
  console.log('PASS Worker pipeline reuses resize/privacy/conversion/compression and previews stay local');

  await set('workflow-name','Website pipeline');await click('workflow-save');await until("document.getElementById('workflow-status').textContent==='Workflow settings saved.'");
  const saved=await evaluate("JSON.parse(localStorage.getItem('ilfc-guest-workflows'))");assert.equal(saved[0].version,2);assert.equal(saved[0].steps.length,4);
  await evaluate("[...document.querySelectorAll('#workflow-list button')].find(b=>b.textContent==='Duplicate').click()");await until("document.querySelectorAll('.workflow-saved-row').length===2");
  await evaluate("window.prompt=()=> 'Renamed pipeline';[...document.querySelectorAll('#workflow-list button')].find(b=>b.textContent==='Rename').click()");await until("document.getElementById('workflow-list').textContent.includes('Renamed pipeline')");
  await evaluate("[...document.querySelectorAll('#workflow-list button')].find(b=>b.textContent==='Delete preset').click()");await until("document.querySelectorAll('.workflow-saved-row').length===1");
  await click('workflow-backup');
  for(let i=0;i<100;i++){if((await readdir(b.downloads)).includes('workflow.ilfc-workflow.json'))break;await new Promise(r=>setTimeout(r,50));}
  const backup=JSON.parse(await readFile(join(b.downloads,'workflow.ilfc-workflow.json'),'utf8'));assert.equal(backup.steps.length,4);
  await evaluate(`{const dt=new DataTransfer();dt.items.add(new File([${JSON.stringify(JSON.stringify(backup))}],'recipe.json',{type:'application/json'}));const n=document.getElementById('workflow-import');n.files=dt.files;n.dispatchEvent(new Event('change'));}`);
  await until("document.getElementById('workflow-status').textContent.startsWith('Backup imported')");
  console.log('PASS Saved recipe create/duplicate/rename/delete, actual backup download and import');

  await set('workflow-step-type','watermark');await click('workflow-add');await set('workflow-step-4-text','TEST');
  await evaluate("document.querySelector('[aria-label=\"Move step 5 up\"]').click()");
  assert.equal(await evaluate("document.querySelectorAll('.workflow-step h2')[3].textContent"),'4. Text watermark');
  await evaluate("document.querySelector('[aria-label=\"Remove step 4: Text watermark\"]').click()");
  assert.equal(await evaluate("document.querySelectorAll('.workflow-step').length"),4);
  await set('workflow-step-0-edge','0');await click('workflow-validate');assert.match(await evaluate("document.getElementById('workflow-status').textContent"),/Step 1/);
  await set('workflow-step-0-edge','450');await put('fixture.image,fixture.bad,fixture.pdf,fixture.image');await run();
  assert.match(await evaluate("document.getElementById('workflow-status').textContent"),/2 succeeded, 2 failed/);
  assert.equal(await evaluate("document.querySelectorAll('.workflow-failed').length"),2);
  assert.match(await evaluate("document.querySelector('.workflow-failed').textContent"),/Step 1/);
  await click('workflow-zip');
  for(let i=0;i<100;i++){if((await readdir(b.downloads)).includes('workflow-results.zip'))break;await new Promise(r=>setTimeout(r,50));}
  const zip=await readFile(join(b.downloads,'workflow-results.zip'));assert.equal(zip.readUInt32LE(0),0x04034b50);assert.equal(zip.includes(Buffer.from('1-photo.webp')),true);assert.equal(zip.includes(Buffer.from('4-photo.webp')),true);
  await put('fixture.image');await run();assert.match(await evaluate("document.getElementById('workflow-status').textContent"),/1 succeeded, 0 failed/);
  console.log('PASS Add/reorder/remove/validate steps, corrupt/unsupported per-file recovery and actual ZIP entries');

  const checks=await evaluate(`await (async()=>{
    const r=core.newWorkflow();r.steps=[core.newStep('resize'),core.newStep('rotate'),core.newStep('convert')];r.steps[0].options.edge=300;r.steps[2].options.format='image/png';
    const worker=await runner.runWorkflowJob({file:fixture.image,recipe:r}),fallback=await runner.runWorkflowJob({file:fixture.image,recipe:r},{forceMainThread:true});
    const a=await createImageBitmap(worker.blob),z=await createImageBitmap(fallback.blob);const dims=[a.width,a.height,z.width,z.height];a.close();z.close();
    const stop=new AbortController();stop.abort();let cancelled=false;try{await runner.runWorkflowJob({file:fixture.image,recipe:r},{signal:stop.signal});}catch(e){cancelled=e.name==='AbortError';}
    return {dims,cancelled,worker:runner.canUseWorkflowWorker()};
  })()`);
  assert.deepEqual(checks.dims,[200,300,200,300]);assert.equal(checks.cancelled,true);assert.equal(checks.worker,true);
  await put('...Array.from({length:20},()=>fixture.image)');
  await evaluate("document.getElementById('workflow-form').requestSubmit()");
  await until("!!document.getElementById('workflow-download') && document.getElementById('workflow-form').getAttribute('aria-busy')==='true'");
  await click('workflow-cancel');await until("document.getElementById('workflow-form').getAttribute('aria-busy')==='false'");
  assert.match(await evaluate("document.getElementById('workflow-status').textContent"),/Cancelled/);
  assert.equal(await evaluate("!!document.getElementById('workflow-download')"),true);
  await evaluate("document.getElementById('workflow-form').requestSubmit()");await go('resize');
  await until("document.getElementById('workflow-form').getAttribute('aria-busy')==='false'");
  assert.equal(await evaluate("document.getElementById('workflow-output').children.length"),0);
  await go('workflow');
  console.log('PASS Worker/fallback parity, immediate cancellation, completed-result retention and route-leave cleanup');

  const imageChecks=await evaluate(`await (async()=>{
    const recipe=core.newWorkflow();recipe.steps=[core.newStep('crop'),core.newStep('convert'),core.newStep('compress'),core.newStep('watermark')];recipe.steps[1].options.format='image/png';recipe.steps[2].options.targetKB=1;recipe.steps[2].options.allowResize=false;recipe.steps[3].options.text='Visible watermark';
    const output=await runner.runWorkflowJob({file:fixture.image,recipe});
    const c=document.createElement('canvas');c.width=40;c.height=20;const png=new File([await new Promise(r=>c.toBlob(r))],'alpha.png',{type:'image/png'});const bg=core.newWorkflow();bg.steps=[core.newStep('background')];bg.steps[0].options.color='#00ff00';const filled=await runner.runWorkflowJob({file:png,recipe:bg});const bit=await createImageBitmap(filled.blob);c.getContext('2d').drawImage(bit,0,0);bit.close();
    return {width:output.width,height:output.height,warnings:output.warnings,pixel:[...c.getContext('2d').getImageData(0,0,1,1).data]};
  })()`);
  assert.equal(imageChecks.width,600);assert.equal(imageChecks.height,600);assert.equal(imageChecks.warnings.length,1);assert.deepEqual(imageChecks.pixel,[0,255,0,255]);

  await evaluate("localStorage.setItem('ilfc-guest-workflows',JSON.stringify([{name:'Old preset',edge:'240',target:'100',format:'image/jpeg',watermark:'Legacy',color:'#ffffff'}]));window.dispatchEvent(new Event('workflows-changed'))");
  await evaluate("[...document.querySelectorAll('#workflow-list button')].find(b=>b.textContent==='Use settings').click()");
  await put('fixture.image');await run();await until("document.querySelector('#workflow-output img')?.naturalWidth>0");assert.equal(await evaluate("document.querySelector('#workflow-output img').naturalWidth"),240);assert.equal(await evaluate("bridge.results.get('workflow-download').blob.type"),'image/jpeg');
  await click('workflow-save');await until("document.getElementById('workflow-status').textContent==='Workflow settings saved.'");
  await evaluate('window.workflowBeforeReload=true');await b.cdp('Page.reload');await until("!window.workflowBeforeReload && !!document.querySelector('.footer-links') && document.documentElement?.dataset.activeTool==='workflow'");
  assert.equal(await evaluate("document.getElementById('workflow-list').textContent.includes('Old preset')"),true);
  await evaluate("window.bridge=await import('./account-bridge.js?v=1');bridge.setPreferences({other:'x'.repeat(7800)});window.dispatchEvent(new CustomEvent('workspace-identity',{detail:{signedIn:true,owner:'test-owner'}}))");
  await click('workflow-save');await until("document.getElementById('workflow-status').textContent.includes('settings are full')");
  await evaluate("window.dispatchEvent(new CustomEvent('workspace-identity',{detail:{signedIn:false}}))");
  assert.equal(await evaluate("document.getElementById('workflow-list').textContent.includes('Old preset')"),true);
  console.log('PASS Crop/background/watermark/final target warnings, legacy migration/persistence and account settings budget');
  for(const width of [320,390,768,1024,1440]){
    await b.cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<1000});
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`Workflow overflow at ${width}`);
  }
  await b.screenshot('release03-workflow-desktop.png');
  assert.deepEqual(b.errors,[]);assert.deepEqual(b.external,[]);
  console.log('PASS Responsive workflow layout; no browser errors or external processing');
} finally {await b.close();}
