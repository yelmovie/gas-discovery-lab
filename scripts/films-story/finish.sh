#!/bin/zsh
# (2026-11-21 마무리 뒤) 앱은 한 편 영상(compose-film.py)을 쓴다. 이 스크립트는 예전 장면별 배경 영상용이라 더는 돌리지 않는다.
# Flow 원본 → 앱용 장면 영상(소리 없음, 1280×720, 24fps). 모션그래픽: 부드러운 비네트, 인트로 1 제목 로고 등장, 파이널 3 끝 로고.
# 앞 장면 끝 프레임에서 0.7초 녹아 들어가게(장면 전환이 끊기지 않게) 2·3번 앞에 크로스페이드를 붙인다.
cd "/Volumes/T7 Shield/iscreammedia_sc34/15 gas"
S=asset-bank/original/generated-20261121-films/flow; O=public/assets/films-story; L=public/assets/logo.webp; W=.tmp/intro-finale-20261121/work; mkdir -p $W
enc=(-c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart -an)
base="scale=1280:720:flags=lanczos,fps=24,setsar=1,trim=duration=7.9,setpts=PTS-STARTPTS,vignette=angle=PI/6"
one(){ # name prev
  local n=$1 prev=$2 f="$S/$1.mp4"; [ -s "$f" ] || f="${S%/flow}/kb/$1.mp4"; [ -s "$f" ] || { echo "skip $n (no source)"; return; }
  echo "$n source: ${f:h:t}"
  if [ -n "$prev" ] && [ -s "$O/$prev.mp4" ]; then
    ffmpeg -v error -y -sseof -0.05 -i "$O/$prev.mp4" -frames:v 1 -update 1 $W/$prev-last.png
    graph="[1:v]${base}[c];[0:v]scale=1280:720,fps=24,setsar=1,format=yuv420p[p];[p][c]xfade=transition=fade:duration=0.7:offset=0[x]"
    inputs=(-loop 1 -t 0.7 -i $W/$prev-last.png -i "$f")
  else graph="[0:v]${base}[x]"; inputs=(-i "$f"); fi
  case $n in
    intro-1) graph="$graph;[x]fade=t=in:st=0:d=0.6[y];[1]scale=440:-1,format=rgba,fade=t=in:st=0.5:d=0.8:alpha=1,fade=t=out:st=3.4:d=0.8:alpha=1[lg];[y][lg]overlay=x=64:y=44:enable='between(t,0.4,4.3)'[v]"; inputs+=(-loop 1 -t 7.9 -i $L);;
    final-3) graph="$graph;[1]scale=480:-1,format=rgba,fade=t=in:st=5.2:d=1.0:alpha=1[lg];[x][lg]overlay=x=(W-w)/2:y=36:enable='gte(t,5.1)'[v]"; inputs+=(-loop 1 -t 7.9 -i $L);;
    *) graph="$graph;[x]null[v]";;
  esac
  # 인트로 1·파이널 3은 로고가 두 번째 입력이다.
  if [[ $n == intro-1 && -z $prev ]]; then graph=${graph//\[1\]scale=440/[1]scale=440}; fi
  [ -n "$DEBUG" ] && echo "$graph";
  ffmpeg -v error -y "${inputs[@]}" -filter_complex "$graph" -map "[v]" -t 7.9 "${enc[@]}" "$O/$n.mp4" || { echo "FAIL $n"; return; }
  ffmpeg -v error -y -i "$O/$n.mp4" -frames:v 1 -q:v 4 "$O/$n.jpg"
  ffmpeg -v error -y -sseof -0.05 -i "$O/$n.mp4" -frames:v 1 -update 1 -q:v 4 "$O/$n-end.jpg"
  echo "$n $(stat -f%z $O/$n.mp4) bytes"
}
list=($@); (( ${#list} )) || list=(intro-1 intro-2 intro-3 final-1 final-2 final-3)
for n in $list; do
  case $n in intro-2) one $n intro-1;; intro-3) one $n intro-2;; final-2) one $n final-1;; final-3) one $n final-2;; *) one $n "";; esac
done
