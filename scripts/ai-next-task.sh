#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

echo "AI Engineering Harness"
echo
echo "Current phase:"
grep -m 1 '^Phase ' "$ROOT_DIR/ai-harness/04-current-phase.md" || true
echo
echo "Recommended files to read before composing the next task prompt:"
echo "- ai-harness/README.md"
echo "- ai-harness/00-product-context.md"
echo "- ai-harness/01-architecture-context.md"
echo "- ai-harness/02-delivery-principles.md"
echo "- ai-harness/03-backlog.md"
echo "- ai-harness/04-current-phase.md"
echo "- ai-harness/05-acceptance-criteria-template.md"
echo "- ai-harness/06-codex-task-template.md"
echo "- ai-harness/12-next-prompts.md"
echo "- ai-harness/13-ai-engineering-workflow.md"
echo
echo "Prompt/template pointers:"
echo "- ai-harness/06-codex-task-template.md"
echo "- ai-harness/12-next-prompts.md"
echo "- ai-harness/14-phase-checklist-template.md"
echo "- ai-harness/15-ai-review-rubric.md"
echo
echo "Safety reminders:"
echo "- Include acceptance criteria inside every task prompt and ask the AI to report pass/fail."
echo "- Work one phase at a time; do not expand scope silently."
echo "- Do not stage .claude/worktrees noise."
echo "- Treat git push as deployment-triggering for this repository."
echo
if command -v git >/dev/null 2>&1 && git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Git branch:"
  git -C "$ROOT_DIR" branch --show-current || true
  echo
  echo "Git short status:"
  git -C "$ROOT_DIR" status --short --branch || true
else
  echo "Git status unavailable."
fi
