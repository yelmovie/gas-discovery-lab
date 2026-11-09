import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const origin='https://gas.example';
async function fixture(t){
 const base=path.join(root,'.tmp');await fs.mkdir(base,{recursive:true});
 const dir=await fs.mkdtemp(path.join(base,'offline-update-'));
 t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 for(const d of ['scripts','src','public/assets'])await fs.mkdir(path.join(dir,d),{recursive:true});
 await fs.copyFile(path.join(root,'scripts/build.mjs'),path.join(dir,'scripts/build.mjs'));
 await fs.writeFile(path.join(dir,'package.json'),JSON.stringify({version:'1.3.1',type:'module'}));
 await fs.writeFile(path.join(dir,'index.html'),'<html>new release</html>');
 await fs.writeFile(path.join(dir,'src/main.js'),'export const release="new";');
 await fs.writeFile(path.join(dir,'public/assets/video.mp4'),'0123456789');
 await fs.writeFile(path.join(dir,'public/_headers'),"/*\n  X-Content-Type-Options: nosniff\n");
 async function build(){
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:dir,stdio:'pipe'});
  const source=await fs.readFile(path.join(dir,'dist/sw.js'),'utf8');
  const manifest=JSON.parse(await fs.readFile(path.join(dir,'dist/offline-manifest.json'),'utf8'));
  const resources=new Map();for(const f of manifest.files)resources.set(f,await fs.readFile(path.join(dir,'dist',f.slice(1))));
  resources.set('/offline-manifest.json',JSON.stringify(manifest));
  return {source,manifest,resources,cache:source.match(/const CACHE='([^']+)'/)[1]};
 }
 return {dir,build};
}
function worker(build,{active=true}={}){
 const listeners=new Map(),stores=new Map(),deleted=[],requests=[],storageAccess=[];
 let offline=false,failedPath=null,quotaPath=null,skipWaiting=0,claimed=0;
 const key=r=>new URL(typeof r==='string'?r:r.url,origin).href;
 const caches={
  async keys(){return [...stores.keys()];},
  async open(name){
   if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);
   return {async match(request){return store.get(key(request))?.clone();},async put(request,response){if(new URL(key(request)).pathname===quotaPath)throw Error('quota');store.set(key(request),response.clone());}};
  },
  async delete(name){deleted.push(name);return stores.delete(name);}
 };
 const context={URL,Request,Response,Headers,caches,self:{registration:{active:active?{}:null},location:{origin},addEventListener:(type,fn)=>listeners.set(type,fn),skipWaiting:async()=>{skipWaiting++;},clients:{claim:async()=>{claimed++;}}},fetch:async(input,options)=>{
  const url=new URL(typeof input==='string'?input:input.url,origin),p=url.pathname;
  requests.push({path:p,cache:options?.cache??input.cache});
  if(offline)throw Error('offline');
  if(p===failedPath)return new Response('unavailable',{status:503});
  if(!build.resources.has(p))return new Response('missing',{status:404});
  return new Response(build.resources.get(p),{status:200});
 }};
 for(const name of ['localStorage','indexedDB'])Object.defineProperty(context,name,{get(){storageAccess.push(name);throw Error('Student storage must not be accessed');}});
 vm.runInNewContext(build.source,context,{filename:'sw.js'});
 async function event(type,data={}){let promise;listeners.get(type)({...data,waitUntil:p=>{promise=p;}});await promise;}
 async function fetchRequest(p,{range,navigate=false,method='GET'}={}){
  const req=new Request(new URL(p,origin),{method,headers:range?{range}:{}});
  if(navigate)Object.defineProperty(req,'mode',{value:'navigate'});
  let promise;listeners.get('fetch')({request:req,respondWith:p=>{promise=p;}});return promise;
 }
 return {caches,stores,deleted,requests,storageAccess,event,fetchRequest,setOffline:v=>{offline=v;},fail:p=>{failedPath=p;},quota:p=>{quotaPath=p;},get skipped(){return skipWaiting;},get claimed(){return claimed;}};
}
async function seed(w,name,p,body){await (await w.caches.open(name)).put(p,new Response(body));}

test('asset changes revise the worker even without a package version bump',async t=>{
 const f=await fixture(t),a=await f.build(),same=await f.build();
 assert.equal(a.source,same.source);
 let previous=a;
 for(const [file,body] of [['src/main.js','export const release="next";'],['public/assets/video.mp4','new movie'],['index.html','<html>next</html>']]){
  await fs.writeFile(path.join(f.dir,file),body);const b=await f.build();assert.notEqual(b.cache,previous.cache);assert.notEqual(b.source,previous.source);previous=b;
 }
 assert.ok(!a.manifest.files.includes('/sw.js'));assert.ok(!a.manifest.files.includes('/offline-manifest.json'));
 assert.ok(!a.manifest.files.includes('/_headers'),'Cloudflare delivery metadata is not an offline asset');
});

