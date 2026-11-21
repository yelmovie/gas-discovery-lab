// 확인·공유용 이어 붙인 영상: 앱용 장면 영상 3편 + 목소리(ElevenLabs, 앱과 같은 파일) + 배경음 + 한글 자막(ASS, 굽기).
// 장면은 목소리 길이에 맞춰 마지막 장면을 잠깐 멈춘다. 다음 장면은 앞 장면 끝 프레임에서 시작하므로 이음새가 없다.
import {execFileSync} from 'node:child_process';import fs from 'node:fs';
const root='/Volumes/T7 Shield/iscreammedia_sc34/15 gas',W=root+'/.tmp/intro-finale-20261121',A=root+'/public/assets';
const {STORY}=await import(root+'/src/data.js');
const ending=[['바람이 다시 흐르기 시작했어요','직접 이은 관을 따라 공기가 흐르고, 멈췄던 시설이 다시 움직여요.'],['내 증거가 마을을 바꾸었어요','무게를 재고, 부피를 비교하고, 기체의 쓰임을 찾았어요. 다섯 연구시설이 모두 빛나요.'],['이제 나는 공기 엔지니어!','예측하고, 해 보고, 결과를 바꾸어 보았어요. 새로운 문제도 근거를 찾아 해결할 수 있어요.']];
const dur=f=>Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',f]).toString());
const films={intro:{clips:['intro-1','intro-2','intro-3'],voices:['story-1','story-2','story-3'],text:STORY.map(s=>[s.title,s.text]),bgm:'main-theme'},final:{clips:['final-1','final-2','final-3'],voices:['el-ending-1','el-ending-2','el-ending-3'],text:ending,bgm:'final-theme'}};
const t2=s=>{const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=(s%60).toFixed(2).padStart(5,'0');return `${h}:${String(m).padStart(2,'0')}:${x}`;};
for(const [name,f] of Object.entries(films)){
 if(!f.clips.every(c=>fs.existsSync(`${A}/films-story/${c}.mp4`))){console.log(name,'skip: clips missing');continue;}
 const lead=.4,tail=.6;let at=0;const scenes=[],cues=[];
 f.clips.forEach((c,i)=>{const v=dur(`${A}/audio/voices/${f.voices[i]}.mp3`),len=Math.max(7.9,lead+v+tail);scenes.push({c,len,hold:len-7.9,start:at});cues.push({start:at+lead,end:at+lead+v,title:f.text[i][0],text:f.text[i][1]});at+=len;});
 const ass=`[Script Info]\nScriptType: v4.00+\nPlayResX: 1280\nPlayResY: 720\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: T,Apple SD Gothic Neo,34,&H00FFFFFF,&H00FFFFFF,&H00303A16,&H96000000,1,0,0,0,100,100,0,0,1,3,1,2,80,80,96,1\nStyle: B,Apple SD Gothic Neo,30,&H00FFFFFF,&H00FFFFFF,&H00202020,&H96000000,0,0,0,0,100,100,0,0,1,2.6,1,2,80,80,40,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`+cues.map(q=>`Dialogue: 0,${t2(q.start)},${t2(q.end+.3)},T,,0,0,0,,{\\fad(250,250)}${q.title}\nDialogue: 0,${t2(q.start)},${t2(q.end+.3)},B,,0,0,0,,{\\fad(250,250)}${q.text}`).join('\n')+'\n';
 fs.writeFileSync(`${W}/${name}.ass`,ass);
 const args=['-v','error','-y'];scenes.forEach(s=>args.push('-i',`${A}/films-story/${s.c}.mp4`));f.voices.forEach(v=>args.push('-i',`${A}/audio/voices/${v}.mp3`));args.push('-i',`${A}/audio/bgm/${f.bgm}.mp3`);
 const n=scenes.length;let g=scenes.map((s,i)=>`[${i}:v]tpad=stop_mode=clone:stop_duration=${s.hold.toFixed(2)}[v${i}]`).join(';')+';'+scenes.map((_,i)=>`[v${i}]`).join('')+`concat=n=${n}:v=1:a=0,subtitles='${W}/${name}.ass':fontsdir=/System/Library/Fonts,fade=t=out:st=${(at-.8).toFixed(2)}:d=0.8[v]`;
 g+=';'+f.voices.map((_,i)=>`[${n+i}:a]adelay=${Math.round(cues[i].start*1000)}|${Math.round(cues[i].start*1000)},volume=1.0[a${i}]`).join(';');
 g+=`;[${2*n}:a]atrim=0:${at.toFixed(2)},afade=t=in:d=1,afade=t=out:st=${(at-1.5).toFixed(2)}:d=1.5,volume=0.22[m];`+f.voices.map((_,i)=>`[a${i}]`).join('')+`[m]amix=inputs=${n+1}:normalize=0,alimiter=limit=0.9[a]`;
 args.push('-filter_complex',g,'-map','[v]','-map','[a]','-t',at.toFixed(2),'-c:v','libx264','-crf','22','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',`${W}/${name}-review.mp4`);
 execFileSync('ffmpeg',args,{stdio:'inherit'});console.log(name,'review',at.toFixed(1)+'s',fs.statSync(`${W}/${name}-review.mp4`).size,'bytes');
}
