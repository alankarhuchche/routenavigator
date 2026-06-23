#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
STATE_FILE="$ROOT_DIR/ai-harness/program/execution-state.md"

current_phase="$(grep -m 1 '^Current program phase:' "$STATE_FILE" | sed 's/^Current program phase: //')"
phase_file="$(grep -m 1 '^Current phase file:' "$STATE_FILE" | sed 's/^Current phase file: `//; s/`$//')"

echo "AI Program Status"
echo

if command -v git >/dev/null 2>&1 && git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
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
else
  echo "Git status unavailable."
  echo
fi

echo "Current program phase:"
echo "$current_phase"
echo
echo "Phase plan:"
echo "ai-harness/program/phase-plan.md"
echo
echo "Current phase file:"
echo "$phase_file"
echo
echo "Reminder: git push may trigger GitHub, Cloud Build and Cloud Run deployment."
