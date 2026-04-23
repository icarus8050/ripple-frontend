---
name: ship-check
description: 현재 브랜치의 변경사항이 머지/배포 준비가 됐는지 빠르게 점검. 사용자가 "ship 준비 됐어?", "PR 올려도 돼?", "커밋 전 체크" 같은 요청을 할 때 실행.
---

# ship-check skill

이 skill은 브랜치가 머지 가능한 상태인지 점검하는 **체크리스트 실행**이다. 결과를 요약해서 사용자에게 보고.

## 실행 순서 (순서대로)

1. **린트**
   ```
   npm run lint
   ```
   에러 0건이어야 통과. warning은 count만 보고.

2. **타입체크**
   ```
   npx tsc -b --noEmit
   ```
   에러 0건이어야 통과.

3. **빌드**
   ```
   npm run build
   ```
   성공해야 통과. 번들 사이즈 증가가 눈에 띄면 언급.

4. **Git 상태**
   - `git status --short` — untracked/modified 파일 요약
   - `git log --oneline origin/main..HEAD` — 이 브랜치만의 커밋
   - `.env`, credential 류가 staged에 있으면 **즉시 중단 + 사용자에게 경고**

5. **커밋/브랜치 상태**
   - 현재 브랜치 이름이 `main`이면 경고 (보통 별도 브랜치에서 작업해야 함)
   - 커밋 없이 변경만 있으면 커밋 필요 여부 질의

## 보고 형식
사용자에게 다음처럼 간결하게 답변:

```
Ship check:
- lint: ✓ (warnings: 2)
- typecheck: ✓
- build: ✓ (bundle 142KB)
- git: 브랜치 feature/xxx, main보다 3 커밋 앞섬, untracked 없음
- 준비됨 / 막힌 항목: <…>
```

## 주의
- 실패 항목이 있으면 고치지 말고 **보고만** 한다 (사용자가 수정 지시할 때까지 대기).
- `npm run build`가 3분 이상 걸리면 타임아웃 가능성 있으니 `run_in_background` 사용 고려.
- 이 skill은 destructive 작업 금지 (reset, force push, 파일 삭제 등).
