import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const production=process.argv.includes('--dist');
const base=production?path.join(root,'dist'):root;
const port=Number(process.env.PORT||4176);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.mp4':'video/mp4','.webm':'video/webm','.ogg':'audio/ogg','.mp3':'audio/mpeg','.wav':'audio/wav'};
http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  let relative=decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if(!relative)relative='index.html';
  if(relative.includes('..')||relative.includes('\\')||relative.startsWith('.')){res.writeHead(403);res.end();return;}
  const publicFile=!production&&!relative.startsWith('src/')&&!relative.startsWith('index.html');
  const file=path.resolve(publicFile?path.join(root,'public'):base,relative);
  if(!file.startsWith(base+path.sep)&&!file.startsWith(path.join(root,'public')+path.sep)){res.writeHead(403);res.end();return;}
  const data=await fs.readFile(file);
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
  if(req.headers.range){const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);const start=m?(m[1]?Number(m[1]):Math.max(0,data.length-Number(m[2]))):NaN,end=m&&m[1]&&m[2]?Math.min(Number(m[2]),data.length-1):data.length-1;if(!m||!Number.isInteger(start)||start<0||start>=data.length||end<start){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}const part=data.subarray(start,end+1);res.writeHead(206,{...headers,'Content-Length':part.length,'Content-Range':`bytes ${start}-${end}/${data.length}`});res.end(part);return;}
  res.writeHead(200,{...headers,'Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);
 }catch(e){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('파일을 찾지 못했어요. 주소를 확인해 주세요.');}
}).listen(port,'127.0.0.1',()=>console.log(`기체 도시 대작전: http://127.0.0.1:${port} (${production?'dist':'development'})`));
