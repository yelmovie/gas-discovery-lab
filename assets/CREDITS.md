# 자료와 제작 기록

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
- FFmpeg로 MP3 변환 및 끝부분 페이드 적용. 배경 음악과 파일 실패 시 대체 효과음은 자체 Web Audio 합성.
- 2026-11-09부터 화면 버튼·정답·완료 같은 UI 효과음은 `src/theme-effects.js`의 자체 Web Audio 합성음을 쓴다. 위 Kenney 파일은 저장소와 배포본에 남아 있지만 지금 코드에서 재생하지 않는다.

## 지도 악당 전투 효과음 (2026-11-17)

과학34 공통 효과음 라이브러리(`_shared/sfx-library-20261117`)에서 골라 이름만 바꿔 복사했다. 모두 CC0 1.0이며 원본 페이지에서 라이선스를 다시 확인한 파일이다(라이브러리 `manifest.json`의 `license_rechecked: true`). 라이브러리에서 앞뒤 무음 제거·짧은 페이드·음량 정규화·모노 MP3 변환만 했고 피치·속도는 바꾸지 않았다.

| 파일 | 쓰는 곳 | 라이브러리 파일 | 원본 · 제작자 | 라이선스 | 출처 |
|---|---|---|---|---|---|
| `public/assets/audio/sfx/attack-swing.mp3` | 공격 버튼을 눌러 공격할 때 | `sfx/wind-whoosh-01.mp3` | Swoosh 15 Windy · qubodup | CC0 | https://freesound.org/people/qubodup/sounds/60002 |
| `public/assets/audio/sfx/hit-light.mp3` | 1·2타 명중(2타는 재생 속도 0.9로 조금 낮게) | `sfx/hit-light-02.mp3` | cartoon pop or drip · AlaskaRobotics | CC0 | https://freesound.org/people/AlaskaRobotics/sounds/221091 |
| `public/assets/audio/sfx/hit-heavy.mp3` | 3타 명중 | `sfx/hit-heavy-02.mp3` | Loud Pillow Hit 2.wav · saturdaysoundguy | CC0 | https://freesound.org/people/saturdaysoundguy/sounds/388035 |
| `public/assets/audio/sfx/villain-exit.mp3` | 3타 뒤 악당이 바람 빠지듯 물러날 때 | `sfx/spray-hiss-02.mp3` | Spray Paint.wav · sKydran | CC0 | https://freesound.org/people/sKydran/sounds/240899 |
| `public/assets/audio/sfx/villain-appear.mp3` | 악당이 지도에 처음 보일 때(세션당 한 번) | `sfx/villain-appear-02.mp3` | Mouth Pop 1 · michorvath | CC0 | https://freesound.org/people/michorvath/sounds/269501 |
| `public/assets/audio/sfx/hurt-bump.mp3` | 아군이 악당에 닿아 움찔할 때(지도·3D 산길) | `sfx/hurt-bump-01.mp3` | LowHit_01.wav · Faulkin | CC0 | https://freesound.org/people/Faulkin/sounds/336495 |

- 재생: `src/audio.js`의 `cue()`. 효과음 스위치·전체 소리 끄기·개념 영상 재생 중·탭 숨김에서는 나지 않고, 파일을 못 읽으면 기존 합성음으로 대신한다.
- 모든 악당 격퇴 팡파르는 넣지 않았다. 마지막 타격 2.9초 뒤 피날레 배경음이 시작되는데 라이브러리 팡파르가 모두 2.2초 이상이라 겹친다.

## 성취 카드 (2026-11-18)

지도 악당(바람 훼방꾼)을 세 번 맞혀 물리치면 받는 성취 카드 5장의 그림과 소리.

- 그림 `public/assets/reward-cards/card-{1..5}-{flow,weight,climate,delivery,engineering}.webp`(640×960)와 `thumb-*.webp`(96×144): 2026-11-18 ChatGPT 앱의 Codex 내장 이미지 도구(GPT 이미지)로 이 프로젝트를 위해 생성했다. 지도 속 학생(`student-walk.webp`, `map-encounters/hero-redraw.png`)과 바람여우 솔이(`soli-character.webp`, `map-encounters/ally-redraw.png`), 각 시설 배경 그림을 화풍 참고로 붙였다. 글자 없이 생성했고 테두리·별·이름은 코드(`src/reward-cards.js`, `src/reward-cards.css`)로 올린다. 원본 PNG는 과학34 작업 폴더 `_scratch/reward-cards-20261118/gen/15/`에 있고 크기 맞춤과 WebP 변환만 했다. 학습용 장면 그림이며 과학 사실의 증거로 쓰지 않는다.
- 소리: 과학34 공통 효과음 라이브러리(`_shared/sfx-library-20261117`)에서 이름만 바꿔 복사했다. 모두 CC0 1.0이며 원본 페이지에서 라이선스를 다시 확인한 파일이다(라이브러리 `manifest.json`의 `license_rechecked: true`). 가공은 라이브러리에서 한 앞뒤 무음 제거·짧은 페이드·음량 정규화·모노 MP3 변환뿐이다.

