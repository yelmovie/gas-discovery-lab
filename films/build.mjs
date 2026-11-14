// films/<편>/index.html과 assets/를 데이터에서 만든다. 실행: node films/build.mjs
// 그림·글꼴은 앱의 public/assets에서 복사한다(진짜 소스 하나).
import fs from 'node:fs';
import path from 'node:path';
import {films} from './films.data.mjs';
import {renderFilm} from './kit/kit.mjs';
const here=import.meta.dirname,pub=path.join(here,'..','public','assets');
const find=name=>{for(const dir of ['','visuals'])if(fs.existsSync(path.join(pub,dir,name)))return path.join(pub,dir,name);throw Error('그림 없음: '+name);};
for(const film of films){
  const dir=path.join(here,film.id),assets=path.join(dir,'assets');
  fs.rmSync(assets,{recursive:true,force:true});fs.mkdirSync(path.join(assets,'fonts'),{recursive:true});
  const html=renderFilm(film);
  fs.writeFileSync(path.join(dir,'index.html'),html);
  for(const font of ['NanumSquareNeoTTF-bRg.woff2', 'NanumSquareNeoTTF-cBd.woff2', 'NanumSquareNeo-OFL.txt'])fs.copyFileSync(path.join(pub,'fonts',font),path.join(assets,'fonts',font));
  for(const name of new Set([...html.matchAll(/assets\/([\w.-]+\.(?:webp|svg))/g)].map(m=>m[1])))fs.copyFileSync(find(name),path.join(assets,name));
  fs.writeFileSync(path.join(dir,'hyperframes.json'),JSON.stringify({paths:{assets:'assets'},media:{autoProxy:true},authoringSkill:'hyperframes'},null,2)+'\n');
  console.log('built',film.id);
}
