import test from 'node:test';
import assert from 'node:assert/strict';
import {APP,STAGES} from '../src/data.js';
import {store,freshSave,loadSave,validateSave,award,completeFinale,resetProgress,setTeacherPreview} from '../src/state.js';
import {completionDateText,validCompletionTimestamp} from '../src/completion-date.js';

const first='2026-11-23T05:00:00.000Z',later='2026-11-24T05:00:00.000Z';
const fullSave=()=>{const s=freshSave();for(const stage of STAGES)s.evidence[stage.id]=stage.tasks.map(t=>({taskId:t.id,summary:'직접 관찰한 기록',details:{},date:'2026-11-22T05:00:00.000Z'}));return s;};
function withSave(save,run){
 const data=new Map([[APP.saveKey,JSON.stringify(save)]]);
 const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 const previous=globalThis.localStorage;globalThis.localStorage=storage;
 for(const k of Object.keys(store))delete store[k];Object.assign(store,loadSave(storage));
 try{run(storage);}finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
}

test('the first core completion survives later practice, repeated core entry and reload',()=>{
 withSave(fullSave(),storage=>{
  assert.equal(completeFinale(first),true);
  assert.equal(store.save.finaleCompletedAt,first,'the core completion, not the last task date');
  const shown=completionDateText(store.save);
  award(STAGES[0],STAGES[0].tasks[0],'나중에 다시 관찰');
  assert.notEqual(store.save.evidence.flow[0].date,'2026-11-22T05:00:00.000Z');
  assert.equal(completeFinale(later),true);
  assert.equal(store.save.finaleCompletedAt,first);
  assert.equal(completionDateText(loadSave(storage).save),shown);
 });
});
test('legacy completion has no invented date, including after another core entry',()=>{
 const legacy=fullSave();legacy.finaleCompleted=true;delete legacy.finaleCompletedAt;
 withSave(legacy,storage=>{
  assert.equal(store.save.finaleCompletedAt,null);
  assert.equal(completionDateText(store.save),'날짜 기록 없음');
  completeFinale(later);
  assert.equal(loadSave(storage).save.finaleCompletedAt,null);
  assert.equal(completionDateText(loadSave(storage).save),'날짜 기록 없음');
 });
});
test('invalid completion timestamps are rejected without affecting earned progress',()=>{
 for(const value of ['invalid','2026-02-30T05:00:00.000Z','2026-11-23',0,null,{},'99999-01-01T00:00:00.000Z']){
  assert.equal(validCompletionTimestamp(value),null);
  const s=fullSave();s.finaleCompleted=true;s.finaleCompletedAt=value;
  const loaded=validateSave(s);assert.equal(loaded.finaleCompleted,true);assert.equal(loaded.finaleCompletedAt,null);
 }
 assert.equal(validCompletionTimestamp(first),first);
 const unfinished=fullSave();unfinished.finaleCompletedAt=first;
 assert.equal(validateSave(unfinished).finaleCompletedAt,null);
 withSave(fullSave(),()=>{assert.equal(completeFinale('invalid'),false);assert.equal(store.save.finaleCompleted,false);});
});
test('reset clears the completion date and retains the original in the recovery copy',()=>{
 const s=fullSave();s.finaleCompleted=true;s.finaleCompletedAt=first;
 withSave(s,storage=>{
  assert.equal(resetProgress(storage),true);
  assert.equal(store.save.finaleCompleted,false);assert.equal(store.save.finaleCompletedAt,null);
  assert.equal(JSON.parse(storage.getItem(APP.saveKey+'-recovery')).finaleCompletedAt,first);
 });
});
test('neither incomplete exploration nor teacher preview creates a core completion date',()=>{
 withSave(freshSave(),()=>{assert.equal(completeFinale(first),false);assert.equal(store.save.finaleCompletedAt,null);});
 withSave(fullSave(),()=>{setTeacherPreview(true);assert.equal(completeFinale(first),false);setTeacherPreview(false);assert.equal(store.save.finaleCompleted,false);assert.equal(store.save.finaleCompletedAt,null);});
});
