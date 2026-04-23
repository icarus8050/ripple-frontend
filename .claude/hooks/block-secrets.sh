#!/usr/bin/env bash
# PreToolUse hook on Bash: if the command is `git commit`, inspect the staged
# file list and block when names look like secrets (.env, *.pem, *.key,
# anything matching credential/secret). .env.example is allowed.

set -u

input=$(cat)
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")

[[ -z "$command" ]] && exit 0

if ! printf '%s' "$command" | grep -qE '(^|[[:space:]]|&&|;|\|)git[[:space:]]+commit([[:space:]]|$)'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" 2>/dev/null || exit 0

staged=$(git diff --cached --name-only 2>/dev/null || true)
[[ -z "$staged" ]] && exit 0

# Match only file BASENAMES that look like secret material. Avoid broad
# substring matches on "secret"/"credential" which would flag legit source
# files (e.g., block-secrets.sh, credential-form.tsx).
sensitive=$(printf '%s\n' "$staged" | grep -iE '(^|/)(\.env(\.[^.]+)?|credentials?\.(json|ya?ml|env|txt)|secrets?\.(json|ya?ml|env)|id_rsa|id_ed25519|.*\.(pem|key|p12|pfx|keystore|jks))$' || true)
# Allow template/example variants explicitly.
sensitive=$(printf '%s\n' "$sensitive" | grep -vE '\.(example|sample|template)$' || true)

if [[ -n "$sensitive" ]]; then
  {
    echo "Blocked: staged files look sensitive:"
    printf '  %s\n' $sensitive
    echo ""
    echo "Unstage with: git restore --staged <file>"
    echo "If you are sure the file is safe to commit (e.g., a template), rename it (*.example) or ask the user to confirm."
  } >&2
  exit 2
fi

exit 0
