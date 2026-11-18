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
