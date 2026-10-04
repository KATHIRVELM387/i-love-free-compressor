import { executeWorkflow } from './workflow-engine.js';
import { makeZip } from './zip.js';
self.onmessage=async({data})=>{
  try {
    const result=data.action==='zip'?{blob:await makeZip(data.files)}:await executeWorkflow(data.file,data.recipe,{onProgress:progress=>self.postMessage({progress})});
    self.postMessage({result});
  }catch(error){self.postMessage({error:{message:error.message,name:error.name}});}
};
