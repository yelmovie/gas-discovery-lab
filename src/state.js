import { APP, STAGES } from './data.js';
import {completeStage} from './model.js';
export const freshSave=()=>({version:1,introSeen:false,evidence:Object.fromEntries(STAGES.map(s=>[s.id,[]])),drafts:{},finaleCompleted:false,ability:'실험 기록을 비교해 설명할 수 있어요.',nickname:'',settings:{music:true,sfx:true,musicVolume:35,adminUnlockAll:false}});
export function validateSave(value){
 if(!value||typeof value!=='object'||value.version!==1)throw Error('저장 형식이 달라요.');
 const clean=freshSave();clean.introSeen=value.introSeen===true;
 for(const stage of STAGES){const seen=new Set();for(const e of Array.isArray(value.evidence?.[stage.id])?value.evidence[stage.id]:[]){if(e&&stage.tasks.some(t=>t.id===e.taskId)&&!seen.has(e.taskId)&&typeof e.summary==='string'){clean.evidence[stage.id].push({taskId:e.taskId,summary:e.summary.slice(0,600),details:typeof e.details==='object'&&e.details?e.details:{},date:typeof e.date==='string'?e.date:''});seen.add(e.taskId);}}}
 clean.settings.music=value.settings?.music!==false;clean.settings.sfx=value.settings?.sfx!==false;
 const volume=value.settings?.musicVolume;clean.settings.musicVolume=Number.isFinite(volume)?Math.min(100,Math.max(0,volume)):35;
 clean.settings.adminUnlockAll=value.settings?.adminUnlockAll===true;
 clean.finaleCompleted=value.finaleCompleted===true&&STAGES.every(s=>completeStage(clean,s.id));
 clean.nickname=typeof value.nickname==='string'?value.nickname.slice(0,16):'';
 if(typeof value.ability==='string')clean.ability=value.ability.slice(0,120);
 if(value.drafts&&typeof value.drafts==='object')for(const task of STAGES.flatMap(s=>s.tasks)){const draft=value.drafts[task.id];if(draft&&typeof draft==='object'&&!Array.isArray(draft))clean.drafts[task.id]=draft;}
 if(value.last&&['map','stage','activity'].includes(value.last.screen)){
  const stage=STAGES.find(s=>s.id===value.last.stageId);
  if(value.last.screen==='map')clean.last={screen:'map'};
  else if(stage)clean.last={screen:value.last.screen,stageId:stage.id,index:Math.max(0,Math.min(stage.tasks.length-1,Math.trunc(Number(value.last.index))||0))};
 }
 return clean;
}
export function loadSave(storage=globalThis.localStorage){
 let raw=null;
 try{raw=storage?.getItem(APP.saveKey);return {save:raw?validateSave(JSON.parse(raw)):freshSave(),problem:null,recoveryPending:false};}
 catch{return {save:freshSave(),problem:'저장된 기록을 읽지 못했어요. 원래 기록을 보존해요. 설정에서 복구 파일을 내려받을 수 있어요.',recovery:raw,recoveryPending:typeof raw==='string'};}
}
export let store=loadSave();
export function persist(storage=globalThis.localStorage){try{if(store.recoveryPending){storage.setItem(APP.saveKey+'-recovery',store.recovery);store.recoveryPending=false;}storage.setItem(APP.saveKey,JSON.stringify(store.save));return true;}catch{store.problem='이 브라우저에 기록을 저장하지 못했어요. 설정에서 연구 기록을 내려받아 주세요.';return false;}}
export function award(stage,task,summary,details={}){const known=STAGES.find(s=>s.id===stage?.id);if(!known?.tasks.some(t=>t.id===task?.id)||typeof summary!=='string')return false;const list=store.save.evidence[stage.id],at=list.findIndex(e=>e.taskId===task.id),previous=at>=0?list[at].details:{};const attempts=Number.isFinite(details.attempts)?Math.max(1,details.attempts):null;const bestAttempts=attempts?Math.min(attempts,Number.isFinite(previous.bestAttempts)?previous.bestAttempts:Infinity):previous.bestAttempts;const record={taskId:task.id,summary:summary.slice(0,600),details:{...details,firstTry:previous.firstTry===true||details.firstTry===true,...(bestAttempts?{bestAttempts}: {})},date:new Date().toISOString()};if(at<0)list.push(record);else list[at]=record;persist();return true;}
export function resetProgress(){const settings={...store.save.settings,adminUnlockAll:false};store.save={...freshSave(),settings};store.problem=null;persist();}
export function allComplete(){return STAGES.every(s=>completeStage(store.save,s.id));}
