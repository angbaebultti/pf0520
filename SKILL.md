# Portfolio Project — 작업 기록

## 최초 세팅 (2026-05-06)

### 프로젝트 초기화

Vite + React + TypeScript 템플릿을 기반으로 수동 구성 (create-vite CLI 비대화형 환경 미지원으로 직접 파일 생성)

---

## 설치 패키지

### dependencies
| 패키지 | 버전 | 용도 |
|--------|------|------|
| react | ^18.3.1 | UI 라이브러리 |
| react-dom | ^18.3.1 | React DOM 렌더링 |

### devDependencies
| 패키지 | 버전 | 용도 |
|--------|------|------|
| vite | ^5.4.10 | 빌드 도구 |
| @vitejs/plugin-react | ^4.3.3 | Vite React 플러그인 |
| typescript | ~5.6.2 | TypeScript 컴파일러 |
| @types/react | ^18.3.12 | React 타입 정의 |
| @types/react-dom | ^18.3.1 | React DOM 타입 정의 |
| @types/node | ^22.9.0 | Node.js 타입 (path 모듈 등) |
| eslint | ^9.13.0 | 코드 린터 |
| @eslint/js | ^9.13.0 | ESLint JS 규칙 |
| typescript-eslint | ^8.11.0 | TypeScript ESLint 통합 |
| eslint-plugin-react-hooks | ^5.0.0 | React Hooks 린트 규칙 |
| eslint-plugin-react-refresh | ^0.4.14 | React Refresh 린트 규칙 |
| eslint-config-prettier | ^9.1.0 | ESLint-Prettier 충돌 방지 |
| prettier | ^3.3.3 | 코드 포매터 |
| globals | ^15.11.0 | 전역 변수 정의 |

---

## 폴더 구조

```
portfolio0506/
├── public/
├── src/
│   ├── assets/          # 이미지, 폰트 등 정적 자원
│   ├── components/      # 재사용 가능한 컴포넌트
│   ├── hooks/           # 커스텀 훅
│   ├── pages/           # 페이지 컴포넌트
│   ├── styles/
│   │   └── index.css    # Reset CSS + 전역 스타일
│   ├── types/           # TypeScript 타입 정의
│   ├── utils/           # 유틸리티 함수
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── .prettierrc
├── .prettierignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 설정 변경 사항

### 절대경로 import (tsconfig.app.json + vite.config.ts)

`tsconfig.app.json`의 `paths`와 `vite.config.ts`의 `resolve.alias`를 동기화하여 절대경로 import 지원.

| 별칭 | 실제 경로 |
|------|----------|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@pages/*` | `src/pages/*` |
| `@styles/*` | `src/styles/*` |
| `@assets/*` | `src/assets/*` |
| `@hooks/*` | `src/hooks/*` |
| `@utils/*` | `src/utils/*` |
| `@types/*` | `src/types/*` |

**사용 예시:**
```tsx
import Button from '@components/Button'
import { useScroll } from '@hooks/useScroll'
import '@styles/index.css'
```

### ESLint 설정 (eslint.config.js)

- TypeScript ESLint 추천 규칙 적용
- React Hooks 규칙 적용
- Prettier 충돌 규칙 비활성화 (`eslint-config-prettier`)
- `@typescript-eslint/no-unused-vars`: 에러 수준, `_` 접두사 매개변수 허용

### Prettier 설정 (.prettierrc)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### index.css (Reset CSS)

Josh W. Comeau의 Modern CSS Reset 기반:
- `box-sizing: border-box` 전역 적용
- 마진/패딩 초기화
- 이미지 `display: block`
- 폼 요소 폰트 상속
- 링크 기본 스타일 제거
- 리스트 스타일 제거
- 버튼 기본 스타일 제거

---

## npm 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷 |

---

## 작업 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-06 | 프로젝트 초기 세팅 (Vite + React + TS, ESLint, Prettier, 절대경로, Reset CSS) |
| 2026-05-06 | three, gsap, @types/three 패키지 설치 |
| 2026-05-06 | IntroSequence 구현: ErrorScreen(CSS 타이핑) → BrokenLCD(Canvas 글리치) → SpaceScene(Three.js + GSAP ScrollTrigger) |
| 2026-05-06 | .gitignore에 .claude 추가 |
| 2026-05-07 | BrokenLCD.tsx 전면 재작성 — Corrupted Signal Art 스타일로 교체 |
| 2026-05-07 | SpaceScene.tsx 터널 중앙 정렬 긴급 수정 — 카메라/렌더러/지오메트리 구조 전면 검토 |
| 2026-05-07 | 3단계 씬 Vaporwave RetroRoom으로 전면 교체 — R3F 도입, 4면 격자방 + 구름 스프라이트 |
| 2026-05-07 | @react-three/fiber 버전 충돌 수정 — 9.x(React 19 전용) → 8.x(React 18 호환), Three.js 0.163.0 |
| 2026-05-08 | RetroRoom 전면 재설계 — 카메라 내부 배치, 거대한 immersive room, 대형 cloud mass |

---

## BrokenLCD 재작성 (2026-05-07)

### 변경된 파일
`src/components/intro/BrokenLCD.tsx`

### 구현한 효과 요약

| 효과 | 내용 |
|------|------|
| **Vertical Streams** | 화면 전체 수백 개 세로 스트림, 독립 속도(빠름/느림 혼재), 두께 1~6px 랜덤, 머리→꼬리 밝기 그라디언트, 픽셀 smear/stretch, 중간 끊김 |
| **Particle Cloud** | 3,200개 파티클, 가우시안(Box-Muller) 분포로 불규칙한 타원형 덩어리, Y축 느린 회전, breathing scale, 깊이별 밝기·투명도, 큰 파티클 소프트 글로우 |
| **Chromatic Aberration** | drawImage 오프셋 × 2 → `lighter` composite 합성으로 RGB fringe 구현 |
| **Glitch Bands** | 랜덤 수평 밴드가 sin 곡선으로 나타났다 사라짐, 콘텐츠 수평 shift |
| **CRT Noise** | 배경 랜덤 노이즈 픽셀 + 수평 스캔라인 (매 3px마다 반투명 줄) |
| **Phase Timing** | 0~1.55s 강한 글리치 → 1.55~2.15s 글리치 fade → 1.9~2.7s 검정 페이드 → onComplete |

### 사용한 기술/API

- **React** `useRef`, `useEffect`
- **Canvas 2D API**: `fillRect`, `arc`, `fill`, `clip`, `rect`, `drawImage`
- **Composite Operations**: `lighter` (chromatic aberration), `clip` (glitch band 마스크)
- **`requestAnimationFrame`** 기반 60fps 렌더 루프
- **`devicePixelRatio`** 대응 (최대 2× 물리 픽셀, CSS px 분리)
- **Offscreen Canvas** (오프스크린 렌더 후 main canvas에 합성)
- **Box-Muller Transform** (가우시안 난수 생성, 파티클 분포)
- **원근 투영** (FOV 기반, Z깊이 → 파티클 스케일/밝기)

### 컨셉 키워드
`corrupted signal` / `broken LCD` / `data corruption` / `monochrome glitch art`  
형광색 금지 · 흰색/회색/은색 계열만 · sci-fi HUD 금지

---

## SpaceScene 터널 중앙 정렬 수정 (2026-05-07)

### 변경된 파일
`src/components/intro/SpaceScene.tsx`

### 원인 분석 및 수정 내역

| 항목 | 이전 | 수정 후 |
|------|------|---------|
| **카메라 FOV** | 72° | 60° |
| **camera.lookAt** | 미호출 (기본 -Z 방향 의존) | `camera.lookAt(0, 0, 0)` 명시 |
| **renderer.setSize** | `setSize(W, H, false)` — CSS 스타일 미업데이트 | `setSize(W, H)` — canvas.style.width/height 동기화 |
| **입장 애니메이션 종착지** | z=30 | z=10 (user spec) |
| **scroll 기준점** | z=30 기준 | z=10 기준 |
| **FRAME_START_Z** | 40 (카메라 z=60 기준) | 5 (카메라 최종 z=10 기준) |
| **FRAME_COUNT** | 20 | 24 (터널 더 길게) |
| **onResize** | `setSize(w, h, false)` | `setSize(w, h)` — 리사이즈 시 CSS 동기화 |

### 핵심 수정 설명

**`renderer.setSize(false)` 제거**: Three.js가 canvas.style.width/height를 직접 관리하도록 변경.  
CSS `inset:0`(클래스 스타일)보다 inline style이 우선하므로, 실제 렌더러 해상도와  
canvas 표시 크기가 완전히 일치 → aspect ratio 오차 제거.

**`FRAME_START_Z = 5`**: 카메라 resting 위치 z=10의 near plane(z=9.9) 이내.  
입장 애니메이션(z=60→10) 동안 카메라가 프레임들을 통과하며 flythrough 연출.

**GSAP onUpdate에서 x=0, y=0 강제**: 애니메이션 중 부동소수점 오차로 인한  
카메라 x/y drift 방지.

---

## 3단계 씬 — Vaporwave RetroRoom (2026-05-07)

### 신규 / 변경 파일

| 파일 | 역할 |
|------|------|
| `src/components/intro/RetroRoom.tsx` | 4면 격자방 (바닥/천장/좌벽/우벽) |
| `src/components/intro/CloudCluster.tsx` | 구름 스프라이트 클러스터 |
| `src/components/intro/SpaceScene.tsx` | R3F Canvas 진입점 (카메라/씬/스크롤) |

