#!/usr/bin/env bash
# Stop hook: run `tsc -b --noEmit` when Claude is about to end its turn.
# If there are type errors, exit 2 to feed them back to Claude so it can
# address them before truly stopping. `stop_hook_active` prevents infinite
# loops if the type errors are unfixable in the current context.

set -u

input=$(cat)

stop_hook_active=$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null || echo "false")
if [[ "$stop_hook_active" == "true" ]]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" 2>/dev/null || exit 0
[[ ! -x "node_modules/.bin/tsc" ]] && exit 0

if ! output=$(./node_modules/.bin/tsc -b --noEmit 2>&1); then
  {
    echo "[typecheck] TypeScript errors detected before stop:"
    echo "$output" | sed -n '1,30p'
    echo ""
    echo "Please fix the type errors and then stop, or explicitly confirm you want to leave them."
  } >&2
  exit 2
fi
exit 0
