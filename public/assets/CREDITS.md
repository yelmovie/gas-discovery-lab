# 자료와 제작 기록

## 2026-10-28 개념 시각 자료 고도화

내장 image_gen으로 독립 투명 이미지 12종을 생성했다. 새 관 3종, 피스톤 하우징·플런저 2종, 풍선 자동차, 중앙 코어, 산소 호흡 지원 장치, 이산화탄소 소화기, 빈 유리병, 고정 팬 하우징·별도 회전 날개다. 팬 하우징은 기존 프로젝트 팬 그림에서 날개만 제거하는 편집으로 제작했다. 사용본은 `public/assets/visuals/`, 원본 PNG는 `asset-bank/original/`, 프롬프트는 `docs/review/IMAGE-GENERATION-PROMPTS.json`에 보관했다. 웹용 변환은 크기 조절과 알파를 유지한 WebP 인코딩만 사용했다.

그림 기반 개념 영상 10편은 기존·신규 소품 이미지를 활용한 프로젝트 자체 모션 그래픽이다. `scripts/render-concepts-v2.mjs`가 이미지 배치와 부피·입자·방향 변화를 코드로 제어하며, `public/assets/concepts-v2/`에 각 9초 WebM·MP4·대표 장면 WebP를 만든다. 한국어 자막과 UI는 앱에서 제공한다. 기존 영상 원본은 `public/assets/concepts/`에 남아 있다.

## 효과음

Kenney, **Interface Sounds 1.0** — https://kenney.nl/assets/interface-sounds

- 이용 조건: Creative Commons Zero 1.0 Universal (CC0). 교육·상업 이용 및 수정 허용.
- 공식 배포 ZIP에서 2026-10-22 내려받음. 라이선스 원문: `public/assets/audio/Kenney-CC0.txt`.
- `tap.mp3` ← `click_003.ogg`
- `rotate.mp3` ← `switch_004.ogg`
- `pump.mp3` ← `scroll_003.ogg`
- `connect.mp3` ← `drop_003.ogg`
- `success.mp3` ← `confirmation_002.ogg`
- `award.mp3` ← `confirmation_004.ogg`
- `hint.mp3` ← `question_001.ogg`
- FFmpeg로 MP3 변환 및 끝부분 페이드 적용. 파일 실패 시 대체 효과음은 자체 Web Audio 합성.

## 배경음 2곡 (Suno 생성)

| 자료 | 사용 위치 | 출처 | 비고 |
|---|---|---|---|
| 배경음 2곡 (Suno 생성) | audio/bgm/main-theme.mp3 (시작 화면 첫 탭부터 홈·지도·3D 산길·활동 반복), audio/bgm/final-theme.mp3 (엔딩·인증서, 지도 악당을 모두 물리친 뒤 지도 파이널 영상 창이 열린 동안) | 2026-11-17 사용자가 Suno로 생성해 제공. 프롬프트는 _shared/music-prompts-10-16.html | 원본은 references/suno 보관. 상업 이용 근거: 생성 당시 Suno Premier 유료 요금제(2026-11-18 사용자 확인) |

## 개념 영상과 동물 친구

프로젝트 자체 제작 SVG 모션 그래픽 10편, 각 9초·1280×720·24fps. `scripts/render-concepts.mjs`로 sharp → FFmpeg 렌더링. WebM(VP9), MP4(H.264/yuv420p/faststart), 마지막 장면 WebP. 영상 안에는 문자를 굽지 않고 앱에서 한국어 자막을 제공함. 파일 크기와 SHA-256은 `public/assets/concepts/manifest.json` 참조.

바람여우 **솔이**: Codex 기본 이미지 생성 도구로 만든 투명 전신 이미지(`public/assets/soli-character.webp`, 2026-11-13). 타이틀, 지도, 활동 힌트와 친구 대화에서 사용한다. 기존 직접 제작 SVG는 제작 원본과 완성 영상의 출처로 보관한다.

## 기존 이미지와 글꼴

배경·학생·연구원·실험 소품: 사용자 제공 이미지 및 기존 프로젝트의 AI 생성 에셋. 제목용 Jua: Woowahan Brothers / Google Fonts, SIL Open Font License 1.1(`public/assets/fonts/`의 라이선스 참조).

