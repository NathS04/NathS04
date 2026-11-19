import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
async function walk(dir){const files=[];for(const item of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,item.name);if(item.isDirectory())files.push(...await walk(full));else files.push(full);}return files;}
let checked=0;const errors=[];
for(const file of (await walk(root)).filter(f=>f.endsWith('.html'))){
  const html=await readFile(file,'utf8');
  for(const [,raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(https?:|mailto:|data:)/.test(raw))continue;
    const [pathname,hash]=raw.split('#');
    let target=pathname?path.resolve(pathname.startsWith('/')?root:path.dirname(file),'.'+(pathname.startsWith('/')?pathname:'/'+pathname)):file;
    if(pathname&&!pathname.startsWith('/'))target=path.resolve(path.dirname(file),pathname);
    try{const meta=await stat(target);if(meta.isDirectory())target=path.join(target,'index.html');const body=await readFile(target,'utf8');if(hash&&!body.includes(`id="${hash}"`))throw Error('missing anchor');checked++;}catch(error){errors.push(`${path.relative(root,file)} → ${raw}: ${error.message}`);}
  }
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Checked ${checked} local links, assets and anchors.`);
