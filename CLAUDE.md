# Ripple Frontend — Claude Development Guide

실시간 채팅 서비스 프론트엔드. 이 문서는 Claude Code가 이 저장소에서 작업할 때 참고하는 가이드라인이다.

## Stack
- **React 19** (function components + hooks 전용, class 컴포넌트 금지)
- **TypeScript** (strict mode)
- **Vite** (dev/build/preview)
- **ESLint** (flat config: `eslint.config.js`)

## 자주 쓰는 명령어
| 목적 | 명령어 |
|---|---|
| 개발 서버 | `npm run dev` |
| 타입체크 + 빌드 | `npm run build` |
| ESLint 실행 | `npm run lint` |
| ESLint 자동 수정 | `npx eslint . --fix` |
| 타입체크만 | `npx tsc -b --noEmit` |
| 프리뷰 | `npm run preview` |

`dev`/`preview`는 장기 실행 프로세스다. 동작 확인 후에는 백그라운드에서 띄우고 자동으로 종료되기를 기대하지 말 것.

## 디렉토리 구조 (확장 계획)
```
src/
├── components/   # 재사용 UI (Message, MessageList, ChatInput, UserAvatar …)
├── features/     # 도메인 단위 조합 (chat-room, user-presence, notifications …)
├── hooks/        # useSocket, useChatRoom, useScrollToBottom …
├── lib/          # socket client, api client, 순수 유틸
├── store/        # 글로벌 상태 (선택 시점에 Zustand 등 추가)
├── types/        # 공유 타입/인터페이스 (Message, User, Room …)
├── App.tsx
└── main.tsx
```
필요할 때 생성하고, 미리 빈 폴더만 만드는 건 금지.

## 실시간 채팅 관련 원칙
1. **WebSocket/SSE 연결은 `src/lib/socket.ts` 한 곳에서 관리**. 컴포넌트가 직접 new WebSocket() 하지 않는다.
2. **연결 수명은 훅(`useSocket`)으로 추상화**. 여러 컴포넌트에서 중복 연결하지 않도록 싱글톤/컨텍스트 패턴 사용.
3. **낙관적 업데이트는 롤백 경로를 반드시 구현**. 서버 ack가 실패하면 UI를 원래 상태로 되돌린다.
4. **메시지 리스트는 key에 `message.id` 사용**. `index` 금지 — 순서가 바뀌면 DOM 재사용이 깨진다.
5. **스크롤 위치 유지**: 사용자가 위로 스크롤한 상태에서 새 메시지가 오면 자동 스크롤하지 않는다. 하단 근처일 때만 자동 스크롤.
6. **재연결(backoff) 전략**: 지수 백오프 + 최대 재시도 한도. 무한 재시도 금지.
7. **메시지 페이로드 검증**: 서버에서 오는 데이터도 경계에서 1회 검증(zod 등 도입 시점에 추가).

## 코드 스타일
- **`any` 금지**. 임시로 필요한 경우에도 `unknown` + 좁히기 패턴을 선호.
- **`React.FC` 사용하지 않음**. 일반 함수 선언 + props 타입을 따로 정의.
- **비동기 에러는 try/catch 또는 .catch로 반드시 처리**. 삼키지 말고 최소한 로깅.
- **`useEffect`는 부수효과 전용**. 파생 상태는 렌더 중에 계산하거나 `useMemo` 사용.
- **import 순서**: 외부 → 내부(절대경로) → 상대경로 → 스타일/에셋.

## 주석 규칙

**기본값은 "주석 쓰지 않기"**. 잘 지은 이름과 작은 함수가 주석을 대체한다. 주석을 지웠을 때 *미래의 독자가 헷갈릴* 경우에만 남긴다.

### 남겨도 되는 주석 (why가 비자명할 때만)
- **숨은 제약**: `// WebSocket.send는 readyState=OPEN이 아니면 throw — 따라서 queue로 bypass`
- **외부 요인**: `// iOS Safari는 WebSocket ping frame을 무시해 15s 내 application-level ping 필요`
- **의도적으로 이상한 선택**: `// 여기서 Map 대신 Array를 쓰는 이유: 삽입 순서 + 적은 원소(<20)에서 더 빠름`
- **특정 버그 우회**: `// react-dom 19.2.5 issue #12345 — 해결되면 제거`
- **의도된 미구현**: `// TODO(chulyun, 2026-Q3): presence 이벤트 도입 시 여기서 broadcast` — 담당자/시점 명시.

