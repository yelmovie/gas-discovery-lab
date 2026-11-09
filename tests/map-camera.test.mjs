import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/map.js',import.meta.url),'utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0);let i=source.indexOf('{',start),depth=1;for(let j=i+1;j<source.length;j++){if(source[j]==='{')depth++;if(source[j]==='}'&&!--depth)return source.slice(start,j+1);}}
const setup='let width,height,scale,ready;const host={clientWidth:w,clientHeight:h},devicePixelRatio=1,canvas={},g={setTransform(){}},map={width:1672,height:941};FN;resize();result={width:map.width*scale,height:map.height*scale};';
test('overview fits the complete world and exploration remains zoomed',()=>{
 for(const [w,h] of [[1024,768],[768,1024],[1280,800],[390,844],[1920,1080]]){
  for(const overview of [true,false]){
   const context={w,h,overview};vm.createContext(context);vm.runInContext(setup.replace('FN',fn('resize')),context);
   const r=context.result;assert.ok(Number.isFinite(r.width)&&Number.isFinite(r.height));
   if(overview){assert.ok(r.width<=w+0.001);assert.ok(r.height<=h+0.001);if('x' in r){assert.ok(Math.abs(r.x-(w-r.width)/2)<0.001);assert.ok(Math.abs(r.y-(h-r.height)/2)<0.001);}}
   else assert.ok(r.width>w&&r.height>h);
  }
 }
});
