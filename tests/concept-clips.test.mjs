import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {CONCEPT_CLIPS,CONCEPT_LABELS,CONCEPT_WORDS,CONCEPT_SECONDS,CUE_SECONDS,cueAt} from '../src/concept-clips.js';
import {films} from '../films/films.data.mjs';
import {renderFilm} from '../films/kit/kit.mjs';

test('every concept clip has three cues, three scene labels and highlight words',()=>{
 for(const [id,[title,cues]] of Object.entries(CONCEPT_CLIPS)){assert.ok(title,id);assert.equal(cues.length,3,id);assert.equal(CONCEPT_LABELS[id].length,3,id);assert.ok(CONCEPT_WORDS[id].length>0,id);}
 assert.equal(CUE_SECONDS*3,CONCEPT_SECONDS);
});
test('film data covers every app clip and uses the app cue boundaries',()=>{
 assert.deepEqual(films.map(f=>f.id).sort(),Object.keys(CONCEPT_CLIPS).sort());
 for(const film of films){
  const html=renderFilm(film);
  assert.match(html,new RegExp(`data-duration="${CONCEPT_SECONDS}"`),film.id);
  for(const tag of film.tags){assert.ok([0,1,2].includes(tag.beat),film.id);const start=cueAt(tag.beat)+(tag.delay??1.1);assert.ok(start>=cueAt(tag.beat)&&start<(tag.beat<2?cueAt(tag.beat+1):CONCEPT_SECONDS-2),`${film.id} 이름표 ${tag.beat}가 자기 장면 안에서 시작`);}
  assert.deepEqual([...new Set(film.tags.map(t=>t.beat))].sort(),[0,1,2],`${film.id} 장면마다 이름표 하나`);
  assert.ok(!/repeat:-1|"repeat":-1|Math\.random|Date\.now/.test(html),`${film.id} 결정적 타임라인`);
  assert.ok(!/particle|입자/.test(html),`${film.id} 입자 모형 없음`);
 }
});
test('shipped clips declare the same length the app uses for its cue timetable',async()=>{
 const manifest=JSON.parse(await fs.readFile(new URL('../public/assets/concepts-v2/manifest.json',import.meta.url),'utf8'));
 const videos=manifest.files.filter(f=>f.seconds);assert.equal(videos.length,20);
 for(const v of videos)assert.equal(v.seconds,CONCEPT_SECONDS,v.file);
});
