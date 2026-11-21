# 인트로·파이널 한 편 영상 (2026-11-21 마무리)

지침: `_shared/FILMS-FINISH-20261121.md`. 기준은 1~8번(전체 화면, 영상 안 자막, `burn.py`).

## 앱에서 뜨는 방식
- 인트로: 저장 기록 없이 「탐험 시작」을 누르면 `#story`에서 한 번(`src/story-film.js`, `src/main.js` `tryFilm`). 끝나거나 「건너뛰기」(오른쪽 위, 131×52px)를 누르면 지도로 가고 `introSeen=true`. 다시 시작하면 바로 본편. 타이틀의 「처음 이야기 보기」로 다시 볼 수 있다.
- 파이널: 마지막 복구 레버 뒤 `#ending`에서 한 번 → 끝나거나 건너뛰면 인증서.
- 전체 화면 `100dvw×100dvh`, `object-fit: contain`, 검은 바탕. 아래 22%(자막 자리)는 아무것도 덮지 않는다(`scripts/qa-films.mjs`가 점으로 확인).
- 목소리 꺼짐 → 영상 음소거, 앱 배경음은 평소대로. 목소리 켜짐 → 영상 속 배경음을 쓰므로 앱 배경음을 멈췄다가 영상이 끝나면 다시 튼다(`audio.js` `filmAudio`). 자동 재생이 막히면 소리 없이 다시 시도.
- 움직임 줄이기이거나 영상을 못 열면 예전 카드 화면(장면 끝 그림 + 글 + 목소리)으로 간다. 뒤로 가기·새로고침에서 영상이 남거나 다시 강제로 뜨지 않는다.
- 서비스워커 첫 설치(SHELL)에는 들어가지 않고, 오프라인 받기를 누를 때만 받는다. 운영은 `run_worker_first`의 `/assets/films-story/*`로 Range 206.

## 이야기
- 인트로(35.0초): 에어가 멈춘 공기 코어와 마을로 열고(눈길) → 루미가 할 일(관·무게·부피, 탐구 기록)을, 포포가 공기 장치로 코어를 움직인다는 목표를(수수께끼, 답은 말하지 않음) → 끝 카드: 제목 로고 + 「공기 코어를 다시 움직일 수 있을까?」 + 에어의 초대 「…같이 출발해요!」.
- 파이널(30.1초): 공기가 다시 흐르는 코어(해결) → 다섯 연구시설이 빛나는 마을(달라진 세계) → 친구들과 기뻐함 → 끝 카드: 「임무 완료!」 도장·반짝임·공기 방울 + 「이제 나만의 인증서를 받으러 가요!」 + 포포의 축하 「우리가 해냈어요! … 고마워요, 공기 엔지니어!」.

## 자막 = 목소리 (줄 단위 대조, 글자 그대로 같음)
| 영상 | 장면 | 화자 | 음원 | 글 | 대조 |
|---|---|---|---|---|---|
| intro | intro-1 | 에어 | `story-1.mp3` | 공기 코어가 멈추자 연구시설도 하나둘 멈췄어요. 여우 에어와 함께 고장 난 마을을 살펴볼까요? | 같음 |
| intro | intro-2 | 루미 | `story-2.mp3` | 관을 잇고, 무게를 재고, 부피를 비교해요. 다섯 연구시설을 도울 때마다 내 탐구 기록과 배지가 생겨요. | 같음 |
| intro | intro-3 | 포포 | `story-3.mp3` | 모은 증거와 직접 만든 공기 장치로 중앙 코어를 움직여요. 모험 끝에는 나만의 연구 기록과 인증서가 남아요. | 같음 |
| intro | card | 에어 | `el-film-invite.mp3` | 멈춘 바람의 비밀을 함께 찾아 줄래요? 친구의 도움이 꼭 필요해요. 같이 출발해요! | 같음 |
| final | final-1 | 에어 | `el-ending-1.mp3` | 직접 이은 관을 따라 공기가 흐르고, 멈췄던 시설이 다시 움직여요. | 같음 |
| final | final-2 | 루미 | `el-ending-2.mp3` | 무게를 재고, 부피를 비교하고, 기체의 쓰임을 찾았어요. 다섯 연구시설이 모두 빛나요. | 같음 |
| final | final-3 | 포포 | `el-ending-3.mp3` | 예측하고, 해 보고, 결과를 바꾸어 보았어요. 새로운 문제도 근거를 찾아 해결할 수 있어요. | 같음 |
| final | card | 포포 | `el-film-cheer.mp3` | 우리가 해냈어요! 함께 탐구해서 정말 재미있었어요. 고마워요, 공기 엔지니어! | 같음 |
## 목소리·음량
- 화자 목소리는 앱과 같은 ElevenLabs 목소리: 에어 Klamon `dnZGOA54w68T7vLLPFTp`, 루미 Sora `R57C1ECBzXRSHUbNYPYx`, 포포 Hun `AjALR5PRxl87zOoe9Q31` (`docs/VOICE-FILL-20261118.json`).
- 새로 녹음한 줄 2개(`eleven_v4`, 공통 잠금 `fc-voice`, 한 줄 한 번): `el-film-invite.mp3` 요청 ID `SuytOO6axIDo7RKjTr0y`, `el-film-cheer.mp3` 요청 ID `8A6iA9ZiGAncXLhYU2nU`. Whisper 받아쓰기 일치. `vf.py norm`으로 -16 LUFS 근처(-16.9, -16.7).
- 기존 `story-1~3`은 -18.5~-19.0 LUFS라 합성 때 +2dB 올려 다른 줄과 맞췄다.
- 완성 영상 전체 음량: 인트로 -16.1 LUFS / 피크 -3.4 dBTP, 파이널 -16.0 LUFS / -3.6 dBTP. 배경음은 0.42 크기에 목소리가 나오면 사이드체인으로 낮춘다.

## 다시 합성
`~/.local/share/uv/tools/earshot/bin/python scripts/films-story/compose-film.py [intro|final]` — 장면 원본은 `asset-bank/original/generated-20261121-films/flow/<장면>.mp4`가 있으면 그것을, 없으면 `kb/<장면>.mp4`(임시)를 쓴다. Gemini·Flow 장면이 생기면 `flow/`에 넣고 다시 돌리기만 하면 된다. 확인 그림: `scripts/films-story/sheet.py` → `.tmp/films-finish-20261121/{intro,final}-sheet.png`. 확인: `node scripts/qa-films.mjs`.
