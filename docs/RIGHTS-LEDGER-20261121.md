# 권리 장부 — 기체 도시 대작전 (2026-11-21)

대상은 운영 빌드에 들어가는 `public/assets/` 전체(`dist/assets`와 같음)다. 근거는 저장소 안 기록과 `_shared` 출처 문서에서만 찾았다. 추측으로 채운 칸은 없다.

| 상태 | 뜻 |
|---|---|
| 확인됨 | 만든 곳·이용 조건·근거 파일이 모두 있다 |
| 근거 약함 | 만든 곳은 적혀 있지만, 이용 조건(요금제·계약) 근거나 파일별 기록이 비어 있다 |
| 출처 미확인 | 저장소·공유 문서에서 만든 곳을 찾지 못했다 |

## 그림

| 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 | 상태 |
|---|---|---|---|---|---|
| `visuals/` 실험 소품 12종(관 3, 피스톤 2, 풍선 자동차, 중앙 코어, 산소 장치, 소화기, 빈 병, 팬 하우징·날개) + `air-jar-v2.webp` | 내장 image_gen(Codex) | 2026-10-28. 프롬프트 `docs/review/IMAGE-GENERATION-PROMPTS.json`, `asset-bank/original/*-prompts.json`. 해시 `visuals/manifest.json` | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | `public/assets/CREDITS.md` 「2026-10-28 개념 시각 자료」 | 확인됨(생성 기록 + 사용자 확인) |
| `visuals/pneumatic-bellows-v1.webp`, `cargo-crate-v1.webp` | Higgsfield GPT Image 2.6 | 2026-11-12. 작업 ID·SHA-256 `visuals/manifest.json`. 원본 `asset-bank/original/generated-20261112/` | 요금제 문구 없음 | CREDITS 「2026-11-12 공기 장치 공방 소품」 | 근거 약함: 저장소 기록(`visuals/manifest.json` `tool: Higgsfield connector`, `model: gpt_image_2_6`)은 Higgsfield 경유 GPT 이미지다. 「전부 Codex」 확인과 서비스가 달라 덮어쓰지 않고 그대로 둠(보고) |
| `run-stage/` 3D 산길 그림 20장 | ChatGPT GPT 이미지(Codex 경유) | 2026-11-17. 프롬프트 `docs/RUN-STAGE-3D-PLAN-20261117.md`, `.tmp/run-stage/prompt-table.md`. 원본 `asset-bank/original/generated-20261117/` | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | CREDITS 「2026-11-17 3D 산길」 | 확인됨(생성 기록 + 사용자 확인) |
| `reward-cards/` 카드 5장 + 썸네일 5장 | ChatGPT Codex 내장 이미지 도구 | 2026-11-18. 원본 `_scratch/reward-cards-20261118/gen/15/` | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | CREDITS 「2026-11-18 성취 카드」 | 확인됨(생성 기록 + 사용자 확인) |
| `soli-character.webp`(바람여우 솔이) | Codex 기본 이미지 생성 도구 | 2026-11-13 | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | CREDITS 「개념 영상과 동물 친구」 | 확인됨(생성 기록 + 사용자 확인) |
| `visuals/` 실험 장면 13장: `workshop-bg-v1`, `climate-warm-v1`·`climate-cold-v1`, `facility-snack·breathing·soda·safety-v1`, `weight-bench-v1.jpg`, `gas-nitrogen·oxygen·carbon-v1`, `hand-point-v1`, `rock-block-v1` | ChatGPT GPT 이미지(`gpt-imagegen` 스킬, Codex 경유) | 2026-11-16 14:56~15:39(UTC). Claude Code 세션 `48870090…`·`11d21a6f…`(파일 이름 `workshop-bg.png`, `climate-warm.png`, `facility-*.png`, `weight-bench.png`, `ui-icons.png`). 기체 통·손·바위 5장은 `ui-icons.png` 한 장을 나눈 것(같은 세션). 커밋 `845925e`·`908b23f` | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | `_shared/codex-image-records-20261121/index-claude.jsonl` | 확인됨(생성 기록 + 사용자 확인) |
| `air-portrait.webp` | 내장 image_gen(`air-fox-v2.png`) | 2026-10-28 프롬프트 기록 | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | `docs/review/IMAGE-GENERATION-PROMPTS.json` | 확인됨(생성 기록 + 사용자 확인) |
| 배경 7장 `title.webp`, `village.webp`, `flow/weight/climate/delivery/engineering.webp`, `ending.webp`, `logo.webp` | Codex(GPT 이미지) — 사용자 확인 | 2026-10-28 이전(`d6f259a`에서 한꺼번에 들어옴) | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | CREDITS 「기존 이미지와 글꼴」 | 확인됨(사용자 확인) |
| 인물 `student-walk.webp`, `air-walk.webp`, `lumi-portrait.webp`, `popo-portrait.webp` | Codex(GPT 이미지) — 사용자 확인 | 2026-10-28 이전 | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | 위와 같음 | 확인됨(사용자 확인) |
| 실험 소품 `prop-*.webp` 12장(풍선, 병, 팬, 병, 노즐, 봉지, 피스톤, 펌프, 저울, 탄산, 공구함, 풍차) | Codex(GPT 이미지) — 사용자 확인 | 2026-10-28 이전 | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | 위와 같음 | 확인됨(사용자 확인) |
| `npc-dialogue/` 인물 4장(에어·루미·포포·솔이) | Codex 내장 이미지 도구(`image_gen`) | 2026-11-12. Codex 세션 `rollout-2026-11-12T21-49-45-01a1cfce…`: 생성 원본 `exec-a776d9eb…png`를 `_scratch/npc-14-16-20261112/sheet-15-clear.png`로 복사한 뒤 4장으로 나눠 `15 gas/public/assets/npc-dialogue/`에 씀. `_scratch/npc-dialogue-plan-20261112/HANDOFF-5-16.md` 40행. 커밋 `fe51772` | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | 세션 기록(3-2a G에서 대조) | 확인됨(생성 기록 + 사용자 확인) |
| `map-residents/` 시설 주민 5장 | ChatGPT GPT 이미지(`gpt-imagegen` 스킬, Codex 경유) | 2026-11-16 15:16(UTC). Claude Code 세션 `48870090…`의 `map-residents.png`(「A single horizontal character sheet … exactly five small full-body chibi」), 커밋 `ace86b1` | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | `_shared/codex-image-records-20261121/index-claude.jsonl` | 확인됨(생성 기록 + 사용자 확인) |
| `map-encounters/hero-redraw.png`·`ally-redraw.png`·`villain-redraw.png`(지도에서 씀) | Codex 기본 이미지 도구 | 2026-11-14. `_scratch/redraw-12-15-20261114/README.md`(「동일한 운영 캐릭터의 새 자세를 Codex 기본 이미지 도구로」, 15행 커밋 `783c62a`·배포 `58bdade4`) | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | 위 README·`RELEASE-12-15.json` | 확인됨(생성 기록 + 사용자 확인) |
| `map-encounters/villain-left.png`(3D 산길에서 씀) | Codex 내장 이미지 도구(악당 콘셉트 시트에서 잘라냄) | 2026-11-13. `_scratch/villain-concepts-20261114/prompts-v2.md`, `villains-12-16-v2.png`. Codex 세션 `rollout-2026-11-14T01-24-29-01a1d5b9…`의 자르기 스크립트(`cutouts-12-16.png` → `15 gas/public/assets/map-encounters/villain-left.png`). 커밋 `a1f5344` | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | 세션 기록·콘셉트 폴더 | 확인됨(생성 기록 + 사용자 확인) |
| `map-encounters/hero.png`·`ally.png`(코드에서 쓰지 않음) | Codex(GPT 이미지) — 사용자 확인 | 2026-11-14 | Codex 쪽 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」, `_shared/CODEX-IMAGE-RECORDS-20261121.md`) | — | 확인됨(사용자 확인) |
| `og-image.jpg` 공유 그림 | 프로젝트 합성(기존 `title.webp`·로고) | 2026-11-10, 커밋 `3c0f33e` | 원 그림을 따름 | 커밋 메시지 | 확인됨(원 그림이 사용자 확인으로 확인됨) |
| `app-icon.svg`, `soli.svg` | 프로젝트 직접 제작 SVG | — | 자체 제작 | CREDITS 「개념 영상과 동물 친구」(솔이 SVG) | 확인됨(`app-icon.svg`는 손으로 쓴 벡터 코드, `d6f259a`) |

