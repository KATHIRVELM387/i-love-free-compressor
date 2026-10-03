import { build } from 'esbuild';
import { cp, readFile, writeFile } from 'node:fs/promises';
for (const [name, entry] of Object.entries({ 'pdf-lib':'pdf-lib', qrcode:'qrcode', jsqr:'jsqr' })) {
 await build({stdin:{contents:`export * from '${entry}'; ${name==='pdf-lib'?'':`export { default } from '${entry}';`}`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,outfile:`public/vendor/${name}.js`,legalComments:'eof'});
}
await cp('node_modules/pdfjs-dist/build/pdf.min.mjs','public/vendor/pdfjs.js');
await cp('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','public/vendor/pdf.worker.mjs');
for (const dir of ['cmaps','standard_fonts','wasm']) await cp(`node_modules/pdfjs-dist/${dir}`,`public/vendor/${dir}`,{recursive:true});
const names=['pdf-lib/LICENSE.md','pdfjs-dist/LICENSE','qrcode/license','jsqr/LICENSE','@pdf-lib/standard-fonts/LICENSE.md','@pdf-lib/upng/LICENSE','pako/LICENSE','tslib/LICENSE.txt','dijkstrajs/LICENSE.md','pngjs/LICENSE'];
let text='Bundled open-source document and QR libraries\n\n';
for(const name of names) { try { text+=name+'\n'+await readFile('node_modules/'+name,'utf8')+'\n\n'; }catch{} }
await writeFile('public/vendor/TOOLS-LICENSES.txt',text);
