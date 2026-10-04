import { executeWorkflow } from './workflow-engine.js';
import { abortCheck } from './workflow-core.js';
import { makeZip } from './zip.js';
export const canUseWorkflowWorker=()=>typeof Worker==='function'&&typeof OffscreenCanvas==='function'&&typeof createImageBitmap==='function';
export function runWorkflowJob(data,{signal,onProgress=()=>{},forceMainThread=false}={}) {
  abortCheck(signal);
  if(forceMainThread||!canUseWorkflowWorker())return data.action==='zip'?makeZip(data.files,{check:()=>abortCheck(signal)}).then(blob=>({blob})):executeWorkflow(data.file,data.recipe,{signal,onProgress});
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('./workflow-worker.js',import.meta.url),{type:'module'});
    const cleanup=()=>{worker.terminate();signal?.removeEventListener('abort',cancel);};
    const cancel=()=>{cleanup();reject(new DOMException('Processing cancelled.','AbortError'));};
    signal?.addEventListener('abort',cancel,{once:true});
    worker.onmessage=({data})=>{if(data.progress){onProgress(data.progress);return;}cleanup();if(data.error){const e=Error(data.error.message);e.name=data.error.name;reject(e);}else resolve(data.result);};
    worker.onerror=()=>{cleanup();reject(Error('The browser could not start background processing. Refresh or try a browser with module-worker support.'));};
    try{worker.postMessage(data);}catch{cleanup();reject(Error('The browser could not prepare this file. Try a smaller image.'));}
  });
}
