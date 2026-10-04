import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
await build({stdin:{contents:"export { default } from 'pptxgenjs';",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,outfile:'public/vendor/pptxgenjs.js',legalComments:'eof'});
let licenses='Presentation export: PptxGenJS and bundled dependencies\n\n';
for(const path of ['pptxgenjs/LICENSE','jszip/LICENSE.markdown','pako/LICENSE','lie/license.md','immediate/LICENSE.txt','setimmediate/LICENSE.txt','@types/node/LICENSE']){try{licenses+=path+'\n'+await readFile('node_modules/'+path,'utf8')+'\n\n';}catch{}}
await writeFile('public/vendor/PRESENTATION-LICENSES.txt',licenses);
