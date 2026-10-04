import {recognizedNameSpans} from './ai-entities.js';
import {AI_MODELS,AI_CACHE,modelURL} from './ai-models.js';
let runtime,model,processor,tokenizer,kind;
// Inference can read verified model cache entries and same-origin runtime files only.
// Optional missing model metadata returns 404 without a network request.
const runtimeFetch=self.fetch.bind(self);
self.fetch=(input,options)=>{
 const url=new URL(typeof input==='string'?input:input.url,self.location.href);
 if(url.href===new URL('./vendor/ai/ort-wasm-simd-threaded.wasm',import.meta.url).href&&(!options?.method||options.method==='GET'))return runtimeFetch(input,options);
 return Promise.resolve(new Response('',{status:404}));
};
async function initialize(next,progress){
 if(kind===next&&model)return;
 const t=runtime||=await import('./vendor/ai/transformers.js');
 t.env.allowLocalModels=true;t.env.allowRemoteModels=false;t.env.localModelPath=new URL('./ai-unavailable-models/',import.meta.url).href;t.env.useBrowserCache=false;t.env.useFSCache=false;t.env.useCustomCache=true;t.env.useWasmCache=false;
 const cache=await caches.open(AI_CACHE),manifest=AI_MODELS[next],aliases=new Map();
 for(const file of manifest.files){const fixed=modelURL(manifest,file);for(const key of [fixed,fixed.replace('/resolve/'+manifest.revision+'/', '/resolve/main/'),t.env.localModelPath+manifest.id+'/'+file.path])aliases.set(key,fixed);}
 t.env.fetch=self.fetch;
 t.env.customCache={match:async request=>aliases.has(request)?(await cache.match(aliases.get(request)))||undefined:undefined,put:async()=>{throw Error('Models must be installed from the explicit download control.');}};
 t.env.backends.onnx.wasm.numThreads=1;t.env.backends.onnx.wasm.proxy=false;t.env.backends.onnx.wasm.wasmPaths={mjs:new URL('./vendor/ai/ort-wasm-simd-threaded.mjs',import.meta.url).href,wasm:new URL('./vendor/ai/ort-wasm-simd-threaded.wasm',import.meta.url).href};
 const options={dtype:'q8',device:'wasm',revision:manifest.revision,local_files_only:true,session_options:{logSeverityLevel:3},progress_callback:p=>{if(p.status==='ready')progress('Model loaded. Generating locally…');}};
 progress('Loading model into memory. This can take a minute…');
 if(next==='entities'){model=await t.pipeline('token-classification',manifest.id,options);}
 else if(next==='text'){tokenizer=await t.AutoTokenizer.from_pretrained(manifest.id,options);model=await t.AutoModelForCausalLM.from_pretrained(manifest.id,options);}
 else{processor=await t.AutoProcessor.from_pretrained(manifest.id,options);model=await t.Florence2ForConditionalGeneration.from_pretrained(manifest.id,options);}
 kind=next;
}
self.onmessage=async({data})=>{
 const {id}=data;const progress=text=>self.postMessage({id,progress:text});
 try{
  if(!Object.hasOwn(AI_MODELS,data.kind))throw Error('Unsupported model.');await initialize(data.kind,progress);const t=runtime;let result;
  if(data.action==='entities'&&data.kind==='entities'){
   if(typeof data.text!=='string'||data.text.length>1500)throw Error('Use a shorter name-recognition passage.');const ids=model.tokenizer(data.text).input_ids.tolist()[0];if(ids.length>512)throw Error('Use a shorter name-recognition passage.');const entities=await model(data.text,{aggregation_strategy:'none'});result=JSON.stringify(recognizedNameSpans(entities,(a,b)=>model.tokenizer.decode(ids.slice(a,b),{skip_special_tokens:true}),data.text));
  }else if(data.action==='generate'&&data.kind==='text'){
   if(typeof data.prompt!=='string'||data.prompt.length>18000||typeof data.system!=='string'||data.system.length>2000||!Number.isInteger(data.maxTokens)||data.maxTokens<1||data.maxTokens>700)throw Error('Use a shorter, supported AI request.');
   const text=tokenizer.apply_chat_template([{role:'system',content:data.system},{role:'user',content:data.prompt}],{tokenize:false,add_generation_prompt:true,enable_thinking:false});const inputs=tokenizer(text);if(inputs.input_ids.dims.at(-1)>6500)throw Error('This passage uses too many model tokens. Select a shorter passage.');
   progress('Generating text locally…');const generated=await model.generate({...inputs,max_new_tokens:data.maxTokens,do_sample:false,repetition_penalty:1.05});result=tokenizer.decode(generated.tolist()[0].slice(inputs.input_ids.dims.at(-1)),{skip_special_tokens:true}).trim();
  }else if(data.action==='image'&&data.kind==='vision'){
   if(!['description','alt','ocr','filename'].includes(data.task)||!(data.pixels instanceof Uint8ClampedArray)||data.width<1||data.height<1||data.width>1024||data.height>1024||data.pixels.length!==data.width*data.height*4)throw Error('Use a supported image of up to 1,024 pixels per side.');
   const image=new t.RawImage(data.pixels,data.width,data.height,4),task=data.task==='ocr'?'<OCR>':data.task==='description'?'<MORE_DETAILED_CAPTION>':'<CAPTION>';
   const inputs=await processor(image,task);const output=await model.generate({...inputs,max_new_tokens:data.task==='ocr'?512:200,do_sample:false,num_beams:1});const decoded=processor.batch_decode(output,{skip_special_tokens:false})[0];const parsed=processor.post_process_generation(decoded,task,image.size);result=String(parsed[task]||'').replace(/<\/?s>/g,'').trim();
  }else throw Error('Unsupported AI operation.');
  if(!result)throw Error('The model returned no text. Try a clearer image or shorter passage.');self.postMessage({id,result});
 }catch(e){self.postMessage({id,diagnostic:String(e.message).slice(0,1000),error:/tokens|Unsupported|supported|returned no text|Use a shorter/.test(e.message)?e.message:'Local AI could not complete this request. The browser may lack memory or model support. Cancel, try a smaller input, or reopen the page.'});}
};
