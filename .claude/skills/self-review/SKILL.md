---
name: self-review
description: 드래프트 구현 이후 구조화된 자가 리뷰와 타겟 리팩터를 실행. 사용자가 "리뷰해줘", "리팩터 볼만한 거 있어?", "이 코드 점검해줘" 등을 요청할 때, 또는 Claude가 중-대규모 기능 구현을 "일단 동작" 수준까지 마친 직후 스스로 invoke. "완료됐다"고 보고하기 전에 적용.
---

# self-review skill

드래프트가 동작하는 상태(lint/typecheck 통과)에서 의식적 자가 리뷰 + 타겟 리팩터를 수행해 **"됨" → "좋음"** 으로 끌어올리는 5-phase 루프.

## 언제 invoke
- 새 기능 구현을 "일단 됨" 수준까지 마친 직후
- PR 올리기 직전
- 사용자가 "리뷰/리팩터/점검" 류 요청을 했을 때

## 언제 skip
- 한 줄 수정, 오탈자, 변수명 한 개 변경
- 이미 배포된 hotfix (루프 돌리다 재발 위험)
- 사용자가 "빠르게", "리뷰 스킵" 명시

## Phases

### Phase 0. Plan (작업 시작 전, ≤30초)
- **성공 기준** 한 문장으로 명시 (e.g. "새 메시지 수신 시 자동 스크롤, 단 사용자가 스크롤 중이면 skip")
- **경계** 선언 1-2개 ("이번엔 presence는 안 건드림")
- 예상 touched files 적어두기

### Phase 1. Draft
- 동작부터 맞춘다. 네이밍·구조는 거칠어도 OK.
- Exit 조건: golden path 수동 확인 + 관련 edge 1개 이상 확인.

### Phase 2. Self-review (체크리스트)
아래 9개 카테고리를 순서대로. 각 항목 **OK / 수정 필요 / 확신 없음** 표시.
"확신 없음"은 Phase 3에서 더 조사할 후보.

#### Correctness
- [ ] 빈 상태, null/undefined, race, 에러 응답을 모두 처리했는가?
- [ ] 비동기 경로에 try/catch 또는 `.catch`가 있고, catch에서 **조용히 삼키지** 않는가? 최소 로깅.
- [ ] off-by-one, 초기 로딩, 에러 후 리셋 상태가 자연스러운가?

#### Naming
- [ ] 주석 없이 이름만 보고 역할을 알 수 있는가?
- [ ] 약어·축약 없는가? (`msg`→`message`, `u`→`user`, `hdl`→`handler`)
- [ ] boolean은 `is/has/can/should/will` 접두사?
- [ ] 다른 의미로 써도 말이 되는 이름이면 더 구체적으로.

#### Structure
- [ ] 한 함수 = 한 책임? (본문에 "step 1, step 2..." 주석 여러 개 = 쪼개라는 신호)
- [ ] 20줄 넘는 JSX 덩어리를 서브컴포넌트로 쪼갤 수 있는가?
- [ ] 한 `useEffect`가 서로 다른 2개 이상의 목적을 섞고 있지 않은가?
- [ ] 데이터 흐름이 단방향인가? (자식이 부모 상태를 직접 변경하지 않는가?)

#### Types
- [ ] `any`/unsafe cast 없는가?
- [ ] discriminated union이 맞는 곳에 쓰였는가?
- [ ] optional(`?`)이 "정말 선택적"인가, 아니면 "아직 설계가 안 된 것"인가?
- [ ] 도메인 타입이 `src/types/`에 있고 컴포넌트는 import만 하는가?

#### Duplication
- [ ] 같은 로직이 2곳 이상에 있는가?
  - 2회 반복: 참고만. 추출은 안 해도 됨.
  - **3회 반복**: 추출 필수 (Rule of Three).
- [ ] 비슷해 보이지만 **다른 진화 경로**를 갈 예정인 코드는 그대로 둔다.

