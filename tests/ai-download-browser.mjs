// Opt-in network check: downloads a pinned configuration and 39 MB model file.
import assert from 'node:assert/strict';
import {browserTest} from './browser-harness.mjs';
const b=await browserTest();
try{
 const result=await b.evaluate(`await (async()=>{const {AI_MODELS}=await import('./ai-models.js');const {downloadPack,packStatus,removePack}=await import('./ai-cache.js');const pack=AI_MODELS.vision;pack.files=pack.files.filter(f=>['config.json','onnx/embed_tokens_quantized.onnx'].includes(f.path));pack.bytes=pack.files.reduce((n,f)=>n+f.bytes,0);await downloadPack('vision');const state=await packStatus('vision');await removePack('vision');return state;})()`);
 assert.equal(result.ready,true);assert.deepEqual(b.errors,[]);console.log('PASS actual Hugging Face configuration and 39 MB ONNX CDN download, browser CORS/CSP, SHA-256 verification, cache and removal');
}finally{await b.close();}
