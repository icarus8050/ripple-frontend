---
name: socket-handler
description: WebSocket/SSE 연결, 메시지 전송/수신 핸들러, 재연결 로직, presence 이벤트 등 실시간 통신 코드를 추가·수정할 때 사용. 사용자가 "소켓 이벤트 추가", "재연결 구현", "presence 처리" 같은 요청을 할 때 트리거.
---

# socket-handler skill

실시간 통신 레이어(`src/lib/socket.ts`, `src/hooks/useSocket.ts`)를 다룰 때 규칙.

## 아키텍처
```
UI Component
     ↓ uses
useSocket (hook)     ←  재사용 가능한 subscribe/send API
     ↓ reads
socket client (src/lib/socket.ts)   ← WebSocket 인스턴스 하나 관리
     ↓
WebSocket
```

## 필수 규칙
1. **WebSocket 인스턴스는 하나만 유지**. 모듈 스코프 싱글톤 + `getSocket()` 팩토리.
2. **메시지 프로토콜은 타입으로 정의**하고 `src/types/socket.ts`에 모음.
   ```ts
   export type ClientMessage =
     | { type: 'send'; roomId: string; text: string; clientMsgId: string }
     | { type: 'typing'; roomId: string }
   export type ServerMessage =
     | { type: 'message'; message: Message }
     | { type: 'ack'; clientMsgId: string }
     | { type: 'error'; code: string; detail?: string }
   ```
3. **수신 데이터는 경계에서 검증**. 서버 신뢰도에 관계없이 최소한 `type` 필드 discriminant 체크.
4. **재연결은 지수 백오프**:
   - 시작 1s, 배수 1.5, 최대 30s, 최대 재시도 예: 10회.
   - 사용자가 수동으로 재연결하면 카운터 리셋.
5. **낙관적 전송**:
   - send 전에 `clientMsgId`(uuid) 생성.
   - UI에 `status: 'pending'` 메시지 추가.
   - `ack` 수신 시 `status: 'sent'`로 전환. 일정 시간(예: 10s) 내에 ack 없으면 `status: 'failed'` + 재시도 버튼.
6. **cleanup**: `useSocket`은 마운트/언마운트 시 subscriber만 붙였다 뗀다. 전체 소켓 close는 앱 종료 시에만.
7. **탭 visibility**: `document.visibilityState === 'hidden'` 상태에서 장시간 idle이면 ping 주기를 줄이고, `visible` 복귀 시 동기화 요청.

## 보안/안정성
- 서버에서 오는 HTML 렌더 금지 (메시지 text는 항상 textContent/children으로).
- URL은 `import.meta.env.VITE_WS_URL`로 주입. 하드코딩 금지.
- 에러 이벤트는 조용히 삼키지 않기 — 최소한 `console.error`로 태그 붙여 로깅.

## 테스트 가능성
- `socket.ts`는 `WebSocket` 인스턴스를 inject 받거나 팩토리 교체 가능하게 만들기. 단위 테스트에서 fake로 교체.

## 완료 전 확인
- 같은 이벤트를 두 곳에서 listen 하지 않는지
- 재연결 루프 중 의도치 않은 send가 없는지
- 메시지 순서 보장 (ack 순서 ≠ 전송 순서 가능)
