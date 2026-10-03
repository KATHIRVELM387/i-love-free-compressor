import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const [url, key] = process.argv.slice(2);
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url || '')) throw new Error('Use your HTTPS Supabase project URL, without a trailing slash.');
let legacyAnon = false;
try { legacyAnon = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'anon'; } catch {}
if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key || '') && !legacyAnon) throw new Error('Use a public publishable key or legacy anon key. Secret/service-role keys must never go in the website.');
const files = ['public/index.html','public/_headers','vercel.json'];
const contents = await Promise.all(files.map(file => readFile(root + file, 'utf8')));
for (let i = 0; i < files.length; i++) {
  if (!contents[i].includes('connect-src ')) throw new Error('Missing CSP in ' + files[i]);
}
for (let i = 0; i < files.length; i++) await writeFile(root + files[i], contents[i].replace(/connect-src [^;]+;/g, `connect-src ${url};`));
await writeFile(root + 'public/account-config.js', '// Public configuration. Never put a secret or service-role key here.\nexport const accountConfig = ' + JSON.stringify({ url, publishableKey: key }, null, 2) + ';\n');
console.log('Public account configuration and all three CSP policies updated. Deploy after backend setup and checks.');