외부 CC0 음원과 OFL 글꼴에는 각 공개 라이선스가 적용된다. 자체 제작 자료의 저작권 고지가 이를 제한하지 않는다.

## 나눔스퀘어 네오 UI 글꼴 (2026-11-10)

네이버 공식 배포 원본 WOFF2 Regular/Bold를 수정 없이 함께 제공한다.
- 공식 안내: https://campaign.naver.com/nanumsquare_neo/
- 원본: https://campaign.naver.com/nanumsquare_neo/download/NaverNanumSquareNeo.zip
- 라이선스: SIL Open Font License 1.1. 전체 저작권 안내·전문은 `fonts/NanumSquareNeo-OFL.txt`.
- 기존 영상·삽화에 포함된 글자는 영상 제작 당시 글꼴을 유지한다.

## 2026-11-12 공기 장치 공방 소품

공기 주머니 받침과 나무 화물 상자를 Higgsfield의 GPT Image 2.6으로 각각 생성했다. 기존 펌프 그림을 화풍 참고로 사용했고, 글자 없이 투명 배경의 단일 소품으로 만들었다. 원본은 외장 SSD의 `asset-bank/original/generated-20261112/`에 보관했다. 여백 정리, 크기 축소, 알파를 유지한 WebP 변환을 거쳐 `visuals/pneumatic-bellows-v1.webp`와 `visuals/cargo-crate-v1.webp`에 적용했다. 생성 작업 ID와 SHA-256은 `visuals/manifest.json`에 기록했다.

## 2026-11-17 3D 산길 스테이지

「높은 산의 과자 봉지」의 3D 산길 그림(`run-stage/`)은 ChatGPT의 GPT 이미지 모델(Codex 경유)로 한 장씩 생성했다. 부푼 과자 봉지는 기존 `prop-packet.webp`를, 원경·관측소·기구 보관함·등불 기둥은 타이틀 그림을 화풍 참고로 썼고, 모두 글자·로고 없이 만들었다. 원본은 외장 SSD의 `asset-bank/original/generated-20261117/run-*.png`에 보관했고 `scripts/prepare-run-stage.mjs`로 여백 정리·크기 축소·WebP 변환을 했다. 프롬프트와 파일 대응은 `docs/RUN-STAGE-3D-PLAN-20261117.md`에 있다. 학생·루미·방해꾼은 기존 그림을 다시 썼다.

3D 표시는 three.js r170(MIT License, Copyright 2010-2024 Three.js Authors)을 수정 없이 `vendor/three/three.module.min.js`로 함께 제공한다. 라이선스 전문은 `vendor/three/THREE-LICENSE.txt`.

## 2026-11-18 캐릭터 목소리 통일·팝업 음성

에어·루미·포포·솔이·바람 훼방꾼의 대사, 인트로·인증서, 시설 소개, 개념 영상 자막, 지도 안내·힌트·악당 말풍선 음성(`audio/voices/el-*.mp3`, 96줄)은 ElevenLabs(유료 Creator 요금제, 상업 이용 가능) `eleven_v4`로 만들었다. 캐릭터마다 한 목소리만 쓴다(에어 Klamon, 루미 Sora, 포포 Hun, 솔이 oki, 바람 훼방꾼 Harry). 실제 사람의 목소리를 복제하지 않았다. 줄마다 목소리·생성 ID·받아쓰기·SHA-256은 저장소 `docs/VOICE-FILL-20261118.json`에 있다.

## 2026-11-21 인트로·파이널 영상 (한 편 영상으로 마무리)

처음 시작할 때 한 번 나오는 인트로 영상(`films-story/intro-film.mp4`, 35.0초, 장면 3편 모두 AI 영상)과 마지막 과제를 처음 끝냈을 때 나오는 파이널 영상(`final-film.mp4`, 30.1초). 1280×720·24fps·H.264+AAC, 자막은 영상 안에 구웠다. 포스터 `*-film.jpg`, 카드 화면(움직임 줄이기·영상을 못 열 때)용 장면 끝 그림 `intro-1~3-end.jpg`, `final-1~3-end.jpg`.

