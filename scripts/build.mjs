import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const target=path.join(root,'dist');
const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
await fs.mkdir(target,{recursive:true});
// Copy an explicit allowlist: source references, scripts, tests and private files never ship.
await fs.cp(path.join(root,'public'),target,{recursive:true});
await fs.cp(path.join(root,'src'),path.join(target,'src'),{recursive:true});
await fs.copyFile(path.join(root,'index.html'),path.join(target,'index.html'));
const files=[];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await walk(f);else if(!['sw.js','offline-manifest.json'].includes(e.name))files.push('/'+path.relative(target,f).replaceAll('\\','/'));}}
await walk(target);
await fs.writeFile(path.join(target,'offline-manifest.json'),JSON.stringify({version:pkg.version,files}));
await fs.writeFile(path.join(target,'sw.js'),`const CACHE='gas-city-${pkg.version}';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('gas-city-')&&k!==CACHE)await caches.delete(k);await self.clients.claim();})());});
self.addEventListener('message',e=>{if(e.data?.type==='CACHE_ALL')e.waitUntil((async()=>{try{const m=await fetch('/offline-manifest.json').then(r=>r.json());const c=await caches.open(CACHE);let done=0;for(const f of m.files){const r=await fetch(f);if(!r.ok)throw Error(f);await c.put(f,r);done++;e.source?.postMessage({type:'CACHE_PROGRESS',done,total:m.files.length});}e.source?.postMessage({type:'CACHE_READY'});}catch{e.source?.postMessage({type:'CACHE_ERROR'});}})());});
async function ranged(request,response){const range=request.headers.get('range');if(!range||response.status!==200)return response;const m=/^bytes=(\\d*)-(\\d*)$/.exec(range);if(!m)return response;const bytes=await response.arrayBuffer(),start=m[1]?Number(m[1]):Math.max(0,bytes.byteLength-Number(m[2])),end=m[1]&&m[2]?Math.min(Number(m[2]),bytes.byteLength-1):bytes.byteLength-1;if(start>=bytes.byteLength||start<0||end<start)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.byteLength}});const headers=new Headers(response.headers);headers.set('Content-Range','bytes '+start+'-'+end+'/'+bytes.byteLength);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');return new Response(bytes.slice(start,end+1),{status:206,headers});}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith((async()=>{const c=await caches.open(CACHE);const cached=await c.match(e.request);if(cached)return ranged(e.request,cached);try{const headers=new Headers(e.request.headers);headers.delete('range');const r=await fetch(new Request(e.request,{headers}));if(r.ok&&r.status===200)await c.put(e.request,r.clone());return ranged(e.request,r);}catch{if(e.request.mode==='navigate')return await c.match('/index.html')||Response.error();return Response.error();}})());});`);
async function syntax(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await syntax(f);else if(f.endsWith('.js'))execFileSync(process.execPath,['--check',f],{stdio:'pipe'});}}
await syntax(path.join(root,'src'));
console.log(`Build ${pkg.version}: ${files.length} files. Static delivery folder: dist/`);
