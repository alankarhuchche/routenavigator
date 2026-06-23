#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
STATE_FILE="$ROOT_DIR/ai-harness/program/execution-state.md"

phase_file="$(grep -m 1 '^Current phase file:' "$STATE_FILE" | sed 's/^Current phase file: `//; s/`$//')"

bash "$ROOT_DIR/scripts/ai-program-status.sh"
echo
echo "Current phase contents:"
echo "-----------------------"
cat "$ROOT_DIR/$phase_file"
echo
echo "Execution reminders:"
echo "- Execute only the current phase file."
echo "- Use controlled autonomy inside this phase only."
echo "- Do not push or deploy."
echo "- Stop at human gates in ai-harness/program/gates.md."
