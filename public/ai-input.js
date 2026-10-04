import { pdfRenderer,pagesFrom,bitmap,canvas } from './studio-core.js';
import { AI_LIMITS,abortAI,validateSource } from './ai-core.js';
export async function documentInput(file,pages,{signal,progress=()=>{}}={}){
 if(!file)throw Error('Choose a PDF or plain-text file.');abortAI(signal);
 if(file.type==='application/pdf'||/\.pdf$/i.test(file.name)){
  if(file.size>AI_LIMITS.pdfBytes)throw Error('Use a PDF up to 25 MB.');let doc;
  try{doc=await pdfRenderer(file);abortAI(signal);if(doc.numPages>200)throw Error('Use a PDF of up to 200 pages.');const chosen=pagesFrom(pages,doc.numPages);if(chosen.length>AI_LIMITS.pdfPages)throw Error('Select up to 20 PDF pages.');const out=[];let length=0;
   for(const index of chosen){abortAI(signal);progress(`Reading PDF page ${index+1}…`);const page=await doc.getPage(index+1);try{const content=await page.getTextContent();const text=content.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('').trim();if(!text)throw Error(`Page ${index+1} has no selectable text. Use an image with Extract visible text, or paste a transcription; scanned-PDF OCR is a separate planned feature.`);length+=text.length;if(length>AI_LIMITS.source)throw Error('These pages contain more than 12,000 characters. Select fewer pages.');out.push(`[PDF page ${index+1}]\n${text}`);}finally{page.cleanup();}}
   abortAI(signal);return validateSource(out.join('\n\n'));
  }catch(e){if(e.name==='AbortError'||/Choose|Use |Select |Page |pages|characters|scanned/.test(e.message))throw e;throw Error('This PDF could not be read. Try an unencrypted, undamaged PDF with selectable text.');}finally{await doc?.destroy();}
 }
 if(!(file.type==='text/plain'||/\.(txt|md|csv)$/i.test(file.name))||file.size>1000000)throw Error('Choose plain text, Markdown or CSV up to 1 MB, or a PDF up to 25 MB.');const bytes=await file.arrayBuffer();abortAI(signal);let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw Error('Save the text file as UTF-8 and try again.');}if(text.includes('\u0000'))throw Error('Choose a plain UTF-8 text file, not a binary file.');return validateSource(text);
}
export async function imageInput(file){
 if(!file||file.size>AI_LIMITS.imageBytes)throw Error('Choose a JPG, PNG or WebP up to 10 MB.');const b=await bitmap(file);
 try{const scale=Math.min(1,AI_LIMITS.imageEdge/Math.max(b.width,b.height)),c=canvas(Math.max(1,Math.round(b.width*scale)),Math.max(1,Math.round(b.height*scale)));try{const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(b,0,0,c.width,c.height);const pixels=ctx.getImageData(0,0,c.width,c.height).data;return {width:c.width,height:c.height,pixels};}finally{c.width=c.height=1;}}finally{b.close();}
}
