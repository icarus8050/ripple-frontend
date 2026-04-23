#!/usr/bin/env bash
# PreToolUse hook: reject Write/Edit/MultiEdit targeting node_modules or dist.
# Build output and vendored deps should never be hand-edited; changes are lost
# on next install/build and typically signal a confused debugging path.

set -u

input=$(cat)
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

[[ -z "$file_path" ]] && exit 0

case "$file_path" in
  */node_modules/*|*/dist/*|*/dist-ssr/*)
    {
      echo "Refusing to modify build output: $file_path"
      echo "node_modules/ and dist/ are generated. Edit source under src/ or fix the build config instead."
    } >&2
    exit 2
    ;;
esac

exit 0