- 첫 장면 그림 6장: ChatGPT의 GPT 이미지(Codex 경유, `gpt-imagegen`). 기존 타이틀·엔딩·인물 그림을 참고로 붙였고 글자 없이 만들었다. 원본과 프롬프트는 외장 SSD `asset-bank/original/generated-20261121-films/`(`prompts.json`, `video-prompts.json`).
- 장면 움직임: 인트로 1은 Google Flow의 Veo 3.1 Fast(주 계정, 화면 표시 PRO). 인트로 2·3은 Gemini 앱 「동영상 만들기」(Veo, 보조 계정 1, 화면 표시 AI Pro / PRO, 사용자 확인 2026-11-21: 유료)로 같은 첫 장면 그림·같은 프롬프트로 만들었다(2026-11-21 17:03, 17:09, 채팅 `4a27321998936890`). 파이널 1은 Gemini 앱(보조 계정 1, 화면 표시 AI Pro / PRO, 2026-11-21 17:25, 채팅 `3ed40412e3c33943`), 파이널 3은 Gemini 앱(보조 계정 2, 화면 표시 AI Pro / PRO, 2026-11-21 18:04, 채팅 `a382835d3c6438fb`)으로 만들었다. 파이널 2는 Gemini 앱(보조 계정 3, 화면 표시 AI Pro / PRO, 사용자 확인 2026-11-21: 유료, 2026-11-22 11:37, 채팅 `0a559deaeaf81ffe`)으로 만들었다. 이제 임시 장면은 없다. Veo가 넣는 작은 「Veo」 표시는 그대로 두었다.
- 목소리: 앱과 같은 ElevenLabs 목소리 파일(에어 Klamon `story-1`, 루미 Sora `story-2`·`el-ending-2`, 포포 Hun `story-3`·`el-ending-3`, 에어 `el-ending-1`). 인트로 끝 초대 한 줄(`el-film-invite.mp3`, 에어 Klamon)과 파이널 끝 축하 한 줄(`el-film-cheer.mp3`, 포포 Hun)은 2026-11-21에 ElevenLabs(유료 Creator 요금제) `eleven_v4`로 새로 만들었다(요청 ID `SuytOO6axIDo7RKjTr0y`, `8A6iA9ZiGAncXLhYU2nU`).
- 배경음: 게임 곡 `main-theme.mp3`(인트로), `final-theme.mp3`(파이널). 목소리가 나올 때 낮춘다. 영상 생성기가 붙인 소리는 쓰지 않았다.
- 자막·모션그래픽: ffmpeg + libass. 공용 자막 도구(`_shared/caption-motion-20261118/burn.py`, 주아체 OFL)의 화자 이름표·말 속도 스윕·[키워드] 강조·진행 줄. 0.4초 교차 페이드, 인트로 끝 제목 로고(`logo.webp`)와 호기심 한 줄, 파이널 끝 「임무 완료!」 도장·반짝임·공기 방울(PIL로 그린 투명 프레임). 스크립트 `scripts/films-story/compose-film.py`, 큐 `docs/film-captions-20261121/`.

## 2026-11-21 포포 힌트 2줄 새 녹음

기체 배송소의 다시 생각하기 힌트 두 줄(`audio/voices/el-retry-delivery-gas-v2.mp3`, `el-retry-delivery-reason-v2.mp3`)은 학습 문구를 바꾸면서 ElevenLabs(유료 Creator 요금제) `eleven_v4`, 포포 목소리 Hun으로 다시 만들었다. 줄마다 요청 ID·SHA-256은 `docs/VOICE-PROVENANCE-20261110.json`과 `docs/VOICE-FILL-20261118.json`에 있다. 예전 두 파일은 지웠다.

## 2026-11-18 성취 카드

지도 악당(바람 훼방꾼)을 세 번 맞혀 물리치면 받는 성취 카드 5장의 그림과 소리.

