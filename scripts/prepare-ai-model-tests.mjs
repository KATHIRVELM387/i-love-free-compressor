// Explicit, opt-in fixture download. These weights never enter public/ or the archive.
import {createHash} from 'node:crypto';
import {createReadStream,createWriteStream} from 'node:fs';
import {mkdir,rename,unlink,stat} from 'node:fs/promises';
import {resolve,dirname,sep} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {AI_MODELS,modelURL} from '../public/ai-models.js';
const root=process.argv[2]&&resolve(process.argv[2]);
if(!root)throw Error('Usage: node scripts/prepare-ai-model-tests.mjs /path/outside/project [text|entities|vision|all]. Downloads up to 1.02 GB.');
const publicRoot=resolve('public');if(root===publicRoot||root.startsWith(publicRoot+sep))throw Error('Keep test weights outside public/.');
const selected=process.argv[3]||'all',kinds=selected==='all'?Object.keys(AI_MODELS):[selected];
if(kinds.some(kind=>!Object.hasOwn(AI_MODELS,kind)))throw Error('Choose text, entities, vision or all.');
async function matches(path,file){try{if((await stat(path)).size!==file.bytes)return false;const hash=createHash('sha256');for await(const chunk of createReadStream(path))hash.update(chunk);return hash.digest('hex')===file.sha256;}catch{return false;}}
for(const kind of kinds)for(const file of AI_MODELS[kind].files){
 const target=resolve(root,kind,file.path);if(await matches(target,file)){console.log('Verified',kind,file.path);continue;}
 await mkdir(dirname(target),{recursive:true});const temporary=target+'.partial';
 try{
  console.log('Downloading',kind,file.path,Math.ceil(file.bytes/1000000)+' MB');
  const response=await fetch(modelURL(AI_MODELS[kind],file),{signal:AbortSignal.timeout(600000)});if(!response.ok||!response.body)throw Error('Model download failed: HTTP '+response.status);
  const hash=createHash('sha256');let bytes=0;
  await pipeline(response.body,async function*(stream){for await(const chunk of stream){bytes+=chunk.length;if(bytes>file.bytes)throw Error('Unexpected model size.');hash.update(chunk);yield chunk;}},createWriteStream(temporary));
  if(bytes!==file.bytes||hash.digest('hex')!==file.sha256)throw Error('Model integrity check failed.');
  await rename(temporary,target);console.log('Verified',kind,file.path);
 }finally{await unlink(temporary).catch(()=>{});}
}
console.log('All selected model fixtures passed SHA-256 verification.');
