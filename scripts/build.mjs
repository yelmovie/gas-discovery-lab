import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const target=path.join(root,'dist');
const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
// Start clean so removed assets never linger in dist or in the offline manifest.
await fs.rm(target,{recursive:true,force:true});
await fs.mkdir(target,{recursive:true});
// Copy an explicit allowlist: source references, scripts, tests and private files never ship.
// public/assets/concepts is the retired first set of concept clips (no code references it); concepts-v2 ships.
const retired=path.join(root,'public','assets','concepts');
await fs.cp(path.join(root,'public'),target,{recursive:true,filter:src=>src!==retired&&!src.startsWith(retired+path.sep)&&!path.basename(src).startsWith('._')});
await fs.cp(path.join(root,'src'),path.join(target,'src'),{recursive:true,filter:src=>!path.basename(src).startsWith('._')});
await fs.copyFile(path.join(root,'index.html'),path.join(target,'index.html'));
const files=[];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await walk(f);else if(!['sw.js','offline-manifest.json','_headers'].includes(e.name)&&!e.name.startsWith('._'))files.push('/'+path.relative(target,f).replaceAll('\\','/'));}}
await walk(target);
files.sort();
// Change the worker whenever shipped asset bytes change, even without a version bump.
const hash=createHash('sha256').update(await fs.readFile(new URL(import.meta.url)));
for(const file of files)hash.update(file).update('\0').update(await fs.readFile(path.join(target,file.slice(1)))).update('\0');
const revision=hash.digest('hex').slice(0,16);
const shell=files.filter(file=>file==='/index.html'||file.startsWith('/src/')||file.startsWith('/assets/fonts/')||['/assets/title.webp','/assets/app-icon.svg','/manifest.webmanifest'].includes(file));
await fs.writeFile(path.join(target,'offline-manifest.json'),JSON.stringify({version:pkg.version,revision,files}));
await fs.writeFile(path.join(target,'sw.js'),`const CACHE='gas-city-assets-${revision}';
const FILES=${JSON.stringify(files)};
const SHELL=${JSON.stringify(shell)};
const isAppCache=k=>k==='gas-city-1.3.0'||k==='gas-city-1.3.1'||/^gas-city-assets-[a-f0-9]{16}$/.test(k);
async function cacheAssets(source){const c=await caches.open(CACHE);let done=0;for(const f of FILES){const r=await fetch(f,{cache:'reload'});if(!r.ok||r.status!==200)throw Error(f);await c.put(f,r);source?.postMessage({type:'CACHE_PROGRESS',done:++done,total:FILES.length});}}
async function oldCaches(){return (await caches.keys()).filter(k=>isAppCache(k)&&k!==CACHE).reverse();}
// Activate after verifying the new screen and all code are available; films and
// other media can use the last prepared snapshot while the new one warms.
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{await cache.addAll(SHELL.map(file=>new Request(new URL(file,self.location.origin),{cache:'reload'})));}
 catch(error){await caches.delete(CACHE);throw error;}
 await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
let preparing=null;
function prepare(source){
 if(!preparing)preparing=(async()=>{await cacheAssets(source);for(const k of await oldCaches())await caches.delete(k);})().finally(()=>preparing=null);
 return preparing;
}
self.addEventListener('message',e=>{
 if(e.data?.type==='WARM_UPDATE')e.waitUntil((async()=>{if((await oldCaches()).length)await prepare().catch(()=>{});})());
 if(e.data?.type==='CACHE_ALL')e.waitUntil((async()=>{try{await prepare(e.source);e.source?.postMessage({type:'CACHE_READY'});}catch{e.source?.postMessage({type:'CACHE_ERROR'});}})());
});
async function ranged(request,response){const range=request.headers.get('range');if(!range||response.status!==200)return response;const m=/^bytes=(\\d*)-(\\d*)$/.exec(range);if(!m)return response;const bytes=await response.arrayBuffer(),start=m[1]?Number(m[1]):Math.max(0,bytes.byteLength-Number(m[2])),end=m[1]&&m[2]?Math.min(Number(m[2]),bytes.byteLength-1):bytes.byteLength-1;if(start>=bytes.byteLength||start<0||end<start)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.byteLength}});const headers=new Headers(response.headers);headers.set('Content-Range','bytes '+start+'-'+end+'/'+bytes.byteLength);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');return new Response(bytes.slice(start,end+1),{status:206,headers});}
self.addEventListener('fetch',e=>{
 const request=e.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 e.respondWith((async()=>{
  const c=await caches.open(CACHE);
  const page=request.mode==='navigate'&&(url.pathname==='/'||url.pathname==='/index.html');
  if(page||url.pathname.startsWith('/src/')||url.pathname.startsWith('/assets/fonts/')){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4500);
   try{const r=await fetch(request,{cache:'no-cache',signal:controller.signal});if(r.ok||r.status<500)return r;}
   catch{}finally{clearTimeout(timer);}
   return await c.match(page?'/index.html':url.pathname,{ignoreVary:true})||Response.error();
  }
  const cached=await c.match(request);
  if(cached)return ranged(request,cached);
  try{const headers=new Headers(request.headers);headers.delete('range');const r=await fetch(new Request(request,{headers}));if(r.ok&&r.status===200)await c.put(request,r.clone());return ranged(request,r);}
  catch{
   if(url.pathname.startsWith('/assets/'))for(const name of await oldCaches()){
    const hit=await (await caches.open(name)).match(request,{ignoreVary:true});if(hit)return ranged(request,hit);
   }
   return Response.error();
  }
 })());
});`);
async function syntax(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await syntax(f);else if(f.endsWith('.js')&&!e.name.startsWith('._'))execFileSync(process.execPath,['--check',f],{stdio:'pipe'});}}
await syntax(path.join(root,'src'));
// macOS exFAT metadata is not a public static asset.
for(const e of await fs.readdir(target,{recursive:true,withFileTypes:true}))if(e.isFile()&&e.name.startsWith('._'))await fs.unlink(path.join(e.parentPath??e.path,e.name));
console.log(`Build ${pkg.version}: ${files.length} files. Static delivery folder: dist/`);
