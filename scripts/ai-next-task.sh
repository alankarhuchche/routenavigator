#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

echo "AI Engineering Harness"
echo
echo "Current phase:"
grep -m 1 '^Phase ' "$ROOT_DIR/ai-harness/04-current-phase.md" || true
echo
echo "Read these context files before composing the next Codex prompt:"
echo "- ai-harness/README.md"
echo "- ai-harness/00-product-context.md"
echo "- ai-harness/01-architecture-context.md"
echo "- ai-harness/02-delivery-principles.md"
echo "- ai-harness/03-backlog.md"
echo "- ai-harness/04-current-phase.md"
echo
echo "Prompt template:"
echo "- ai-harness/06-codex-task-template.md"
echo
echo "Reminder: include acceptance criteria inside the prompt and ask Codex to report pass/fail."
