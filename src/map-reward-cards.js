// Achievement cards: one per map villain, earned on its third hit.
// Ownership is read from the existing hit record (save.mapHits[id]===3), so nothing new is saved and a villain
// that was already driven off shows its card in the header without replaying the reveal.
import {createRewardCards} from './reward-cards.js';
import {STAGES} from './data.js';

// Card titles in facility order (map.js encounterStage ids are the stage ids). The star count rises with the order.
const TITLES=['바람길 연결 개척자','공기 무게 측정 탐정','기체 부피 탐구왕','알맞은 기체 해결사','전설의 공기 엔지니어'];
const base='/assets/reward-cards/';
export const REWARD_CARDS=STAGES.map((stage,index)=>{
 const file=`${index+1}-${stage.id}.webp`;
 return {id:stage.id,title:TITLES[index],stage:stage.name,art:`${base}card-${file}`,thumb:`${base}thumb-${file}`};
});
const HITS=3;
export const ownedRewardCards=hits=>REWARD_CARDS.map(({id})=>hits?.[id]===HITS);
// Card indexes won by a save: only the hit that takes a villain from under three to three.
export const newRewardCards=(before,after)=>REWARD_CARDS.flatMap(({id},index)=>before?.[id]!==HITS&&after?.[id]===HITS?[index]:[]);

// map.js hands over its cue player, so the cards follow the effects switch, quiet mode and the hidden-tab rule.
let play=()=>{};
export function bindRewardSound(cue){play=cue;}

// Built on first use: unit tests read the card rules without a browser.
let instance;
function rewards(){
 return instance??=createRewardCards({
  setName:'기체 도시 대작전 성취 카드',
  cards:REWARD_CARDS,
  theme:{accent:'#d5aa58',accent2:'#235f63',glow:'#f5daa1',ink:'#263e3d'},
  particles:['bubble','circle','gear','spark'],
  colors:['#d5aa58','#f5daa1','#267e82','#a7e7ff','#e2f1e9','#ffffff'],
  // Card back: the wind mark of the app icon (public/assets/app-icon.svg).
  emblem:'<svg viewBox="29 29 134 134" aria-hidden="true"><path d="M48 80h59c26 0 26-31 8-31-9 0-15 5-15 12M44 103h94c27 0 28 32 7 32-10 0-15-4-16-10M59 126h35" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round"/></svg>',
  sound:name=>play(`card-${name}`),
  inertRoot:()=>document.querySelector('#app'),
 });
}

// A card on its way to a slot stays empty in the header until it lands, even if the header is redrawn meanwhile.
const flying=new Set();
const shown=hits=>ownedRewardCards(hits).map((owned,index)=>owned&&!flying.has(index));
// The slot strip that sits just before the sound button (main.js controls()).
export const rewardSlotsHtml=hits=>rewards().slotsHtml(shown(hits));
export function syncRewardSlots(hits){if(instance)instance.syncSlots(shown(hits));}
// Cards whose villain has finished its exit and that are not in their slot yet.
let due=0;
// True from the moment a won card is ready to open until it sits in its slot. map.js adds it to the encounters'
// blocked(), so the all-villains finale waits for the card even when a dialog (settings) delayed the card.
export const rewardCardDue=()=>due>0;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
/**
 * Call with the hit record before and after a villain save, before the save is announced (the header redraws on it).
 * After `delay` (the villain's exit) each won card opens from its villain. `state()` answers 'open', 'wait'
 * (a dialog covers the map) or 'gone' (the learner left the map: the slot simply shows what is saved).
 */
export function awardRewardCards(before,after,{delay,state,hits}){
 for(const index of newRewardCards(before,after))void win(index,delay,state,hits);
}
async function win(index,delay,state,hits){
 flying.add(index);
 let counted=false;
 try{
  await wait(delay);
  due++;counted=true;
  let now;
  while((now=state())==='wait')await wait(300);
  if(now!=='open'||!ownedRewardCards(hits())[index])return;
  const foe=document.querySelector(`.map-encounter-foe[data-encounter="${REWARD_CARDS[index].id}"]`),box=foe?.getClientRects().length?foe.getBoundingClientRect():null;
  // An open card makes #app inert: the map, its villains and the finale wait until the card is put away.
  await rewards().reveal(index,box?{x:box.left,y:box.top-28}:undefined,ownedRewardCards(hits()).map((owned,i)=>owned&&(i===index||!flying.has(i))));
 }finally{
  if(counted)due--;
  flying.delete(index);
  syncRewardSlots(hits());
 }
}
