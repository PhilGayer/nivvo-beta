import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
const html=await readFile('index.html','utf8');
const head=html.slice(0,html.indexOf('</head>')).replace(/<title>.*?<\/title>/,'<title>NIVVO · v1.1.0-dev</title>');
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['cloud/app.mjs'],outfile:'dist/assets/app.js',bundle:true,format:'esm',minify:true,target:'es2022',legalComments:'none'});
await writeFile('dist/index.html',head+`</head><body><div class="shell"><div class="top"><div class="brand-wrap"><div class="logo">N</div><div><div class="brand-tag">É novo. É vivo. É outro nível.</div><div class="brand-mark">NIVVO</div></div></div><span class="pill">v1.1.0-dev</span></div><div id="cloudStatus" role="status" aria-live="polite">Conectando à sua conta…</div><nav id="cloudNav" class="nav-tabs hidden" aria-label="Navegação"></nav><main id="cloudRoot"></main></div><script type="module" src="./assets/app.js"></script></body></html>`);
await copyFile('engine/motor.mjs','supabase/functions/nivvo-api/motor.mjs');
