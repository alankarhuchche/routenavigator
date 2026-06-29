# Current Phase

Phase 4B — Separate Customer View and Bank Intelligence drawer

Execution mode: do not start Phase 4B unless explicitly instructed. Use `ai-harness/program/execution-state.md` and `bash scripts/ai-program-next.sh` to confirm state before further controlled execution.

## Objective

Separate the customer-facing money movement journey from the bank/expert intelligence evidence so the customer experience stays outcome-led while executives can still inspect controls, route evidence and future customer-insight concepts.

## Current Status

- Phase 4A is complete locally.
- The visible proposition is now Money Movement Intelligence.
- Stage 2 is now Money Movement Intent.
- Customer-facing copy is outcome-led: the customer asks to move money; the bank evaluates safe options.
- AI/Gemini remains limited to structuring and explanation.
- The deterministic route engine still owns route recommendation.
- Customer/passkey approval remains required before anything moves.
- No backend route decision logic, payment execution logic, API contracts, deployment files or dependencies were changed in Phase 4A.

## Expected Phase 4B Scope

- Frontend-only separation of customer view and bank/expert intelligence view.
- A clearer place for control evidence, route traces and future customer insight context.
- No new scoring or customer profile logic yet.
- No backend customer insight model yet.

## Constraints

- Do not push without explicit approval.
- Do not deploy without explicit approval.
- Do not change backend route logic.
- Do not change payment execution logic.
- Do not change API contracts.
- Do not change deployment files.
- Do not add dependencies.
- Do not touch `.claude/worktrees`.

## Expected Outputs For Phase 4B

- Files inspected.
- Files changed.
- Customer/bank view separation summary.
- Commands run and results.
- Acceptance criteria result.
- Local commit only if checks pass.