## 영상

| 파일(묶음) | 만든 곳 | 만든 날·기록 | 이용 조건 | 근거 파일 | 상태 |
|---|---|---|---|---|---|
| `concepts/` 개념 영상 10편(WebM·MP4·WebP) | 프로젝트 자체 SVG 모션 그래픽(`scripts/render-concepts.mjs`) | 해시 `concepts/manifest.json` | 자체 제작 | CREDITS 「개념 영상과 동물 친구」 | 확인됨 |
| `concepts-v2/` 개념 영상 10편 | 자체 모션 그래픽(`scripts/render-concepts-v2.mjs`). 그림은 위 소품 그림을 씀 | 2026-10-28 | 자체 제작 + 소품 그림 조건 | CREDITS 「2026-10-28」 | 확인됨(자체 모션 그래픽 + 확인된 소품 그림) |
| `films-story/intro-film.mp4`·`final-film.mp4` 인트로·파이널 한 편 영상(2026-11-21 마무리) | 장면: 인트로 1 Google Flow(Veo 3.1 Fast, 주 계정, 화면 표시 PRO) / 인트로 2·3·파이널 1~3 임시(GPT 이미지 그림을 ffmpeg로 확대·이동). 합성·자막·모션그래픽 자체(`scripts/films-story/compose-film.py`, 공용 `burn.py`) | 2026-11-21. 장면 1: Aside 세션 `FfvuZxu9…`. SHA-256 앞 16자 intro `5b15b1e2051d73b4`, final `719c9b76a377b730` | Google AI Pro 유료(사용자 확인 2026-11-21 09:25), 그림 Codex 유료, 주아체 OFL | `public/assets/CREDITS.md` 「인트로·파이널 영상」, `docs/film-captions-20261121/` | 확인됨 |
| `map-encounters/map-finale.mp4` 지도 마지막 영상 | 제미나이(영상) — 사용자 확인 | 2026-11-14 | 제미나이 유료 요금제(사용자 확인 2026-11-21 09:25 「전부 맞아」) | — | 확인됨(사용자 확인) |

