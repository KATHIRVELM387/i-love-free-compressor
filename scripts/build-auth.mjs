import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
await build({ stdin: { contents: "export { createClient } from '@supabase/supabase-js';", resolveDir: process.cwd(), sourcefile: 'supabase-client.js' }, outfile: 'public/vendor/supabase.js', bundle: true, format: 'esm', platform: 'browser', target: ['es2022'], minify: true, legalComments: 'linked' });

const licenses = ['@supabase/supabase-js/LICENSE','@supabase/auth-js/LICENSE','@supabase/functions-js/LICENSE','@supabase/postgrest-js/LICENSE','@supabase/realtime-js/LICENSE','@supabase/storage-js/LICENSE','@supabase/phoenix/LICENSE.md','iceberg-js/LICENSE'];
await writeFile('public/vendor/LICENSES.txt', (await Promise.all(licenses.map(async name => name + '\n' + await readFile('node_modules/' + name, 'utf8')))).join('\n\n'));
