import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSource,sourceChunks,contextFor,verifiedQuotes,checkNumbers,validateSlidePlan,slidePoints,generatedSlide,deckFromAI,safeFilename,abortAI} from '../public/ai-core.js';
import {recognizedNameSpans} from '../public/ai-entities.js';
import {documentJob,presentationJob} from '../public/ai-jobs.js';
test('bounded sources, relevant excerpts and literal extraction reject invented values',()=>{
 assert.throws(()=>validateSource(''));assert.throws(()=>validateSource('x'.repeat(12001)));
 assert.equal(sourceChunks('word '.repeat(500)).length,2);assert.ok(contextFor('A short source.','source').length);
 assert.deepEqual(verifiedQuotes('["Priya Raman"]','Priya Raman owns the launch'),['Priya Raman']);
 assert.throws(()=>verifiedQuotes('["John Smith"]','Priya Raman owns the launch'));
 assert.throws(()=>verifiedQuotes('{"code":"alert(1)"}','source'));
 assert.equal(checkNumbers('Budget $25,000.','Budget 25000 dollars.'),'Budget $25,000.');
 assert.throws(()=>checkNumbers('Launch within 24 hours.','Launch on 12 October 2026.'));
});
test('generated plans and decks are validated and charts preserve only user numbers',()=>{
 assert.deepEqual(validateSlidePlan('["One","Two"]',2),['One','Two']);assert.throws(()=>validateSlidePlan('["Same","Same"]',2));assert.deepEqual(validateSlidePlan('{"slides":[{"title":"One"},{"title":"Two"}]}',2),['One','Two']);assert.throws(()=>validateSlidePlan('{"slides":[{"content":"Missing title"}]}',1));assert.deepEqual(validateSlidePlan('{"slide_1":"One","slide_2":"Two"}',2),['One','Two']);assert.throws(()=>validateSlidePlan('{"slide_1":"One","slide_3":"Three"}',2));
 const raw=JSON.stringify({points:['First fact','Second fact'],notes:'Explain both ideas.',visual:'A diagram of the process.',layout:'bullets'});
 const slides=[generatedSlide(raw,'One',0,2),generatedSlide(raw,'Two',1,2)];const deck=deckFromAI('Topic',slides,'Research | 25\nBuild | 75');
 assert.equal(deck.slides.length,2);assert.equal(deck.slides[1].layout,'chart');assert.equal(deck.slides[1].title,'Your chart data');assert.equal(deck.slides[1].body,'Research | 25\nBuild | 75');assert.match(deck.slides[0].notes,/Suggested image/);
 assert.throws(()=>generatedSlide('{"points":[]}','One',0,2));assert.throws(()=>deckFromAI('Title',slides,'Fake | nope'));
 assert.equal(safeFilename('../<script>A brown dog</script>'),'scripta-brown-dogscript.png');
 const c=new AbortController();c.abort();assert.throws(()=>abortAI(c.signal),{name:'AbortError'});
});
test('local extraction is explicit; name recognition cannot return invented source values',async()=>{
 const result=await documentJob({}, {task:'dates',text:'Launch: 12 October 2026. Budget: 25000.'});assert.match(result.text,/12 October/);assert.doesNotMatch(result.text,/25000/);assert.match(result.notice,/not AI generation/);
 const names=await documentJob({entities:async()=> '["Priya Raman"]'},{task:'names',text:'Priya Raman owns the launch.'});assert.match(names.text,/Priya Raman/);
 await assert.rejects(documentJob({entities:async()=> '["invented"]'},{task:'names',text:'Priya Raman.'}));
 const table=await documentJob({}, {task:'tables',text:'Month | Sales\nMay | 10'});assert.match(table.text,/May \| 10/);
 await assert.rejects(documentJob({}, {task:'question',text:'Some text',question:''}));
});
test('presentation orchestration passes structured generations to existing editor schema',async()=>{
 let calls=0;const provider={generate:async()=>++calls===1?'["Introduction","Recap"]':'Review the topic. Discuss the evidence.'};
 const deck=await presentationJob(provider,{topic:'Working together',audience:'Students',count:2});assert.equal(calls,7);assert.equal(deck.slides.length,2);assert.equal(deck.version,1);
 await assert.rejects(presentationJob(provider,{topic:'',audience:'',count:2}));
 const c=new AbortController();c.abort();await assert.rejects(presentationJob(provider,{topic:'Topic',audience:'',count:2,signal:c.signal}));
});

test('name recognition joins adjacent word pieces across PER/ORG but never bridges unrelated tokens',()=>{
 const tokens=[{index:1,entity:'B-PER'},{index:2,entity:'B-PER'},{index:3,entity:'I-ORG'},{index:4,entity:'I-ORG'},{index:7,entity:'B-ORG'}];
 assert.deepEqual(recognizedNameSpans(tokens,(a,b)=>a===1&&b===5?'Priya Raman':'Acme','Priya Raman works at Acme.'),['Priya Raman','Acme']);
 assert.deepEqual(recognizedNameSpans([{index:1,entity:'B-PER'}],()=> 'P','Priya Raman'),[]);
});

test('presentation drafts normalize bounded model variants and reject invalid or invented content',async()=>{
 const slide=generatedSlide(JSON.stringify({points:['One point'],notes:['Explain the point.','Invite discussion.'],visual:['A process diagram.']}),'Title',0,2);assert.match(slide.notes,/Explain the point\. Invite discussion\./);
 assert.throws(()=>generatedSlide(JSON.stringify({points:['One point'],notes:[{script:'bad'}],visual:'Diagram'}),'Title',0,2));
 let attempts=0;await assert.rejects(presentationJob({generate:async()=>{attempts++;return '["Same","Same"]';}},{topic:'Topic',audience:'Students',count:2}),/could not plan/);assert.equal(attempts,2);
 let calls=0;await assert.rejects(presentationJob({generate:async()=>++calls===1?'["Introduction","Recap"]':'Budget is 999 dollars.'},{topic:'Budget',audience:'Students',count:2,source:'Budget is 25 dollars.'}),/could not produce/);
 const controller=new AbortController();await assert.rejects(presentationJob({generate:async()=>{controller.abort();return '["Introduction","Recap"]';}},{topic:'Topic',audience:'Students',count:2,signal:controller.signal}),{name:'AbortError'});
});

test('plain-text slide generation preserves bounded content without trusting model JSON',()=>{assert.deepEqual(slidePoints('- One fact.\n- Another fact.'),['One fact.','Another fact.']);const long='word '.repeat(100).trim();assert.equal(slidePoints(long).join(' '),long);assert.throws(()=>slidePoints('x'.repeat(301)));assert.throws(()=>slidePoints('x'.repeat(1501)));});

test('invalid chart values are rejected before expensive generation',async()=>{let calls=0;await assert.rejects(presentationJob({generate:async()=>{calls++;return ''; }},{topic:'Topic',audience:'Students',count:2,chart:'Cost | invalid'}));assert.equal(calls,0);});
