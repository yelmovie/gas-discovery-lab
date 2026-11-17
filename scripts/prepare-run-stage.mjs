// 3D 산길 스테이지 그림 가공: 생성 원본(asset-bank/original/generated-20261117/run-*.png) → public/assets/run-stage/*.webp
// 실행: SHARP_MODULE=<sharp 경로> node scripts/prepare-run-stage.mjs   (원본은 고치지 않는다)
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const sharp=createRequire(import.meta.url)(process.env.SHARP_MODULE||'sharp');
const root=path.resolve(import.meta.dirname,'..'),source=path.join(root,'asset-bank/original/generated-20261117'),out=path.join(root,'public/assets/run-stage');
await fs.mkdir(out,{recursive:true});
const report=[],missing=[];
const original=name=>path.join(source,`run-${name}.png`);
const exists=file=>fs.stat(file).then(()=>true,()=>false);
async function done(name){const file=path.join(out,name+'.webp'),meta=await sharp(file).metadata();report.push(`${name}.webp ${meta.width}×${meta.height} ${(await fs.stat(file)).size}B${meta.hasAlpha?' alpha':''}`);}
// 이어 붙이는 무늬
for(const name of ['trail-grass','stone-steps','log-bridge','rock-face','meadow-flowers','river']){
 if(!await exists(original(name))){missing.push(name);continue;}
 await sharp(original(name)).resize(512,512,{fit:'cover'}).webp({quality:80}).toFile(path.join(out,name+'.webp'));await done(name);
}
// 새 원경은 왼쪽 앞의 큰 나무와 아래쪽 흙길(가까운 풍경)을 잘라 내고 먼 풍경만 쓴다. 좌우로 뒤집어 이어 붙이기 때문이다.
const backdropFile=await exists(original('backdrop-v2'))?original('backdrop-v2'):original('mountain-backdrop'),backdropMeta=await sharp(backdropFile).metadata();
const crop=backdropFile===original('backdrop-v2')?{left:Math.round(backdropMeta.width*.2),top:0,width:Math.round(backdropMeta.width*.8),height:Math.round(backdropMeta.width*.8*9/16)}:{left:0,top:0,width:backdropMeta.width,height:backdropMeta.height};
await sharp(backdropFile).extract(crop).resize(1536,864,{fit:'cover'}).webp({quality:82}).toFile(path.join(out,'mountain-backdrop.webp'));await done('mountain-backdrop');
// 세워 놓는 그림: 투명 여백을 자르고 긴 변을 맞춘다. 투명 픽셀이 없으면 멈춘다.
async function cutout(input,name,size,shape){
 if(!await exists(input)){missing.push(name);return;}
 const trimmed=await sharp(input).ensureAlpha().trim({threshold:8}).toBuffer(),{data,info}=await sharp(trimmed).raw().toBuffer({resolveWithObject:true});
 let clear=0;for(let i=3;i<data.length;i+=4)if(data[i]<8)clear++;
 if(clear/(info.width*info.height)<.03)throw new Error(`${name}: 투명 배경이 아니에요.`);
 await sharp(trimmed).resize(shape||{width:size,height:size,fit:'inside',withoutEnlargement:true}).webp({quality:88,alphaQuality:92}).toFile(path.join(out,name+'.webp'));await done(name);
}
await cutout(path.join(root,'public/assets/prop-packet.webp'),'bag-normal',384);
await cutout(original('bag-puffed'),'bag-puffed',384);
await cutout(await exists(original('summit-observatory'))?original('summit-observatory'):original('summit-station'),'summit-station',512);
await cutout(original('base-shelter'),'base-shelter',384);
await cutout(original('station-post'),'station-post',384);
await cutout(original('pine-tree'),'pine-tree',384);
// 한 줄에 소품 여러 개를 그린 묶음 그림은 완전히 투명한 세로 띠를 경계로 잘라 하나씩 가공한다.
async function splitRow(sheet,parts){
 if(!await exists(original(sheet))){missing.push(sheet);return;}
 const {data,info}=await sharp(original(sheet)).ensureAlpha().raw().toBuffer({resolveWithObject:true}),runs=[];
 let start=-1;
 for(let x=0;x<=info.width;x++){
  let filled=false;if(x<info.width)for(let y=0;y<info.height;y++)if(data[(y*info.width+x)*4+3]>24){filled=true;break;}
  if(filled&&start<0)start=x;else if(!filled&&start>=0){runs.push([start,x]);start=-1;}
 }
 // 가까운 조각(깃발 끝, 꽃잎 등)은 같은 소품으로 합친다.
 const merged=[];for(const run of runs){const last=merged.at(-1);if(last&&run[0]-last[1]<info.width*.03)last[1]=run[1];else merged.push([...run]);}
 const objects=merged.filter(([a,b])=>b-a>info.width*.04);
 if(objects.length!==parts.length)throw new Error(`${sheet}: 소품 ${parts.length}개를 기대했지만 ${objects.length}개로 나뉘었어요.`);
 for(const [i,[name,size]] of parts.entries()){
  const [a,b]=objects[i],piece=path.join(root,'.tmp/run-stage',`piece-${name}.png`);
  await fs.mkdir(path.dirname(piece),{recursive:true});
  await sharp(original(sheet)).extract({left:a,top:0,width:b-a,height:info.height}).png().toFile(piece);
  await cutout(piece,name,size);
 }
}
await splitRow('props-tall',[['leafy-tree',384],['lantern-post',384],['pinwheel',320]]);
await splitRow('props-low',[['flower-clump',256],['boulder',320],['cloud',512]]);
// 울타리는 옆으로 이어 붙이므로 한 칸 크기로 맞춘다.
await cutout(original('fence'),'fence',0,{width:512,height:192,fit:'fill'});
console.log(report.join('\n'));
if(missing.length){console.error('원본이 없는 그림: '+missing.join(', '));process.exitCode=1;}
