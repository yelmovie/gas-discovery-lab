import { APP, STAGES } from './data.js';
import {completeStage} from './model.js';
import { normalizeMapHits } from './map-encounter-progress.js';
export const freshSave=()=>({version:1,mapRepairs:[],mapHits:{},introSeen:false,evidence:Object.fromEntries(STAGES.map(s=>[s.id,[]])),drafts:{},finaleCompleted:false,ability:'실험 기록을 비교해 설명할 수 있어요.',nickname:'',settings:{music:true,sfx:true,musicVolume:35,reduceMotion:false,adminUnlockAll:false}});
export function validateSave(value){
 if(!value||typeof value!=='object'||value.version!==1)throw Error('저장 형식이 달라요.');
 const clean=freshSave();clean.introSeen=value.introSeen===true;
 clean.mapRepairs=Array.isArray(value.mapRepairs)?[...new Set(value.mapRepairs.filter(n=>Number.isInteger(n)&&n>=0&&n<5))]:[];
 for(const stage of STAGES){const seen=new Set();for(const e of Array.isArray(value.evidence?.[stage.id])?value.evidence[stage.id]:[]){if(e&&stage.tasks.some(t=>t.id===e.taskId)&&!seen.has(e.taskId)&&typeof e.summary==='string'){clean.evidence[stage.id].push({taskId:e.taskId,summary:e.summary.slice(0,600),details:typeof e.details==='object'&&e.details?e.details:{},date:typeof e.date==='string'?e.date:'',...(e.firstObservation&&typeof e.firstObservation.summary==='string'?{firstObservation:{summary:e.firstObservation.summary.slice(0,600),details:e.firstObservation.details||{},date:e.firstObservation.date||''}}:{})});seen.add(e.taskId);}}}
 clean.settings.music=value.settings?.music!==false;clean.settings.sfx=value.settings?.sfx!==false;
 const volume=value.settings?.musicVolume;clean.settings.musicVolume=Number.isFinite(volume)?Math.min(100,Math.max(0,volume)):35;
 clean.settings.reduceMotion=value.settings?.reduceMotion===true;
 clean.settings.adminUnlockAll=false;
 clean.finaleCompleted=value.finaleCompleted===true&&STAGES.every(s=>completeStage(clean,s.id));
 clean.nickname=typeof value.nickname==='string'?value.nickname.slice(0,16):'';
 if(typeof value.ability==='string')clean.ability=value.ability.slice(0,120);
 if(value.drafts&&typeof value.drafts==='object')for(const task of STAGES.flatMap(s=>s.tasks)){const draft=value.drafts[task.id];if(draft&&typeof draft==='object'&&!Array.isArray(draft))clean.drafts[task.id]=draft;}
 if(value.last&&['map','stage','activity'].includes(value.last.screen)){
  const stage=STAGES.find(s=>s.id===value.last.stageId);
  if(value.last.screen==='map')clean.last={screen:'map'};
  else if(stage)clean.last={screen:value.last.screen,stageId:stage.id,index:Math.max(0,Math.min(stage.tasks.length-1,Math.trunc(Number(value.last.index))||0))};
 }
 clean.mapHits=normalizeMapHits(value.mapHits,STAGES.filter(s=>completeStage(clean,s.id)).map(s=>s.id));
 return clean;
}
export function loadSave(storage){
 let raw=null;
 try{storage=storage??globalThis.localStorage;raw=storage?.getItem(APP.saveKey)??null;return {save:raw?validateSave(JSON.parse(raw)):freshSave(),problem:null,recoveryPending:false,baseline:raw,demo:false};}
 catch{return {save:freshSave(),problem:'저장된 기록을 읽지 못했어요. 원래 기록을 보존해요. 설정에서 복구 파일을 내려받을 수 있어요.',recovery:raw,recoveryPending:typeof raw==='string',baseline:raw,demo:false};}
}
export let store=loadSave();
export function setTeacherPreview(enabled){
 if(enabled&&!store.demo){store.studentSave=store.save;store.save=JSON.parse(JSON.stringify(store.save));store.save.settings.adminUnlockAll=true;store.demo=true;}
 else if(!enabled&&store.demo){store.save=store.studentSave;delete store.studentSave;store.demo=false;}
}
export function persist(storage){
 if(store.demo)return true;
 if(store.recoveryPending)return false;
 try{
  storage=storage??globalThis.localStorage;
  if(!storage)throw Error('Storage unavailable');
  if((storage.getItem(APP.saveKey)??null)!==store.baseline){store.problem='다른 탭에서 기록이 바뀌었어요. 현재 연구 기록을 내려받고 새로고침해 주세요. 덮어쓰지 않았어요.';return false;}
  const raw=JSON.stringify(store.save);storage.setItem(APP.saveKey,raw);store.baseline=raw;store.problem=null;return true;
 }catch{store.problem='이 브라우저에 기록을 저장하지 못했어요. 설정에서 연구 기록을 내려받아 주세요.';return false;}
 finally{if(typeof window!=='undefined')window.dispatchEvent(new Event('gas-save-status'));}
}
export function award(stage,task,summary,details={}){
 const known=STAGES.find(s=>s.id===stage?.id);if(!known?.tasks.some(t=>t.id===task?.id)||typeof summary!=='string')return false;
 const list=store.save.evidence[stage.id],at=list.findIndex(e=>e.taskId===task.id),old=at>=0?list[at]:null,previous=old?.details||{};
 const attempts=Number.isFinite(details.attempts)?Math.max(1,details.attempts):null;
 const bestAttempts=attempts?Math.min(attempts,Number.isFinite(previous.bestAttempts)?previous.bestAttempts:Infinity):previous.bestAttempts;
 const record={taskId:task.id,summary:summary.slice(0,600),details:{...details,firstTry:previous.firstTry===true||details.firstTry===true,...(bestAttempts?{bestAttempts}:{})},date:new Date().toISOString()};
 record.firstObservation=old?.firstObservation||{summary:old?.summary??record.summary,details:JSON.parse(JSON.stringify(old?.details??record.details)),date:old?.date??record.date};
 if(at<0)list.push(record);else list[at]=record;persist();return true;
}
export function resetProgress(storage){
 if(store.demo){store.problem='시연을 종료한 뒤 학생 기록을 초기화해 주세요.';return false;}
 try{
  storage=storage??globalThis.localStorage;
  const raw=storage.getItem(APP.saveKey)??null;
  if(raw!==store.baseline){store.problem='다른 탭의 기록이 바뀌어 초기화를 멈췄어요. 새로고침해 주세요.';return false;}
  if(raw!==null)storage.setItem(APP.saveKey+'-recovery',raw);
  const next={...freshSave(),settings:{...store.save.settings,adminUnlockAll:false}},encoded=JSON.stringify(next);
  storage.setItem(APP.saveKey,encoded);Object.assign(store,{save:next,baseline:encoded,recoveryPending:false,problem:null,recovery:raw});return true;
 }catch{store.problem='원래 기록을 안전하게 보관하지 못해 초기화를 멈췄어요.';return false;}
}
export function allComplete(){return STAGES.every(s=>completeStage(store.save,s.id));}
