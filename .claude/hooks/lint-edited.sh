#!/usr/bin/env bash
# PostToolUse hook: after Edit/Write/MultiEdit on a .ts/.tsx/.js/.jsx file,
# run eslint --fix on that file. Exits 0 (non-blocking) even on unfixable
# errors so Claude's flow is not interrupted — lint output still surfaces
# in the transcript.

set -u

input=$(cat)
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

[[ -z "$file_path" ]] && exit 0

case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

case "$file_path" in
  */node_modules/*|*/dist/*|*/dist-ssr/*) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" 2>/dev/null || exit 0
[[ ! -x "node_modules/.bin/eslint" ]] && exit 0

if ! ./node_modules/.bin/eslint --fix "$file_path" >/tmp/ripple-lint.out 2>&1; then
  echo "[lint] unresolved issues in $file_path:" >&2
  sed -n '1,20p' /tmp/ripple-lint.out >&2
fi
exit 0
