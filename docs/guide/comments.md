# 주석 가이드

**기본값은 "주석 쓰지 않기"**. 잘 지은 이름과 작은 함수가 주석을 대체한다. 주석을 지웠을 때 *미래의 독자가 헷갈릴* 경우에만 남긴다.

## 남겨도 되는 주석 (why가 비자명할 때만)
- **숨은 제약**: `// WebSocket.send는 readyState=OPEN이 아니면 throw — 따라서 queue로 bypass`
- **외부 요인**: `// iOS Safari는 WebSocket ping frame을 무시해 15s 내 application-level ping 필요`
- **의도적으로 이상한 선택**: `// 여기서 Map 대신 Array를 쓰는 이유: 삽입 순서 + 적은 원소(<20)에서 더 빠름`
- **특정 버그 우회**: `// react-dom 19.2.5 issue #12345 — 해결되면 제거`
- **의도된 미구현**: `// TODO(chulyun, 2026-Q3): presence 이벤트 도입 시 여기서 broadcast` — 담당자/시점 명시.

## 쓰지 말아야 할 주석
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

## JSDoc / 함수 주석
- **기본 원칙: 달지 않는다**. TypeScript 시그니처가 이미 대부분을 설명.
- 공개 API(라이브러리 경계, 외부에서 import 하는 함수)에 한해 **한 줄 요약** 허용. 여러 단락 docstring 금지.
- `@param`, `@returns` 반복 설명 금지 — 타입으로 충분. 정말 필요한 `@throws`, `@deprecated`, `@see`만.

## 검토 시 자문
주석을 쓰기 전:
1. **이름을 더 좋게 고치면** 주석 없이 설명될까?
2. **함수로 추출하면** 이름이 설명을 대신할까?
3. 지웠을 때 **미래의 나/동료가 헷갈릴 이유**가 실제로 있는가?
4. 이 내용이 **커밋 메시지 / PR / ADR에 더 어울리지** 않는가?

위 중 하나라도 "yes"면 주석 대신 그 해결책을 쓴다.

## 기존 코드 리뷰·리팩터 시
- 다른 작업을 하다가 마주친 불필요한 주석은 **같은 커밋에 1-2개까지** 지우고, 많으면 `chore(comments): 노이즈 정리` 별도 커밋으로 분리.
- 주석을 보고 "이게 왜 맞지?" 싶으면 **코드가 아니라 주석이 틀렸을** 가능성이 크다 — 삭제하거나 정확히 수정.
