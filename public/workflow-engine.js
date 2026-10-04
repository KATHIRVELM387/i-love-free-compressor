import { STEP_TYPES, validateWorkflow, abortCheck, WORKFLOW_LIMITS } from './workflow-core.js';
import { bitmap } from './studio-core.js';
import { prepareImage, fitDimensions, getCropRect, downloadName } from './image-tools.js?v=7';
import { processUtility } from './utility-core.js';

// These adapters reuse the same processors as the individual Release 02 tools.
// Extend this registry with explicit input/output types as document adapters land.
export const PROCESSORS = Object.fromEntries(Object.keys(STEP_TYPES).map(type=>[type,{accepts:'image',produces:'image',run:async(blob,o,check)=>{
  if(type==='image-privacy') {
    const result=await processUtility('image-privacy',[blob],{},check);
    try{return {blob:result.blob,width:result.preview.width,height:result.preview.height};}
    finally{if(result.preview)result.preview.width=result.preview.height=1;}
  }
  let image;
  try {
    try{image=await bitmap(blob);}catch(e){if(/Choose|25 MB|40 million/.test(e.message))throw e;throw Error('This image could not be opened. Choose an undamaged JPG, PNG, or WebP.');}
    check();
    let width=image.width,height=image.height,edits={},format=blob.type,target=null,allowResize=false;
    if(type==='resize'){const scale=Math.min(1,o.edge/Math.max(width,height));({width,height}=fitDimensions(width*scale,height*scale));}
    if(type==='crop'){edits.cropRatio=Number(o.ratio);({width,height}=getCropRect(image,edits));width=Math.max(1,Math.floor(width));height=Math.max(1,Math.floor(height));}
    if(type==='rotate'){edits={rotation:Number(o.rotation),flipX:o.flipX,flipY:o.flipY};if(edits.rotation%180)[width,height]=[height,width];}
    if(type==='convert')format=o.format;
    if(type==='watermark')edits={watermarkText:o.text,watermarkColor:o.color,watermarkPosition:o.position,watermarkSize:o.size,watermarkOpacity:o.opacity/100};
    if(type==='background')edits.background=o.color;
    if(type==='compress'){target=o.targetKB*1000;allowResize=o.allowResize;}
    if(width>4096||height>4096||width*height>16000000)throw Error('Add a Resize step first: this image exceeds 4,096 pixels per side or 16 million pixels.');
    return await prepareImage(image,{width,height,type:format,target,allowResize,check,...edits});
  } finally{image?.close();}
}}]));

export async function executeWorkflow(file,input,{signal,onProgress=()=>{}}={}) {
  const recipe=validateWorkflow(input),reports=[];let artifact={blob:file};
  const check=()=>abortCheck(signal);
  check();
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPG, PNG, or WebP image.');
  if(file.size>WORKFLOW_LIMITS.fileBytes)throw Error('Each input image must be 25 MB or smaller.');
  for(const [index,step]of recipe.steps.entries()) {
    check();onProgress({index,total:recipe.steps.length,title:STEP_TYPES[step.type].title});
    await new Promise(r=>setTimeout(r,0));check();
    try {
      artifact=await PROCESSORS[step.type].run(artifact.blob,step.options,check);check();
      if(artifact.blob.size>WORKFLOW_LIMITS.fileBytes)throw Error('This intermediate image exceeds 25 MB. Resize earlier or choose a smaller output format.');
      reports.push({step:index+1,type:step.type,bytes:artifact.blob.size,width:artifact.width,height:artifact.height,meetsTarget:artifact.meetsTarget??true});
    }catch(e){if(e.name==='AbortError')throw e;const error=Error(`Step ${index+1} (${STEP_TYPES[step.type].title}): ${e.message||'Could not process this image. Try smaller dimensions.'}`);error.step=index+1;throw error;}
  }
  const lastCompression=recipe.steps.findLast(s=>s.type==='compress');
  const warnings=[];
  if(lastCompression&&artifact.blob.size>lastCompression.options.targetKB*1000)warnings.push('Final output is above the requested maximum. Put compression last or allow smaller dimensions.');
  const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[artifact.blob.type];
  check();return {...artifact,name:downloadName(file.name||'image','workflow-result',ext),reports,warnings};
}