## 음악

| 파일 | 만든 곳 | 만든 날·기록 | 이용 조건 | 근거 파일 | 상태 |
|---|---|---|---|---|---|
| `audio/bgm/main-theme.mp3`, `final-theme.mp3` | Suno(사용자 생성·제공) | 2026-11-17. 프롬프트 `_shared/music-prompts-10-16.html`. 원본 `references/suno/` | 생성 당시 Suno Premier 유료 요금제(2026-11-18 사용자 확인) | CREDITS 「배경음 2곡」 | 근거 약함(요금제 화면·계정 증빙 파일은 저장소에 없음, 사용자 확인 문장만) |

## 효과음

| 파일 | 만든 곳 | 기록 | 이용 조건 | 근거 파일 | 상태 |
|---|---|---|---|---|---|
| `audio/` 7개(tap, rotate, pump, connect, success, award, hint) | Kenney Interface Sounds 1.0 | 2026-10-22 공식 ZIP | CC0 1.0 | CREDITS 「효과음」, `audio/Kenney-CC0.txt` | 확인됨 |
| `audio/sfx/card-*.mp3` 5개 | 과학34 공통 라이브러리(Freesound CC0 원본) | 2026-11-18 | CC0 | CREDITS 「성취 카드」 표(원본·제작자·주소) | 확인됨 |
| `audio/sfx/step-1·2`, `stage-open`, `stage-twinkle`, `pickup` | 공통 라이브러리(Freesound·Kenney CC0) | 2026-11-19 | CC0 | CREDITS 「발자국·스테이지 열림」 표 | 확인됨 |
| `audio/sfx/attack-swing`, `hit-light`, `hit-heavy`, `villain-exit`, `villain-appear`, `hurt-bump` | 공통 라이브러리. 파일 해시가 `wind-whoosh-01`, `hit-light-02`, `hit-heavy-02`, `spray-hiss-02`, `villain-appear-02`, `hurt-bump-01`과 같다 | 2026-11-17 효과음 작업(`_shared/SFX-APPLY-BRIEF-20261117.md`) | CC0(라이브러리 `manifest.json`, `license_rechecked:true`) | 라이브러리 `manifest.json`. **프로젝트 CREDITS에는 6줄이 빠져 있다** | 근거 약함(근거는 있으나 CREDITS 누락) |
| 절차 생성 소리(`src/theme-effects.js`, Web Audio) | 자체 코드 | — | 자체 제작 | `docs/AUDIO-PROVENANCE.md` | 확인됨 |