### 설치 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `@react-three/fiber` | 8.18.0 | React 18 호환 Three.js 바인딩 (Canvas, useThree) |

### 구현 효과

**RetroRoom.tsx**
- 4면(바닥·천장·좌벽·우벽) 모두 `THREE.LineSegments`로 격자 구성
- ROOM: 36W × 26H × 99D(z=9~-90), 격자 간격 3 → 12×8 cell
- 흰색(0xffffff), opacity 0.82 — 레트로퓨처리즘 분위기
- `useEffect`로 `scene.add/remove` + geometry/material dispose 관리
- 모든 버텍스 x=0,y=0 중심 기준 — offset 없음

**CloudCluster.tsx**
- 512×512 canvas에 방사형 그라디언트 puff 13개로 뭉게구름 텍스처 생성
- 좌(8) + 우(8, 대칭) + 중앙(5) = 21개 `THREE.Sprite`
- 각 스프라이트: opacity/size 다양화 → 입체적 구름 뱅크
- `THREE.Sprite`는 자동 빌보드 — 카메라 방향 tracking 내장
- floor 레벨(y=-9~-2) + 좌우 벽면 근처(x=±11~17) 배치

**SpaceScene.tsx**
- R3F `<Canvas camera={{ position:[0,0,60], fov:60, near:0.1, far:2000 }}>` — vanishing point 정중앙 고정
- `SceneSetup`: scene.background (#020208), FogExp2(density 0.007)
- `SpaceStars`: 3000개 Points, z=-60~-660 랜덤 분포
- `CameraController`: GSAP 입장(z=60→10, 2.5s) + ScrollTrigger 플라이스루(z=10→-70)
- GSAP onUpdate에서 x=0,y=0 강제 → 카메라 drift 방지

### 컨셉 키워드
`vaporwave` / `retro-futurism` / `wireframe room` / `80s CGI` / `cloud corridor`

---

## 패키지 버전 충돌 수정 (2026-05-07)

### 원인
`@react-three/fiber@9.x`는 **React 19 전용**으로 React 19 내부 스케줄러 API(`React.S` 등)를 사용함.
React 18에서 실행 시 `"Cannot read properties of undefined (reading 'S')"` 에러 발생.

### 호환 매트릭스

| React 버전 | @react-three/fiber | Three.js |
|-----------|-------------------|----------|
| React 18 | **8.x** ✓ | 0.139 ~ 0.168 |
| React 19 | 9.x | 0.165+ |

### 수정 내용

| 패키지 | 이전 | 수정 후 |
|--------|------|---------|
| `@react-three/fiber` | ^9.6.1 | **^8.17.0** → 실설치 8.18.0 |
| `three` | ^0.184.0 | **^0.163.0** → 실설치 0.163.0 |
| `@types/three` | ^0.184.0 | **^0.163.0** → 실설치 0.163.0 |

### 절차
1. `package.json` 버전 스펙 수정
2. `node_modules` 삭제 (`rm -rf node_modules`)
3. `package-lock.json` 삭제
4. `npm install --legacy-peer-deps` 클린 재설치

---

---

## RetroRoom 전면 재설계 (2026-05-08)

### 변경 파일
| 파일 | 변경 내용 |
|------|----------|
| `RetroRoom.tsx` | 룸 스케일 대폭 확대, 카메라 내부 배치 구조로 재설계 |
| `CloudCluster.tsx` | 대형 cloud sprite 재배치, center cluster 제거 |
| `SpaceScene.tsx` | FOV 85, 카메라 y=1.6 eye-level, 입장 z=5 |

### 핵심 변경 사항

**카메라 구도**
| 항목 | 이전 | 수정 후 |
|------|------|---------|
| FOV | 60° | 85° |
| camera.position | (0, 0, 60→10) | (0, 1.6, 60→5) |
| lookAt | (0, 0, 0) | (0, 1.6, -100) |
| scroll 종착지 | z=-70 | z=-75 |

**Room 구조**
| 항목 | 이전 | 수정 후 |
|------|------|---------|
| Width | 36 (hw=18) | 70 (hw=35) |
| Height | 26 (hh=13) | 30 (hh=15) |
| FRONT_Z | 9 (카메라 앞 1u) | 50 (카메라 뒤 45u) |
| BACK_Z | -90 | -130 |
| STEP | 3 | 5 |

**핵심 원리 — "camera inside room"**

`ROOM_FRONT_Z = 50`이 camera z=5보다 크다 → 입구 벽이 카메라 뒤에 위치.  
near-plane(0.1u)이 뒤쪽 선분을 클리핑 → 바닥/천장/벽선이 화면 가장자리에서 시작해  
소실점으로 수렴. FOV=85°에서 바닥은 z≈-13 지점부터 화면 하단에 진입.

이전 구조는 ROOM_FRONT_Z=9(카메라 앞 1u)로 바닥이 atan(13/1)=85.6° — FOV 30° 밖이었음.

**Cloud 재설계**
- LEFT/RIGHT 각 10개 sprite, 크기 sx=28~50 (이전 sx=14~22)
- y=2~9 (eye-level 근방), x=±14~28, z=-8~-60
- CENTER cluster 제거 — 중앙 통로 확보
- 텍스처 puff 15개로 강화 (이전 13개)

### 컨셉 키워드
`giant immersive corridor` / `camera inside cyberspace` / `strong perspective` / `retro CGI` / `VHS corridor`

---

## BrokenLCD texture rewrite (2026-05-07)

### Changed file
`src/components/intro/BrokenLCD.tsx`

### Visual direction
Primary reference: attached broken-LCD/corrupted-framebuffer image from the 2026-05-07 request.

This pass intentionally avoids clean matrix rain, sci-fi HUD styling, and polished generative-particle motion. The target is a dirty monochrome framebuffer collapsing in real time.

### Rendering behavior

| Layer | Implementation |
|------|----------------|
| Dense vertical corruption | Hundreds of narrow `DataColumn` streaks advance downward with broken segments, uneven widths, missing chunks, tiny white horizontal tears, and vertical data stretching. |
| Particle mass collapse | Thousands of `CollapseParticle` points start as a compressed central mass, then get pulled inward and downward with long per-particle vertical smears. |
| Framebuffer smear | A persistent `memory` canvas redraws previous frames with small downward offsets, so the image feels retained, dragged, and damaged instead of freshly rendered each frame. |
| Dirty monochrome LCD | Palette is restricted to black, gray, and dirty white, with scanlines, random LCD speckle, compression blocks, and vignette darkening. |
| Corrupted signal artifacts | Short-lived horizontal `Slice` bands clip and shift portions of the frame; additional thin row copies simulate bad video decode/data tearing. |
| Compression artifacts | Random rectangular blocks and row fragments are composited at low alpha to create blocky, lossy signal damage. |

### Timing

| Phase | Duration |
|------|----------|
| Full corruption/collapse | 0ms to 1880ms |
| Signal intensity decay | 1880ms to about 2500ms |
| Fade to black | 2220ms to 2850ms |
| Completion | Calls `onComplete` after 2850ms |

### Keywords
`corrupted framebuffer` / `broken LCD texture` / `dirty monochrome` / `vertical data stretching` / `framebuffer smear` / `particle mass collapse` / `compression artifacts`

---

## RetroRoom camera-inside framing update (2026-05-08)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/SpaceScene.tsx` | Removed animated camera drift and locked the R3F camera to the requested centered view. |
| `src/components/intro/RetroRoom.tsx` | Rebuilt the room as four large grid planes: floor, ceiling, left wall, and right wall. |
| `src/components/intro/CloudCluster.tsx` | Moved clouds down to the left/right floor edges and kept the center walkway open. |

### Camera spec

- Perspective camera position: `(0, 0, 10)`
- Camera target: `lookAt(0, 0, 0)`
- FOV: `75`
- No pitch, twist, scroll flythrough, or y-axis eye-level offset.

### Room spec

- Width: `56`
- Height: `26`
- Depth: `96`
- Front Z: `18`, so the camera at `z=10` sits inside the wireframe room.
- Back Z: `-78`, leaving a central black void and star field beyond the open end.
- Grid step: `4`

### Plane orientation

- Floor: `rotation.x = -Math.PI / 2`
- Ceiling: `rotation.x = Math.PI / 2`
- Left wall: `rotation.y = Math.PI / 2`
- Right wall: `rotation.y = -Math.PI / 2`

### Visual target

The composition should read as a giant retro cyberspace room viewed from its center, with all four grid faces converging toward the exact middle of the screen. The floor perspective must be clearly visible, the ceiling must not dominate, and cloud masses should rise from the left and right floor edges while leaving the middle path open.

---

## BrokenLCD particle-buffer collapse update (2026-05-08)

### Changed file

| File | Change |
|------|--------|
| `src/components/intro/BrokenLCD.tsx` | Rebuilt the effect as one dense corrupted image buffer instead of separate rain and particle layers. |

### Visual target

The effect should read as a collapsing corrupted framebuffer: a compressed noisy white particle mass is pulled downward into vertical pixel memory trails, while the entire frame tears horizontally, accumulates, crushes, and redraws with dirty LCD persistence.

### Implementation notes

- Removed the independent `DataColumn` rain system.
- Increased density to roughly `18,000` to `52,000` `MemoryParticle` samples depending on viewport size.
- Each particle owns its own vertical smear, so streaks originate inside the central image mass.
- Added strong framebuffer feedback with a persistent `memory` canvas drawn downward and sideways each frame.
- Added horizontal tearing through short-lived `TearSlice` row offsets.
- Added scanline displacement, block corruption, row copies, compression blocks, scratch noise, chromatic offset, and crushed black overlays.
- Raised contrast toward pure white highlights and near-black crushed regions.

### Keywords

`corrupted framebuffer` / `collapsing image memory` / `particle-origin vertical smear` / `broken LCD persistence` / `horizontal tearing` / `compression blocks` / `digital signal death`

---

## BrokenLCD base-texture glitch update (2026-05-08)

### Changed files

| File | Change |
|------|--------|
| `public/broken-lcd-reference.png` | Added the user-provided corrupted image as the fullscreen base texture. |
| `src/components/intro/BrokenLCD.tsx` | Replaced procedural framebuffer art with image-based realtime glitch compositing. |

### Rendering model

- Draw the reference image fullscreen with a CSS-like `cover` crop.
- Keep the background black.
- Preserve the image texture as the primary visual source.
- Add only moderate realtime signal damage on top.

### Effects

- Low-amplitude unstable signal wobble.
- Subtle vertical jitter by copying thin source columns downward.
- Scanline tearing with horizontal slice displacement.
- Framebuffer feedback through a low-alpha `memory` canvas.
- Small RGB split with `lighter` composite offsets.
- Dirty noise flicker and light compression block artifacts.
- Gentle black pulse/fade to keep the dying-monitor feeling.

### Explicit non-goals

- No matrix rain.
- No particle system.
- No clean procedural art.
- No sci-fi HUD.

### Keywords

`base texture glitch` / `broken LCD` / `dying monitor` / `unstable image memory` / `damaged video signal` / `framebuffer feedback` / `scanline tearing`

---

## Retro cyberspace room full rewrite (2026-05-08)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/SceneCanvas.tsx` | Added the R3F scene entry with fixed center camera, black space background, 2000 stars, and Z-only scroll motion. |
| `src/components/intro/SpaceScene.tsx` | Reduced to a compatibility export of `SceneCanvas`. |
| `src/components/intro/RetroRoom.tsx` | Rebuilt the room as four direct `LineSegments` grid planes. |
| `src/components/intro/CloudCluster.tsx` | Rebuilt the left/right cloud banks with 20 large sprites and an open center path. |

### Camera

- Initial position: `(0, 2, 12)`
- Target: `lookAt(0, 2, 0)`
- FOV: `75`
- Scroll motion changes only `camera.position.z`.
- No Y-axis offset or Y-axis scroll drift.

### Room geometry

- Floor: `60 x 80`, position `(0, 0, -28)`, rotation `[-Math.PI / 2, 0, 0]`
- Ceiling: `60 x 80`, position `(0, 14, -28)`, rotation `[Math.PI / 2, 0, 0]`
- Left wall: `80 x 14`, position `(-30, 7, -28)`, rotation `[0, Math.PI / 2, 0]`
- Right wall: `80 x 14`, position `(30, 7, -28)`, rotation `[0, -Math.PI / 2, 0]`
- Grid step: `3`
- Line material: white, opacity `0.85`, `AdditiveBlending`

### Clouds

- 10 left sprites and 10 right sprites.
- Left range: `x=-18..-8`, `y=2..8`, `z=-5..-25`
- Right range: `x=8..18`, `y=2..8`, `z=-5..-25`
- Sprite scale: `12..20`
- Opacity: `0.85..0.95`
- Center path `x=-6..6` remains empty.

### Visual target

The scene should match the reference composition: a giant wireframe room filling the viewport, floor/ceiling/side walls converging toward a central black star field, with large cloud masses rising along both sides and a clear open void in the middle.

---

## RetroRoom depth correction (2026-05-08)

### Changed file

| File | Change |
|------|--------|
| `src/components/intro/RetroRoom.tsx` | Rebuilt the room depth so the camera sits inside the room instead of looking at planes centered too far ahead. |

### Corrected room volume

- Front Z: `12`
- Back Z: `-80`
- Depth: `92`
- Center Z: `-34`
- Floor: width `60`, depth `92`, y `0`, rotation `-Math.PI / 2`
- Ceiling: width `60`, depth `92`, y `14`, rotation `Math.PI / 2`
- Left wall: x `-30`, height `14`, depth `92`, rotation `Math.PI / 2`
- Right wall: x `30`, height `14`, depth `92`, rotation `-Math.PI / 2`

### Reason

The previous room faces were centered at a single `z=-28` setup, which could read like flat planes in front of the camera. The corrected volume spans from the camera plane at `z=12` into the distance at `z=-80`, so the camera at `(0, 2, 12)` is inside the wireframe room.

---

## Retro room center-height camera and cloud scale update (2026-05-08)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/SceneCanvas.tsx` | Moved the camera and target from y `2` to the room center height y `7`. |
| `src/components/intro/CloudCluster.tsx` | Enlarged cloud sprites by 3x and constrained them to the requested side ranges. |
| `src/components/intro/RetroRoom.tsx` | Confirmed the room volume remains z `12` to `-80` around the camera. |

### Camera

- Canvas camera prop: `[0, 7, 12]`
- Initial rig position: `(0, 7, 12)`
- Scroll rig position: `(0, 7, 12 - progress * 8)`
- Target: `lookAt(0, 7, 0)`

### Clouds

- Left x range: `-20..-10`
- Right x range: `10..20`
- Y range: `3..9`
- Scale: previous cloud sprite values multiplied by `3`

### Room

- Floor and ceiling span z `12..-80`, depth `92`
- Side walls span z `12..-80`, depth `92`
- Grid step `3`, white, opacity `0.85`

---

## Fullscreen Canvas layout fix (2026-05-08)

### Changed files

| File | Change |
|------|--------|
| `src/styles/index.css` | Forced `html`, `body`, and `#root` to full width/height with `overflow: hidden` and black background. |
| `src/App.tsx` | Added fullscreen `app-shell` wrapper class to the root `<main>`. |
| `src/components/intro/SceneCanvas.tsx` | Added fixed fullscreen inline style to the R3F `<Canvas>`. |

### Reason

The retro room scene was rendering as a thin strip because the Canvas viewport height could collapse through the DOM/CSS parent chain. This was a layout sizing issue, not a camera, geometry, or cloud placement issue.

### Rules

- `html`, `body`, and `#root` must stay `width: 100%` and `height: 100%`.
- `body` must keep `overflow: hidden`.
- `.app-shell` must stay `width: 100vw`, `height: 100vh`, `overflow: hidden`, `position: relative`.
- `.scene-shell` and the R3F Canvas inline style must stay fixed fullscreen.

---

## Retro room mood refinement (2026-05-08)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/SceneCanvas.tsx` | Explicitly keeps scene fog disabled to preserve black negative space. |
| `src/components/intro/RetroRoom.tsx` | Increased wireframe line opacity from `0.85` to `1.0`. |
| `src/components/intro/CloudCluster.tsx` | Reduced overlarge cloud sprites, lowered opacity, sharpened alpha cutoff, and kept masses away from the center corridor. |

### Visual intent

- Keep the center void black and readable.
- Preserve room depth and perspective lines.
- Avoid screen-filling white haze.
- Make clouds read as separated volumetric clusters near the side walls and floor.
- Keep grid lines bright, crisp, and high contrast.

### Notes

- Camera, room proportions, and fullscreen layout were not redesigned.
- Fog should stay off or extremely subtle.
- Cloud sprites should avoid additive blending unless a future pass adds controlled highlights only.

---

## Retro room rendering quality pass (2026-05-08)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/RetroRoom.tsx` | Added subtle additive glow plus red/cyan offset line layers while preserving the existing room geometry and camera framing. |
| `src/components/intro/CloudCluster.tsx` | Replaced single large cloud billboards with layered cloudlets, sharper noisy texture detail, shaded depth layers, and a center-cleared floor haze. |
| `src/components/intro/SceneCanvas.tsx` | Added a screen-space CRT atmosphere overlay element. |
| `src/styles/index.css` | Added subtle vignette, scanline, grain, and CRT texture styling. |

### Visual intent

- Preserve current composition, room proportions, camera, and fullscreen layout.
- Make wireframe lines feel brighter and more analog without becoming soft white haze.
- Improve clouds from flat fog sprites into layered sculpted masses near the floor and side walls.
- Add floor depth with low haze that leaves the center corridor readable.
- Increase black-level separation through vignette and subtle CRT texture.

### Constraints

- No HUD elements.
- No camera redesign.
- No room layout redesign.
- Screen texture must remain subtle and should not obscure the central black void.

---

## Analog CRT atmosphere pass (2026-05-08)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/SceneCanvas.tsx` | Switched scroll immersion to smooth wheel-driven Z pull and added subtle analog monitor frame markup. |
| `src/components/intro/RetroRoom.tsx` | Preserved room geometry while adding more phosphor bloom, amber warmth, and red/cyan analog line offsets. |
| `src/components/intro/CloudCluster.tsx` | Added more cloudlet depth layers and stronger monochrome texture breakup for sculpted storm-cloud silhouettes. |
| `src/styles/index.css` | Expanded CRT/VHS treatment with scanlines, vignette, corner markers, technical readouts, and a faint terminal strip. |

### Visual intent

- Keep the established camera, room proportions, perspective, and composition.
- Make grid lines feel like overexposed CRT phosphor, not vector UI lines.
- Use slow Z-only scroll pull so the black center void feels absorbing and cinematic.
- Improve clouds through layered grayscale masses and textured alpha breakup.
- Add old monitor recording details without becoming a futuristic HUD or game interface.

### Constraints

- Do not redesign camera direction.
- Do not redesign room geometry.
- Do not add prominent HUD panels.
- Monitor overlay should remain subtle, analog, and atmospheric.

---

## Retro tunnel texture refinement pass (2026-05-08)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/RetroRoom.tsx` | Added subtle material opacity flicker to make grid lines feel like unstable CRT phosphor. |
| `src/components/intro/CloudCluster.tsx` | Increased cloud texture breakup, darker internal contrast, extra cloudlet depth layers, and side-biased floor haze. |
| `src/components/intro/SceneCanvas.tsx` | Added a screen-space center void mask without changing camera or room geometry. |
| `src/styles/index.css` | Added `void-depth-mask` and tuned CRT vignette/scanline/grain for deeper black levels and analog VHS softness. |

### Visual intent

- Preserve the established composition, camera, perspective, and room proportions.
- Make the floor grid feel like CRT phosphor glow captured on VHS rather than clean vector lines.
- Keep center corridor readable while making the black void feel larger and deeper.
- Make clouds denser, heavier, more grayscale, and less like transparent fog sprites.
- Push the whole scene toward recorded analog memory and damaged VHS playback.

### Constraints

- No geometry redesign.
- No camera direction changes.
- No composition rebuild.
- Texture and atmosphere passes should remain subtle and cinematic.

---

## BrokenLCD framebuffer-collapse rewrite (2026-05-08)

### Changed file

| File | Change |
|------|--------|
| `src/components/intro/BrokenLCD.tsx` | Completely rewrote the middle transition as screen-buffer corruption instead of procedural particles or generative glitch art. |

### Rendering model

- Treat the whole screen as a damaged framebuffer.
- Start from a blue monitor buffer.
- Fade in the corrupted reference image as image memory.
- Use previous-frame feedback and low-alpha redraw accumulation.
- Collapse the buffer through vertical slice stretch, scanline displacement, partial row copies, imageData corruption, frame skipping, RGB drift, and compression-like blocks.
- Fade to black before handing off to the retro room scene.

### Sequence

1. Blue screen framebuffer.
2. Signal instability and partial redraw errors.
3. Framebuffer collapse with vertical smear and horizontal tearing.
4. Corrupted image mass from the reference texture.
5. Analog void fade.

### Explicit non-goals

- No particle simulation.
- No matrix rain.
- No floating objects.
- No sci-fi visualizer.
- Corruption must feel screen-based and physical, as if the monitor itself is failing.

---

## ErrorScreen glitch handoff update (2026-05-09)

### Changed file

| File | Change |
|------|--------|
| `src/components/intro/ErrorScreen.tsx` | Added a two-step post-typing corruption transition before `BrokenLCD`. |

### Sequence

1. Existing blue error text types normally.
2. A 0.5s text-stretch phase duplicates the final lines, corrupts characters, and pulls the text downward with uneven horizontal offsets.
3. A 0.5s screen-corruption phase flickers the blue framebuffer, adds scanlines, RGB text separation, and horizontal tearing overlays.
4. `onComplete()` fires after the corruption phase, handing off to `BrokenLCD`.

### Implementation notes

- Added `FailurePhase` state: `typing`, `stretch`, `corrupt`.
- Replaced the direct post-typing timeout with staged timers: stretch at typing completion, corrupt at +500ms, complete at +1000ms.
- The smear is CSS-driven using duplicated bottom text lines plus deterministic character corruption.
- The blue-screen corruption uses pseudo-element overlays, scanline gradients, row tears, background flicker, and RGB text-shadow offsets.

### Keywords

`blue screen corruption` / `text stretch` / `framebuffer read error` / `vertical smear` / `RGB split` / `horizontal tearing`

---

## ErrorScreen full-screen collapse update (2026-05-12)

### Changed file

| File | Change |
|------|--------|
| `src/components/intro/ErrorScreen.tsx` | Expanded the post-typing glitch from bottom-only smear into whole-screen text and framebuffer collapse. |

### Sequence

1. Clean blue screen typing remains unchanged.
2. A short subtle instability phase begins after typing completes.
3. The full display enters corruption: every visible text line mutates, jitters, smears, and flickers between readable and unreadable states.
4. Full-screen analog failure overlays add scanline displacement, RGB split, brightness flicker, CRT tearing, framebuffer slice stretch, and noisy redraw artifacts.
5. `onComplete()` fires after about 1.12s and hands off to `BrokenLCD`.

### Implementation notes

- Added a `corruptFrame` redraw tick during non-typing phases so broken text changes continuously.
- Replaced the bottom-only smear source with `allVisibleLines`, so the collapse layer covers the entire blue screen.
- Added `collapseLine()` to preserve approximate line lengths while injecting symbols, numbers, broken spacing, dropped characters, and fragmented ASCII.
- The visible text itself now corrupts during failure; the overlay is no longer the only damaged layer.
- Timing is now 280ms subtle instability plus 840ms full corruption, keeping the handoff in the requested 0.8-1.2s range.

### Keywords

`full-screen blue screen collapse` / `dying CRT signal` / `memory corruption` / `framebuffer failure` / `analog tearing` / `all-line text scramble`

---

## ErrorScreen to BrokenLCD handoff fix (2026-05-12)

### Changed file

| File | Change |
|------|--------|
| `src/components/intro/BrokenLCD.tsx` | Removed the unwanted dark blue gradient prelude between `ErrorScreen` and the LCD corruption scene. |

### Implementation notes

- Confirmed `IntroSequence` switches directly from `error` to `lcd` with no intermediate phase.
- Replaced the BrokenLCD opening blue gradient fill with a pure `#0000ff` buffer.
- Set the canvas background to `#0000ff` before the first render so image-load or first-frame timing cannot expose a gradient or blank frame.
- Started the BrokenLCD render loop immediately instead of waiting for the reference image `onload`; the reference texture is composited into the already-running glitch as soon as it is ready.
- Moved BrokenLCD signal timing forward so the corrupted image/glitch starts immediately after `ErrorScreen` completes instead of waiting through a blue gradient flash.
- Global `body`/`#root` backgrounds remain solid black and do not contain radial or linear gradients.

### Keywords

`instant error to lcd handoff` / `no blue gradient flash` / `pure blue buffer` / `immediate broken lcd glitch`

---

## BrokenLCD real-image corruption rewrite (2026-05-12)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/BrokenLCD.tsx` | Rewrote the LCD transition around corrupting real image pixels instead of generating procedural texture. |
| `public/broken-lcd-source.png` | Added the attached photographic corruption reference as the source image for the framebuffer destruction pass. |

### Rendering model

- Load `broken-lcd-source.png` into an offscreen canvas and fit it to the viewport.
- Crush and desaturate the source pixels with real `ImageData` so blacks stay pure and highlights retain photographic density.
- Build a bright-edge mask from the actual image pixels and use it for selective red/cyan edge split.
- Draw each frame from real copied image regions, previous-frame memory, and source-column drags.
- Keep the screen background pure black throughout BrokenLCD.

### Corruption behavior

- The dense upper-center mass comes from the source image, not procedural noise.
- Vertical streams are copied columns from the real source image, biased toward the center, then stretched and dragged downward.
- Horizontal LCD tears copy real framebuffer rows with random offsets, compression, and intermittent refresh skipping.
- Small block corruptions mutate actual sampled pixels with `getImageData()` / `putImageData()`.
- RGB separation is applied mainly through the bright-edge mask instead of a global chromatic offset.

### Explicit non-goals

- Do not synthesize the main visual field from particles, shader noise, or generated glitch bars.
- Do not use gray background fills or washed-out gradients.
- Do not make the effect look like clean cyberpunk UI; it should read as damaged photographic memory on a dying monitor.

### Keywords

`real image data corruption` / `photographic framebuffer collapse` / `vertical pixel drag` / `LCD row tearing` / `pure black levels` / `selective RGB edge split`

---

## Retro tunnel cinematic scale refinement (2026-05-12)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/CloudCluster.tsx` | Enlarged and rebuilt the side clouds as massive vertical volumetric walls while preserving the empty center. |
| `src/components/intro/RetroRoom.tsx` | Raised the room height, widened grid spacing, and increased multi-pass CRT grid glow/fringe. |
| `src/styles/index.css` | Strengthened the center void mask and CRT vignette so the black negative space dominates the composition. |

### Visual direction

- Keep the existing tunnel structure, camera, and scene composition.
- Make the void the hero: the center must stay dark, open, and visually pulling inward.
- Clouds frame the scene from the sides as giant sculpted masses, not decorative fog.
- Grid lines should read as bright cinematic CRT architecture rather than a dense technical wireframe.

### Implementation notes

- Cloud groups increased to 18 per side with base positions in the side-wall range and deeper z variation.
- Cloud sprites are scaled up, stretched vertically, contrast-boosted, and clamped outside the center so x = -8 to 8 remains empty.
- Floor haze is reduced and center-cleared more aggressively.
- Grid step changed from 3 to 5.5 to reduce clutter.
- Room height changed from 14 to 22 to make the ceiling feel much taller.
- Grid glow, bloom, amber warmth, and subtle red/cyan fringe are brighter.
- The screen-space void mask is wider and darker to preserve an infinite center.

### Keywords

`cinematic retro tunnel` / `massive volumetric cloud walls` / `infinite center void` / `bright CRT grid` / `tall ceiling scale` / `abandoned digital space`

---

## Cross-phase signal continuity update (2026-05-12)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/IntroSequence.tsx` | Reworked phase control so BrokenLCD can reveal SpaceScene before it finishes instead of hard-switching between isolated scenes. |
| `src/components/intro/BrokenLCD.tsx` | Added `onRevealSpace` and `isRevealingSpace` so the LCD corruption can continue as a fading screen-memory layer while the tunnel appears underneath. |
| `src/components/intro/SignalContamination.tsx` | Added a shared analog damage overlay used across all phases. |
| `src/components/intro/SceneCanvas.tsx` | Added an `isEmerging` class hook for tunnel stabilization from corrupted signal. |
| `src/components/intro/SpaceScene.tsx` | Passes the emergence state into `SceneCanvas`. |
| `src/styles/index.css` | Added persistent scanlines, luma flicker, horizontal tears, blue-screen text ghosts, tunnel emergence distortion, and subtle steady-state analog wobble. |

### Visual direction

- Treat the whole intro as one damaged monitor signal, not three unrelated screens.
- Let previous-frame memory contaminate the next scene through overlap, opacity decay, scanline drift, and ghosted text.
- BrokenLCD reveals the tunnel while still active, so the tunnel feels like it stabilizes out of corruption.
- The tunnel keeps faint row tearing, CRT scanlines, luma breathing, and micro wobble so it does not become perfect CG.

### Implementation notes

- `IntroSequence` now keeps SpaceScene mounted under BrokenLCD during the final LCD interval.
- BrokenLCD calls `onRevealSpace` around 2.05s and fades its canvas over ~1.18s using stepped opacity decay.
- `SignalContamination` stays mounted across phases and changes strength by mode: error, lcd, and space.
- The LCD phase includes blue-screen text remnants and RGB-shifted ghost text.
- The space phase retains weaker horizontal tearing and shared monitor texture.
- `scene-shell--emerging` applies a brief unstable reveal before returning to the steady tunnel wobble.

### Keywords

`framebuffer persistence` / `transition bleeding` / `signal contamination` / `image memory decay` / `lcd to tunnel emergence` / `shared CRT damage`

---

## CloudCluster volumetric material rewrite (2026-05-12)

### Changed file

| File | Change |
|------|--------|
| `src/components/intro/CloudCluster.tsx` | Rebuilt the cloud rendering stack for soft cumulus volume, rim lighting, floor fog, and glossy reflections. |

### Visual direction

- Clouds should read as giant illuminated cloud sculptures, not smoke, dust, or noisy fog sprites.
- Keep the tunnel structure and center void, but make the side cloud walls feel soft, moist, dense, and cinematic.
- Edges facing the void should glow softly against black.
- Cloud bases should dissolve into low floor mist with subtle reflected brightness on the grid floor.

### Implementation notes

- Replaced the single grainy alpha texture with separate generated textures for cloud body, left/right rim glow, floor haze, and floor reflection.
- Cloud body texture uses large rounded cumulus masks, smooth density gradients, internal shadow puffs, and soft highlight lobes.
- Removed high-frequency dusty noise in favor of larger smooth gradients and broader density forms.
- Rim glow is rendered as an additive second sprite layer, offset toward the center void.
- Reflection planes sit on the floor under selected cloud groups with blurred, scanline-broken brightness.
- Floor haze is stronger and wider, with side-biased mist and center clearing to preserve the void.
- Cloudlets are depth-sorted and retain side-safe placement so the central x = -8 to 8 region stays open.

### Keywords

`soft volumetric cumulus` / `cloud rim lighting` / `floor mist` / `glossy cloud reflections` / `cinematic vapor density` / `giant cloud walls`

---

## Retro tunnel synthwave VHS overhaul (2026-05-12)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/CloudCluster.tsx` | Shifted cloud, fog, rim, and reflection materials from grayscale cumulus to neon violet/magenta/cyan synthwave vapor. |
| `src/components/intro/RetroRoom.tsx` | Recolored grid passes into warm white, magenta, violet, cyan, and amber glow layers with stronger bloom offsets. |
| `src/components/intro/SceneCanvas.tsx` | Added subtle violet scene fog and a cyan secondary star glow layer. |
| `src/styles/index.css` | Pushed CRT/VHS treatment harder with saturated scene filtering, magenta bloom, heavier scanlines, chromatic edge tint, warm HUD text, and analog color drift. |

### Visual direction

- Major style shift from clean monochrome wireframe to dreamy synthwave VHS cinematic atmosphere.
- Scene should read like a surreal neon cloud dimension recorded through CRT glass.
- Palette centers on neon violet, magenta glow, deep black, soft cyan highlights, and warm pink bloom.
- Clouds should feel internally lit, with violet bodies, magenta rims, cyan accents, and stronger glossy floor reflections.
- Grid should feel glowing and diffused rather than purely technical.

### Implementation notes

- Cloud body texture now uses pink/violet volume gradients and purple-blue internal shadows.
- Rim texture uses magenta bloom and cyan secondary glow.
- Floor haze and reflection textures now carry pink, violet, and cyan light.
- Reflection planes are larger and more opaque to make the floor feel wet/glossy.
- Grid materials were recolored from neutral white/gray to neon synthwave layers.
- CRT overlays now add stronger scanlines, bloom tint, color drift, saturation, and warm orange HUD framing.

### Keywords

`dreamy synthwave VHS` / `neon cloud dimension` / `magenta violet clouds` / `wet glossy grid floor` / `CRT color bloom` / `retro sci-fi album cover`

---

## Retro tunnel exposure/readability rebalance (2026-05-12)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/CloudCluster.tsx` | Reduced cloud, fog, rim, and reflection intensity while keeping the magenta/violet/cyan synthwave palette. |
| `src/components/intro/RetroRoom.tsx` | Kept the neon grid bright but reduced bloom dominance so ceiling, wall, and floor structure stay readable. |
| `src/components/intro/SceneCanvas.tsx` | Lowered scene fog density so atmosphere supports depth without washing over the tunnel. |
| `src/styles/index.css` | Darkened the center void mask, reduced global bloom overlays, and lowered contamination opacity in the space phase. |

### Visual direction

- Preserve the dreamy synthwave VHS palette.
- Avoid full-screen purple haze, overexposure, or fog covering the camera.
- Keep the wireframe room readable at all times.
- Restore clear cloud silhouettes with sculpted side masses.
- Keep the center void dark, deep, and dominant.

### Priority order

1. Scene readability.
2. Cloud silhouette.
3. Center void.
4. Atmosphere.
5. Bloom.

### Keywords

`synthwave readability` / `reduced bloom` / `subtle fog` / `clear cloud silhouettes` / `deep center void` / `balanced CRT atmosphere`

---

## Tunnel geometry restoration pass (2026-05-13)

### Changed files

| File | Change |
|------|--------|
| `src/styles/index.css` | Removed the 90% black center ellipse from `void-depth-mask` and cut the `crt-atmosphere` dark vignette from 80% → 36% so grid geometry shows through. |
| `src/components/intro/SceneCanvas.tsx` | Reduced fog density from `0.0024` → `0.0009` so distant grid lines stay readable. |
| `src/components/intro/CloudCluster.tsx` | Pushed center-safe clamp from `±9.8` → `±13`, cut haze plane opacity `0.34` → `0.09`, cloud sprite body `0.82` → `0.72`, rim glow `0.36` → `0.22`. |
| `src/components/intro/RetroRoom.tsx` | Core line color `0xfff0ff` → `0xffffff`, glow layer `0.34` → `0.42`, bloom layer `0.18` → `0.22`, removed unused flicker variable. |

### Root cause

The `void-depth-mask` CSS overlay had a `radial-gradient(ellipse 34% 36% at 50% 48%, rgba(0,0,0,0.9) …)` centered on screen. This put a 90% black overlay over the exact center where the tunnel converges — making the wireframe invisible and producing the "blurry dark hole" appearance. The `crt-atmosphere` vignette (0.8 → 0.36) and heavy floor haze (additive, 0.34) compounded the issue with god rays.

### Priority order (enforced)

1. Room geometry — wireframe must be dominant, always readable
2. Center void — dark from 3D background, not CSS overlay
3. Cloud silhouette — wall-anchored, center x ±13 stays empty
4. Reflections
5. Atmosphere
6. Bloom

### Constraints

- Center void darkness comes from the 3D scene background, not CSS masks.
- CSS overlays are for CRT scanlines and subtle edge vignette only — never center darkening.
- Fog density must stay below 0.001 to preserve grid depth.
- Cloud center clamp must stay ≥ ±12 to keep tunnel corridor open.

### Keywords

`tunnel geometry restoration` / `remove center void mask` / `grid visibility` / `cloud wall framing` / `reduced fog` / `no center CSS darkening`

---

## Retro tunnel sculpted-cloud rewrite (2026-05-13)

### Changed files

| File | Change |
|------|--------|
| `src/components/intro/CloudCluster.tsx` | Rebuilt cloud layout as asymmetric sculpted cloud towers made from many sharper layered sprites instead of giant blurred fog planes. |
| `src/components/intro/RetroRoom.tsx` | Increased grid density and strengthened the white tunnel structure while reducing colored bloom passes. |
| `src/components/intro/SceneCanvas.tsx` | Reduced scene fog and secondary star glow so the chamber stays dark and readable. |
| `src/styles/index.css` | Reduced CRT/VHS overlay intensity, magenta wash, text glow, and bloom while preserving scanlines and warm monitor accents. |

### Visual direction

- Clouds should read as dense physical formations with cauliflower silhouettes, bright rim light, white highlights, and dark shadow pockets.
- Avoid fullscreen pink fog, heavy blur, mirrored cloud walls, center haze, and over-bloom.
- The tunnel grid should dominate the scene: floor, walls, ceiling, and center void remain crisp and black.
- Cloud composition is intentionally asymmetric: a larger right-side tower, smaller left formations, varied heights, and deeper staggered clusters.
- Floor reflections are faint, low-opacity glints only, not mirror images.

### Keywords

`sculpted volumetric clouds` / `crisp retro chamber` / `dark center void` / `reduced VHS wash` / `asymmetric cloud towers` / `subtle floor reflections`

---

## CloudCluster dense material refinement (2026-05-13)

### Changed file

| File | Change |
|------|--------|
| `src/components/intro/CloudCluster.tsx` | Refined only cloud material and shape while leaving camera, tunnel, grid, room layout, scene setup, and CSS untouched. |

### Cloud direction

- Increased cloudlet density and reduced individual sprite scale so formations read as stacked cauliflower-like lobes instead of broad fog sheets.
- Raised body opacity and alpha clipping to make the masses block the background more like physical cloud volume.
- Reworked procedural cloud textures with sharper alpha masks, many small sub-puffs, internal cutouts, darker shadow pockets, and pixel-level micro-contrast.
- Shifted body color toward white/light gray with purple shadow depth; rim texture adds restrained pink-orange highlights.
- Added low base puffs, contact shadow planes, and very subtle floor reflections/pooling so clouds feel grounded.

### Constraints

- Do not change camera, tunnel proportions, grid perspective, or room layout for this pass.
- Avoid large blurred billboard fog and mirrored reflections.

### Keywords

`dense cloud material` / `cauliflower lobes` / `opaque cloud volume` / `dark interior pockets` / `white body pink rim` / `grounded floor contact`

---

## 2026-05-13 Control Room Section

- Added `src/components/ControlRoom.tsx`, `src/components/CRTMonitor.tsx`, and `src/styles/controlroom.css`.
- Placed the retro control room below the existing tunnel sequence in `src/App.tsx`.
- Enabled natural vertical page scrolling while keeping the fixed retro tunnel scene intact.
- Built an amber CRT monitor wall with six placeholder project channels, two decorative signal panels, scanlines, glowing bezels, and a decorative bottom control bar.

---

## 2026-05-13 CloudCluster Volumetric Rebuild

- Rebuilt `src/components/intro/CloudCluster.tsx` from scratch around fewer, much larger baked cloud masses instead of hundreds of repeated sprite puffs.
- Added primary silhouette layers, medium sculpting layers, soft veil layers, warm rim-glow overlays, and floor-hugging fog planes.
- Preserved the empty center tunnel void by keeping cloud masses locked to the left and right sides.
- Shifted the material direction toward deep navy/violet interiors, magenta midtones, pink/orange rim lighting, and soft cinematic atmospheric density.

---

## 2026-05-13 Tunnel Scroll End Camera Fix

- Fixed `src/components/intro/SceneCanvas.tsx` so tunnel camera progress follows actual document scroll instead of accumulated wheel delta.
- Clamped the scroll end camera position to `z = -54`, well before the `RetroRoom` back wall at `z = -80`.
- Changed the camera look target to remain ahead inside the tunnel during the whole scroll, preventing the end state from looking back into empty/front space.
- Reduced `FogExp2` density from `0.00028` to `0.00018` so the deep tunnel grid remains visible near scroll completion.

---

## 2026-05-14 CloudCluster layered canvas cloud rewrite

- Rewrote `src/components/intro/CloudCluster.tsx` around layered `THREE.Sprite` clouds using generated 512x512 CanvasTexture alpha maps.
- Each generated cloud texture draws 8-12 overlapping white/light-gray radial-gradient puffs with transparent edges, then applies subtle pixel noise for a softer cumulus surface.
- Replaced the previous rim-heavy billboard look with cloud groups made from one large base sprite, multiple medium offset sprites, and small detail sprites.
- Main clouds now use `THREE.SpriteMaterial`, `THREE.NormalBlending`, `transparent`, `depthWrite={false}`, `depthTest={false}`, explicit `renderOrder`, and `frustumCulled={false}`.
- Cloud colors are material tints: soft purple `#c8a0e0`, pink `#e090c0`, and deep shadow purple `#6040a0`.
- Cloud groups are placed inside the visible tunnel corridor at x=-15..-8 and x=8..15, y=3..12, z=-5..-30, with scroll-only z/parallax motion.
- Added 5 large low-opacity floor fog sprites at y=0..2 with scale 20-30 and opacity 0.15-0.25.
- Avoided drei Billboard, PointsMaterial, particle systems, and additive blending for main cloud bodies.

---

## 2026-05-14 CloudCluster image texture replacement

- Copied `src/assets/cloud.png` to `src/assets/only_cloud.png` for the tunnel cloud texture source.
- Replaced `src/components/intro/CloudCluster.tsx` with an image-based implementation using `THREE.TextureLoader`.
- Removed all procedural canvas cloud generation, sprite groups, ground-fog generators, and scroll-parallax cloud code.
- The scene now renders split left/right `PlaneGeometry` cloud instances:
  - Left cloud plane at `(-10, 5, -12)`, scale `(20, 18, 1)`, using texture `offset=(0, 0)` and `repeat=(0.5, 1)`.
  - Right cloud plane at `(10, 5, -12)`, scale `(20, 18, 1)`, using texture `offset=(0.5, 0)` and `repeat=(0.5, 1)`.
- Both cloud planes use cloned `TextureLoader` textures and `MeshBasicMaterial` with `transparent`, `alphaTest: 0.01`, `depthWrite: false`, `side: THREE.DoubleSide`, and explicit render order.
- Tightened the tunnel composition by reducing `RetroRoom` width to `34` units and setting the tunnel camera FOV to `65`.

## 2026-05-20 Retro Tunnel Compact Framing Update

- Updated `src/components/intro/SceneCanvas.tsx` so the tunnel camera starts at `z = 8` and scroll travel stops at `z = -30`, making the room feel shorter and more compact.
- Kept the camera height and FOV stable while using `CAMERA_START_Z` for the Canvas camera position.
- Updated `src/components/intro/CloudCluster.tsx` so the image cloud planes sit higher and closer to the camera:
  - Left plane position: `(-10, 6.5, -9)`
  - Right plane position: `(10, 6.8, -11)`
  - Plane scale: `(20, 27, 1)`, increasing cloud height by `1.5x`.
- Visual target: clouds should fill from the floor toward mid-screen while leaving the central tunnel opening and star void readable.

---

## 2026-05-20 Scroll-Driven Tunnel Pull Update

- Updated `src/components/intro/SceneCanvas.tsx` so scroll progress drives a camera target from `z = 8` to `z = -50`.
- Camera movement is smoothed in `useFrame` with `THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05)` instead of setting the scroll position directly.
- Applied smoothstep easing with `t = t * t * (3 - 2 * t)` so the pull starts slow, accelerates through the middle, and eases near the end.
- Locked camera Y to `7` for the full scroll; only camera Z changes.
- Increased the tunnel scroll track from `260vh` to `400vh` to give the pull into the center void more room.
- Visual target: scrolling should feel like a slow magnetic pull into the black center while tunnel geometry remains visible at the end position.

### Follow-up scroll fix

- Replaced `ScrollTrigger`-based progress in `SceneCanvas.tsx` with a native `window.scrollY` listener because the dynamically mounted space scene could leave the GSAP trigger stuck at progress `0`.
- Progress now uses `window.scrollY / (scrollTrack.offsetHeight - window.innerHeight)` and clamps to `0..1`.
- The scroll and resize listeners call `invalidate()` so the demand-frameloop canvas redraws when the user wheels the page.
- Set the fixed R3F Canvas `pointerEvents` to `none` so mouse wheel input reaches the document scroll instead of being captured by the full-screen WebGL layer.

### Dramatic visible movement fix

- Changed the scroll camera target to a direct position set from `z = 8` to `z = -45`, using `z = 8 - smoothProgress * 53`.
- Removed camera lerp smoothing so scroll immediately produces visible camera movement.
- Added temporary `console.log('scrollProgress', ...)` output in `SceneCanvas.tsx` to confirm scroll events are firing.
- Expanded camera FOV during scroll from `65` to `90` with `camera.fov = 65 + smoothProgress * 25`.
- Switched the R3F Canvas to `frameloop="always"` so camera, cloud, and grid progress changes are continuously visible.
- Updated `CloudCluster.tsx` so both cloud planes grow up to `1.5x` scale as scroll progress increases.
- Updated `RetroRoom.tsx` so the main grid opacity ramps from `0.6` to `1.0`, with supporting glow/color passes also brightening.

---

## 2026-05-20 Render-Loop Scroll Camera Rewrite

- Rewrote `src/components/intro/SceneCanvas.tsx` scroll handling to remove scroll listeners entirely.
- Camera progress is now read every R3F frame using:
  - `scrollY = window.scrollY`
  - `maxScroll = document.documentElement.scrollHeight - window.innerHeight`
  - `progress = Math.min(scrollY / maxScroll, 1)`
  - `smooth = progress * progress * (3 - 2 * progress)`
- Camera Z is set directly every frame with `camera.position.z = 8 - smooth * 60`, making forward movement physically visible during scroll.
- Camera FOV now expands every frame with `camera.fov = 65 + smooth * 30`.
- Added render-loop console logging for `camera.position.z` and scroll progress to confirm that the camera is actually changing.
- Increased `.scroll-track` height to `600vh` for a slower, more cinematic tunnel pull.
- Updated `src/styles/controlroom.css` so `ControlRoom` opacity is driven by `--control-room-opacity`, which remains `0` until 95% scroll and fades to `1` by 100%.

### Layout scrollability fix

- Updated `src/styles/index.css` so `html`, `body`, `#root`, and `.app-shell` use `height: auto` with `min-height` instead of fixed `height: 100%`.
- Confirmed `html` and `body` do not use `overflow: hidden`; both keep `overflow-y: auto`.
- Changed `src/App.tsx` so the root app wrapper is a normal scrolling `div.app-shell`.
- Kept the R3F Canvas fixed, while the `.scroll-track` remains a normal document-flow sibling outside the Canvas.
- Added a temporary fixed `ScrollDebugReadout` in `SceneCanvas.tsx` showing `scroll: {window.scrollY}px` so real page scrolling can be verified visually.

---

## 2026-05-20 Tunnel Approach Depth Pass

- Updated `src/components/intro/SceneCanvas.tsx` so camera FOV expands from `60` to `120` with `camera.fov = 60 + smooth * 60`, making the black center void grow much more dramatically.
- Changed the Canvas starting FOV to `60`.
- Updated `StarField` so star z positions stretch by `1 + scrollProgress * 2`, creating a stronger rushing-forward sensation during tunnel scroll.
- Updated `src/components/intro/CloudCluster.tsx` so cloud planes follow the camera instead of staying fixed in world space.
- Cloud planes now derive camera travel from scroll progress and stay 10 units in front of the camera along the visible `-Z` direction, preventing them from disappearing as the camera advances.
- Updated `src/components/intro/RetroRoom.tsx` so tunnel depth extends to `z = -200`, keeping tunnel geometry visible through the full scroll.

---

## 2026-05-20 GlassTunnel Fullscreen Replacement

- Replaced the mounted app scene in `src/App.tsx` with only `src/components/intro/GlassTunnel.tsx`.
- Temporarily removed the visible intro sequence, scroll track, and control room from the rendered app surface by no longer mounting `IntroSequence` or `ControlRoom`.
- Upgraded `GlassTunnel.tsx` into a raw Three.js fixed fullscreen scene with constant camera auto-flight along `-Z`.
- Added ACES tone mapping, black exponential fog, transparent physical glass panels, cyan/orange/blue emissive boxes, neon frame structures, point lights, a persistent center human silhouette, and additional drifting background silhouettes.
- Added `EffectComposer`, `RenderPass`, and `UnrealBloomPass` for intense bloom.
- Strengthened the Canvas2D chromatic/lens flare overlay with cyan, orange, and blue rings plus screen-blended cross flare.
- Ensured the Three.js canvas and wrapper use fixed fullscreen sizing with `z-index: 0`.
- Verified with production build and DOM inspection that the WebGL canvas is mounted by `GlassTunnel`.

### Correction: keep original intro phases

- Restored `src/App.tsx` to mount `IntroSequence` and `ControlRoom` inside `.app-shell`.
- Kept the existing `ErrorScreen` and `BrokenLCD` components unchanged.
- Updated `src/components/intro/IntroSequence.tsx` so the phase flow is `error -> glitch -> scene`.
- Replaced only the old scene-phase tunnel with `GlassTunnel`; `GlassTunnel` now mounts where `SpaceScene`/`SceneCanvas` used to appear.
- Added a `600vh` scroll track inside `GlassTunnel` so the fixed glass tunnel remains visible while scrolling toward `ControlRoom`.
- `GlassTunnel` now combines constant auto-flight with scroll-based camera speed boost, and updates `--control-room-opacity` near the end of the scroll range so `ControlRoom` fades in.

---

## 2026-05-20 GlassTunnel Cyber-Space Rewrite

- Replaced `src/components/intro/GlassTunnel.tsx` with a React Three Fiber implementation.
- Kept `App.tsx`, `ErrorScreen.tsx`, `BrokenLCD.tsx`, and the intro phase logic untouched for this pass.
- Changed the visual direction away from neon/synthwave tunnel aesthetics toward a dark, cinematic floating data-space.
- Procedurally generates instanced transparent glass panels, translucent slabs, reflective metallic bars, rectangular frame structures, subtle cyan accent pieces, and atmospheric point particles.
- Uses `MeshPhysicalMaterial` for glass, slabs, and reflective metal with restrained cyan/white/green lighting.
- Added R3F-managed camera drift with slow forward motion, mouse parallax, scroll-boosted movement, and `--control-room-opacity` fade near scroll end.
- Added Three example `EffectComposer` postprocessing with subtle bloom, chromatic aberration via `RGBShiftShader`, vignette, and very light film grain.
- Preserved the `600vh` scroll track so the glass data-space remains the scene phase before `ControlRoom`.

### Runtime fix

- Fixed a browser-only crash in `GlassTunnel.tsx` caused by using obsolete `FilmShader` uniforms (`nIntensity`, `sIntensity`, `sCount`) that do not exist in the installed Three.js `0.163.0` shader.
- Switched film grain setup to the available `FilmShader.uniforms.intensity` API.
- Slightly raised glass/slab emissive visibility and removed unnecessary `gl.autoClear = false` so the scene does not appear as a blank black screen after the intro transition.
- Verified production build and live dev-server DOM after the intro reaches `GlassTunnel`; the scene canvas and `.scroll-track` mount without the previous runtime crash.

---

## 2026-05-20 Cursed Retro Cyberspace Rewrite

- Replaced `src/components/intro/GlassTunnel.tsx` again, keeping `App.tsx`, `ErrorScreen.tsx`, `BrokenLCD.tsx`, and phase wiring untouched.
- Shifted the scene away from polished glass/luxury sci-fi into eerie PS1-era retro cyberspace: black void, toxic green wireframe, faint cyan ghosts, fog, analog noise, and low-fidelity distortion.
- Added a procedurally warped infinite wireframe tunnel built from dynamic `LineSegments`; the tunnel bends, pulses, and follows camera depth.
- Added neural-network-like strand geometry, floating wireframe panels, tetrahedral debris, cyan bars, and ghostly low-poly humanoid silhouettes.
- Added unstable camera drift with mouse parallax, subtle shake, auto-forward motion, scroll-boosted speed, and end-scroll `--control-room-opacity` fade.
- Added postprocessing with `EffectComposer`, `AfterimagePass` ghost trails, `UnrealBloomPass`, `RGBShiftShader`, `VignetteShader`, and `FilmShader`.
- Added an in-component 2D analog overlay canvas for CRT scanlines, random speckle, horizontal tears, and dark monitor vignette.
- Verified production build and live dev-server DOM after intro completion: two canvases mount successfully (`WebGL + analog overlay`) and `.scroll-track` is present.

---

## 2026-05-20 Tunnel Scene Redesign (scroll-wheel + sage green + bloom)

- **그리드**: 가로 8등분(`GRID_CROSS=8`), 세로(깊이) 12등분(`GRID_DEPTH=12`). 터널 크기 width 8 × height 6 × length 80.
- **색상**: `#00ff41` → `#5B8E53` (세이지 그린, hex `0x5b8e53`). 머티리얼·포인트라이트·폴백 CSS 모두 교체.
- **카메라 이동 방식 변경**: 자동 전진 완전 제거. `wheel` 이벤트(`passive: false`, `preventDefault`)로 교체. `e.deltaY * 0.05` 누적 → `THREE.MathUtils.clamp([CAM_Z_MIN, 0])` → `currentZ`가 lerp 0.08로 추적. scroll-track div 제거 (더 이상 scroll 기반 카메라 불필요).
- **`--control-room-opacity`**: scroll progress 대신 카메라 Z progress(`(-currentZ)/(TUNNEL_LENGTH-1)`) 기반으로 전환. 터널 90-100% 지점에서 컨트롤룸 페이드인.
- **네온 글로우**: 각 면(floor/ceiling/left/right)에 동일 geometry 공유 메시를 두 개 생성. `matMain`(opacity 0.9 normal), `matGlow`(opacity 0.18, `AdditiveBlending`, `depthWrite:false`). 블렌딩으로 선 밝기 누적.
- **bloom 후처리**: `EffectComposer` + `RenderPass` + `UnrealBloomPass(strength 0.4, radius 0.6, threshold 0.3)`. `composer.render()`로 렌더. resize 시 `composer.setSize()` 함께 호출.
- **fog 제거**: `FogExp2` 삭제. far clip 200으로 축소.
- **카메라**: fov 62, y=0 (정중앙), near 0.1.
- **렌더러**: `antialias: true`, pixel ratio 최대 1.25.
- **cleanup**: `composer.dispose()` + 4개 geometry + 2개 material + `renderer.dispose()` + `cancelAnimationFrame` + `wheel`·`resize` listener 제거.

---

## 2026-05-20 charcter02 Transition Fix (GhostEntityRenderer dual-effect refactor)

**Bugs fixed:**
1. charcter02 did not appear at all during the break period.
2. CSS `filter: brightness(1.3)` on the canvas broke `mix-blend-mode: screen` due to `#root { isolation: isolate }` creating a stacking context boundary — the canvas composited normally (invisible on dark background) instead of screen-blending.

**Root cause of bug 1:** Previous `useEffect([src])` approach restarted the entire animation (cancel RAF → restart → image load → `ready=false` blank frames) when `imageUrl` changed. With only a 760ms window, the blank period + image load timing made charcter02 either invisible or barely seen.

**Fix — dual-effect pattern in `GhostEntityRenderer.tsx`:**
- Effect 1 (`[]`): creates the shared off-screen ghost canvas, stores it in `ghostCanvasRef`/`ghostCtxRef`, runs the RAF animation loop forever. Never restarts.
- Effect 2 (`[imageUrl]`): loads the image and rewrites the ghost canvas pixels in-place via `getImageData`/`putImageData`. Does NOT reset `readyRef` while loading — the animation keeps drawing the old texture until the new one is atomically written. `readyRef.current = true` is set only after `putImageData` completes.
- On initial mount, Effect 1 runs first (declaration order guarantees), setting refs before Effect 2 reads them.
- Removed `canvasFilter` prop entirely. brightness(1.3) baked into ghost texture pixel values (`bake = 1.3` multiplier on alpha and RGB channels for charcter02).

**Fix — `ErrorScreen.tsx`:**
- Added a dedicated preload `useEffect([])` that fires `new Image().src = charcter02Url` on mount, ensuring the image is in browser cache long before the 3000ms break timer fires.
- Removed `canvasFilter` prop from `GhostEntityRenderer`.
- Raised `alphaBoost` from 1.35 → 1.6 for the break phase (more visible, compensates for removed CSS filter).

---

## 2026-05-20 Error→Tunnel Transition: charcter02 Image Swap

- Identified that `GhostEntityRenderer.tsx` renders `character.png` with glitch/CRT/scanline effects inside `ErrorScreen`. The "transition gap" is the `breakDurationMs={760}` period after the error animation ends before `onComplete` fires.
- Added `imageUrl`, `alphaBoost`, `canvasFilter` props to `GhostEntityRenderer`. `alphaBoostRef` pattern (ref updated each render) lets the running `requestAnimationFrame` loop pick up the new multiplier without restarting. When `imageUrl` changes, `useEffect([src])` re-runs, reloading and rebuilding the ghost texture with the new image.
- In `ErrorScreen`, added `useState(false)` (`isBreaking`) + `window.setTimeout(() => setIsBreaking(true), durationMs)` — fires exactly when the break period starts (3000ms mark). Cleanup calls `clearTimeout` on both the complete timer and the break timer.
- During break phase (`isBreaking === true`): passes `imageUrl={charcter02Url}`, `alphaBoost={1.35}` (character ~51–100% vs original 38–76%), `canvasFilter="brightness(1.3)"` (eye-region emphasis). All glitch/CRT/scanline draw logic in `GhostEntityRenderer` remains unchanged.
- Error scene (`isBreaking === false`): `character.png`, default alpha, no extra filter — untouched.
- Tunnel scene (`GlassTunnel`): no character rendered — untouched.

---

## 2026-05-20 Rectangular Grid Corridor Tunnel Rewrite

- Replaced `src/components/intro/GlassTunnel.tsx` with a vanilla Three.js (no R3F) rectangular corridor wireframe tunnel.
- Dropped React Three Fiber `Canvas`; scene is now mounted via `useEffect` on a plain `<canvas>` element with manual `renderer.dispose()` and `cancelAnimationFrame` cleanup on unmount.
- Tunnel structure: four `PlaneGeometry` faces (floor, ceiling, left wall, right wall) sharing one `MeshBasicMaterial` — wireframe, color `#00ff41`, opacity 0.85. Width 6, height 4, length 80. Grid: 20 cross-sections × 40 depth segments per face.
- Camera: `PerspectiveCamera` fov 75, auto-advances at 3 units/sec along -Z; seamless loop — snaps back to z=0 when within 0.5 units of the far end.
- Mouse parallax: lerp factor 0.05, max sway ±0.3 on X/Y axes.
- Atmosphere: `FogExp2` density 0.03, black background, single `PointLight` `#00ff41` following 10 units ahead of camera.
- Slow tunnel roll: `tunnelGroup.rotation.z += 0.0003` per frame (≈1°/sec at 60fps).
- Scroll → `--control-room-opacity` fade logic preserved from previous pass (600vh scroll track, smoothstep 90%–100%).
- Removed all previous scene elements: warped ring tunnel, neural strands, floating debris, ghost figures, `EffectComposer` postprocessing, `AnalogOverlay` canvas.
- `TunnelFallback` updated to a simple CSS perspective green grid for no-WebGL environments.
- No characters or silhouettes; `ErrorScreen` phase wiring in `IntroSequence.tsx` untouched.

---

## 2026-05-20 Green CRT ErrorScreen Rewrite

- Replaced `src/components/intro/ErrorScreen.tsx` with a fullscreen Canvas2D retro crash screen.
- Kept `BrokenLCD.tsx`, `GlassTunnel.tsx`, `App.tsx`, and phase wiring untouched for this pass.
- Preserved the `onComplete()` callback behavior and set the error phase duration to about `5.2s` before handing off to `BrokenLCD`.
- Visual direction changed from blue error text to cursed green monochrome CRT terminal: dense kernel panic logs, fake C/assembly snippets, memory dumps, virtual machine diagnostics, corrupted filesystem messages, and hexadecimal traces.
- Added procedural text layers with independent scroll speeds, opacity flicker, phosphor glow, chromatic ghost offsets, corruption characters, and peak panic overlays.
- Added analog artifacts: scanlines, tracking bar, static speckles, horizontal tearing, compression-like blocks, frame jitter, persistent ghost trails, and dark monitor vignette.
- Added a timeout-based completion guard so the transition is reliable even if `requestAnimationFrame` is throttled.
- Verified production build and live dev-server DOM: after about 7s, `ErrorScreen` unmounts and `BrokenLCD` canvas is active.

---

## 2026-05-20 charcter02 Break Visibility Update

- `IntroSequence.tsx` calls `ErrorScreen` with `breakDurationMs={3000}` so the transition ghost has a full three-second window before the tunnel phase.
- `ErrorScreen.tsx` exposes a throttled `breakProgress` state from the Canvas2D loop and passes it into `GhostEntityRenderer`, instead of relying only on a boolean break flag.
- `GhostEntityRenderer.tsx` uses `breakProgress` and `breakDurationMs` for charcter02 timing: 0.4s fade in, middle hold, final 0.5s fade out.
- Desktop and mobile share the same ghost render path; `MAX_PIXEL_RATIO` is raised from `1.25` to `2` for sharper high-DPI desktop rendering.

---

## 2026-05-20 GlassTunnel Grid Method: PlaneGeometry → LineSegments

- **문제**: `PlaneGeometry` + `wireframe: true` 방식은 쿼드를 삼각형 두 개로 분할하기 때문에 격자에 대각선이 나타남. 정사각형 타일 격자 구현이 불가.
- **해결**: `THREE.LineSegments` + 수동으로 구성한 `THREE.BufferGeometry`로 완전 교체. 수평·수직 선분만 명시적으로 정의하여 대각선 원천 제거.

### 그리드 빌더 함수

**`buildHGrid(y)`** — 바닥(y=-3) / 천장(y=+3):
- `(COLS+1)`개 깊이 선분(Z 방향, X 간격): 카메라 앞→끝까지 뻗는 세로줄
- `(DEPTH+1)`개 크로스 선분(X 방향, Z 간격): 단면 가로줄
- 각 선분: `(x, y, 0) → (x, y, -L)` 또는 `(xMin, y, z) → (xMax, y, z)`

**`buildVGrid(x)`** — 좌벽(x=-4) / 우벽(x=+4):
- `(ROWS+1)`개 깊이 선분(Z 방향, Y 간격)
- `(DEPTH+1)`개 크로스 선분(Y 방향, Z 간격)

### 파라미터

| 상수 | 값 | 역할 |
|------|-----|------|
| `CELL` | 1 | 1 world unit = 정사각형 1칸 |
| `W` | 8 | 터널 폭 (x: -4 → +4) |
| `H` | 6 | 터널 높이 (y: -3 → +3) |
| `L` | 80 | 터널 깊이 |
| `COLS` | 8 | 바닥/천장 X 칸 수 |
| `ROWS` | 6 | 벽 Y 칸 수 |
| `DEPTH` | 80 | Z 단면 수 |

### `addFace(geo)` 패턴

동일 geometry를 두 `LineSegments`에 공유:
- `matLine`: opacity 0.85, 일반 blending
- `matGlow`: opacity 0.15, `AdditiveBlending`, `depthWrite: false`
- 두 레이어 모두 `frustumCulled = false` — 선분이 카메라 위치를 가로질러 뻗어 있어 frustum culling이 오작동하는 것을 방지

### 유지된 기능

- 휠 스크롤 카메라(`targetZ` 누적, lerp 0.08, clamp)
- `EffectComposer` + `UnrealBloomPass`(0.4 / 0.6 / 0.3)
- `--control-room-opacity` CSS 변수(카메라 Z progress 기반)
- fov 60, camera y=0, SAGE 색상(0x5b8e53)
- cleanup: geo×4 + mat×2 + composer + renderer dispose

---

## 2026-05-20 GlassTunnel Canvas2D Binary Particle Rewrite

- Replaced `src/components/intro/GlassTunnel.tsx` completely and removed the previous Three.js/WebGL tunnel implementation.
- New implementation is a fixed fullscreen Canvas2D scene with `position: fixed; inset: 0`.
- Particle system renders 370 binary string particles (`0`, `1`, `10`, `01`, `110`, `001`, etc.).
- Particles spawn near the center vanishing point, move radially outward, grow with perspective, fade toward the edges, and reset after leaving the screen.
- Scroll wheel interaction is preserved: scrolling down increases particle speed, scrolling up reduces it, and speed lerps back to the default.
- Visual treatment uses cyan/blue binary text, intermittent pale white highlights, glow via `shadowBlur`/`shadowColor`, subtle center glow, faint grid, vignette, and scanlines.
- Component keeps an optional `onComplete?()` prop for scene wiring compatibility, but the tunnel itself does not auto-complete.
- Cleanup cancels `requestAnimationFrame` and removes `resize`/`wheel` listeners.
