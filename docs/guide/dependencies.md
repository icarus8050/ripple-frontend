# 의존성·도구 체인 가이드

Node 버전, 의존성 변경 절차, 설치 실패 대응.

## Node 버전
- 고정 버전: **24.15.0** (`.nvmrc` + `package.json` `engines.node: ^24.15.0`).
- 새 클론 후: `nvm use` → `npm install` → `npm run dev`.
- CI 환경도 `.nvmrc`를 읽도록 설정 (Node setup 액션의 `node-version-file: '.nvmrc'`).

## 버전 변경 전 반드시 레지스트리 확인
`package.json`의 버전 범위를 바꾸거나 새 floor를 제안하기 전에 **실제 존재하는 버전**을 확인한다:

```bash
npm view <package> versions --json | tail -20
```

이유: 공급자별 릴리스 주기가 다르다. 특히 주의해야 할 불일치 패턴:

| 패턴 | 예시 |
|---|---|
| `@types/*`는 런타임 minor를 전부 따라가지 않는다 | `@types/node`는 24.12.2 이후 25.0.0으로 바로 점프 — 24.15.x 없음 |
| React와 `@types/react`는 비동기 릴리스 | React 19.2.5와 `@types/react` 19.2.14처럼 patch 번호 다름 |
| Vite 메이저와 플러그인 호환 | `@vitejs/plugin-react`는 Vite major마다 호환 범위 주의 |

## 변경 제안 원칙
1. **"존재할 것 같다"로 제안하지 않는다** — 확인 안 했으면 "추측임"을 사용자에게 명시.
2. **런타임과 타입 패키지를 기계적으로 맞추지 않는다** — `@types/*`는 "같은 major 안의 최신"이면 충분.
3. **floor를 올리는 이유가 있을 때만** 올린다. "새 버전이 나왔으니까"는 이유가 아니다 — 구체적으로 필요한 API, 버그 픽스, 보안 패치를 언급.
4. **설치 실패 시** 즉시 원인 보고 + 복구 제안. 우회하려 `--force`/`--legacy-peer-deps` 등을 먼저 시도하지 않는다.

## 의존성 커밋 규칙
- `package.json` + `package-lock.json`은 **같은 커밋**에 묶는다 (한 쪽만 변경되면 재현 불가).
- 의존성 변경과 해당 라이브러리를 실제로 쓰는 코드는 **별도 커밋** ([커밋 단위 규칙](./commits.md#반드시-분리해야-하는-조합-의무) #4).
- 커밋 타입: 런타임 의존성이면 `build:` 또는 `chore(deps):`, devDependency면 `chore(deps):`.