## 목소리

| 파일(묶음) | 만든 곳 | 기록 | 이용 조건 | 근거 파일 | 상태 |
|---|---|---|---|---|---|
| `audio/voices/el-*.mp3` 96줄(에어·루미·포포·솔이·바람 훼방꾼) | ElevenLabs `eleven_v4`, 목소리 Klamon·Sora·Hun·oki·Harry | 2026-11-18. 줄마다 생성 ID·받아쓰기·SHA-256 | 유료 Creator 요금제, 상업 이용 가능(CREDITS 문장). 실제 사람 목소리 복제 없음 | `docs/VOICE-FILL-20261118.json`, CREDITS 「캐릭터 목소리 통일」, `_shared/voice-provenance-20261118.md` | 근거 약함(요금제 화면 증빙 없음) |
| `audio/voices/el-film-invite.mp3`, `el-film-cheer.mp3` (영상 끝 초대·축하 2줄) | ElevenLabs `eleven_v4`, 에어 Klamon `dnZGOA54w68T7vLLPFTp` / 포포 Hun `AjALR5PRxl87zOoe9Q31` | 2026-11-21, 요청 ID `SuytOO6axIDo7RKjTr0y`·`8A6iA9ZiGAncXLhYU2nU`, SHA-256 앞 16자 `7ac156adebc63b10`·`36962e1abc246c9f`, 받아쓰기 일치 | 유료 Creator 요금제(상업 이용) | `docs/film-captions-20261121/README.md` | 확인됨 |
| `audio/voices/` 이름 있는 13줄(welcome, title-buddy, story-1~3, stage-* 등) | ElevenLabs v4, Klamon 등 | 2026-11-12 | 「ElevenLabs account and Voice Library terms」 | `docs/VOICE-PROVENANCE-20261110.json` | 근거 약함(위와 같음) |
| `audio/voices/` reward-*·retry-* 17줄 | Qwen3-TTS 1.7B VoiceDesign(로컬 모모) | 2026-11-10 | Apache-2.0(Qwen3-TTS) | `docs/VOICE-PROVENANCE-20261110.json` | 근거 약함(모델 라이선스 원문 파일이 저장소에 없음) |
| `audio/voices/ending-1~3.mp3` | Qwen3-TTS 0.6B Base, 참조 음성 합성 | 2026-11-10 | Apache-2.0. 참조 음성은 ElevenLabs 조건을 따름 | 같은 파일 | 근거 약함 |
| `audio/npc-welcome.m4a` | momo-voice / Supertonic 3 | 2026-11-07 | OpenRAIL-M(`docs/SUPERTONIC3-LICENSE.txt`) | `docs/AUDIO-PROVENANCE.md` | 확인됨 |
| 위 3개 묶음 밖의 나머지 이름 있는 목소리 파일 | `docs/VOICE-PROVENANCE-20261110.json`에 33줄만 있다. 이름 있는 파일은 33개라 수가 맞다 | — | — | — | 확인됨(수 대조) |

