# Current Phase

Phase 3B — Voice intent and Gemini route explanation demo

Execution mode: do not start Phase 3B unless explicitly instructed. Use `ai-harness/program/execution-state.md` and `bash scripts/ai-program-next.sh` to confirm state before any further work.

## Objective

Add a future-facing voice intent and bounded Gemini explanation demo layer while preserving deterministic route selection and payment safety boundaries.

## Current Status

- Phase 3A demo journey shell is complete.
- The frontend now presents four page-like stages:
  - Secure Intent
  - Route Intelligence
  - Journey & Controls
  - Approval & Tracking
- Frontend route engine, map, approval, tracking and simulation behavior are preserved.
- No backend, API, deployment, dependency or route decision logic changes were made in Phase 3A.

## Expected Phase 3B Scope

- Frontend/demo framing only unless explicitly approved otherwise.
- Keep voice capture mocked; do not implement real audio.
- Keep Gemini bounded to explanation of redacted route traces only.
- Do not allow Gemini to select, score, approve, execute, amend, cancel or move money.
- Preserve static corridor demo labelling.

## Constraints

- Do not push without explicit approval.
- Do not deploy without explicit approval.
- Do not change backend route logic.
- Do not change API contracts.
- Do not change deployment files.
- Do not add dependencies.
- Do not touch `.claude/worktrees`.

## Expected Outputs For Phase 3B

- Files inspected.
- Files changed.
- Copy/safety summary.
- Commands run and results.
- Acceptance criteria result.
- Local commit only if checks pass.
