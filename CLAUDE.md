# Ripple Frontend — Claude Development Guide

실시간 채팅 서비스 프론트엔드. 이 문서는 Claude Code가 이 저장소에서 작업할 때 참고하는 가이드라인이다.

> **이 가이드가 단일 진실 소스다.** 새로 배운 규칙·교훈·반복 패턴·결정은 Claude 개인 메모리(`~/.claude/.../memory/`)가 아니라 다음 세 위치 중 하나에 기록한다:
> - **규칙·관행**: 이 `CLAUDE.md`
> - **재사용 절차**: `.claude/skills/<name>/SKILL.md` (+ 필요 시 Augmentation Log)
> - **되돌리기 비싼 결정**: `docs/decisions/NNNN-*.md` (ADR)
>
> 이유: 개인 메모리는 팀·CI·다른 머신과 공유되지 않고, 사용자가 세션을 정리하면 참조 맥락이 끊긴다. 버전 관리되는 파일에 남겨야 지속성이 보장된다.

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

**기본값은 "주석 쓰지 않기"**. 잘 지은 이름과 작은 함수가 주석을 대체한다. 허용 사례·금지 예시·JSDoc 원칙은 **[`docs/guide/comments.md`](./docs/guide/comments.md)**.

핵심: 주석을 지웠을 때 *미래의 독자가 헷갈릴 경우에만* 남긴다. "무엇"을 설명하지 말고 "왜"만.

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

## 의존성·도구 체인

- Node 버전은 **24.15.0** 고정 (`.nvmrc` + `engines.node: ^24.15.0`).
- `package.json` 버전 변경 전 **반드시 `npm view <pkg> versions`** 로 존재 여부 확인. `@types/*`는 런타임 minor를 따라가지 않는다.
- `package.json`과 `package-lock.json`은 **같은 커밋**에 묶는다.

세부(불일치 패턴 표, 변경 제안 4원칙, 커밋 분리 규칙): **[`docs/guide/dependencies.md`](./docs/guide/dependencies.md)**.

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

## 커밋·PR 규칙

커밋 형식·타입·단위, PR 작성 세부는 **[`docs/guide/commits.md`](./docs/guide/commits.md)** 참조. 아래는 상시 적용되는 핵심 원칙만.

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

## 참고
- GitHub: https://github.com/icarus8050/ripple-frontend
- 소유자: icarus8050