### 쓰지 말아야 할 주석
다음은 전부 제거 대상:

```tsx
// ❌ 코드를 번역한 주석 (이름이 이미 설명함)
// 메시지 리스트를 렌더링한다
function MessageList({ messages }: Props) { ... }

// ❌ "무엇"을 설명 (시그니처로 자명)
// userId를 받아 User 객체를 반환
function getUser(userId: string): User { ... }

// ❌ 타입 중복
// string 타입의 roomId
const roomId: string = ...

// ❌ 현재 task/PR/이슈를 언급 — 커밋 메시지에 있어야 할 내용
// #42 대응으로 추가
// claude가 리팩터링함

// ❌ 호출 관계 언급 (IDE로 즉시 확인 가능, 리팩터로 쉽게 썩음)
// Header 컴포넌트에서 사용됨
// useSocket에서 호출

// ❌ 삭제된 코드에 대한 안내
// removed: old session handler
// (이전 버전에서는 polling 사용)

// ❌ 명백한 단계 나열
// 1. 사용자 가져오기
// 2. 메시지 전송
// 3. 응답 반환

// ❌ 주석 장식 (banner, separator)
// =================
// USER FUNCTIONS
// =================

// ❌ 감정/의견
// 여기 로직이 좀 복잡함. 나중에 리팩터 필요.
//   → 리팩터가 필요하면 리팩터해라. "나중에"는 오지 않는다.

// ❌ commented-out code
// const oldValue = compute();  // 예전 방식
//   → 지워라. git 히스토리에 남아 있다.
```

### JSDoc / 함수 주석
- **기본 원칙: 달지 않는다**. TypeScript 시그니처가 이미 대부분을 설명.
- 공개 API(라이브러리 경계, 외부에서 import 하는 함수)에 한해 **한 줄 요약** 허용. 여러 단락 docstring 금지.
- `@param`, `@returns` 반복 설명 금지 — 타입으로 충분. 정말 필요한 `@throws`, `@deprecated`, `@see`만.

### 검토 시 자문
주석을 쓰기 전:
1. **이름을 더 좋게 고치면** 주석 없이 설명될까?
2. **함수로 추출하면** 이름이 설명을 대신할까?
3. 지웠을 때 **미래의 나/동료가 헷갈릴 이유**가 실제로 있는가?
4. 이 내용이 **커밋 메시지 / PR / ADR에 더 어울리지** 않는가?

위 중 하나라도 "yes"면 주석 대신 그 해결책을 쓴다.

### 기존 코드 리뷰·리팩터 시
- 다른 작업을 하다가 마주친 불필요한 주석은 **같은 커밋에 1-2개까지** 지우고, 많으면 `chore(comments): 노이즈 정리` 별도 커밋으로 분리.
- 주석을 보고 "이게 왜 맞지?" 싶으면 **코드가 아니라 주석이 틀렸을** 가능성이 크다 — 삭제하거나 정확히 수정.

## 하지 말 것
- 직접 `node_modules/`, `dist/` 편집 (hook이 차단함)
- `.env`/credentials 파일 커밋 (hook이 경고함)
- `--no-verify` 플래그로 훅 우회
- 기능 플래그/하위호환 shim을 미리 만드는 것 — 필요해지면 그때 추가
- 테스트가 없는 상태에서 "테스트 통과함"이라고 보고하는 것

## 작업 체크리스트
새 기능이나 수정 작업 후:
1. `npm run lint` — 0 에러
2. `npx tsc -b --noEmit` — 타입 에러 0건
3. UI 변경이면 `npm run dev`로 브라우저에서 실제 동작 확인 (golden path + edge case)
4. 커밋 메시지는 "왜"를 1-2문장으로

## 자가 리뷰 루프