- 그림 `public/assets/reward-cards/card-{1..5}-{flow,weight,climate,delivery,engineering}.webp`(640×960)와 `thumb-*.webp`(96×144): 2026-11-18 ChatGPT 앱의 Codex 내장 이미지 도구(GPT 이미지)로 이 프로젝트를 위해 생성했다. 지도 속 학생(`student-walk.webp`, `map-encounters/hero-redraw.png`)과 바람여우 솔이(`soli-character.webp`, `map-encounters/ally-redraw.png`), 각 시설 배경 그림을 화풍 참고로 붙였다. 글자 없이 생성했고 테두리·별·이름은 코드(`src/reward-cards.js`, `src/reward-cards.css`)로 올린다. 원본 PNG는 과학34 작업 폴더 `_scratch/reward-cards-20261118/gen/15/`에 있고 크기 맞춤과 WebP 변환만 했다. 학습용 장면 그림이며 과학 사실의 증거로 쓰지 않는다.
- 소리: 과학34 공통 효과음 라이브러리(`_shared/sfx-library-20261117`)에서 이름만 바꿔 복사했다. 모두 CC0 1.0이며 원본 페이지에서 라이선스를 다시 확인한 파일이다(라이브러리 `manifest.json`의 `license_rechecked: true`). 가공은 라이브러리에서 한 앞뒤 무음 제거·짧은 페이드·음량 정규화·모노 MP3 변환뿐이다.

| 파일 | 쓰는 곳 | 라이브러리 파일 | 원본 · 제작자 | 라이선스 | 출처 |
|---|---|---|---|---|---|
| `public/assets/audio/sfx/card-whoosh.mp3` | 카드가 날아올 때·보관함 칸으로 날아갈 때 | `sfx/wind-whoosh-03.mp3` | Slow Swosh 40 · qubodup | CC0 | https://freesound.org/people/qubodup/sounds/60027 |
| `public/assets/audio/sfx/card-reveal.mp3` | 카드 공개(브론즈·실버·골드) | `sfx/reward-01.mp3` | Fantasy_ui_Button_3.wav · ZenithInfinitiveStudios | CC0 | https://freesound.org/people/ZenithInfinitiveStudios/sounds/376745 |
| `public/assets/audio/sfx/card-epic.mp3` | 카드 공개(홀로·레전드, 긴 징글) | `sfx/reward-03.mp3` | Achievement Happy Beeps Jingle · CogFireStudios | CC0 | https://freesound.org/people/CogFireStudios/sounds/619838 |
| `public/assets/audio/sfx/card-slot.mp3` | 카드가 보관함 칸에 들어갈 때 | `sfx/pickup-01.mp3` | item-pickup-v1.wav · DeltaCode | CC0 | https://freesound.org/people/DeltaCode/sounds/678384 |
| `public/assets/audio/sfx/card-complete.mp3` | 다섯 장을 모두 모았을 때(모든 악당 격퇴 축하음. 지도 파이널 배경음은 이 소리 위로 1.2초에 걸쳐 커짐) | `sfx/victory-jingle-01.mp3` | Game Success Fanfare Short · el_boss | CC0 | https://freesound.org/people/el_boss/sounds/677858 |

- 재생: `src/audio.js`의 `cue()`(지도 악당 효과음과 같은 경로). 효과음 스위치·전체 소리 끄기·탭 숨김을 따른다.
- 공통 모듈 `src/reward-cards.js`·`src/reward-cards.css`는 과학34 공통 폴더(`_shared/reward-cards`)의 자체 제작 코드를 그대로 복사한 것이다.

## 발자국·스테이지 열림·산길 기록 소리 (2026-11-19)

과학34 공통 효과음 라이브러리(`_shared/sfx-library-20261117`)에서 골라 이름만 바꿔 복사했다. 모두 CC0 1.0이며 원본 페이지에서 라이선스를 다시 확인한 파일이다(라이브러리 `manifest.json`의 `license_rechecked: true`). 가공은 라이브러리에서 한 앞뒤 무음 제거·짧은 페이드·음량 정규화·모노 MP3 변환뿐이다.

