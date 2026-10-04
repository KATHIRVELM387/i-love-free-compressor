import { AI_MODELS,AI_CACHE,modelURL } from './ai-models.js';
import { abortAI } from './ai-core.js';
const valid=(response,file)=>response?.headers.get('x-ilfc-sha256')===file.sha256&&Number(response.headers.get('content-length'))===file.bytes;
export async function packStatus(kind){if(!Object.hasOwn(AI_MODELS,kind))throw Error('Choose a supported AI pack.');if(!globalThis.caches)return {ready:false,bytes:0};const model=AI_MODELS[kind],cache=await caches.open(AI_CACHE);let bytes=0;for(const file of model.files)if(valid(await cache.match(modelURL(model,file)),file))bytes+=file.bytes;return {ready:bytes===model.bytes,bytes};}
export async function downloadPack(kind,{signal,progress=()=>{}}={}){
 abortAI(signal);if(!Object.hasOwn(AI_MODELS,kind))throw Error('Choose a supported AI pack.');if(!isSecureContext||!globalThis.caches||!crypto.subtle)throw Error('Model storage needs a secure browser with Cache Storage. Try current Chrome or Edge.');
 if(navigator.deviceMemory&&navigator.deviceMemory<4)throw Error('This device reports less than 4 GB of memory. Use a desktop with more memory before downloading local AI models.');
 const model=AI_MODELS[kind],estimate=await navigator.storage?.estimate?.();if(estimate?.quota&&estimate.quota-estimate.usage<model.bytes*1.2)throw Error('There is not enough browser storage for this model. Remove an unused AI pack or free device storage.');
 const cache=await caches.open(AI_CACHE);let done=0;
 for(const file of model.files){abortAI(signal);const url=modelURL(model,file);if(valid(await cache.match(url),file)){done+=file.bytes;continue;}
  const response=await fetch(url,{credentials:'omit',referrerPolicy:'no-referrer',signal});if(!response.ok||!response.body)throw Error('The model download failed. Check your connection and retry; verified files are kept.');
  const reader=response.body.getReader(),chunks=[];let loaded=0;
  try{while(true){abortAI(signal);const {done:ended,value}=await reader.read();if(ended)break;loaded+=value.length;if(loaded>file.bytes)throw Error('The model file has an unexpected size. Nothing from this file was saved.');chunks.push(value);progress({loaded:done+loaded,total:model.bytes,label:'Downloading '+model.label});}}finally{await reader.cancel().catch(()=>{});}
  if(loaded!==file.bytes)throw Error('The model download is incomplete. Retry to resume from verified files.');abortAI(signal);progress({loaded:done+loaded,total:model.bytes,label:'Verifying model integrity…'});
  const blob=new Blob(chunks);chunks.length=0;const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('');abortAI(signal);if(hash!==file.sha256)throw Error('The downloaded model did not pass its integrity check. Please retry.');
  try{await cache.put(url,new Response(blob,{headers:{'content-length':String(file.bytes),'x-ilfc-sha256':hash,'content-type':file.path.endsWith('.json')?'application/json':'application/octet-stream'}}));}catch{throw Error('Browser storage could not keep this model. Free storage and retry.');}done+=loaded;
 }
 progress({loaded:done,total:model.bytes,label:'Model verified and ready on this device.'});
}
export async function removePack(kind){if(!Object.hasOwn(AI_MODELS,kind))throw Error('Choose a supported AI pack.');const cache=await caches.open(AI_CACHE);for(const file of AI_MODELS[kind].files)await cache.delete(modelURL(AI_MODELS[kind],file));}