"일단 동작" 상태에서 멈추지 말고 **self-review → refactor** 루프를 돌린 뒤 완료 보고한다. 상세 체크리스트와 실행 절차는 [`.claude/skills/self-review/SKILL.md`](./.claude/skills/self-review/SKILL.md).

### 5-phase 요약
| Phase | 내용 |
|---|---|
| **0. Plan** | 성공 기준 한 문장 + 건드리지 않을 경계 선언 |
| **1. Draft** | 동작부터. 네이밍/구조는 거칠어도 OK |
| **2. Self-review** | 9개 카테고리 체크리스트 — Correctness / Naming / Structure / Types / Duplication / Boundaries / Side effects / React-specific / Readability |
| **3. Refactor** | **현재 범위 안**의 발견만. 범위 밖은 별도 커밋/이슈로 기록 |
| **4. Verify** | lint + typecheck + (UI면) 브라우저 확인 |

**Loop:** Phase 3에서 새 smell 발견 시 Phase 2로 복귀. **3회 이상 루프**가 돌면 상위 설계를 재검토.

### 적용 기준
- **적용**: 중-대규모 기능 구현 직후, PR 직전, 사용자가 "리뷰해줘" 요청
- **skip**: 한 줄 수정, 오탈자, hotfix, "빠르게" 명시

### 지속 강화 (self-augmenting)
리뷰 중에 **2회 이상 반복**된 패턴(smell 또는 관행)은 `.claude/skills/self-review/SKILL.md` 하단 **Augmentation Log**에 날짜와 함께 추가한다. 이 저장소에서 **누적되는 학습 자산**.

- 기록 금지: 일회성 버그, 사소한 네이밍 수정
- 기록 대상: 반복 패턴, 프로젝트 특유의 pitfall
- 체크리스트가 35개 초과 시 정리(덜 쓰이는 항목 삭제)
- 스킬 수정은 **별도 커밋**: `chore(skill): self-review — <요약>`
- 프로젝트 특유 아니라 일반 원칙이면 CLAUDE.md로 승격 검토

## 커밋 규칙

### 형식
```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type** (필수): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`, `revert`
- **scope** (선택): 변경 영역 — `chat`, `socket`, `auth`, `ui`, `hooks`, `lib`, `deps` 등 도메인/모듈 이름
- **subject**: 50자 이내, 마침표 없이, 한글은 "~추가/수정/제거" 명령형 어미 / 영어는 현재형 동사
- **body** (선택이지만 권장): 72자 기준 wrap, "무엇"이 아니라 **"왜"** 를 설명
- **footer** (선택): `BREAKING CHANGE:`, `Closes #123`, `Refs #45`, `Co-Authored-By:`

### 예시
```
feat(chat): 메시지 낙관적 전송 구현

서버 ack 지연 시에도 입력 즉시 UI에 반영해 체감 속도를 개선.
10초 내 ack 없으면 status=failed로 전환하고 재시도 버튼 노출.

Refs #42
```
```
fix(socket): 재연결 시 중복 subscribe 제거

useSocket 언마운트 후 재마운트 경로에서 같은 listener가 두 번
붙어 메시지가 중복 렌더링되던 문제.

Closes #58
```
```
chore(deps): react 19.2.5 → 19.3.0 업데이트
```

### 타입 선택 가이드
| 상황 | type |
|---|---|
| 완전히 새 기능/API | `feat` |
| 버그 수정 | `fix` |
| 문서/주석만 | `docs` |
| 공백·세미콜론·포매팅 (동작 변경 없음) | `style` |
| 동작 유지하면서 구조 개선 | `refactor` |
| 눈에 띄는 성능 개선 | `perf` |
| 테스트 추가/수정 | `test` |
| 빌드/번들/의존성 | `build` 또는 `chore(deps)` |
| CI 설정 | `ci` |
| 이전 커밋 되돌리기 | `revert` |
| 그 외 자잘한 잡무 | `chore` |

### 커밋 단위 (논리적 변경의 경계)

**목표는 "작은 커밋"이 아니라 "단일 목적 커밋"이다.** 한 커밋이 답하는 질문은 언제나 *하나*여야 한다: "왜 이 변경을 했는가?"

