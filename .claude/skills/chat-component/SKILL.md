---
name: chat-component
description: 채팅 도메인 컴포넌트(Message, MessageList, ChatInput, RoomHeader 등)를 이 저장소 규칙에 맞게 생성하거나 수정할 때 사용. 사용자가 "메시지 컴포넌트 만들어줘", "채팅 입력창 추가", "MessageList 리팩터" 같은 요청을 할 때 트리거.
---

# chat-component skill

이 저장소의 실시간 채팅 UI 컴포넌트를 생성·수정할 때 반드시 따를 규칙.

## 위치
- 순수 재사용 UI: `src/components/<ComponentName>/<ComponentName>.tsx`
- 도메인 조합 (데이터 훅 + UI): `src/features/<domain>/<ComponentName>.tsx`

## 컴포넌트 작성 체크리스트
1. **함수 선언 + 분리된 props 타입**
   ```tsx
   type MessageProps = {
     message: Message
     isOwn: boolean
   }

   export function Message({ message, isOwn }: MessageProps) { … }
   ```
   `React.FC` 사용 금지.
2. **메시지 리스트의 key는 반드시 `message.id`**. `index` 사용하면 DOM 재사용이 깨져서 입력 포커스/애니메이션이 튐.
3. **자동 스크롤은 "하단 근처에 있을 때만"**. 사용자가 히스토리 읽는 중이면 건드리지 않기.
4. **입력값 `onChange`와 전송 로직을 분리**. 디바운스/트로틀은 hook으로 추출.
5. **`useEffect`에 socket 연결 직접 붙이지 않기**. `useSocket` 훅 경유.
6. **접근성**:
   - 버튼은 `<button type="button">`
   - 아이콘 전용 버튼은 `aria-label`
   - 메시지 영역은 `role="log"` + `aria-live="polite"`
7. **타입은 `src/types/`에서 import**. 컴포넌트 파일 안에 도메인 타입 재정의 금지.

## 하지 말 것
- `any`, `as any` 사용
- 컴포넌트 안에서 `fetch`/WebSocket 직접 호출 (→ 훅이나 `src/lib/` 경유)
- 인라인 스타일로 레이아웃 구현 (CSS 파일 사용)
- "일단 만들어두는" 미사용 prop

## 완료 전 확인
- `npm run lint` 통과
- `npx tsc -b --noEmit` 통과
- props에 불필요한 optional(`?`) 없는지 — 넣는 이유가 명확할 때만 optional
