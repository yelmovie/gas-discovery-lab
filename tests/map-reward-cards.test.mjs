import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {REWARD_CARDS,ownedRewardCards,newRewardCards,rewardCardDue} from '../src/map-reward-cards.js';
import {STAGES} from '../src/data.js';
const root=new URL('../',import.meta.url);

test('one achievement card per map villain, in facility order, with its art and thumbnail', async () => {
 assert.deepEqual(REWARD_CARDS.map(card=>card.id),STAGES.map(stage=>stage.id));
 assert.deepEqual(REWARD_CARDS.map(card=>card.stage),STAGES.map(stage=>stage.name));
 assert.equal(new Set(REWARD_CARDS.map(card=>card.title)).size,5);
 for(const [index,card] of REWARD_CARDS.entries())for(const [kind,file,least] of [['card',card.art,20000],['thumb',card.thumb,1000]]){
  assert.equal(file,`/assets/reward-cards/${kind}-${index+1}-${card.id}.webp`);
  assert.ok((await fs.stat(new URL('public'+file,root))).size>least,file);
 }
});

test('a card is owned only after the third hit, from the existing hit record', () => {
 assert.deepEqual(ownedRewardCards({}),[false,false,false,false,false]);
 assert.deepEqual(ownedRewardCards(undefined),[false,false,false,false,false]);
 assert.deepEqual(ownedRewardCards({flow:3,weight:2,delivery:3,core:3}),[true,false,false,true,false]);
});

test('a card is won only by the hit that takes a villain from under three to three', () => {
 assert.deepEqual(newRewardCards({},{weight:1}),[]);
 assert.deepEqual(newRewardCards({weight:2},{weight:3}),[1]);
 assert.deepEqual(newRewardCards({weight:3},{weight:3}),[]);
 assert.deepEqual(newRewardCards({flow:3,engineering:2},{flow:3,engineering:3}),[4]);
 assert.equal(rewardCardDue(),false,'no card is due before a villain is driven off');
});

test('achievement card cue files ship, are credited and are wired into the cue player', async () => {
 const credits=await fs.readFile(new URL('assets/CREDITS.md',root),'utf8'),audio=await fs.readFile(new URL('src/audio.js',root),'utf8');
 for(const name of ['whoosh','reveal','epic','slot','complete']){
  assert.ok((await fs.stat(new URL(`public/assets/audio/sfx/card-${name}.mp3`,root))).size>1000,name);
  assert.match(credits,new RegExp(`audio/sfx/card-${name}\\.mp3.*CC0`),name);
  assert.ok(audio.includes(`'card-${name}':'card-${name}.mp3'`),name);
 }
});

test('the shared card module and its styles are loaded by the page', async () => {
 assert.match(await fs.readFile(new URL('index.html',root),'utf8'),/href="\/src\/reward-cards\.css"/);
 assert.ok((await fs.stat(new URL('src/reward-cards.js',root))).size>10000);
});
