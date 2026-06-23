#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

echo "AI pre-commit harness check"
echo

if ! command -v git >/dev/null 2>&1; then
  echo "git is not available; cannot inspect repository state."
  exit 0
fi

if ! git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git work tree."
  exit 0
fi

echo "Current branch:"
git -C "$ROOT_DIR" branch --show-current || true
echo

echo "Git status:"
git -C "$ROOT_DIR" status --short --branch || true
echo

if git -C "$ROOT_DIR" status --short | grep -q '^.. \.claude/worktrees'; then
  echo "WARNING: .claude/worktrees appears in git status. Do not stage this noise unless explicitly requested."
  echo
fi

echo "Staged files:"
STAGED_FILES="$(git -C "$ROOT_DIR" diff --cached --name-only || true)"
if [ -n "$STAGED_FILES" ]; then
  printf '%s\n' "$STAGED_FILES"
else
  echo "(none)"
fi
echo

if [ -n "$STAGED_FILES" ] && printf '%s\n' "$STAGED_FILES" | grep -q '^\.claude/'; then
  echo "WARNING: staged files include .claude/. Unstage unless explicitly intended."
  echo
fi

if [ -n "$STAGED_FILES" ] && printf '%s\n' "$STAGED_FILES" | grep -Eq '^(frontend/|backend/|deployment/|Dockerfile$|cloudbuild\.yaml$)'; then
  echo "WARNING: staged files include app/backend/deployment paths."
  echo "For harness-only phases, staged files should normally be limited to ai-harness/ and scripts/."
  echo
fi

echo "Reminders:"
echo "- Run relevant tests or validation scripts before committing."
echo "- Report acceptance criteria pass/fail."
echo "- Do not push if push triggers deployment unless that is intentional and explicitly approved."