#### 신호: 분리가 필요한 커밋
- Subject에 **and / 그리고 / 및 / "겸사겸사" / "~김에"** 가 등장한다 → 목적이 2개.
- Body가 두 단락으로 나뉘고 각 단락이 서로 다른 이유를 설명한다 → 목적이 2개.
- `git revert <sha>` 했을 때 **의도하지 않은 변경이 함께 사라진다** → 커밋을 나눠야 했다.
- 리뷰어에게 "이 줄은 왜 바뀌었지?" 질문에 **두 개 이상의 이유**를 대야 한다 → 분리.
- 한 diff 안에 성격이 다른 파일군이 섞여 있다 (e.g. `package.json` + 로직 + 린트 픽스).

#### 반드시 분리해야 하는 조합 (의무)
1. **포매팅/자동수정 vs 로직 변경**
   `eslint --fix`나 prettier가 건드린 수백 줄과 실제 3줄짜리 로직 수정을 섞지 말 것. 노이즈로 리뷰가 불가능해지고 bisect도 망가진다. 포매팅은 **별도 커밋 또는 별도 PR** (`style:` 또는 `chore: format`).
2. **파일 이동(rename/move) vs 내용 변경**
   이동하면서 내용을 바꾸면 Git이 rename을 추적하지 못해 `git log --follow` 히스토리가 끊긴다. ① 순수 이동 커밋 → ② 내용 수정 커밋, 2단계로.
3. **리팩터 vs 동작 변경**
   prep 커밋(동작 유지하는 구조 개선) → 동작 변경 커밋 순서로. 리뷰어가 "행동이 실제 바뀐 건 후자뿐"을 즉시 판별할 수 있어야 한다.
4. **의존성 추가/업그레이드 vs 사용처 반영**
   `package.json` + `package-lock.json` 변경만 있는 커밋과, 해당 라이브러리를 실제로 쓰는 코드 커밋을 분리. 버전 롤백/bisect가 쉬워진다.
5. **버그 수정 vs 기능 추가**
   같은 PR/브랜치여도 커밋은 분리. 긴급 상황에서 `fix:` 커밋만 `main`으로 cherry-pick 가능해야 한다.
6. **실질적 rename이면 삭제+신규가 아니라 rename 커밋 하나로**
   파일 내용 동일하면 `git mv` 또는 일반 mv 후 add/rm. 내용도 바꿔야 하면 위 규칙 #2 적용.
7. **공개 API/타입 시그니처 변경 vs 호출부 조정**
   대규모 마이그레이션일수록 ① 새 시그니처 추가(기존 유지) → ② 호출부 이전 → ③ 구 시그니처 제거, 3단계로 나누면 중간 상태에서도 빌드가 된다.

#### 묶어도 되는 조합 (허용)
- **기능 구현 + 그 기능의 테스트** — 같은 목적이므로 한 덩어리 OK.
- **한 API 메서드 추가 + 타입 정의 + 1-2군데 호출부 반영** — 서로 없으면 빌드 안 되는 관계라면 OK.
- **구현 추가 중 발견한 같은 파일의 오타 1개 수정** — 1-2개까지 가산 허용. 3개 이상이면 `fix(typo):`로 분리.
- **작은 리팩터 + 그 함수에 직결된 주석/JSDoc 정리**.

#### Bisect 친화성 (강제)
- **모든 커밋은 독립적으로 `npm run lint` + `npx tsc -b --noEmit` + `npm run build` 통과**. 한 커밋이라도 깨진 중간 상태가 있으면 `git bisect`가 무력해진다.
- 대형 마이그레이션은 **"기능 플래그 뒤에 숨기고 단계적으로 진입"** 패턴 고려. 각 단계가 배포 가능한 상태.

#### 크기 기준 (참고)
- 리뷰 편의상 **+200/-200 라인 내외**가 이상적. +1000 넘어가면 "더 쪼갤 방법이 없는가"를 먼저 자문.
- 단, **단일 rename, 자동 생성 파일, lock 파일**처럼 본질적으로 쪼갤 수 없는 큰 diff는 그대로 둔다. 억지 분할 금지.
- 반대로 **한 줄짜리 커밋도 정당**하다. 크기가 작다는 이유로 다른 변경과 합치지 말 것.