#### Boundaries
- [ ] 서버에서 들어오는 payload를 경계에서 1회 검증하는가?
- [ ] 사용자 입력을 DOM/URL/API로 보내기 전에 이스케이프·검증하는가?
- [ ] 내부 호출에 방어적 validation을 과하게 붙이지 않았는가? (noise)

#### Side effects
- [ ] `useEffect` 의존성 배열에 누락/과잉이 없는가?
- [ ] cleanup 필요한 곳에 모두 있는가? (subscribe, timeout, interval, listener)
- [ ] 렌더 중에 state 변경/부수효과 금지 원칙 준수했는가?
- [ ] global singleton (socket 등)에 다중 subscribe 중복이 없는가?

#### React-specific
- [ ] 리스트 `key`가 `index`가 아닌 안정적 id인가?
- [ ] 불필요한 `useCallback`/`useMemo` 없는가? (성능 증거 없으면 제거)
- [ ] `useState` 초기값이 비싼 계산이면 lazy init (`useState(() => …)`) 사용했는가?
- [ ] 렌더 안에서 객체/배열/함수 리터럴을 prop으로 넘겨 자식이 매번 re-render되는가? (memoized 자식일 때만 문제)

#### Readability
- [ ] 처음 보는 사람이 **30초 안에 파일의 역할**을 파악할 수 있는가?
- [ ] 주석이 "무엇"이 아니라 "왜"만 설명하는가? (`CLAUDE.md` §주석 규칙 참고)
- [ ] 코드 순서가 **읽는 순서**와 일치하는가? (top-down: 공개 API → 도우미)

### Phase 3. Refactor (타겟형)
- **현재 작업 범위 안의 발견만** 고친다.
- 범위 밖 (다른 모듈, 오래된 기술부채)은 **즉석에서 고치지 말고** 별도 커밋/이슈 후보로 기록. TODO 주석은 마지막 수단.
- 리팩터는 **동작 유지**가 원칙. 동작이 바뀌면 Phase 1로 강등 → 재검증.
- 리팩터 커밋은 구현 커밋과 **분리** (§ 커밋 단위 규칙 #3).

### Phase 4. Verify
- `npm run lint` — 0 error (warning은 수치만 보고)
- `npx tsc -b --noEmit` — 0 error
- UI면 `npm run dev`로 golden path + edge case 1개 이상 수동 확인
- 전부 green일 때만 커밋 승인 요청

### Phase 5. Loop 또는 Stop
- Phase 3에서 새 문제를 발견했는가? → **Phase 2로 복귀**.
- **3번째 루프**를 돌고 있다면 **멈추고 상위 설계 재검토** — 체크리스트로 풀 수 없는 구조적 문제 가능성.
- 더 나올 게 없으면 → Augmentation 단계로.

## Augmentation (스킬 자가 강화)

리뷰 중에 **반복되는 패턴**(2회 이상 목격한 smell 또는 유용한 관행)을 발견하면, 이 파일 하단 `## Augmentation Log` 에 날짜와 함께 **짧게** 추가한다.

### 추가 규칙
- **일회성 버그 수정은 기록 금지** — git history에 이미 있다.
- **2회 이상 반복**된 패턴만 추가. 기준: "이번에도 보였다".
- 항목 1개 = 1-3줄. 장황하게 쓰지 않는다.
- 체크리스트가 **너무 커지면**(카테고리당 7개 초과, 전체 35개 초과) 정리:
  - 안 쓰이는 항목 삭제 (쓰인 빈도를 Augmentation Log에서 역추적)
  - 카테고리를 분할하거나 병합
- **스킬 수정 자체는 별도 커밋**: `chore(skill): self-review — <한 줄 요약>`. 기능 커밋과 섞지 않는다.
- 추가한 항목이 이 프로젝트 특유가 아니라 **일반 원칙**에 가깝다면 CLAUDE.md로 승격 고려.

### 형식
```markdown
### 2026-MM-DD
- **패턴 이름**: 한 줄 설명. 새 체크리스트 항목 제안 또는 관련 이슈/PR 링크.
```

## Augmentation Log

> 새 발견은 **역순**(최신 위)으로 추가.

- _(아직 기록 없음)_
