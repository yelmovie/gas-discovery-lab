// films/<편> → HyperFrames 렌더(1920×1080 30fps) → 앱 경로·형식으로 게시.
//   public/assets/concepts-v2/<편>.mp4 (1280×720 H.264, 소리 없음, faststart) · .webm (VP9) · .webp (마지막 장면 = 포스터·동작 줄이기 대체 그림)
// 실행: RENDER_DIR=<외장 SSD 폴더> node films/render.mjs [편...]   SKIP_RENDER=1이면 기존 렌더 원본으로 게시만 한다.
// 앱 영상은 자동재생을 위해 muted로 재생되므로 소리를 넣지 않는다.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {films} from './films.data.mjs';
import {CONCEPT_SECONDS} from '../src/concept-clips.js';
const sharp=createRequire(import.meta.url)(process.env.SHARP_MODULE||'sharp');
const here=import.meta.dirname,out=path.join(here,'..','public','assets','concepts-v2'),renders=process.env.RENDER_DIR;
if(!renders)throw Error('RENDER_DIR를 외장 SSD 폴더로 지정해 줘.');
fs.mkdirSync(renders,{recursive:true});
const LIMIT=2.5*1024*1024,only=process.argv.slice(2);
const probe=(file,entries)=>execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries',entries,'-of','csv=p=0',file]).toString().trim();
const duration=file=>+execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',file]).toString();
for(const film of films.filter(f=>!only.length||only.includes(f.id))){
  const src=path.join(renders,`${film.id}-1080.mp4`);
  if(process.env.SKIP_RENDER!=='1')execFileSync('hyperframes',['render','--quality','delivery','-o',src],{cwd:path.join(here,film.id),stdio:'inherit'});
  if(Math.abs(duration(src)-CONCEPT_SECONDS)>.1)throw Error(`${film.id}: 렌더 길이 ${duration(src)}s ≠ ${CONCEPT_SECONDS}s`);
  const mp4=path.join(out,film.id+'.mp4'),webm=path.join(out,film.id+'.webm'),still=path.join(renders,film.id+'-last.png');
  const scale=['-vf','scale=1280:720:flags=lanczos','-r','30','-an'];
  execFileSync('ffmpeg',['-y','-v','error','-i',src,...scale,'-c:v','libx264','-profile:v','main','-pix_fmt','yuv420p','-crf','25','-preset','slow','-movflags','+faststart',mp4]);
  execFileSync('ffmpeg',['-y','-v','error','-i',src,...scale,'-c:v','libvpx-vp9','-b:v','0','-crf','36','-row-mt','1','-cpu-used','2','-pix_fmt','yuv420p',webm]);
  for(const file of [mp4,webm])if(fs.statSync(file).size>LIMIT)throw Error(`${file}: ${fs.statSync(file).size}B > 2.5MB`);
  execFileSync('ffmpeg',['-y','-v','error','-sseof','-0.1','-i',src,'-frames:v','1','-vf','scale=1280:720:flags=lanczos',still]);
  await sharp(still).webp({quality:86}).toFile(path.join(out,film.id+'.webp'));
  console.log(`${film.id}: mp4 ${fs.statSync(mp4).size}B, webm ${fs.statSync(webm).size}B, ${duration(mp4).toFixed(2)}s ${probe(mp4,'stream=codec_name,width,height')}`);
}
// 매니페스트: verify-media가 해시·크기·길이를 검사한다.
const manifest=[];
for(const film of films)for(const ext of ['mp4','webm','webp']){const file=film.id+'.'+ext,b=fs.readFileSync(path.join(out,file));manifest.push({file,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),...(ext==='webp'?{}:{seconds:CONCEPT_SECONDS,width:1280,height:720,fps:30})});}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({method:'HyperFrames 0.9.26 (films/ 공용 부품 + 편별 데이터, 게임 소품 그림) → FFmpeg',generated:'2026-11-10',files:manifest},null,2)+'\n');
