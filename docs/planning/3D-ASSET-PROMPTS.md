# 기체 도시 대작전 3D 기본 이미지와 프롬프트

실내 활동은 기존 스타일의 2D로 유지하고, 여기의 3D 오브젝트는 먼저 고정 각도로 렌더한 2D 이미지로 활용하는 안이야. 실제 3D 회전은 5장 장치 연결부 확대 보기의 후속 후보야. 스테이지 선택 지도의 2.5D 픽셀 표현과 구분해서 제작하면 돼.

# 3D를 적용할 화면

| 화면 | 적용안 | 우선순위 |
|---|---|---|
| 5장 공기 공학실 | 부품과 연결부의 입체 원본 제작 → 2D 조립 이미지로 사용. 후속으로 작은 3D 확대 보기 검토 | 가장 높음 |
| 마지막 코어 복구 | 코어 외장과 회전부를 나눠 제작 → 2D 작동 애니메이션 | 높음 |
| 3장 압력 실험 | 피스톤 원형을 만들면 이동하는 피스톤과 고정 몸체를 분리해 2D로 사용 | 선택 |
| 자연형 선택 지도 | 고정 사선 시점의 픽셀 타일과 캐릭터 스프라이트 | 실제 3D 모델 불필요 |
| 무게 측정과 증거 분석 | 수치·조건·기록 중심의 기존 2D 유지 | 3D 제작 불필요 |

# 제작 기준

기존 배경 22·23·26·29·30번의 청록·아이보리·은색·황동색과 둥근 모서리를 참고해. 반짝이는 세부 장식은 줄이고, 작은 태블릿 화면에서도 연결구와 움직이는 부분이 잘 보이게 해.

- 이미지 투 3D용 기본 이미지는 1024×1024 이상 정사각형으로, 한 이미지에 한 오브젝트만 담아.
- 기본 시점은 앞과 오른쪽 면이 보이는 약한 사선 시점이야. 과장된 원근과 위에서 내려다보는 지도 시점은 피해야 해.
- 배경은 단색 밝은 회색, 조명은 부드럽고 균일하게 해. 강한 바닥 그림자와 반사는 넣지 않아.
- 모델 입력용 이미지에는 UI, 글자, 숫자, 눈금, 화살표, 캐릭터, 입자 그림, 동작 효과를 넣지 않아.
- 별도 각도가 필요하면 같은 승인된 이미지를 기준으로 정면·측면·후면을 각각 한 장씩 만들어. 한 장의 다중 시점 시트는 모델 입력용으로 쓰지 않아.
- 투명한 관·용기는 기본 이미지에서 형태가 읽히는 무광 또는 반투명 몸체로 표현해. 실제 투명 재질과 내부 공간은 모델 후처리에서 설정해.
- 이미지 한 장이 실제 연결 가능한 3D 모델을 보장하지는 않아. 분리 부품, 열린 구멍, 연결 규격, 회전 중심은 모델 단계에서 맞춰야 해.
- 최종 2D용 출력은 투명 배경 PNG로 만들고, 모든 부품의 카메라 각도·축척·바닥 기준을 통일해.

아래 프롬프트는 이미지 생성용 초안이야. 아직 이미지 생성이나 3D 변환은 실행하지 않았어.

# 기본 이미지 목록

| ID | 기본 이미지 | 쓰임 | 제작 순서 |
|---|---|---|---|
| G01 | 중앙 공기 코어 외장 | 마지막 복구 장면의 고정 몸체 | 1차 |
| G02 | 코어 회전 날개 | 공기 공급에 따른 작동 반응 | 1차 |
| G03 | 장치 조립 받침대 | 5장 부품 고정과 연결 | 1차 |
| G04 | 공기 저장 풍선 모듈 | 공기 공급부 | 1차 |
| G05 | 둥근 노즐 | 공기 출구와 방향 확인 | 1차 |
| G06 | 손잡이 밸브 | 공기 경로 개폐 | 1차 |
| G07 | 일자 관 | 기본 연결 | 1차 |
| G08 | 90도 굽은 관 | 다른 유효 경로 만들기 | 1차 |
| G09 | 손 펌프 | 대체 공기 공급부 | 후속 |
| G10 | 피스톤 실험 장치 | 압력과 부피 관찰 | 후속 |
| G11 | 단단한 밀폐 계측 용기 | 무게 비교용 용기 | 선택 |
| G12 | T자 관 | 분기 경로 확장 | 후속 |

