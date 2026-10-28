import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
process.env.TEMP = process.env.TMP = path.join(root, '.tmp');
await fs.mkdir(process.env.TEMP, { recursive: true });
const sharp = require(process.argv[2] || process.env.SHARP_MODULE || 'sharp');
const out = path.join(root, 'public/assets');
await fs.mkdir(out, { recursive: true });
const input = name => path.join(root, 'references/generated', name);
const reference = (group, n) => path.join(root, 'assets/references', group, `chatgpt_generated_${String(n).padStart(2, '0')}.png`);
await sharp(input('village.png')).webp({ quality: 91 }).toFile(path.join(out, 'village.webp'));
for (const [name, file] of [['student', 'student-walk.png'], ['air', 'air-walk.png']]) {
  await sharp(input(file)).webp({ lossless: true }).toFile(path.join(out, `${name}-walk.webp`));
}
await sharp(reference('branding',31)).resize({width:1000,withoutEnlargement:true}).webp({quality:95}).toFile(path.join(out,'logo.webp'));
for (const [name,n] of [['title',21],['flow',23],['weight',24],['climate',25],['delivery',28],['engineering',29],['ending',30]]) {
  await sharp(reference('backgrounds',n)).resize({width:1600,withoutEnlargement:true}).webp({quality:85}).toFile(path.join(out,`${name}.webp`));
}
for (const [name,n] of [['air',32],['lumi',33],['popo',34]]) {
  await sharp(reference('characters',n)).extract({left:0,top:0,width:334,height:470}).trim().resize({height:650}).webp({quality:94}).toFile(path.join(out,`${name}-portrait.webp`));
}
const props = ['pump','fan','jar','scale','bottle','piston','balloon','nozzle','packet','soda','windmill','toolbox'];
const meta = await sharp(input('lab-props.png')).metadata();
const manifest = { generated: '2026-10-21', atlas: {}, props: {} };
for (let i=0;i<props.length;i++) {
  const x=i%4,y=Math.floor(i/4),left=Math.floor(x*meta.width/4),top=Math.floor(y*meta.height/3);
  const width=Math.floor((x+1)*meta.width/4)-left,height=Math.floor((y+1)*meta.height/3)-top;
  const file=path.join(out,`prop-${props[i]}.webp`);
  await sharp(input('lab-props.png')).extract({left,top,width,height}).webp({lossless:true}).toFile(file);
  manifest.props[props[i]]={width,height};
}
for (const name of ['student','air']) {
  const {data,info}=await sharp(input(name==='air'?'air-walk.png':'student-walk.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const frames=[];
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
    const left=Math.floor(col*info.width/4),top=Math.floor(row*info.height/4),width=Math.floor((col+1)*info.width/4)-left,height=Math.floor((row+1)*info.height/4)-top;
    let minX=width,maxX=0,maxY=0;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[((top+y)*info.width+left+x)*4+3]>128){minX=Math.min(minX,x);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
    frames.push({left,top,width,height,pivotX:(minX+maxX)/2,pivotY:maxY});
  }
  manifest.atlas[name]={width:info.width,height:info.height,frames};
}
await fs.writeFile(path.join(out,'sprite-manifest.json'),JSON.stringify(manifest,null,2));
const total=(await Promise.all((await fs.readdir(out)).filter(f=>f.endsWith('.webp')).map(f=>fs.stat(path.join(out,f))))).reduce((s,f)=>s+f.size,0);
console.log(`Prepared game images: ${(total/1024/1024).toFixed(2)} MiB; originals preserved.`);
