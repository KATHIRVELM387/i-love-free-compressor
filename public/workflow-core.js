// Recipes contain settings only. No source bytes, remote URLs or executable code.
export const WORKFLOW_LIMITS = Object.freeze({ steps:12, saved:10, files:20, totalBytes:100000000, fileBytes:25000000, recipeBytes:50000 });
const formats = [['image/jpeg','JPG'],['image/png','PNG'],['image/webp','WebP']];
const number = (label, value, min, max) => ({label,kind:'number',value,min,max});
const select = (label, value, choices) => ({label,kind:'select',value,choices});
export const STEP_TYPES = {
  resize:{title:'Resize',fields:{edge:number('Maximum edge (px)',1600,1,4096)}},
  crop:{title:'Crop',fields:{ratio:select('Crop shape','1',[['1','Square 1:1'],['1.3333333333333333','Landscape 4:3'],['0.75','Portrait 3:4'],['1.7777777777777777','Wide 16:9'],['0.5625','Story 9:16']])}},
  rotate:{title:'Rotate & flip',fields:{rotation:select('Clockwise rotation','90',[['0','0°'],['90','90°'],['180','180°'],['270','270°']]),flipX:{label:'Flip horizontally',kind:'checkbox',value:false},flipY:{label:'Flip vertically',kind:'checkbox',value:false}}},
  'image-privacy':{title:'Remove original metadata',fields:{}},
  convert:{title:'Convert format',fields:{format:select('Output format','image/webp',formats)}},
  watermark:{title:'Text watermark',fields:{text:{label:'Watermark text',kind:'text',value:'',max:80},color:{label:'Text color',kind:'color',value:'#ffffff'},position:select('Position','bottom-right',[['top-left','Top left'],['top-right','Top right'],['center','Center'],['bottom-left','Bottom left'],['bottom-right','Bottom right']]),size:number('Relative text size (%)',6,2,15),opacity:number('Opacity (%)',70,0,100)}},
  background:{title:'Fill transparent background',fields:{color:{label:'Background color',kind:'color',value:'#ffffff'}}},
  compress:{title:'Compress below a maximum',fields:{targetKB:number('Maximum size (KB)',200,1,25000),allowResize:{label:'Allow smaller dimensions to meet size',kind:'checkbox',value:true}}}
};
export const newStep = type => {
  if (!Object.hasOwn(STEP_TYPES,type)) throw Error('Choose a supported workflow step.');
  return {type,options:Object.fromEntries(Object.entries(STEP_TYPES[type].fields).map(([k,f])=>[k,f.value]))};
};
export const newWorkflow = () => ({version:2,id:crypto.randomUUID(),name:'Website photos',steps:[newStep('resize'),newStep('image-privacy'),newStep('convert'),newStep('compress')],export:'zip'});
const record = value => value && typeof value==='object' && !Array.isArray(value);
export function validateWorkflow(input) {
  if (!record(input) || input.version!==2) throw Error('This workflow version is not supported.');
  if (typeof input.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(input.id)) throw Error('This workflow has an invalid identifier.');
  if (typeof input.name!=='string'||!input.name.trim()||input.name.trim().length>50) throw Error('Enter a workflow name from 1 to 50 characters.');
  if (!Array.isArray(input.steps)||!input.steps.length||input.steps.length>WORKFLOW_LIMITS.steps) throw Error('Use between 1 and 12 workflow steps.');
  if (!['files','zip'].includes(input.export)) throw Error('Choose individual files or ZIP export.');
  const steps=input.steps.map((step,index)=>{
    if (!record(step)||!Object.hasOwn(STEP_TYPES,step.type)||!record(step.options)) throw Error(`Step ${index+1}: choose a supported step and settings.`);
    const fields=STEP_TYPES[step.type].fields;
    if (Object.keys(step.options).some(k=>!Object.hasOwn(fields,k))) throw Error(`Step ${index+1}: unsupported settings.`);
    const options={};
    for(const [key,f]of Object.entries(fields)) {
      const value=step.options[key];
      const valid=f.kind==='number'?Number.isInteger(value)&&value>=f.min&&value<=f.max:f.kind==='checkbox'?typeof value==='boolean':f.kind==='select'?f.choices.some(([v])=>v===value):f.kind==='color'?typeof value==='string'&&/^#[\da-f]{6}$/i.test(value):typeof value==='string'&&value.length<=f.max;
      if(!valid)throw Error(`Step ${index+1}: check ${f.label.toLowerCase()}.`);
      options[key]=value;
    }
    return {type:step.type,options};
  });
  return {version:2,id:input.id,name:input.name.trim(),steps,export:input.export};
}
export function migrateWorkflow(input,index=0) {
  if(input?.version===2)return validateWorkflow(input);
  if(!record(input)||typeof input.name!=='string')throw Error('This saved workflow cannot be read.');
  const resize=newStep('resize');resize.options.edge=Number(input.edge);
  const watermark=newStep('watermark');watermark.options.text=input.watermark||'';watermark.options.color=input.color||'#ffffff';
  const convert=newStep('convert');convert.options.format=input.format;
  const compress=newStep('compress');compress.options.targetKB=Number(input.target);
  return validateWorkflow({version:2,id:'legacy-'+index,name:input.name,steps:[resize,watermark,convert,compress],export:'files'});
}
export function validateSelection(files) {
  if(!files.length)throw Error('Choose at least one image.');
  if(files.length>WORKFLOW_LIMITS.files||files.reduce((n,f)=>n+f.size,0)>WORKFLOW_LIMITS.totalBytes)throw Error('Choose up to 20 files and 100 MB combined.');
}
export function validateSavedWorkflows(list) {
  if(!Array.isArray(list)||list.length>10)throw Error('Save up to 10 workflows.');
  list.forEach((item,index)=>migrateWorkflow(item,index));
  if(new TextEncoder().encode(JSON.stringify(list)).length>WORKFLOW_LIMITS.recipeBytes)throw Error('Saved workflow settings are too large. Download a workflow backup or remove unused workflows.');
  return list;
}
export function checkPreferenceBudget(preferences,workflows) {
  // Pretty serialization is conservatively larger than PostgreSQL jsonb::text.
  if(new TextEncoder().encode(JSON.stringify({...preferences,workflows},null,1)).length>7800)throw Error('Your account settings are full. Download this workflow backup or remove an unused workflow before saving.');
}
export function abortCheck(signal) {
  if(signal?.aborted)throw new DOMException('Processing cancelled.','AbortError');
}