1차는 8종이야. G01과 G02로 완성 코어를 구성하고, 나머지 6종을 조립 활동에서 재사용하는 안이야. 일자 관과 굽은 관은 단순 형상이라 실제 모델 제작 단계에서 직접 모델링하는 편이 더 간단할 수 있어.

# 기본 이미지 프롬프트

## G01 중앙 공기 코어 외장

참고: 배경 30번의 코어 분위기. 도시 전체를 만들지 않고 코어 외장 하나만 만들어.

```text
Create one isolated central air-core housing for a friendly elementary science adventure game. A compact round ivory-and-teal housing with restrained brass connector rims, a large open circular front cavity for a separately modeled rotor, one clearly visible side air inlet, and a stable low base. Leave the rotor cavity empty. Rounded readable shapes, clean stylized 3D asset, moderate detail. Single object centered with generous margins, front-right three-quarter near-orthographic view, square composition, plain light-gray background, soft neutral studio light. No city, pipes attached to other objects, rotor, characters, text, numbers, arrows, UI, glow beams, particles, or dramatic shadows.
```

모델 분리: 외장은 고정, G02 회전 날개는 별도 오브젝트. 완성 코어의 미작동·작동 상태는 조명과 회전으로 구분해.

## G02 코어 회전 날개

참고: 화면 02·12번의 팬. G01 내부에 들어갈 회전부야.

```text
Create one isolated compact air-driven rotor for a friendly science game. Six broad rounded teal blades attached to a single circular brass-colored center hub, with a short visible axle extending behind the hub. Sturdy simplified geometry, consistent blade spacing, a clear silhouette and open space between blades. Match an ivory, teal, brushed silver and brass laboratory asset family. Single object only, front-right three-quarter near-orthographic view, centered square composition, plain light-gray background, soft neutral light. Show the complete stationary rotor. No outer housing, motion blur, airflow effects, particles, face, text, labels, arrows, UI, or extra parts.
```

회전 중심은 허브 한가운데로 설정해. 팬 반응은 학습 상태에 따라 코드에서 제어해.

## G03 장치 조립 받침대

참고: 배경 29번의 둥근 작업대와 화면 19번의 장치 외형.

```text
Create one isolated small modular air-device mounting base for an elementary science engineering game. A low rounded rectangular ivory platform with teal edges, a few clearly visible smooth mounting sockets, two simple brass-rimmed support brackets, and four short stable rubber feet. The base is empty and ready to hold separately created tubes and a balloon module. Clean stylized 3D prop, readable practical shapes, moderate detail, no excessive machinery. Front-right three-quarter near-orthographic view, complete object centered in a square image, plain light-gray background, soft neutral studio lighting. No assembled device, wheels, wires, characters, text, numbers, arrows, UI, or effects.
```

장치가 코어를 구동하는 구성을 우선해. 기존 자동차형 외형을 꼭 유지할지는 시나리오 협의 후 결정하면 돼.

## G04 공기 저장 풍선 모듈

참고: 화면 19번의 풍선과 공기 장치. 작동 전후의 형상 변화가 필요해.

```text
Create one isolated inflated balloon air-storage module for a friendly elementary science game. A smooth rounded teal flexible balloon attached by a clearly visible short neck to a simple ivory holder with a single brass-rimmed hose outlet. The balloon is unmarked and has a believable soft rubber surface. Make the neck, outlet and silhouette easy to read. Clean stylized 3D educational prop, front-right three-quarter near-orthographic view, entire object centered with margins, square composition, plain light-gray background, soft neutral lighting. No tank, face, particle symbols, transparent interior, flowing gas, text, arrows, UI, characters, or extra objects.
```

팽창·수축 이미지를 따로 생성해 서로 다른 물체가 되게 하기보다, 같은 모델의 변형으로 상태를 만드는 안이 좋아.

