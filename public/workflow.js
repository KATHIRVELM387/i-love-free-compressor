import { getPreferences, registerResult, forgetToolResults } from './account-bridge.js?v=1';
import { STEP_TYPES, WORKFLOW_LIMITS, newWorkflow, newStep, validateWorkflow, migrateWorkflow, validateSelection, validateSavedWorkflows, checkPreferenceBudget } from './workflow-core.js';
import { runWorkflowJob, canUseWorkflowWorker } from './workflow-runner.js';
import { formatBytes } from './image-tools.js?v=7';

const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
export let signedIn=false;
let identity=null,identityVersion=0;
export function workspacePresets(){
  let value;
  try{value=signedIn?getPreferences().workflows:JSON.parse(localStorage.getItem('ilfc-guest-workflows'));}catch{}
  return Array.isArray(value)?value.slice(0,10):[];
}
export async function storePresets(value){
  validateSavedWorkflows(value);
  const version=identityVersion;
  if(signedIn){
    checkPreferenceBudget(getPreferences(),value);
    await new Promise((resolve,reject)=>window.dispatchEvent(new CustomEvent('save-workspace-preferences',{detail:{key:'workflows',value,resolve,reject}})));
  }else{
    try{localStorage.setItem('ilfc-guest-workflows',JSON.stringify(value));}catch{throw Error('This browser could not save the workflow. Download a workflow backup instead.');}
  }
  if(version!==identityVersion)throw Error('Your account changed. Reopen your saved workflows before continuing.');
  window.dispatchEvent(new Event('workflows-changed'));
}
const section=el('section',undefined,'workspace wrap');section.id='workflow-tool';section.hidden=true;
section.innerHTML=`<div class="workspace-heading"><div><span class="tiny-label">BROWSER WORKFLOWS</span><h1 id="workflow-heading" tabindex="-1">Workflow builder</h1><p>Arrange image-processing steps, preview one photo, then run the same settings on a batch.</p></div></div>
<div class="workflow-layout"><form id="workflow-form"><fieldset id="workflow-controls" class="studio-controls">
<label>Workflow name<input id="workflow-name" maxlength="50" required></label>
<div class="workflow-actions"><button type="button" id="workflow-new" class="button secondary">New workflow</button><button type="button" id="workflow-save" class="button secondary">Save workflow</button><button type="button" id="workflow-backup" class="text-button">Download workflow backup</button></div>
<label>Photos<input id="workflow-file" type="file" multiple accept="image/jpeg,image/png,image/webp"></label>
<p id="workflow-selection" class="field-help">Choose up to 20 photos, 25 MB each and 100 MB combined. Originals remain unchanged.</p>
<div class="workflow-input-marker">1. Choose photos → 2. Run steps in this order</div><ol id="workflow-steps" class="workflow-steps"></ol>
<div class="workflow-add"><label>Add a processing step<select id="workflow-step-type"></select></label><button type="button" id="workflow-add" class="button secondary">Add step</button></div>
<label>Downloads<select id="workflow-export"><option value="zip">Individual files and ZIP</option><option value="files">Individual files</option></select></label>
<p class="field-help">Metadata cleanup creates a fresh PNG. Put conversion and compression afterwards to control the final format and size. Resize never enlarges photos; crop uses centered framing.</p>
<div class="workflow-actions"><button type="button" id="workflow-validate" class="button secondary">Check workflow</button><button type="button" id="workflow-preview" class="button secondary">Preview first photo</button><button id="workflow-run" class="button primary">Run workflow</button></div>
</fieldset></form><aside class="workflow-saved"><h2>Saved workflows</h2><p id="workflow-scope" class="field-help"></p><fieldset id="workflow-saved-controls"><div id="workflow-list"></div><label class="workflow-import-label">Import workflow backup<input id="workflow-import" type="file" accept=".json,application/json,text/plain"></label></fieldset><p class="field-help">Workflows store settings only. Downloads and previews stay on this device until you explicitly save a result to My Files.</p></aside></div>
<div class="workflow-progress"><progress id="workflow-progress" value="0" max="1" hidden aria-label="Workflow processing progress"></progress><button id="workflow-cancel" type="button" class="button secondary" hidden>Cancel processing</button></div>
<p id="workflow-status" class="studio-status" role="status" aria-live="polite">Build a workflow or use a saved one.</p><div id="workflow-output" class="studio-output"></div>`;
document.getElementById('main-content').append(section);
const $=id=>document.getElementById('workflow-'+id);
let recipe=newWorkflow(),files=[],running=false,controller=null,revision=0,urls=[],dirty=false,downloadPending=false;
function status(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error);}
function clearResults(){revision++;forgetToolResults('workflow');urls.forEach(u=>URL.revokeObjectURL(u));urls=[];$('output').replaceChildren();downloadPending=false;}
function changed(){clearResults();dirty=true;}
function snapshot(){return validateWorkflow({...recipe,name:$('name').value,export:$('export').value});}
function button(text,action,cls='button secondary'){
  const n=el('button',text,cls);n.type='button';n.onclick=async()=>{if(running)return;try{await action();}catch(e){status(e.message||'Could not complete this action. Try again.',true);}};return n;
}
function renderSteps(focusIndex){
  $('steps').replaceChildren();
  recipe.steps.forEach((step,index)=>{
    const def=STEP_TYPES[step.type],li=el('li',undefined,'workflow-step');li.dataset.step=String(index);
    const head=el('div',undefined,'workflow-step-heading');const title=el('h2',`${index+1}. ${def.title}`);title.tabIndex=-1;head.append(title);
    const controls=el('div',undefined,'workflow-step-actions');
    const up=button('↑',()=>move(index,-1)),down=button('↓',()=>move(index,1)),remove=button('Remove',()=>{recipe.steps.splice(index,1);changed();renderSteps(Math.min(index,recipe.steps.length-1));});
    up.disabled=index===0;down.disabled=index===recipe.steps.length-1;up.setAttribute('aria-label',`Move step ${index+1} up`);down.setAttribute('aria-label',`Move step ${index+1} down`);remove.setAttribute('aria-label',`Remove step ${index+1}: ${def.title}`);controls.append(up,down,remove);head.append(controls);li.append(head);
    const fields=el('div',undefined,'workflow-fields');
    for(const [key,f]of Object.entries(def.fields)){
      const label=el('label',f.label),input=el(f.kind==='select'?'select':'input');input.id=`workflow-step-${index}-${key}`;label.htmlFor=input.id;
      if(f.kind==='select')for(const [value,text]of f.choices){const option=el('option',text);option.value=value;input.append(option);}
      else input.type=f.kind;
      if(f.kind==='checkbox')input.checked=step.options[key];else input.value=step.options[key];
      if(f.kind==='number'){input.min=f.min;input.max=f.max;input.step=1;input.required=true;}
      if(f.kind==='text')input.maxLength=f.max;
      input.oninput=()=>{step.options[key]=f.kind==='number'?Number(input.value):f.kind==='checkbox'?input.checked:input.value;changed();};
      label.append(input);fields.append(label);
    }
    if(!fields.children.length)fields.append(el('p','Re-save pixels as PNG without original camera/GPS metadata. Visible content remains.','field-help'));
    li.append(fields);$('steps').append(li);
  });
  if(!recipe.steps.length)$('steps').append(el('li','Add at least one step to run this workflow.','field-help'));
  if(focusIndex>=0)$('steps').querySelector(`[data-step="${focusIndex}"] h2`)?.focus();
  $('add').disabled=recipe.steps.length>=WORKFLOW_LIMITS.steps;
}
function move(index,delta){[recipe.steps[index],recipe.steps[index+delta]]=[recipe.steps[index+delta],recipe.steps[index]];changed();renderSteps(index+delta);}
function replace(next){
  if((dirty||downloadPending)&&!confirm('Replace your unsaved workflow settings? Download a workflow backup first to keep them.'))return false;
  clearResults();recipe=validateWorkflow(next);$('name').value=recipe.name;$('export').value=recipe.export;dirty=false;renderSteps();return true;
}
function savedList(){
  $('scope').textContent=signedIn?'Settings save to your account, within its existing settings limit. Photos are not included.':'Settings save in this browser. Sign in to save settings to your account.';
  $('list').replaceChildren();
  const raw=workspacePresets();if(!raw.length)$('list').append(el('p','No saved workflows yet.','field-help'));
  raw.forEach((saved,index)=>{
    const row=el('article',undefined,'workflow-saved-row');let item;
    try{item=migrateWorkflow(saved,index);}catch{}
    row.append(el('strong',typeof saved?.name==='string'?saved.name:'Unreadable workflow'));
    if(item){
      row.append(el('p',`${item.steps.length} steps${saved.version===2?'':' · Compatible with your earlier saved settings'}`,'field-help'));
      row.append(button('Use settings',()=>{if(replace(item))status('Workflow loaded. Choose photos, then preview or run.');}));
      row.append(button('Rename',async()=>{
        const name=prompt('Workflow name',item.name);if(name===null)return;
        const next=validateWorkflow({...item,name}),all=workspacePresets();all[index]=next;await storePresets(all);
        if(recipe.id===item.id){recipe.name=next.name;$('name').value=next.name;}
        status('Workflow renamed.');
      }));
      row.append(button('Duplicate',async()=>{const copy={...item,id:crypto.randomUUID(),name:Array.from(item.name).slice(0,43).join('')+' (copy)'};await storePresets([...workspacePresets(),copy]);status('Workflow duplicated.');}));
    }else row.append(el('p','These settings cannot be loaded. They have not been removed.','field-help'));
    row.append(button('Delete preset',async()=>{if(!confirm('Delete this saved workflow? Your photos and downloaded files are unaffected.'))return;await storePresets(workspacePresets().filter((_,i)=>i!==index));status('Saved workflow deleted.');},'text-button'));
    $('list').append(row);
  });
}
for(const [type,def]of Object.entries(STEP_TYPES)){const option=el('option',def.title);option.value=type;$('step-type').append(option);}
$('add').onclick=()=>{if(running||recipe.steps.length>=12)return;recipe.steps.push(newStep($('step-type').value));changed();renderSteps(recipe.steps.length-1);};
$('name').oninput=()=>{recipe.name=$('name').value;dirty=true;};
$('export').oninput=()=>{recipe.export=$('export').value;changed();};
$('file').onchange=()=>{
  if(running)return;const incoming=[...$('file').files];if(!incoming.length)return;
  try{validateSelection(incoming);files=incoming;clearResults();$('selection').textContent=`${files.length} photo${files.length===1?'':'s'} selected · ${formatBytes(files.reduce((n,f)=>n+f.size,0))}`;status('Ready to preview or run. Unsupported or damaged files will be reported individually.');}
  catch(e){$('file').value='';status(e.message,true);}
};
$('new').onclick=()=>{if(replace(newWorkflow())){$('name').value='Untitled workflow';recipe.name='Untitled workflow';dirty=true;status('New workflow. Add, move or configure its steps.');}};
$('save').onclick=async()=>{
  if(running)return;$('save').disabled=true;
  try{const current=snapshot(),all=workspacePresets();const index=all.findIndex((p,i)=>{try{return migrateWorkflow(p,i).id===current.id;}catch{return false;}});if(index>=0)all[index]=current;else all.push(current);await storePresets(all);recipe=current;dirty=false;status('Workflow settings saved.');}
  catch(e){status(e.message,true);}finally{$('save').disabled=false;}
};
$('backup').onclick=()=>{
  try{const current=snapshot(),blob=new Blob([JSON.stringify(current,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='workflow.ilfc-workflow.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);dirty=false;status('Workflow backup prepared. It contains settings, not your files.');}catch(e){status(e.message,true);}
};
$('import').onchange=async()=>{
  const file=$('import').files[0];$('import').value='';if(!file||running)return;
  const epoch=identityVersion;
  try{if(file.size>WORKFLOW_LIMITS.recipeBytes)throw Error('Use a workflow backup of 50 KB or smaller.');let value;try{value=JSON.parse(await file.text());}catch{throw Error('This file is not a valid workflow backup.');}if(epoch!==identityVersion)return;const next=validateWorkflow(value);next.id=crypto.randomUUID();if(replace(next)){dirty=true;status('Backup imported. Choose Save workflow to keep it.');}}catch(e){status(e.message,true);}
};
$('validate').onclick=()=>{try{const current=snapshot();status(`Workflow is valid: ${current.steps.length} ordered image steps. Preview a photo to check its actual result.`);}catch(e){status(e.message,true);}};
function setBusy(value){running=value;$('controls').disabled=value;$('saved-controls').disabled=value;$('form').setAttribute('aria-busy',String(value));$('cancel').hidden=!value;$('cancel').disabled=false;}
function addResult(result,index,preview){
  const row=el('article',undefined,'workflow-result');const url=URL.createObjectURL(result.blob);urls.push(url);
  const image=el('img');image.src=url;image.alt=preview?'Workflow preview':`Workflow result ${index+1}`;image.className='file-preview';image.loading='lazy';
  row.append(el('h2',preview?'Preview of the first photo':result.name),image,el('p',`${result.width} × ${result.height} px · ${formatBytes(result.blob.size)} · ${result.blob.type.replace('image/','').toUpperCase()}`));
  for(const warning of result.warnings)row.append(el('p',warning,'workflow-warning'));
  const details=el('details'),summary=el('summary','Step results');details.append(summary);
  for(const report of result.reports)details.append(el('p',`${report.step}. ${STEP_TYPES[report.type].title}: ${report.width} × ${report.height} · ${formatBytes(report.bytes)}${report.meetsTarget?'':' · Above target'}`));row.append(details);
  if(!preview){const a=el('a','Download result','button primary');a.id=index===0?'workflow-download':`workflow-download-${index}`;a.href=url;a.download=result.name;a.onclick=()=>{downloadPending=false;};row.append(a);$('output').append(row);registerResult(a.id,result.blob,'workflow');downloadPending=true;}
  else $('output').append(row);
}
async function run(preview=false){
  if(running)return;let current;
  try{current=snapshot();validateSelection(files);}catch(e){status(e.message,true);return;}
  clearResults();const version=revision;controller=new AbortController();const signal=controller.signal;setBusy(true);
  const chosen=preview?files.slice(0,1):files;const completed=[];let total=0,failures=0;
  $('progress').hidden=false;$('progress').max=chosen.length*current.steps.length;$('progress').value=0;
  status(canUseWorkflowWorker()?'Processing locally in the background…':'Processing locally. This browser may pause briefly during an image operation.');
  try{
    for(const [index,file]of chosen.entries()){
      if(signal.aborted)break;
      try{
        const result=await runWorkflowJob({file,recipe:current},{signal,onProgress:p=>{if(version!==revision)return;status(`${preview?'Preview':'Photo '+(index+1)+' of '+chosen.length}: step ${p.index+1}/${p.total} — ${p.title}`);$('progress').value=index*current.steps.length+p.index;}});
        if(signal.aborted||version!==revision)break;
        if(total+result.blob.size>WORKFLOW_LIMITS.totalBytes)throw Error('Combined output would exceed 100 MB. Use fewer files or smaller dimensions.');
        total+=result.blob.size;
        // Prefix every batch filename, avoiding collisions after sanitization.
        if(chosen.length>1)result.name=`${index+1}-${result.name}`;
        completed.push(result);addResult(result,index,preview);
      }catch(e){
        if(e.name==='AbortError'||signal.aborted)break;
        failures++;const row=el('article',undefined,'workflow-result workflow-failed');row.append(el('h2',file.name||`Photo ${index+1}`),el('p',e.message||'Could not process this file. Try a smaller, undamaged image.'));$('output').append(row);
      }
      $('progress').value=(index+1)*current.steps.length;
    }
    if(!preview&&completed.length&&current.export==='zip'&&!signal.aborted&&version===revision){
      status('Preparing ZIP of completed results…');
      const {blob}=await runWorkflowJob({action:'zip',files:completed.map(r=>({name:r.name,blob:r.blob}))},{signal});
      if(blob.size>WORKFLOW_LIMITS.totalBytes)throw Error('ZIP exceeds 100 MB. Download the completed files individually.');
      if(!signal.aborted&&version===revision){const a=el('a','Download ZIP','button primary');a.id='workflow-zip';a.download='workflow-results.zip';a.href=URL.createObjectURL(blob);urls.push(a.href);a.onclick=()=>{downloadPending=false;};$('output').prepend(a);registerResult(a.id,blob,'workflow');}
    }
    if(version===revision)status(signal.aborted?`Cancelled. ${completed.length} completed result(s) remain available.`:preview?(completed.length?'Preview ready. It has not been uploaded or saved to your account.':'Preview failed. Check the file or step settings.'):`Workflow complete: ${completed.length} succeeded, ${failures} failed. Inspect the results before sharing.`,!!failures);
  }catch(e){if(version===revision)status(e.name==='AbortError'?`Cancelled. ${completed.length} completed result(s) remain available.`:(e.message||'Processing failed. Try smaller files.'),e.name!=='AbortError');}
  finally{setBusy(false);controller=null;}
}
$('form').onsubmit=e=>{e.preventDefault();run();};$('preview').onclick=()=>run(true);
$('cancel').onclick=()=>{controller?.abort();$('cancel').disabled=true;status('Cancelling processing… Completed results are kept.');};
window.addEventListener('toolchange',()=>{if(document.documentElement.dataset.activeTool!=='workflow'&&running){controller?.abort();clearResults();}});
window.addEventListener('workspace-identity',e=>{
  const next=e.detail.signedIn?(e.detail.owner||'signed-in'):null;
  if(next!==identity){identity=next;identityVersion++;controller?.abort();clearResults();recipe=newWorkflow();$('name').value=recipe.name;$('export').value=recipe.export;dirty=false;renderSteps();}
  signedIn=!!e.detail.signedIn;savedList();
});
window.addEventListener('preferences-changed',savedList);window.addEventListener('workflows-changed',savedList);
window.addEventListener('storage',e=>{if(e.key==='ilfc-guest-workflows'&&!signedIn)savedList();});
window.addEventListener('beforeunload',e=>{if(document.documentElement.dataset.activeTool==='workflow'&&(dirty||downloadPending||running)){e.preventDefault();e.returnValue='';}});
$('name').value=recipe.name;$('export').value=recipe.export;renderSteps();savedList();window.dispatchEvent(new Event('request-workspace-identity'));
