import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'public/assets/concepts-v2');
const require=createRequire(import.meta.url),sharp=require(process.env.SHARP_MODULE||'sharp');
const ffmpeg=process.env.FFMPEG||'ffmpeg',W=1280,H=720,fps=24,seconds=9;
await fs.mkdir(out,{recursive:true});execFileSync(ffmpeg,['-version'],{stdio:'pipe'});
sharp.concurrency(2);sharp.cache({memory:48,files:0,items:32});
const files={pump:'prop-pump.webp',scale:'prop-scale.webp',jar:'prop-jar.webp',balloon:'prop-balloon.webp',packet:'prop-packet.webp',soda:'prop-soda.webp',nozzle:'prop-nozzle.webp',core:'visuals/air-core.webp',car:'visuals/balloon-car.webp',oxygen:'visuals/oxygen-support-v1.webp',extinguisher:'visuals/co2-extinguisher-v1.webp',bottle:'visuals/empty-bottle-v1.webp',chamber:'visuals/pressure-chamber-v1.webp',plunger:'visuals/pressure-plunger-v1.webp',pipe:'visuals/pipe-straight-v1.webp',housing:'visuals/fan-housing-v1.webp',rotor:'visuals/fan-rotor-v1.webp'};
// librsvg reliably embeds PNG; external-image/WebP decoding varies by renderer build.
const assets={};for(const [key,file]of Object.entries(files))assets[key]='data:image/png;base64,'+(await sharp(path.join(root,'public/assets',file)).png().toBuffer()).toString('base64');
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const img=(key,x,y,w,h,extra='')=>`<image xlink:href="${assets[key]}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" ${extra}/>`;
const dot=(x,y,r=5,color='#2b9da0')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const arrow=(x,y,xx,yy,color='#d8ab5b')=>{const a=Math.atan2(yy-y,xx-x);return `<path d="M${x} ${y}L${xx} ${yy}m${-22*Math.cos(a-.6)} ${-22*Math.sin(a-.6)}L${xx} ${yy}l${-22*Math.cos(a+.6)} ${-22*Math.sin(a+.6)}" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;};
const particles=(x,y,w,h,t,n=16)=>Array.from({length:n},(_,i)=>dot(x+10+((i*.618+t*.035)%1)*(w-20),y+10+((i*.382+t*.045)%1)*(h-20),4)).join('');
const fan=(x,y,size,t)=>img('rotor',x+size*.18,y+size*.07,size*.64,size*.70,`transform="rotate(${t*170} ${x+size*.5} ${y+size*.42})"`)+img('housing',x,y,size,size);
function flow(t){return img('pump',95,270,200,250)+img('pipe',290,260,620,300)+particles(320,398,560,25,t,12)+arrow(390,550,825,550)+fan(920,250,255,Math.max(0,t-3));}
function weight(t){const added=t<6?ease((t-3)/2):1-ease((t-6)/2);return img('scale',160,400,350,230)+img('scale',770,400,350,230)+img('jar',255,280,165,250)+img('jar',865,280,165,250)+particles(285,358,105,120,t,8)+particles(895,358,105,120,t,8+Math.round(added*12))+arrow(535,300,735,300);}
function temperature(t){const warm=t<6?ease((t-2.4)/2):1-ease((t-6)/2),s=.84+.30*warm,cx=640,base=355;let p='';for(let i=0;i<16;i++){const a=i*2.4,r=25+(i%4)*9;p+=dot(cx+Math.cos(a)*r*s,base-105*s+Math.sin(a)*r*s,4,'#ffebcf');}return img('bottle',568,335,144,265)+`<g transform="translate(${cx} ${base}) scale(${s})">${img('balloon',-110,-215,220,230)}</g>`+p+`<rect x="430" y="625" width="420" height="18" rx="9" fill="#dae9e9"/><rect x="430" y="625" width="${90+warm*330}" height="18" rx="9" fill="${warm>.5?'#e09b7c':'#6aa4ba'}"/>`+arrow(935,420,935,warm>.5?310:510,warm>.5?'#d89b7a':'#73a5b9');}
function pressure(t){const press=t<6?ease((t-2.6)/2):1-ease((t-6)/2),ratio=1-.34*press,h=235*ratio,bottom=570,top=bottom-h;return img('chamber',438,166,405,455)+`<rect x="532" y="${top}" width="210" height="${h}" fill="#86c8c52a"/>`+particles(548,top+20,178,h-45,t)+img('plunger',515,top-240,246,280)+arrow(940,t<6?155:330,940,t<6?225+100*press:210);}
function nitrogen(t){const p=ease((t-2)/2);return img('packet',450,170,375,430)+`<path d="M640 140L885 230V390Q870 550 640 625Q410 550 395 390V230Z" fill="none" stroke="#2d9294" stroke-width="8" opacity="${p*.65}"/>`+Array.from({length:10},(_,i)=>dot(340+((t*28+i*83)%610),620,6)).join('');}
function oxygen(t){const breathe=1+.014*Math.sin(t*2);return `<g transform="translate(640 370) scale(${breathe})">${img('oxygen',-220,-265,440,480)}</g>`+arrow(255,350,400,350,'#4b9ba4')+Array.from({length:7},(_,i)=>dot(230+((t*40+i*22)%160),310+i%3*17,5)).join('');}
function carbon(t){return img('soda',450,175,360,430)+Array.from({length:16},(_,i)=>{const y=500-((Math.max(0,t-3)*60+i*21)%290);return dot(600+(i%4)*17,y,4+i%3,'#e7f6ed');}).join('')+arrow(920,440,920,255,'#3c989f');}
function extinguisher(t){return img('extinguisher',450,160,370,450)+`<ellipse cx="640" cy="634" rx="190" ry="12" fill="#35696618"/>`+Array.from({length:8},(_,i)=>dot(900+(i%3)*27,270+((t*20+i*31)%260),6,'#7cb9b0')).join('');}
function engineering(t){return img('pump',90,245,200,270)+img('pipe',290,235,360,310)+img('nozzle',650,325,125,125)+particles(320,378,470,30,t,12)+fan(910,235,275,Math.max(0,t-3))+arrow(350,555,815,555);}
function car(t){const p=ease((t-3)/5),x=300+380*p;return img('car',x,260,390,290)+arrow(850,565,1100,565)+arrow(x-10,390,x-145,390,'#4c9ca1')+Array.from({length:7},(_,i)=>dot(x-20-((t*70+i*19)%150),385+(i%3)*10,4)).join('');}
const clips={flow,weight,temperature,pressure,nitrogen,oxygen,carbon,extinguisher,engineering,car};
const frame=(fn,t)=>`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}"><defs><radialGradient id="bg"><stop stop-color="#fffcf2"/><stop offset="1" stop-color="#e3ede8"/></radialGradient></defs><rect width="1280" height="720" fill="url(#bg)"/><rect x="65" y="80" width="1150" height="580" rx="36" fill="#ffffff45" stroke="#b9cdc2" stroke-width="3"/>${fn(t)}</svg>`;
async function encode(id,fn){
 if(process.env.RENDER_POSTERS==='1'){await sharp(Buffer.from(frame(fn,8.75))).webp({quality:88}).toFile(path.join(out,id+'.webp'));return;}
 const dest=path.join(out,id+'.mp4'),encoder=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(fps),'-i','-','-c:v','libx264','-crf','24','-preset','fast','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart','-an',dest],{stdio:['pipe','inherit','inherit']});
 const ended=new Promise((ok,no)=>{encoder.on('error',no);encoder.on('close',c=>c===0?ok():no(Error('FFmpeg '+c)));});encoder.stdin.on('error',()=>{});
 for(let f=0;f<fps*seconds;f++){const bytes=await sharp(Buffer.from(frame(fn,f/fps))).ensureAlpha().raw().toBuffer();if(!encoder.stdin.write(bytes))await new Promise(ok=>encoder.stdin.once('drain',ok));}
 encoder.stdin.end();await ended;
 execFileSync(ffmpeg,['-v','error','-y','-i',dest,'-c:v','libvpx-vp9','-crf','34','-b:v','0','-deadline','good','-cpu-used','5','-threads','2','-an',path.join(out,id+'.webm')],{stdio:'pipe'});
 await sharp(Buffer.from(frame(fn,8.75))).webp({quality:88}).toFile(path.join(out,id+'.webp'));
 console.log('Rendered illustrated concept',id);
}
const manifest=[];
for(const [id,fn]of Object.entries(clips)){
 if(!process.env.CONCEPT_ONLY||process.env.CONCEPT_ONLY===id)await encode(id,fn);
 for(const ext of ['mp4','webm','webp']){const file=id+'.'+ext;try{const b=await fs.readFile(path.join(out,file));manifest.push({file,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),...(ext==='webp'?{}:{seconds,width:W,height:H,fps})});}catch{}}
}
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({method:'Generated transparent illustrations + model-driven SVG motion → sharp → FFmpeg',generated:'2026-10-28',files:manifest},null,2));
