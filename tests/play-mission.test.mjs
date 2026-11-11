import test from 'node:test';import assert from 'node:assert/strict';import{flow,missions,freshCells}from'../src/play-mission-model.js';
export function solve(n){const c=freshCells();if(n===0)for(const i of [3,4,5])c[i]={type:0,turn:1};if(n===1)for(const[i,type,turn]of[[3,1,3],[0,1,1],[1,0,1],[2,1,2],[5,1,0]])c[i]={type,turn};if(n===2)for(const[i,type,turn]of[[3,1,2],[6,1,0],[7,0,1],[8,1,3],[5,1,1]])c[i]={type,turn};return c;}
test('each circuit solves and open vent leaks',()=>{missions.forEach((m,n)=>{const r=flow(solve(n),m,false);assert.equal(r.reached,true);assert.equal(r.leak,false);assert.equal(flow(solve(n),m,true).leak,true);});});
test('unconnected pipes never complete',()=>{missions.forEach(m=>assert.equal(flow(freshCells(),m,false).reached,false));});