#### 커밋 직전 체크리스트
- [ ] Subject 한 줄에 **and/및/그리고 없이** 요약 가능한가?
- [ ] `git diff --cached --stat` — 파일 목록이 하나의 목적으로 설명되는가?
- [ ] 이 커밋만 revert 해도 **나머지 브랜치가 깨지지 않는가**?
- [ ] 린트/타입체크/빌드 중 하나라도 실패하지 않는가?
- [ ] 포매팅 노이즈가 로직 변경을 가리지 않는가?

#### 섞여버린 변경을 분리하는 기법
작업하다 보면 한 working tree에 여러 목적의 변경이 섞이는 경우가 많다. 해결책:

- **`git add -p <file>`** — hunk 단위로 선택 스테이징. 같은 파일을 여러 커밋으로 쪼갤 때 핵심 도구.
- **`git add -N <new-file>` 후 `git add -p`** — 새 파일도 hunk 단위로 나눠 스테이징 가능.
- **`git stash --keep-index`** — 스테이지된 것만 남기고 나머지는 임시 보관 → 빌드/테스트 → 커밋 → `git stash pop`. 각 커밋의 독립 빌드 확인에 유용.
- **`git commit --fixup=<sha>` + `git rebase -i --autosquash`** — 이전 커밋에 합쳐야 할 조각을 깔끔히 묶기 (push 전에만).

### 일반 원칙
1. **커밋·푸시는 반드시 사용자 승인 후 실행**.
   Claude는 `git commit`, `git push`, `git merge`, `git rebase`, 태그 생성 등 **공유 히스토리에 영향을 주는 명령을 단독으로 실행하지 않는다**. 변경 내용과 제안 커밋 메시지를 먼저 보여주고, 사용자의 **명시적 지시**("커밋해", "push해" 등)가 있을 때만 실행. 이전 승인은 그 당시 범위에만 유효하며, 매 커밋마다 새로 확인한다.
2. **Co-Authored-By trailer 사용 금지**. Claude가 작성한 커밋이라도 footer에 `Co-Authored-By: Claude …`를 넣지 않는다. 히스토리는 실제 커밋터만 표기.
3. **빌드/린트/타입체크 통과 상태에서만 커밋**. 작업 중간 스냅샷은 로컬에서만 (또는 `wip/` 브랜치).
4. **`main`에 직접 커밋 지양** — 기능 작업은 `feat/<slug>`, 수정은 `fix/<slug>` 브랜치.
5. **force-push 금지** (로컬 브랜치 정리 제외). `main`에는 절대 금지.
6. **`--amend`는 아직 push 하지 않은 최신 커밋에만**. push된 커밋은 새 커밋으로 수정.
7. **`--no-verify` 금지** — 훅이 실패하면 원인을 고친다.
8. **Breaking change는 footer에 명시**: `BREAKING CHANGE: Message 타입의 id 필드가 string에서 number로 변경됨.`
9. **이슈/PR 참조는 footer에**: `Closes #123` (자동 close), `Refs #45` (참조만).
10. **시크릿 금지** — `block-secrets` 훅이 자동 감지하지만 최종 책임은 작성자.

## 결정 로그 (Decision Log)

방향을 바꾸거나 되돌리기 비싼 결정은 **`docs/decisions/`** 에 ADR (Architecture Decision Record) 형식으로 기록한다. 코드는 *무엇을* 하는지 보여주지만 *왜 이렇게 했는지* 는 설명하지 못한다 — 6개월 뒤의 자신과 새 팀원을 위해 남긴다.