## 글꼴·코드

| 파일 | 만든 곳 | 이용 조건 | 근거 파일 | 상태 |
|---|---|---|---|---|
| `fonts/jua-korean-400.woff2`, `jua-latin-400.woff2` | Jua, Woowahan Brothers / Google Fonts | SIL OFL 1.1 | `fonts/Jua-OFL.txt` | 확인됨 |
| `fonts/NanumSquareNeoTTF-bRg·cBd.woff2` | 네이버 나눔스퀘어 네오 공식 배포 | SIL OFL 1.1 | `fonts/NanumSquareNeo-OFL.txt`, CREDITS | 확인됨 |
| `fonts/title-400.woff2`, `title-700.woff2`(글꼴 이름 「Gas City Title」) | 나눔스퀘어 네오를 쓰는 글자만 남겨 줄인 파생본(fontTools `subset.Subsetter`) | SIL OFL 1.1(원 글꼴과 같음, 이름을 바꾼 파생본) | Codex 세션 `rollout-2026-11-13T21-43-10-01a1d4ee…`: 같은 세션의 서브셋 스크립트(`NanumSquareNeoTTF-*.woff2` → 제목 서브셋)와 15번 커밋 명령 「Lighten gas city title fonts」(`3c96402`) | 확인됨 |
| `vendor/three/three.module.min.js` | three.js r170 | MIT | `vendor/three/THREE-LICENSE.txt` | 확인됨 |
| 공통 성취 카드 코드 `src/reward-cards.*` | 과학34 공통 자체 제작 | 자체 제작 | CREDITS | 확인됨 |

## 집계

**출처 미확인 줄 수**

| 시점 | 줄 수 | 근거 |
|---|---|---|
| 11-21 첫 장부 | 8 | — |
| 3-2a G | 5 | 생성 기록 대조 |
| 3-2a 뒤 | **0** | 사용자 확인 2026-11-21 09:25: 「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제로 만든 게 맞아?」 → 「전부 맞아」 |

- **생성 로그가 없는 옛 그림 25장과 영상 1편:** 배경 7, 인물 4, 소품 12, 쓰지 않는 지도 그림 2, `map-finale.mp4`. 위 확인을 근거로 「확인됨(사용자 확인)」으로 적었다. CREDITS의 「사용자 제공 이미지 및 기존 프로젝트의 AI 생성 에셋」과 어긋나지 않는다.
- **생성 기록이 있던 Codex·GPT 이미지 줄:** 요금제가 확인돼 「확인됨」으로 바꿨다.

**어긋나서 덮어쓰지 않은 줄(보고):**
- `pneumatic-bellows-v1.webp`, `cargo-crate-v1.webp` 2장. 저장소 기록은 Higgsfield 경유 GPT Image 2.6이다. 「Codex」 확인과 서비스가 달라서 근거 약함으로 둔다. Higgsfield 요금제 기록이 있으면 확인됨이 된다.

**이 확인의 범위 밖(음악·목소리):** 각자의 출처 문서를 따른다. 그대로 둔 줄은 다음과 같다.
- Suno 음악: 사용자 확인 Premier(CREDITS)
- ElevenLabs 목소리: Creator(CREDITS)
- Qwen3-TTS: 라이선스 원문 사본이 저장소에 없다

## 사용자가 줘야 하는 자료

1. Higgsfield 요금제 기록. 공방 소품 2장(`pneumatic-bellows-v1`, `cargo-crate-v1`)에 필요하다. 없으면 3-3단계에서 Codex로 다시 그려 바꿀 수 있다.
2. Qwen3-TTS 라이선스 원문(Apache-2.0) 사본. 저장소 `docs/`에 넣는다.
3. 요금제 화면 캡처(ChatGPT·제미나이·ElevenLabs·Suno). 납품 때 붙이는 증빙이고, 장부를 채우는 데는 필요하지 않다.

저장소만으로 할 일: 지도 악당 효과음 6줄을 CREDITS에 적는다. 근거는 공통 라이브러리 `manifest.json`이다.
