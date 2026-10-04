import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
const out='public/vendor/ai';
await mkdir(out,{recursive:true});
await build({entryPoints:['node_modules/@huggingface/transformers/dist/transformers.web.min.js'],bundle:true,format:'esm',platform:'browser',target:'es2022',minifyIdentifiers:true,minifySyntax:true,minifyWhitespace:false,outfile:out+'/transformers.js',legalComments:'eof'});
for(const suffix of ['mjs','wasm'])await cp('node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.'+suffix,out+'/ort-wasm-simd-threaded.'+suffix);
let notices='Local AI runtime licences. Model licences and fixed revisions: ../../ai-models.js and docs/AI-ARCHITECTURE.md.\n\n';
for(const name of ['@huggingface/transformers','onnxruntime-web','@huggingface/jinja','@huggingface/tokenizers']){
 for(const filename of ['LICENSE','LICENSE.txt']){try{notices+=name+'\n'+await readFile('node_modules/'+name+'/'+filename,'utf8')+'\n\n';break;}catch{}}
}
await writeFile(out+'/LICENSES.txt',notices);
console.log('Bundled local AI runtime and WASM; model weights are optional verified browser downloads.');