| 파일 | 쓰는 곳 | 라이브러리 파일 | 원본 · 제작자 | 라이선스 | 출처 |
|---|---|---|---|---|---|
| `public/assets/audio/sfx/step-1.mp3` | 지도·3D 산길에서 걷는 동안 0.3초마다(두 파일을 번갈아) | `sfx/step-01.mp3` | Footstep on Stone · sgossner | CC0 | https://freesound.org/people/sgossner/sounds/197778 |
| `public/assets/audio/sfx/step-2.mp3` | 위와 같음 | `sfx/step-02.mp3` | concrete footstep 4 · Yoyodaman234 | CC0 | https://freesound.org/people/Yoyodaman234/sounds/166506 |
| `public/assets/audio/sfx/stage-open.mp3` | 시설을 처음 마치고 지도로 돌아와 다음 시설(또는 중앙 코어)이 열릴 때 | `sfx/open-01.mp3` | maximize_008 · Kenney | CC0 | https://kenney.nl/assets/interface-sounds |
| `public/assets/audio/sfx/stage-twinkle.mp3` | 위 열림 소리 0.12초 뒤 반짝 | `sfx/twinkle-02.mp3` | anime.wav · 1urker | CC0 | https://freesound.org/people/1urker/sounds/457306 |
| `public/assets/audio/sfx/pickup.mp3` | 3D 산길 꼭대기에서 봉지 크기를 기록할 때 | `sfx/pickup-03.mp3` | Pickup Sound · Davidsraba | CC0 | https://freesound.org/people/Davidsraba/sounds/347175 |

- 재생: `src/audio.js`의 `cue()`·`footstep()`. 효과음 스위치·전체 소리 끄기·개념 영상 재생 중·탭 숨김을 따른다. 발자국은 다른 소리를 끊지 않고 다른 소리에 끊기지도 않으며, 대사 중에는 절반 크기다.

## 지도 악당 효과음 (2026-11-17 적용, 2026-11-22 기록 보충)

과학34 공통 효과음 라이브러리(`_shared/sfx-library-20261117`)에서 골라 이름만 바꿔 복사했다(파일 해시가 라이브러리 파일과 같다). 모두 CC0 1.0이며 원본 페이지에서 라이선스를 다시 확인한 파일이다(라이브러리 `manifest.json`의 `license_rechecked`).

| 파일 | 쓰는 곳 | 라이브러리 파일 | 원본 · 제작자 | 라이선스 | 출처 |
|---|---|---|---|---|---|
| `public/assets/audio/sfx/attack-swing.mp3` | 공격 버튼을 휘두를 때 | `sfx/wind-whoosh-01.mp3` | Swoosh 15 Windy · qubodup | CC0 | https://freesound.org/people/qubodup/sounds/60002 |
| `public/assets/audio/sfx/hit-light.mp3` | 악당을 가볍게 맞힐 때 | `sfx/hit-light-02.mp3` | cartoon pop or drip · AlaskaRobotics | CC0 | https://freesound.org/people/AlaskaRobotics/sounds/221091 |
| `public/assets/audio/sfx/hit-heavy.mp3` | 마지막 공격으로 악당을 물리칠 때 | `sfx/hit-heavy-02.mp3` | Loud Pillow Hit 2.wav · saturdaysoundguy | CC0 | https://freesound.org/people/saturdaysoundguy/sounds/388035 |
| `public/assets/audio/sfx/villain-exit.mp3` | 악당이 물러날 때 | `sfx/spray-hiss-02.mp3` | Spray Paint.wav · sKydran | CC0 | https://freesound.org/people/sKydran/sounds/240899 |
| `public/assets/audio/sfx/villain-appear.mp3` | 악당이 나타날 때 | `sfx/villain-appear-02.mp3` | Mouth Pop 1 · michorvath | CC0 | https://freesound.org/people/michorvath/sounds/269501 |
| `public/assets/audio/sfx/hurt-bump.mp3` | 주인공이 악당에 부딪힐 때 | `sfx/hurt-bump-01.mp3` | LowHit_01.wav · Faulkin | CC0 | https://freesound.org/people/Faulkin/sounds/336495 |

## 인증서 테두리 · 2026-11-22

- `public/assets/certificate-frame-20261122.webp`: Codex 기본 imagegen(GPT 이미지), 풍선·바람개비·공기 펌프·구름 도시 수채 테두리. 글자 없음, 1회 생성. 원본 `assets/generated/certificate-20261122.png`, 프롬프트 `assets/generated/PROMPT-15.txt`. 1800×1273, 146,200 bytes.