## G05 둥근 노즐

```text
Create one isolated short air nozzle for a friendly elementary science engineering kit. A broad brass-rimmed hose connector at the rear tapers smoothly into a smaller rounded front outlet. Ivory main body with a simple teal accent, both the rear connection and the open front outlet clearly readable, no sharp edges. Clean stylized 3D asset with simple practical geometry. Front-right three-quarter near-orthographic view, centered square composition, complete object with generous margins, plain light-gray background, neutral soft studio light. No handle, trigger, weapon styling, hose, airflow, particles, text, arrow, UI, or additional parts.
```

방향이 뒤집혔을 때 출구가 어디를 보는지 형태로 구분할 수 있어야 해.

## G06 손잡이 밸브

```text
Create one isolated compact inline air valve for a friendly science engineering kit. A short ivory cylindrical body with two aligned open brass-rimmed hose ports on opposite ends and one chunky teal quarter-turn lever on top. The lever is in a clear neutral presentation position and remains visually separate from the body. Rounded safe-looking edges, simple readable stylized 3D geometry, moderate detail. Front-right three-quarter near-orthographic view, square composition, centered complete object, plain light-gray background, neutral soft light. No connected pipes, gauges, text, arrows, numbers, UI, particles, hands, or extra objects.
```

모델에서는 손잡이와 몸체를 분리해. 열림·닫힘 상태는 색만 쓰지 않고 손잡이 방향과 실제 UI 상태로 함께 알려줘.

## G07 일자 관

```text
Create one isolated straight pipe segment for a friendly elementary science construction kit. A short smooth matte pale-teal cylindrical tube with two identical thick brass connector collars and clearly open ends. Uniform tube diameter, simple readable geometry, generous internal opening, rounded edges. Clean stylized 3D asset, front-right three-quarter near-orthographic view with both the tube length and an open end visible, complete object centered in a square image, plain light-gray background, soft neutral light. No glass reflections, transparent liquid, particles, flow arrows, attached devices, text, numbers, UI, or extra pipe pieces.
```

모델 후처리에서 관 몸체에 투명 재질을 적용해. 연결구 규격은 G08·G12와 같게 맞춰.

## G08 90도 굽은 관

```text
Create one isolated ninety-degree elbow pipe for a friendly elementary science construction kit. A smooth matte pale-teal curved tube with a constant diameter, a clean rounded bend, and two identical thick brass connector collars with open ends. Match the straight pipe kit in material and proportions. Make both perpendicular port directions easy to understand. Clean stylized 3D asset, front-right three-quarter near-orthographic view, complete object centered with margins in a square image, plain light-gray background, soft neutral light. No sharp bend, transparency glare, liquid, particles, arrows, text, UI, other pipes, or scenery.
```

같은 부품을 회전해 여러 경로를 만들 수 있어. 정해진 한 배치만 정답으로 고정하지 않아.

## G09 손 펌프

```text
Create one isolated hand-operated air pump for a friendly elementary science game. A compact upright ivory cylinder, a chunky teal T-shaped handle on a straight silver piston rod, a stable rounded base, and one clearly visible brass-rimmed hose outlet near the bottom. No hose attached. Simple readable moving and fixed parts, clean stylized 3D geometry, moderate detail, rounded edges. Front-right three-quarter near-orthographic view, complete object centered in a square image, plain light-gray background, neutral soft studio lighting. No compressed-gas tank, numbers, pressure gauge, text, arrows, particles, UI, hands, or extra items.
```

손잡이·막대는 움직이고 몸체는 고정돼. 기존 공급 방식 외의 장치가 필요할 때 추가해.

## G10 피스톤 실험 장치

참고: 배경 26번의 왼쪽 장치. 기존 그림의 고정 화살표와 눈금은 이미지에 넣지 않아.

```text
Create one isolated educational piston apparatus for observing the volume of trapped air. A short upright cylindrical chamber with a lightly frosted pale-teal shell, an ivory sealed base, a broad visible flat piston halfway inside, a straight silver rod and a chunky teal top handle. Show the empty air space below the piston without any particles, liquid or character inside. Rounded clean stylized 3D laboratory prop, clear separable mechanical forms. Front-right three-quarter near-orthographic view, full object centered, square composition, plain light-gray background, soft neutral light. No numbers, scale marks, arrows, labels, UI, extra apparatus, or background room.
```