| 파일 | 쓰는 곳 | 라이브러리 파일 | 원본 · 제작자 | 라이선스 | 출처 |
|---|---|---|---|---|---|
| `public/assets/audio/sfx/card-whoosh.mp3` | 카드가 날아올 때·보관함 칸으로 날아갈 때 | `sfx/wind-whoosh-03.mp3` | Slow Swosh 40 · qubodup | CC0 | https://freesound.org/people/qubodup/sounds/60027 |
| `public/assets/audio/sfx/card-reveal.mp3` | 카드 공개(브론즈·실버·골드) | `sfx/reward-01.mp3` | Fantasy_ui_Button_3.wav · ZenithInfinitiveStudios | CC0 | https://freesound.org/people/ZenithInfinitiveStudios/sounds/376745 |
| `public/assets/audio/sfx/card-epic.mp3` | 카드 공개(홀로·레전드, 긴 징글) | `sfx/reward-03.mp3` | Achievement Happy Beeps Jingle · CogFireStudios | CC0 | https://freesound.org/people/CogFireStudios/sounds/619838 |
| `public/assets/audio/sfx/card-slot.mp3` | 카드가 보관함 칸에 들어갈 때 | `sfx/pickup-01.mp3` | item-pickup-v1.wav · DeltaCode | CC0 | https://freesound.org/people/DeltaCode/sounds/678384 |
| `public/assets/audio/sfx/card-complete.mp3` | 다섯 장을 모두 모았을 때(지도 파이널 배경음이 시작되면 멈춤) | `sfx/victory-jingle-01.mp3` | Game Success Fanfare Short · el_boss | CC0 | https://freesound.org/people/el_boss/sounds/677858 |

- 재생: `src/audio.js`의 `cue()`(지도 악당 효과음과 같은 경로). 효과음 스위치·전체 소리 끄기·탭 숨김을 따른다.
- 공통 모듈 `src/reward-cards.js`·`src/reward-cards.css`는 과학34 공통 폴더(`_shared/reward-cards`)의 자체 제작 코드를 그대로 복사한 것이다.

## 개념 영상과 동물 친구

프로젝트 자체 제작 SVG 모션 그래픽 10편, 각 9초·1280×720·24fps. `scripts/render-concepts.mjs`로 sharp → FFmpeg 렌더링. WebM(VP9), MP4(H.264/yuv420p/faststart), 마지막 장면 WebP. 영상 안에는 문자를 굽지 않고 앱에서 한국어 자막을 제공함. 파일 크기와 SHA-256은 `public/assets/concepts/manifest.json` 참조.

바람여우 **솔이**: 프로젝트에서 직접 그린 SVG(`public/assets/soli.svg`). 학생 캐릭터의 이동 궤적을 따라가며 활동별 단계 힌트를 제공함.

## 기존 이미지와 글꼴

배경·학생·연구원·실험 소품: 사용자 제공 이미지 및 기존 프로젝트의 AI 생성 에셋. 제목용 Jua: Woowahan Brothers / Google Fonts, SIL Open Font License 1.1(`public/assets/fonts/`의 라이선스 참조).

외부 CC0 음원과 OFL 글꼴에는 각 공개 라이선스가 적용된다. 자체 제작 자료의 저작권 고지가 이를 제한하지 않는다.

## 메인 키아트와 여우 에어 (2026-10-30)

- `public/assets/title.webp`, `public/assets/air-portrait.webp`: Figma AI 이미지 생성(gpt-image-2.5)으로 이번 프로젝트용 새로 제작. 원본 PNG는 `asset-bank/original/`(배포 제외), 프롬프트는 `docs/review/IMAGE-GENERATION-PROMPTS.json`의 `title-v2` 항목.
- 여우 이미지는 흰 배경을 가장자리부터 지워 투명 처리했어. 실존 캐릭터·브랜드를 참고하지 않은 자체 디자인이야.
