import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {CONCEPT_SECONDS} from '../src/concept-clips.js';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'public/assets/concepts-v2');
const manifest=JSON.parse(await fs.readFile(path.join(dir,'manifest.json'),'utf8'));
assert.equal(manifest.files.length,30);
for(const item of manifest.files){
 const bytes=await fs.readFile(path.join(dir,item.file));assert.equal(bytes.length,item.bytes,item.file);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,item.file);
 if(item.seconds){assert.equal(item.seconds,CONCEPT_SECONDS);assert.equal(item.width,1280);assert.equal(item.height,720);execFileSync(process.env.FFMPEG||'ffmpeg',['-v','error','-i',path.join(dir,item.file),'-f','null','-'],{stdio:'pipe'});
  const real=Number(execFileSync(process.env.FFPROBE||'ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',path.join(dir,item.file)]).toString());assert.ok(Math.abs(real-CONCEPT_SECONDS)<.15,`${item.file} 실제 길이 ${real}s`);assert.ok(bytes.length<=2.5*1024*1024,`${item.file} 2.5MB 초과`);}
}
for(const name of ['tap','rotate','pump','connect','success','award','hint'])assert.ok((await fs.stat(path.join(root,`public/assets/audio/${name}.mp3`))).size>500);
console.log('PASS: 30 media hashes/sizes, 20 complete video decodes, 7 local effects.');
