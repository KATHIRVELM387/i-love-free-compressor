import { packStatus } from './ai-cache.js';
import { abortAI } from './ai-core.js';
// Provider boundary: no cloud implementation, API keys, automatic uploads or tool execution.
export class LocalAIProvider {
 constructor(){this.worker=null;this.kind=null;this.pending=null;this.sequence=0;}
 dispose(){if(this.pending)this.pending.reject(new DOMException('AI operation cancelled.','AbortError'));this.pending=null;this.worker?.terminate();this.worker=null;this.kind=null;}
 async request(kind,payload,{signal,progress=()=>{}}={}){
  abortAI(signal);if(typeof Worker!=='function'||typeof WebAssembly!=='object')throw Error('Local AI needs a browser with Web Workers and WebAssembly. Try a current desktop Chrome or Edge.');if(navigator.deviceMemory&&navigator.deviceMemory<4)throw Error('This device reports less than 4 GB of memory. Use the regular tools or a desktop with more memory for local AI.');if(this.pending)throw Error('Wait for the current AI operation or cancel it.');
  if(!await packStatus(kind).then(s=>s.ready))throw Error('Download and verify the required AI pack first.');abortAI(signal);
  if(this.kind!==kind){this.dispose();this.kind=kind;this.worker=new Worker(new URL('./ai-worker.js',import.meta.url),{type:'module'});}
  const worker=this.worker,id=++this.sequence;
  return new Promise((resolve,reject)=>{
   let timer;const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);if(this.pending?.id===id)this.pending=null;};
   const fail=e=>{cleanup();reject(e);};const cancel=()=>{this.dispose();};
   this.pending={id,reject:fail};signal?.addEventListener('abort',cancel,{once:true});
   timer=setTimeout(()=>{cleanup();this.dispose();reject(Error('AI exceeded the time limit on this device. Try a shorter passage or use a faster device.'));},300000);
   worker.onmessage=({data})=>{if(data.id!==id)return;if(data.progress){progress(data.progress);return;}cleanup();if(data.error){console.warn('Local AI diagnostic:',data.diagnostic);this.dispose();reject(Error(data.error));}else resolve(data.result);};
   worker.onerror=()=>{cleanup();this.dispose();reject(Error('Local AI could not run in this browser. Try a current desktop Chrome or Edge, or use the regular tools.'));};
   try{worker.postMessage({id,kind,...payload});}catch{cleanup();this.dispose();reject(Error('The browser could not start this request. Try a smaller input.'));}
  });
 }
 entities(input,options){return this.request('entities',{action:'entities',...input},options);}
 generate(input,options){return this.request('text',{action:'generate',...input},options);}
 image(input,options){return this.request('vision',{action:'image',...input},options);}
}
