import { makeZip } from './zip.js';
export const LIMIT = 100000000;
export function pagesFrom(text = '', count) {
 if (!text.trim()) return Array.from({length:count},(_,i)=>i);
 const pages=[];
 for(const part of text.split(',')) {
  const m=part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
  if(!m) throw Error('Use page numbers such as 1, 3-5.');
  const a=Number(m[1]),b=Number(m[2]||m[1]);
  if(a<1||b<a||b>count) throw Error(`Pages must be between 1 and ${count}.`);
  for(let p=a;p<=b;p++) pages.push(p-1);
  if(pages.length>200) throw Error('Choose up to 200 pages.');
 }
 return [...new Set(pages)];
}
export function canvas(w,h) {
 w=Math.round(w);h=Math.round(h);
 if(!Number.isFinite(w)||!Number.isFinite(h)||w<1||h<1||w>4096||h>4096||w*h>16000000) throw Error('Use dimensions from 1 to 4096 pixels, up to 16 million pixels total.');
 const c=document.createElement('canvas');c.width=w;c.height=h;return c;
}
export function encode(c,type='image/png',quality=.92) {return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Could not encode this image.')),type,quality));}
export async function bitmap(file) {
 if(!file || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw Error('Choose a JPG, PNG, or WebP image.');
 if(file.size>25000000) throw Error('Each image must be 25 MB or smaller.');
 const b=await createImageBitmap(file);
 if(b.width*b.height>40000000) {b.close();throw Error('Images must be 40 million pixels or smaller.');}
 return b;
}
export function contain(ctx,b,x,y,w,h) {const s=Math.min(w/b.width,h/b.height);ctx.drawImage(b,x+(w-b.width*s)/2,y+(h-b.height*s)/2,b.width*s,b.height*s);}
export async function pdfRenderer(file) {
 const pdf=await import('./vendor/pdfjs.js');
 pdf.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.mjs',import.meta.url).href;
 const task=pdf.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,enableXfa:false,cMapUrl:new URL('./vendor/cmaps/',import.meta.url).href,cMapPacked:true,standardFontDataUrl:new URL('./vendor/standard_fonts/',import.meta.url).href,wasmUrl:new URL('./vendor/wasm/',import.meta.url).href});
 try{const doc=await task.promise;doc.destroy=()=>task.destroy();return doc;}catch(error){await task.destroy();throw error;}
}
export async function renderPage(doc,index,max=1600) {
 const p=await doc.getPage(index+1),v=p.getViewport({scale:1});
 const view=p.getViewport({scale:Math.min(2,max/Math.max(v.width,v.height))});
 const c=canvas(Math.ceil(view.width),Math.ceil(view.height));
 await p.render({canvasContext:c.getContext('2d'),viewport:view}).promise;p.cleanup();return c;
}
export async function processPDF(kind,files,o,progress,check) {
 const {PDFDocument,StandardFonts,rgb,degrees}=await import('./vendor/pdf-lib.js');
 const output=await PDFDocument.create();
 if(kind==='text-pdf') {
  const text=o.text.trim();if(!text) throw Error('Enter some text first.');
  if(text.length>50000) throw Error('Use up to 50,000 characters.');
  const font=await output.embedFont(StandardFonts.Helvetica),size=Number(o.fontSize)||12;
  // Standard PDF font has a limited character set. Fail explicitly, never silently drop text.
  try{font.encodeText(text.replace(/[\r\n\t]/g,' '));}catch{throw Error('This PDF font supports Latin text. Please use Latin characters for this tool.');}
  const dims=o.paper==='letter'?[612,792]:[595.28,841.89];let page,y;
  const newPage=()=>{page=output.addPage(dims);y=dims[1]-48;};newPage();
  for(const line of text.replace(/\r/g,'').split('\n')) {
   let current='';
   const flush=()=>{if(y<48)newPage();page.drawText(current,{x:48,y,size,font});y-=size*1.5;current='';};
   for(const ch of line.replace(/\t/g,'    ')) {if(font.widthOfTextAtSize(current+ch,size)>dims[0]-96)flush();current+=ch;}
   flush();
  }
 } else {
  if(!files.length) throw Error('Choose a PDF first.');
  if(kind==='merge-pdf'&&files.length<2)throw Error('Choose at least two PDFs to merge.');
  if(files.some(f=>f.size>25000000)||files.reduce((s,f)=>s+f.size,0)>LIMIT)throw Error('Use PDFs up to 25 MB each and 100 MB combined.');
  if(['pdf-images','pdf-text'].includes(kind)) {
   const doc=await pdfRenderer(files[0]);
   try {
    if(doc.numPages>200)throw Error('Use a PDF with up to 200 pages.');
    const chosen=pagesFrom(o.pages,doc.numPages),results=[];let total=0;
    for(const [i,index] of chosen.entries()) {
     check();progress(`Processing page ${i+1} of ${chosen.length}…`);
     if(kind==='pdf-images') {const c=await renderPage(doc,index,Number(o.resolution)||1600);const blob=await encode(c,o.format);c.width=c.height=1;total+=blob.size;results.push({name:`page-${index+1}.${o.format==='image/jpeg'?'jpg':'png'}`,blob});}
     else {const p=await doc.getPage(index+1),content=await p.getTextContent();results.push(`--- Page ${index+1} ---\n`+content.items.map(item=>item.str+(item.hasEOL?'\n':' ')).join(''));p.cleanup();}
     if(total>LIMIT)throw Error('Output exceeds 100 MB. Select fewer pages or a smaller resolution.');
    }
    check();return kind==='pdf-images'?{blob:await makeZip(results),name:'pdf-pages.zip'}:{blob:new Blob([results.join('\n\n')],{type:'text/plain'}),name:'pdf-text.txt',text:results.join('\n\n')};
   } finally {await doc.destroy();}
  }
  let totalPages=0;
  for(const [i,file] of files.entries()) {
   check();progress(`Reading document ${i+1}…`);
   let source;
   try {source=await PDFDocument.load(await file.arrayBuffer());}catch{throw Error('This PDF could not be opened. Password-protected or damaged PDFs are not supported.');}
   totalPages+=source.getPageCount();if(totalPages>200)throw Error('Use up to 200 pages combined.');
   let chosen=kind==='merge-pdf'?source.getPageIndices():pagesFrom(o.pages,source.getPageCount());
   if(kind==='organize-pdf') chosen=o.order?.map(p=>p.index)||chosen;
   if(!chosen.length)throw Error('Keep at least one page.');
   for(const [j,page] of (await output.copyPages(source,chosen)).entries()) {
    if(kind==='organize-pdf') page.setRotation(degrees((page.getRotation().angle+(o.order?.[j]?.rotation||0))%360));
    output.addPage(page);
   }
   if(kind!=='merge-pdf')break;
  }
  if(kind==='pdf-watermark'||kind==='pdf-numbers') {
   // Preserve all source pages and modify only the selected pages.
   const full=await PDFDocument.load(await files[0].arrayBuffer());
   const chosen=pagesFrom(o.pages,full.getPageCount());const font=await full.embedFont(StandardFonts.Helvetica);
   for(const index of chosen) {
    const p=full.getPage(index),{width,height}=p.getSize();
    const text=kind==='pdf-numbers'?String(index+Number(o.start||1)):o.text.trim();
    if(!text)throw Error('Enter watermark text.');
    try {font.encodeText(text);}catch{throw Error('Use Latin characters for PDF watermarks.');}
    let size=kind==='pdf-numbers'?12:Math.min(48,width/Math.max(3,text.length)*1.4);
    const tw=font.widthOfTextAtSize(text,size);
    p.drawText(text,{font,size,x:o.position==='left'?24:o.position==='right'?Math.max(12,width-tw-24):Math.max(12,(width-tw)/2),y:kind==='pdf-watermark'?height/2:o.position==='top'?height-30:24,color:rgb(.15,.2,.3),opacity:kind==='pdf-watermark'?Number(o.opacity)/100:1});
   }
   return {blob:new Blob([await full.save()],{type:'application/pdf'}),name:kind+'.pdf'};
  }
 }
 check();return {blob:new Blob([await output.save()],{type:'application/pdf'}),name:kind+'.pdf'};
}
export async function processImages(kind,files,o,progress,check,drawing) {
 if(kind==='qr') {
  if(!o.text.trim())throw Error('Enter text or a URL.');
  const {default:QR}=await import('./vendor/qrcode.js');const c=canvas(Number(o.width),Number(o.width));
  await QR.toCanvas(c,o.text,{width:c.width,margin:4,errorCorrectionLevel:'M',color:{dark:'#14243aff',light:'#ffffffff'}});
  return {blob:await encode(c),name:'qr-code.png',preview:c};
 }
 if(kind==='gradient') {
  const c=canvas(Number(o.width),Number(o.height)),ctx=c.getContext('2d');
  const g=ctx.createLinearGradient(0,0,o.direction==='vertical'?0:c.width,o.direction==='horizontal'?0:c.height);
  g.addColorStop(0,o.color);g.addColorStop(1,o.color2);ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
  return {blob:await encode(c),name:'gradient.png',preview:c};
 }
 if(kind==='signature') {
  if(!drawing?.length)throw Error('Draw your signature first.');
  const c=canvas(1200,400);drawMarks(c,drawing,'signature');return {blob:await encode(c),name:'signature.png',preview:c};
 }
 if(kind==='base64'&&o.mode==='decode') {
  if(o.text.length>34000000)throw Error('Use image data up to 25 MB.');
  const m=o.text.trim().match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\s]+)$/);
  if(!m)throw Error('Paste a PNG, JPG, or WebP base64 data URL.');
  let bytes;try{bytes=Uint8Array.from(atob(m[2].replace(/\s/g,'')),x=>x.charCodeAt(0));}catch{throw Error('Invalid Base64 image data.');}
  const file=new File([bytes],'decoded',{type:m[1]}),b=await bitmap(file);const s=Math.min(1,4096/Math.max(b.width,b.height),Math.sqrt(16000000/(b.width*b.height)));const c=canvas(b.width*s,b.height*s);c.getContext('2d').drawImage(b,0,0,c.width,c.height);b.close();
  return {blob:await encode(c),name:'decoded-image.png',preview:c};
 }
 if(!files.length)throw Error('Choose an image first.');
 if(files.length>20||files.reduce((s,f)=>s+f.size,0)>LIMIT)throw Error('Use up to 20 images and 100 MB combined.');
 if(kind==='base64') {
  const b=await bitmap(files[0]);b.close();const text=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not read the image.'));r.readAsDataURL(files[0]);});
  return {blob:new Blob([text],{type:'text/plain'}),name:'image-base64.txt',text:text.length<1000000?text:'Large Base64 output: download the text file to view it.'};
 }
 if(kind==='qr-reader') {
  const b=await bitmap(files[0]);const s=Math.min(1,2000/Math.max(b.width,b.height)),c=canvas(b.width*s,b.height*s);c.getContext('2d').drawImage(b,0,0,c.width,c.height);b.close();
  const {default:jsQR}=await import('./vendor/jsqr.js');const data=c.getContext('2d').getImageData(0,0,c.width,c.height),result=jsQR(data.data,c.width,c.height);
  if(!result)throw Error('No readable QR code found. Try a sharper image with the whole code visible.');
  return {blob:new Blob([result.data],{type:'text/plain'}),name:'qr-content.txt',text:result.data};
 }
 if(kind==='contact-sheet'||kind==='stitch') {
  const sizes=[];
  for(const f of files){check();const b=await bitmap(f);sizes.push([b.width,b.height]);b.close();}
  let c;
  if(kind==='contact-sheet')c=canvas(1654,2339);
  else {const horizontal=o.direction==='horizontal',cross=Number(o.size)||600;const along=sizes.reduce((sum,[w,h])=>sum+Math.round(cross*(horizontal?w/h:h/w)),0)+Number(o.gap)*(files.length-1);c=canvas(horizontal?along:cross,horizontal?cross:along);}
  const ctx=c.getContext('2d');ctx.fillStyle=o.color;ctx.fillRect(0,0,c.width,c.height);let offset=0;
  for(const [i,f] of files.entries()) {
   check();progress(`Drawing image ${i+1} of ${files.length}…`);const b=await bitmap(f);
   try{
    if(kind==='contact-sheet') {const cols=Number(o.columns)||3,rows=Math.ceil(files.length/cols),w=(c.width-80)/cols,h=(c.height-80)/rows,x=40+(i%cols)*w,y=40+Math.floor(i/cols)*h;contain(ctx,b,x+10,y+10,w-20,h-60);ctx.fillStyle='#14243a';ctx.font='20px sans-serif';ctx.fillText(f.name.slice(0,40),x+10,y+h-20,w-20);}
    else {const horiz=o.direction==='horizontal',cross=Number(o.size)||600,along=Math.round(cross*(horiz?b.width/b.height:b.height/b.width));ctx.drawImage(b,horiz?offset:0,horiz?0:offset,horiz?along:cross,horiz?cross:along);offset+=along+Number(o.gap);}
   }finally{b.close();}
  }
  return {blob:await encode(c),name:kind+'.png',preview:c};
 }
 const b=await bitmap(files[0]);
 try {
  if(kind==='favicon') {
   const results=[];
   for(const size of [16,32,48,180,192,512]){const c=canvas(size,size);contain(c.getContext('2d'),b,0,0,size,size);results.push({name:`icon-${size}.png`,blob:await encode(c)});}
   // ICO contains a PNG image, supported by modern browsers and Windows.
   const png=results[1].blob,h=new Uint8Array(22),v=new DataView(h.buffer);v.setUint16(2,1,true);v.setUint16(4,1,true);h[6]=h[7]=32;v.setUint16(10,1,true);v.setUint16(12,32,true);v.setUint32(14,png.size,true);v.setUint32(18,22,true);
   results.push({name:'favicon.ico',blob:new Blob([h,png])});
   results.push({name:'README.txt',blob:new Blob(['Use favicon.ico for the browser tab and icon-180.png for apple-touch-icon. PNG icons retain the original aspect ratio with transparent padding.'])});
   return {blob:await makeZip(results),name:'website-icons.zip'};
  }
  const s=Math.min(1,4096/Math.max(b.width,b.height),Math.sqrt(16000000/(b.width*b.height)));let c;
  if(kind==='expand') {c=canvas(Number(o.width),Number(o.height));if(c.width<b.width||c.height<b.height)throw Error('Canvas dimensions must be at least as large as the original image.');const ctx=c.getContext('2d');if(!o.transparent){ctx.fillStyle=o.color;ctx.fillRect(0,0,c.width,c.height);}ctx.drawImage(b,(c.width-b.width)/2,(c.height-b.height)/2);}
  else {c=canvas(b.width*s,b.height*s);const ctx=c.getContext('2d');ctx.drawImage(b,0,0,c.width,c.height);
   if(kind==='redact'||kind==='annotate') {if(!drawing?.length)throw Error('Add at least one mark to the image first.');drawMarks(c,drawing,kind);}
   if(kind==='logo-watermark') {
    if(!o.logo)throw Error('Choose your logo image.');const logo=await bitmap(o.logo);
    try{const w=c.width*Number(o.size)/100,h=w*logo.height/logo.width;const gap=Math.min(c.width,c.height)*.03;if(h>c.height-2*gap)throw Error('Reduce logo size so it fits the image.');const x=o.position.includes('left')?gap:o.position.includes('right')?c.width-w-gap:(c.width-w)/2,y=o.position.includes('top')?gap:o.position.includes('bottom')?c.height-h-gap:(c.height-h)/2;ctx.globalAlpha=Number(o.opacity)/100;ctx.drawImage(logo,x,y,w,h);ctx.globalAlpha=1;}finally{logo.close();}
   }
  }
  return {blob:await encode(c),name:kind+'.png',preview:c};
 }finally{b.close();}
}
export function drawMarks(c,marks,kind) {
 const ctx=c.getContext('2d'),w=c.width,h=c.height;
 for(const m of marks){ctx.save();ctx.strokeStyle=ctx.fillStyle=kind==='redact'?'#000000':m.color||'#14243a';ctx.lineWidth=Math.max(2,w*(m.weight||.005));ctx.lineCap=ctx.lineJoin='round';
  const x=m.x*w,y=m.y*h,dx=(m.ex-m.x)*w,dy=(m.ey-m.y)*h;
  if(m.points){ctx.beginPath();m.points.forEach(([px,py],i)=>i?ctx.lineTo(px*w,py*h):ctx.moveTo(px*w,py*h));ctx.stroke();}
  else if(kind==='redact')ctx.fillRect(Math.floor(Math.min(x,x+dx)),Math.floor(Math.min(y,y+dy)),Math.ceil(Math.abs(dx))+1,Math.ceil(Math.abs(dy))+1);
  else if(m.shape==='text'){ctx.font=`${Math.max(14,w*.035)}px sans-serif`;ctx.fillText(m.text,x,y,w-x);}
  else if(m.shape==='circle'){ctx.beginPath();ctx.ellipse(x+dx/2,y+dy/2,Math.abs(dx/2),Math.abs(dy/2),0,0,Math.PI*2);ctx.stroke();}
  else if(m.shape==='rectangle')ctx.strokeRect(x,y,dx,dy);
  else {ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);const a=Math.atan2(dy,dx),n=w*.03;ctx.moveTo(x+dx-n*Math.cos(a-.5),y+dy-n*Math.sin(a-.5));ctx.lineTo(x+dx,y+dy);ctx.lineTo(x+dx-n*Math.cos(a+.5),y+dy-n*Math.sin(a+.5));ctx.stroke();}ctx.restore();
 }
}
