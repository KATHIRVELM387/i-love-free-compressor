import { UTILITY_KEYS, processUtility, readProperties, textStats } from './utility-core.js';
const NO_FILE = ['signature','gradient','qr','text-pdf','text-cleanup','json-format'];
import { EXTRA_TOOLS } from './studio-catalog.js';
import { canvas, bitmap, contain, encode, drawMarks, processPDF, processImages, pdfRenderer, renderPage } from './studio-core.js';
import { registerResult, forgetResult } from './account-bridge.js?v=1';
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const states=new Map();
function button(text,action,cls='button secondary'){const b=node('button',text,cls);b.type='button';b.addEventListener('click',()=>Promise.resolve().then(action).catch(e=>{const s=states.get(document.documentElement.dataset.activeTool);if(s)status(s,e.message,true);}));return b;}
function status(s,text,error=false){s.status.textContent=text;s.status.classList.toggle('error',error);}
function invalidate(s){s.revision++;s.output.replaceChildren();for(const url of s.urls)URL.revokeObjectURL(url);s.urls=[];forgetResult(s.key+'-download');s.dirty=true;}
function field(s,key,label,type='text',value='',attrs={}){const wrap=node('label',label),input=node(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.name=key;input.id=s.key+'-'+key;input.value=value;Object.assign(input,attrs);wrap.append(input);s.controls.append(wrap);s.fields[key]=input;return input;}
function select(s,key,label,values,value){const wrap=node('label',label),input=node('select');input.name=key;input.id=s.key+'-'+key;for(const [v,t]of values){const o=node('option',t);o.value=v;input.append(o);}input.value=value||values[0][0];wrap.append(input);s.controls.append(wrap);s.fields[key]=input;return input;}
function options(s){return Object.fromEntries(Object.entries(s.fields).map(([k,f])=>[k,f.type==='checkbox'?f.checked:f.type==='file'?f.files[0]:f.value]));}
function paint(s){if(!s.canvas)return;const c=s.canvas,ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);if(s.base)ctx.drawImage(s.base,0,0,c.width,c.height);drawMarks(c,s.marks,s.key);s.undo.disabled=!s.marks.length;s.redo.disabled=!s.redos.length;}
function installDrawing(s){s.canvas=canvas(1200,s.key==='signature'?400:800);s.canvas.tabIndex=0;s.canvas.setAttribute('aria-label',s.key==='signature'?'Draw your signature with mouse or touch':'Drag to place a mark. Numeric placement controls are also available.');const stage=node('div',undefined,'drawing-stage');stage.append(s.canvas);s.preview.append(stage);
 s.undo=button('Undo',()=>{if(s.marks.length){s.redos.push(s.marks.pop());invalidate(s);paint(s);}});s.redo=button('Redo',()=>{if(s.redos.length){s.marks.push(s.redos.pop());invalidate(s);paint(s);}});
 s.preview.append(s.undo,s.redo,button('Clear marks',()=>{s.marks=[];s.redos=[];invalidate(s);paint(s);}));
 let mark;
 const point=e=>{const r=s.canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))];};
 s.canvas.addEventListener('pointerdown',e=>{if(s.busy||(!s.base&&s.key!=='signature'))return;e.preventDefault();s.canvas.setPointerCapture(e.pointerId);const [x,y]=point(e);mark={x,y,ex:x,ey:y,color:s.fields.color?.value,shape:s.fields.shape?.value,text:s.fields.text?.value||'Text'};if(s.key==='signature')mark.points=[[x,y],[x+.001,y+.001]];s.marks.push(mark);s.redos=[];invalidate(s);paint(s);});
 s.canvas.addEventListener('pointermove',e=>{if(!mark)return;const [x,y]=point(e);mark.ex=x;mark.ey=y;if(mark.points)mark.points.push([x,y]);paint(s);});
 const end=()=>{mark=null;};s.canvas.addEventListener('pointerup',end);s.canvas.addEventListener('pointercancel',end);
 if(s.key!=='signature'){
  field(s,'x','Mark left (%)','number',10,{min:0,max:100});field(s,'y','Mark top (%)','number',10,{min:0,max:100});field(s,'markWidth','Mark width (%)','number',25,{min:1,max:100});field(s,'markHeight','Mark height (%)','number',15,{min:1,max:100});
  s.controls.append(button('Add mark using coordinates',()=>{if(!s.base)throw Error('Choose an image first.');if(!s.form.reportValidity())return;const o=options(s);s.marks.push({x:Number(o.x)/100,y:Number(o.y)/100,ex:Math.min(1,(Number(o.x)+Number(o.markWidth))/100),ey:Math.min(1,(Number(o.y)+Number(o.markHeight))/100),shape:o.shape,color:o.color,text:o.text||'Text'});s.redos=[];invalidate(s);paint(s);}));
 }
 paint(s);
}
async function load(s,incoming){if(s.busy)return;const many=['merge-pdf','contact-sheet','stitch'].includes(s.key);const files=many?[...s.files,...incoming]:[...incoming].slice(0,1);
 if(files.length>20||files.some(f=>f.size>(s.key==='checksum'?100000000:25000000))||files.reduce((n,f)=>n+f.size,0)>100000000)throw Error(s.key==='checksum'?'Choose a file up to 100 MB.':'Choose up to 20 files, 25 MB each and 100 MB combined.');
 invalidate(s);const revision=s.revision;
 if(s.canvas&&s.key!=='signature'&&files[0]){const b=await bitmap(files[0]);if(revision!==s.revision){b.close();return;}const scale=Math.min(1,1600/Math.max(b.width,b.height));s.base=canvas(b.width*scale,b.height*scale);s.base.getContext('2d').drawImage(b,0,0,s.base.width,s.base.height);b.close();s.canvas.width=s.base.width;s.canvas.height=s.base.height;s.marks=[];s.redos=[];paint(s);}
 s.files=files;fileList(s);status(s,`${files.length} file${files.length===1?'':'s'} selected. Adjust settings, then create your download.`);
 if(s.key==='organize-pdf')await organize(s,revision);
}
function fileList(s){s.list.replaceChildren();for(const [i,f] of s.files.entries()){const row=node('div',undefined,'file-selection');row.append(node('span',`${i+1}. ${f.name} · ${(f.size/1000000).toFixed(2)} MB`));if(s.files.length>1){const up=button('↑',()=>{[s.files[i-1],s.files[i]]=[s.files[i],s.files[i-1]];invalidate(s);fileList(s);});up.disabled=i===0;up.setAttribute('aria-label','Move '+f.name+' up');const down=button('↓',()=>{[s.files[i+1],s.files[i]]=[s.files[i],s.files[i+1]];invalidate(s);fileList(s);});down.disabled=i===s.files.length-1;down.setAttribute('aria-label','Move '+f.name+' down');row.append(up,down);}row.append(button('Remove',()=>{s.files.splice(i,1);invalidate(s);fileList(s);if(!s.files.length){s.base=null;s.marks=[];paint(s);s.pages=[];if(s.key==='organize-pdf')s.preview.replaceChildren();}}));s.list.append(row);}}
async function organize(s,revision){s.preview.replaceChildren();s.pages=[];s.busy=true;s.run.disabled=true;status(s,'Preparing page thumbnails…');let doc;
 try{doc=await pdfRenderer(s.files[0]);if(doc.numPages>200)throw Error('Use up to 200 pages.');for(let i=0;i<doc.numPages;i++){if(revision!==s.revision)return;const c=await renderPage(doc,i,180);s.pages.push({index:i,rotation:0,canvas:c});}if(revision!==s.revision)return;pageList(s);status(s,'Move, rotate, or remove pages, then create your PDF.');}
 finally{await doc?.destroy();s.busy=false;s.run.disabled=false;}
}
function pageList(s){s.preview.replaceChildren();const grid=node('div',undefined,'page-grid');for(const [i,p] of s.pages.entries()){const card=node('article',undefined,'page-card');card.append(p.canvas,node('p',`Page ${p.index+1} · +${p.rotation}°`));for(const [text,act] of [['Move earlier',()=>{if(i>0)[s.pages[i-1],s.pages[i]]=[s.pages[i],s.pages[i-1]];}],['Move later',()=>{if(i<s.pages.length-1)[s.pages[i+1],s.pages[i]]=[s.pages[i],s.pages[i+1]];}],['Rotate 90°',()=>p.rotation=(p.rotation+90)%360],['Remove page',()=>s.pages.splice(i,1)]])card.append(button(text,()=>{if(s.busy)return;act();invalidate(s);pageList(s);}));grid.append(card);}s.preview.append(grid);}
async function run(s){if(s.busy||!s.form.reportValidity())return;invalidate(s);s.busy=true;s.run.disabled=true;s.controls.disabled=true;const revision=s.revision,check=()=>{if(revision!==s.revision)throw Error('Processing stopped.');};status(s,'Preparing your file…');
 try{const o=options(s);o.order=s.pages;const pdf=s.key.includes('pdf');const result=await (UTILITY_KEYS.includes(s.key)?processUtility(s.key,s.files,o,check):pdf?processPDF(s.key,s.files,o,t=>status(s,t),check):processImages(s.key,s.files,o,t=>status(s,t),check,s.marks));check();if(result.blob.size>100000000)throw Error('Output exceeds 100 MB. Use fewer files or smaller dimensions.');
  if(result.preview){result.preview.className='studio-result-preview';result.preview.setAttribute('aria-label','Prepared image preview');s.output.append(result.preview);}
  if(result.text!==undefined){const text=node('textarea');text.readOnly=true;text.value=result.text;text.setAttribute('aria-label','Result text');s.output.append(text,button('Copy text',async()=>{await navigator.clipboard.writeText(result.text);status(s,'Copied to clipboard.');}));}
  const summary=node('p',`Ready · ${result.name} · ${(result.blob.size/1000).toFixed(1)} KB${result.preview?` · ${result.preview.width} × ${result.preview.height} px`:''}`);s.output.append(summary);if(result.message)s.output.append(node('p',result.message,'field-help'));
  const a=node('a','Download file','button primary');a.id=s.key+'-download';a.download=result.name;a.href=URL.createObjectURL(result.blob);s.urls.push(a.href);a.addEventListener('click',()=>s.dirty=false);s.output.append(a);registerResult(a.id,result.blob.type==='application/json'?result.blob.slice(0,result.blob.size,'text/plain'):result.blob,s.key);status(s,'Your file is ready. Download it below, or save it to your account.');
 }catch(e){status(s,e.message||'Could not process this file.',true);}finally{s.busy=false;s.run.disabled=false;s.controls.disabled=false;}
}
for(const [key,tool] of Object.entries(EXTRA_TOOLS)){
 const section=node('section',undefined,'workspace wrap studio-tool');section.id=key+'-tool';section.hidden=true;if(UTILITY_KEYS.includes(key))section.classList.add('utility-tool');
 const header=node('div',undefined,'workspace-heading'),intro=node('div');intro.append(node('span',tool.group.toUpperCase(),'tiny-label'));const heading=node('h1',tool.title);heading.id=key+'-heading';heading.tabIndex=-1;intro.append(heading,node('p',tool.description));header.append(intro,node('span','On your device','local-badge'));
 const form=node('form',undefined,'studio-form'),controls=node('fieldset',undefined,'studio-controls'),body=node('div',undefined,'studio-body'),preview=node('div',undefined,'studio-preview'),output=node('div',undefined,'studio-output'),list=node('div',undefined,'studio-files'),statusNode=node('p','Choose your input and settings, then select Create download. Your result will appear here.','studio-status');statusNode.setAttribute('role','status');statusNode.setAttribute('aria-live','polite');
 const s={key,section,form,controls,preview,output,list,status:statusNode,fields:{},files:[],pages:[],marks:[],redos:[],urls:[],revision:0,busy:false,dirty:false};states.set(key,s);
 if(!NO_FILE.includes(key)){
  const label=node('label','1. Choose files'),input=node('input');input.type='file';input.id=key+'-input';input.accept=key==='checksum'?'':key==='image-dpi'?'image/jpeg,image/png':key.includes('pdf')?'application/pdf': 'image/jpeg,image/png,image/webp';input.multiple=['merge-pdf','contact-sheet','stitch'].includes(key);label.append(input);controls.append(label,list);input.addEventListener('change',()=>{load(s,input.files).catch(e=>status(s,e.message,true));input.value='';});
  controls.append(node('p',key==='checksum'?'Any file type, up to 100 MB.':'Up to 25 MB per file. Multiple-file tools: 20 files and 100 MB combined. PDF tools: up to 200 pages.','field-help'));
 }

 if(key==='image-privacy'||key==='image-dpi')controls.append(node('p','Re-saves a single image frame. Up to 4,096 pixels per side and 16 million pixels total; larger images must be resized first. Original metadata is removed. JPG is re-encoded at high quality. DPI changes print size, not image detail.','field-help'));
 if(key==='image-dpi')field(s,'dpi','Print resolution (DPI)','number',300,{min:1,max:1200,step:1,required:true});
 if(key==='pdf-properties'){
  select(s,'mode','Action',[['edit','Edit properties'],['clear','Clear all document properties']]);
  for(const [name,label]of [['title','Title'],['author','Author'],['subject','Subject'],['keywords','Keywords (comma separated)']])field(s,name,label,'text','',{maxLength:2000});
  controls.append(button('Read current properties',async()=>{const revision=s.revision;status(s,'Reading document properties…');const values=await readProperties(s.files[0]);if(revision!==s.revision)return;for(const [k,v]of Object.entries(values))s.fields[k].value=v;invalidate(s);status(s,'Current properties loaded. Edit them, then create your download.');}),node('p','Read current properties before editing. Blank fields clear those properties. Both actions remove the document-level XMP metadata; Clear also removes all document Info fields. This does not remove personal information from page content, annotations, or attachments.','field-help'));
 }
 if(key==='text-cleanup'||key==='json-format'){
  const input=field(s,'text',key==='json-format'?'JSON input':'Your text','textarea','',{rows:10,maxLength:1000000,required:true});
  select(s,'mode','Action',key==='json-format'?[['pretty','Format'],['minify','Minify']]:[['spaces','Clean extra spacing'],['upper','UPPERCASE'],['lower','lowercase'],['lines','Remove duplicate lines'],['count','Count only']]);
  if(key==='json-format')select(s,'indent','Indentation',[['2','2 spaces'],['4','4 spaces']]);
  else{const stats=node('p','0 words · 0 characters · 0 lines','field-help');controls.append(stats);input.addEventListener('input',()=>{const v=textStats(input.value);stats.textContent=`${v.words} words · ${v.characters} characters · ${v.lines} lines`;});}
  controls.append(node('p','Up to 1 million characters. '+(key==='json-format'?'Numbers retain their original precision. Valid JSON is required.':'Words are separated by whitespace. Characters count Unicode code points.'),'field-help'));
 }
 if(key==='checksum')field(s,'expected','Expected SHA-256 (optional)','text','',{maxLength:64,placeholder:'Paste a 64-character checksum to compare'});
 if(['split-pdf','pdf-images','pdf-text','pdf-watermark','pdf-numbers'].includes(key))field(s,'pages','Pages (blank means all)','text','',{placeholder:'Example: 1, 3-5',maxLength:1000});
 if(key==='pdf-images'){select(s,'format','Output format',[['image/png','PNG'],['image/jpeg','JPG']]);select(s,'resolution','Maximum page edge',[['1600','1600 pixels'],['2400','2400 pixels'],['3200','3200 pixels']]);}
 if(['pdf-watermark','qr','text-pdf','base64','annotate'].includes(key))field(s,'text',key==='annotate'?'Annotation text':key==='base64'?'Base64 image data URL':key==='qr'?'Text or URL':'Text',key==='annotate'?'text':'textarea','',{maxLength:key==='base64'?34000000:key==='text-pdf'?50000:key==='qr'?2000:200,rows:5});
 if(key==='text-pdf'){select(s,'paper','Paper size',[['a4','A4'],['letter','US Letter']]);field(s,'fontSize','Font size','number',12,{min:8,max:32});controls.append(node('p','Latin text supported. Text wraps automatically onto additional pages.','field-help'));}
 if(key==='pdf-numbers')field(s,'start','Starting number','number',1,{min:1,max:100000});
 if(['pdf-watermark','pdf-numbers'].includes(key))select(s,'position','Position',[['center','Center / bottom'],['left','Left / bottom'],['right','Right / bottom'],...(key==='pdf-numbers'?[['top','Top center']]:[])]);
 if(['pdf-watermark','logo-watermark'].includes(key))field(s,'opacity','Opacity (%)','number',key==='pdf-watermark'?25:70,{min:1,max:100});
 if(key==='logo-watermark'){field(s,'logo','Logo image','file','',{accept:'image/png,image/jpeg,image/webp'});field(s,'size','Logo width (% of photo)','number',20,{min:1,max:90});select(s,'position','Position',[['bottom-right','Bottom right'],['bottom-left','Bottom left'],['top-right','Top right'],['top-left','Top left'],['center','Center']]);}
 if(['signature','annotate','gradient','expand','stitch','contact-sheet'].includes(key))field(s,'color',key==='signature'||key==='annotate'?'Ink color':'Background / first color','color',key==='signature'||key==='annotate'?'#14243a':key==='gradient'?'#2563eb':'#ffffff');
 if(key==='annotate')select(s,'shape','Shape',[['arrow','Arrow'],['rectangle','Rectangle'],['circle','Circle'],['text','Text']]);
 if(['redact','annotate','signature'].includes(key))installDrawing(s);
 if(key==='redact')controls.append(node('p','Drag over the area to cover, or use the coordinate controls. Download creates a flattened PNG. Check every area before sharing.','field-help'));
 if(['gradient','expand'].includes(key)){field(s,'width','Width (px)','number',1600,{min:1,max:4096,required:true});field(s,'height','Height (px)','number',1200,{min:1,max:4096,required:true});}
 if(key==='expand')field(s,'transparent','Transparent padding','checkbox');
 if(key==='gradient')field(s,'color2','Second color','color','#14b8a6');
 if(['gradient','stitch'].includes(key))select(s,'direction','Direction',[['horizontal','Horizontal'],['vertical','Vertical'],...(key==='gradient'?[['diagonal','Diagonal']]:[])]);
 if(key==='stitch'){field(s,'size','Shared height / width (px)','number',600,{min:1,max:4096});field(s,'gap','Gap (px)','number',8,{min:0,max:100});}
 if(key==='contact-sheet')select(s,'columns','Columns',[['2','2'],['3','3'],['4','4']],'3');
 if(key==='qr')select(s,'width','Image size',[['512','512 × 512'],['1024','1024 × 1024']]);
 if(key==='base64')select(s,'mode','Mode',[['encode','Image to Base64'],['decode','Base64 to image']]);
 controls.append(button('Try a sample',async()=>{
  if(s.busy)return;
  if(key==='text-cleanup'||key==='json-format'){s.fields.text.value=key==='json-format'?'{"project":"I Love Free Compressor","free":true,"tools":46}':'  Make   your text easier to read.  \n\nTry the cleanup options.';s.fields.text.dispatchEvent(new Event('input',{bubbles:true}));return;}
  if(key==='checksum'){await load(s,[new File(['abc'],'sample.txt',{type:'text/plain'})]);return;}
  if(key==='text-pdf'){s.fields.text.value='My notes\n\nA clear document, created on my device.';invalidate(s);return;}
  if(key==='qr'){s.fields.text.value='https://example.com/';invalidate(s);return;}
  if(key==='gradient'){s.fields.color.value='#2563eb';s.fields.color2.value='#14b8a6';invalidate(s);return;}
  if(key==='signature'){s.marks=[{color:'#14243a',points:[[.1,.7],[.2,.2],[.17,.75],[.3,.4],[.4,.65],[.55,.3],[.5,.7],[.8,.55]]}];s.redos=[];invalidate(s);paint(s);return;}
  if(key.includes('pdf')){const {PDFDocument}=await import('./vendor/pdf-lib.js');const pdf=await PDFDocument.create();for(let i=1;i<=3;i++){const page=pdf.addPage([400,550]);page.drawText('Sample page '+i,{x:40,y:470});}const f=new File([await pdf.save()],'sample.pdf',{type:'application/pdf'});await load(s,key==='merge-pdf'?[f,new File([f],'second.pdf',{type:f.type})]:[f]);if(key==='pdf-watermark')s.fields.text.value='SAMPLE';return;}
  const c=canvas(720,480),x=c.getContext('2d');x.fillStyle='#dbeafe';x.fillRect(0,0,720,480);x.fillStyle='#2563eb';x.fillRect(80,80,260,220);x.fillStyle='#14b8a6';x.beginPath();x.arc(490,260,115,0,Math.PI*2);x.fill();x.fillStyle='#172b45';x.font='32px sans-serif';x.fillText('Sample image',80,390);
  if(key==='qr-reader'){const {default:QR}=await import('./vendor/qrcode.js');await QR.toCanvas(c,'https://example.com/',{width:480,margin:4});}
  const f=new File([await encode(c)],'sample.png',{type:'image/png'});if(key==='base64')s.fields.mode.value='encode';await load(s,['contact-sheet','stitch'].includes(key)?[f,new File([f],'second.png',{type:f.type})]:[f]);
  if(key==='logo-watermark'){const dt=new DataTransfer();dt.items.add(f);s.fields.logo.files=dt.files;}
 }));
 const help=node('details',undefined,'tool-help');help.append(node('summary','How to use this tool'),node('p',`${tool.description} ${['signature','redact','annotate'].includes(key)?'Draw on the preview; undo and redo are available.':key.includes('pdf')?'Select PDFs and enter page numbers where needed. Password-protected PDFs are not supported.':'Choose your settings and create a download.'} Your files stay in this browser unless you explicitly save a result to My Files.`));
 s.run=node('button','Create download','button primary');s.run.type='submit';form.addEventListener('submit',e=>{e.preventDefault();run(s);});form.addEventListener('input',e=>{if(e.target.type!=='file')invalidate(s);});
 form.append(controls,s.run,button('Stop',()=>{if(s.busy){invalidate(s);status(s,'Stopping after the current operation…');}}));body.append(form,preview);if(UTILITY_KEYS.includes(key)){preview.append(node('h2','Your result'),statusNode,output);section.append(header,body,help);}else section.append(header,body,statusNode,output,help);document.getElementById('main-content').append(section);
 section.addEventListener('dragover',e=>e.preventDefault());section.addEventListener('drop',e=>{e.preventDefault();if(e.dataTransfer.files.length&&!NO_FILE.includes(key))load(s,e.dataTransfer.files).catch(err=>status(s,err.message,true));});
 const card=node('a',undefined,'tool-card');card.href='#/'+key;card.append(node('span',tool.group==='PDF tools'?'PDF':tool.group==='Web utilities'?'</>':'✧','tool-icon'),node('h3',tool.title),node('p',tool.description),node('span','Open tool →','tool-open'));document.querySelector('.tool-grid').append(card);
}
window.addEventListener('toolchange',()=>{const route=document.documentElement.dataset.activeTool;for(const s of states.values())if(s.key!==route&&s.busy){invalidate(s);status(s,'Processing stopped when you left this tool.');}});
window.addEventListener('paste',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName))return;const s=states.get(document.documentElement.dataset.activeTool);const files=[...(e.clipboardData?.files||[])];if(s&&files.length&&!s.key.includes('pdf')&&!NO_FILE.includes(s.key)){e.preventDefault();load(s,files).catch(err=>status(s,err.message,true));}});
window.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const s=states.get(document.documentElement.dataset.activeTool);if(s?.canvas&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();(e.shiftKey?s.redo:s.undo).click();}});
window.addEventListener('beforeunload',e=>{if([...states.values()].some(s=>s.dirty)){e.preventDefault();e.returnValue='';}});