이 이미지는 형상 참고야. 실제 공기 공간은 모델·2D 레이어에서 따로 만들고, 피스톤 위치로 부피를 보여줘. 피스톤 아래에 공·구름·분자를 넣지 않아.

## G11 단단한 밀폐 계측 용기

참고: 화면 13번의 용기. 무게 비교에서는 같은 용기의 외형이 유지돼야 해.

```text
Create one isolated rigid sealed laboratory weighing vessel for an elementary science game. A small cylindrical container with a lightly frosted pale-teal rigid body, a broad ivory screw lid with a brass edge, a flat stable base and one tiny capped air inlet on the lid. Constant rigid shape, no balloon, no expanding walls, no objects or liquid inside. Clean stylized 3D prop with a clear silhouette and restrained detail. Front-right three-quarter near-orthographic view, entire object centered in a square image, plain light-gray background, soft neutral studio lighting. No balance, numeric display, scales, particles, molecule icons, text, arrows, UI, or extra items.
```

이 용기는 무게 실험용이야. 온도 변화에 따라 용기 자체가 부풀어 오르는 장면에는 사용하지 않아.

## G12 T자 관

```text
Create one isolated T-junction pipe for a friendly elementary science construction kit. A smooth matte pale-teal tube with two straight aligned ports and a third perpendicular branch at the center. Three identical thick brass connector collars with clearly open ends, matching the diameter and material family of a simple straight pipe and elbow. Rounded clean stylized 3D geometry, no extra branches. Front-right three-quarter near-orthographic view, full object centered with margins, square composition, plain light-gray background, soft neutral studio light. No liquid, transparency glare, particles, attached machinery, arrows, numbers, text, UI, or other objects.
```

분기를 넣으면 막히지 않은 열린 포트와 누수를 함께 다뤄야 해. 기본 조립을 먼저 검증한 뒤 확장하는 부품이야.

# 별도 필요한 2.5D 픽셀 지도

이 이미지는 3D 모델 입력이 아니라 선택 지도의 분위기와 배치를 정하는 시안이야. 숲·강·언덕 속에 연구시설 5곳을 배치하는 자연형 연구 마을로 방향을 확정했어. 실제 구현에는 걷는 캐릭터, 길, 장애물, 입구, 앞을 가리는 나무를 분리해야 해.

```text
Create a wide 16:9 pixel-art RPG stage-selection map concept for an elementary science adventure called an air-engineering research village. Fixed elevated oblique top-down camera, consistent crisp pixel scale, warm natural daylight. A green woodland clearing with a winding shallow river, small bridges, gentle hills and clearly readable walking paths. Place five distinct small ivory-and-teal science facilities with restrained brass pipe details around one central air-core control building. Use architecture to distinguish an air-flow workshop, a weighing laboratory, a temperature-and-pressure observatory, a gas-supply station and an engineering workshop. Every entrance connects to the main walking path. Keep both top corners visually quiet for interface overlays. Charming readable pixel art, not photorealistic, no dramatic perspective. No UI, text, numbers, icons, labels, quest markers, people, NPCs, particle diagrams, futuristic skyscraper city, or character sprites.
```

맵 위 학생 아바타는 별도 확정이 필요해. 기존 여우·고양이·다람쥐 포즈 모음에는 방향별 보행 프레임이 없어서 그대로 걷기 시트로 쓰지 않아.

# 생성 후 확인할 것

- 기준 이미지와 색·형태·카메라 각도가 일치하는지 확인해.
- 구멍이 막혀 있거나 연결구 수가 달라지지 않았는지 확인해.
- 회전부와 고정부를 분리하고, 연결 포트와 회전 중심을 맞춰.
- 작은 2D 화면에서 부품 방향과 작동 전후가 명확히 보이는지 확인해.
- 글자·수치·UI는 게임에서 넣고, 공기 이동 효과는 실제 기체의 색이나 입자를 뜻하지 않게 안내해.

