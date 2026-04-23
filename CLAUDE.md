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
- **주석은 "왜"만 설명**. "무엇"은 코드와 이름이 설명하도록.
- **import 순서**: 외부 → 내부(절대경로) → 상대경로 → 스타일/에셋.

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

## PR
- 제목은 70자 이내, 한글/영어 모두 허용
- 본문에 `## Summary`(1-3개 불릿) + `## Test plan`(체크박스)
- `main`에 force-push 금지

## 참고
- GitHub: https://github.com/icarus8050/ripple-frontend
- 소유자: icarus8050