### 기록 대상 (log 해야 하는 결정)
- 새 라이브러리·프레임워크 도입 또는 제거 (상태 관리, 테스트 러너, 빌드 도구, 인증 방식 등)
- 프로토콜·아키텍처 선택 (WebSocket vs SSE vs polling, 낙관적 업데이트 정책, 재연결 전략, 메시지 페이로드 스키마 등)
- 공개 API/타입 설계 결정 (`Message`, `Room`, `User` 등 도메인 타입 구조)
- 기존 결정을 뒤집는 경우 — 왜 바꿨는지 명시적으로 남긴다
- 보안·프라이버시 트레이드오프 (예: 메시지 클라이언트 캐싱 여부)
- 눈에 보이지 않지만 중요한 제약 (성능 예산, 브라우저 지원 범위, i18n 정책 등)
- CI/배포 파이프라인 구조 변경

### 기록 대상 아님 (skip)
- 함수·변수 네이밍, 포매팅, 코드 스타일 선택 — CLAUDE.md로 충분
- 단일 버그 수정 — 커밋 메시지로 충분
- 커밋 직후 사라질 임시 결정, 실험용 스파이크
- 이미 CLAUDE.md나 README에 문서화된 일반 규칙을 반복 설명

### 형식

파일명: `docs/decisions/NNNN-kebab-case-title.md` (NNNN은 4자리 순차 번호, 0001부터)

```markdown
---
id: 0003
title: 메시지 전송에 WebSocket 대신 SSE 채택
status: accepted          # proposed | accepted | deprecated | superseded-by-NNNN
date: 2026-04-24
deciders: icarus8050
supersedes: 0001          # (선택) 이 결정이 대체하는 이전 ADR 번호
---

## Context
현재 상황, 제약, 배경. 왜 지금 이 결정이 필요해졌는가.

## Decision
채택한 방식. 단정적이고 명시적으로 한 문장으로 시작.

## Consequences
- **긍정:** ...
- **부정:** ...
- **추후 주시할 점:** ...

## Alternatives considered
- **A:** 고려했으나 선택하지 않은 이유
- **B:** 고려했으나 선택하지 않은 이유
```

### 규칙
1. **한 파일 = 한 결정**. 여러 결정을 섞지 않는다.
2. **번호는 영구 불변**. 결정을 바꿀 때 파일을 **삭제·재작성하지 말고** 새 ADR을 추가한 뒤 이전 ADR의 `status`를 `superseded-by-NNNN`으로 업데이트.
3. **날짜는 YYYY-MM-DD** 절대 날짜. 상대 날짜 금지.
4. **본문 재작성 금지** — 결정 당시의 맥락을 역사로 보존한다. 바뀐 결정은 새 ADR로.
5. **예외적 본문 수정**(오탈자, 명백한 오류)은 별도 커밋으로 분리해 의도 기록.
6. **PR 본문에서 해당 ADR을 링크** — 리뷰어가 컨텍스트를 즉시 파악하도록.
7. **구현 PR과 ADR PR 분리**가 원칙. 큰 결정은 먼저 ADR만 머지해 정렬한 뒤 구현. 작은 결정은 같은 PR에 포함해도 허용.

### Claude가 지켜야 할 흐름
새 기능이나 리팩터링 요청을 받았을 때 다음을 차례로 자문:
1. 이 작업이 **기록 대상 결정**에 해당하는가?
2. 해당한다면 **기존 ADR**이 관련 방향을 이미 정하고 있는가? (`docs/decisions/` 훑기)
3. 기존 ADR과 **충돌**하면 사용자에게 알리고 새 ADR 작성을 제안. 기존 결정을 조용히 우회하지 않는다.
4. 충돌이 없지만 새 결정이 필요하면 **구현 전에 ADR 초안을 먼저 제시**하고 사용자 승인 대기.
5. ADR 파일 생성·수정도 **일반 커밋 승인 규칙**(위 §일반 원칙 1)을 따른다.

## PR
- 제목은 70자 이내, 한글/영어 모두 허용. 커밋 type 접두사를 제목에 쓸지는 선택(`feat(chat): …` 형태 권장)
- 본문에 `## Summary`(1-3개 불릿) + `## Test plan`(체크박스)
- 단일 커밋이면 커밋 메시지를 그대로 본문에 사용, 여러 커밋이면 요약 새로 작성
- `main`에 force-push 금지

## 참고
- GitHub: https://github.com/icarus8050/ripple-frontend
- 소유자: icarus8050
