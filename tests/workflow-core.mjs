import test from 'node:test';
import assert from 'node:assert/strict';
import { newWorkflow, newStep, validateWorkflow, migrateWorkflow, validateSavedWorkflows, checkPreferenceBudget, validateSelection, abortCheck } from '../public/workflow-core.js';

test('versioned settings round-trip and independent step defaults',()=>{
  const recipe=newWorkflow();assert.deepEqual(validateWorkflow(JSON.parse(JSON.stringify(recipe))),recipe);
  const a=newStep('watermark'),b=newStep('watermark');a.options.text='Changed';assert.equal(b.options.text,'');
  assert.throws(()=>newStep('__proto__'),/supported/);
});
test('untrusted recipes reject invalid versions, steps, options and sizes',()=>{
  const r=newWorkflow();
  for(const bad of [null,{...r,version:3},{...r,name:''},{...r,id:'../file'},{...r,steps:[]},{...r,steps:Array(13).fill(newStep('resize'))},{...r,export:'remote'},{...r,steps:[{type:'fetch',options:{url:'https://example.invalid'}}]}])assert.throws(()=>validateWorkflow(bad));
  for(const value of [0,4097,NaN,Infinity,'1200',1.5])assert.throws(()=>validateWorkflow({...r,steps:[{type:'resize',options:{edge:value}}]}));
  assert.throws(()=>validateWorkflow({...r,steps:[{type:'resize',options:{edge:100,script:'run'}}]}),/unsupported settings/);
  assert.throws(()=>validateWorkflow({...r,steps:[{type:'watermark',options:{...newStep('watermark').options,text:'x'.repeat(81)}}]}));
});
test('legacy presets retain source values and operation ordering without mutating stored data',()=>{
  const old={name:'Existing website',edge:'800',target:'90',format:'image/jpeg',watermark:'Kathir',color:'#123456'};
  const before=JSON.stringify(old),r=migrateWorkflow(old,4);
  assert.equal(r.id,'legacy-4');assert.deepEqual(r.steps.map(s=>s.type),['resize','watermark','convert','compress']);
  assert.equal(r.steps[0].options.edge,800);assert.equal(r.steps[1].options.text,'Kathir');assert.equal(r.steps[3].options.targetKB,90);assert.equal(JSON.stringify(old),before);
  assert.deepEqual(migrateWorkflow(r),r);assert.throws(()=>migrateWorkflow({name:'Broken'}));
});
test('settings quotas never require storing source files or increasing backend limits',()=>{
  assert.equal(validateSavedWorkflows([newWorkflow()]).length,1);
  assert.throws(()=>validateSavedWorkflows(Array.from({length:11},newWorkflow)),/10/);
  checkPreferenceBudget({favorites:['resize']},[newWorkflow()]);
  assert.throws(()=>checkPreferenceBudget({existing:'x'.repeat(7800)},[newWorkflow()]),/settings are full/);
  assert.throws(()=>checkPreferenceBudget({existing:'அ'.repeat(2700)},[newWorkflow()]),/settings are full/);
});
test('selection guards and cancellation preserve existing batch ceilings',()=>{
  assert.throws(()=>validateSelection([]),/at least/);
  assert.throws(()=>validateSelection(Array(21).fill({size:1})),/20/);
  assert.throws(()=>validateSelection([{size:100000001}]),/100 MB/);
  validateSelection(Array(20).fill({size:5000000}));
  const c=new AbortController();abortCheck(c.signal);c.abort();assert.throws(()=>abortCheck(c.signal),{name:'AbortError'});
});