test('upgrade stages every asset before activation and preserves unrelated caches and student storage',async t=>{
 const f=await fixture(t),b=await f.build(),w=worker(b);
 for(const name of ['gas-city-1.3.1','gas-city-assets-'+ 'a'.repeat(16),'gas-city-student-exports','other-app'])await seed(w,name,'/index.html','old '+name);
 await w.event('install');
 assert.equal(w.skipped,1);assert.deepEqual(w.deleted,[]);
 for(const asset of b.manifest.files)assert.ok(await (await w.caches.open(b.cache)).match(asset),asset);
 assert.ok(w.requests.every(r=>r.cache==='reload'),'stage fresh bytes, not a stale HTTP cache');
 await w.event('activate');
 assert.deepEqual(w.deleted.sort(),['gas-city-1.3.1','gas-city-assets-'+ 'a'.repeat(16)].sort());
 assert.equal(w.claimed,1);
 assert.equal(await (await (await w.caches.open('gas-city-student-exports')).match('/index.html')).text(),'old gas-city-student-exports');
 assert.equal(await (await (await w.caches.open('other-app')).match('/index.html')).text(),'old other-app');
 assert.deepEqual(w.storageAccess,[]);
 assert.equal(await (await w.fetchRequest('/src/main.js')).text(),'export const release="new";');
});

test('failed download or quota leaves the active old offline release untouched',async t=>{
 for(const mode of ['download','quota']){
  const f=await fixture(t),b=await f.build(),w=worker(b);
  await seed(w,'gas-city-1.3.1','/index.html','old offline release');
  if(mode==='download')w.fail('/src/main.js');else w.quota('/src/main.js');
  await assert.rejects(w.event('install'));
  assert.equal(w.skipped,0);assert.equal(w.claimed,0);assert.deepEqual(w.deleted,[]);
  assert.equal(await (await (await w.caches.open('gas-city-1.3.1')).match('/index.html')).text(),'old offline release');
 }
});

test('new release stays available offline with navigation fallback and media byte ranges',async t=>{
 const f=await fixture(t),b=await f.build(),w=worker(b);
 await w.event('install');await w.event('activate');w.setOffline(true);
 assert.equal(await (await w.fetchRequest('/?returning=1',{navigate:true})).text(),'<html>new release</html>');
 assert.equal(await (await w.fetchRequest('/src/main.js')).text(),'export const release="new";');
 const part=await w.fetchRequest('/assets/video.mp4',{range:'bytes=2-5'});
 assert.equal(part.status,206);assert.equal(part.headers.get('content-range'),'bytes 2-5/10');assert.equal(await part.text(),'2345');
 const suffix=await w.fetchRequest('/assets/video.mp4',{range:'bytes=-3'});assert.equal(await suffix.text(),'789');
 assert.equal((await w.fetchRequest('/assets/video.mp4',{range:'bytes=15-20'})).status,416);
 assert.equal((await w.fetchRequest('/missing.png')).type,'error');
 assert.equal(await w.fetchRequest('/src/main.js',{method:'POST'}),undefined);
 assert.deepEqual(w.storageAccess,[]);
});

test('offline preparation still reports progress and errors without deleting cached files',async t=>{
 const f=await fixture(t),b=await f.build(),w=worker(b),messages=[];
 await w.event('install');await w.event('activate');
 await w.event('message',{data:{type:'CACHE_ALL'},source:{postMessage:m=>messages.push(m)}});
 assert.equal(messages.at(-1).type,'CACHE_READY');assert.equal(messages.filter(m=>m.type==='CACHE_PROGRESS').length,b.manifest.files.length);
 w.setOffline(true);messages.length=0;
 await w.event('message',{data:{type:'CACHE_ALL'},source:{postMessage:m=>messages.push(m)}});
 assert.equal(messages.at(-1).type,'CACHE_ERROR');
 assert.equal(await (await w.fetchRequest('/src/main.js')).text(),'export const release="new";');
});

test('first offline opt-in retains the existing message-driven progress workflow',async t=>{
 const f=await fixture(t),b=await f.build(),w=worker(b,{active:false}),messages=[];
 await w.event('install');await w.event('activate');
 assert.equal(w.skipped,1);assert.equal(w.requests.length,0);
 await w.event('message',{data:{type:'CACHE_ALL'},source:{postMessage:m=>messages.push(m)}});
 assert.equal(messages.at(-1).type,'CACHE_READY');assert.equal(messages.filter(m=>m.type==='CACHE_PROGRESS').length,b.manifest.files.length);
 w.setOffline(true);assert.equal(await (await w.fetchRequest('/',{navigate:true})).text(),'<html>new release</html>');
});
