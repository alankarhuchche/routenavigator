# Current Phase

Phase 4C — Add Customer Insight Context screen

Execution mode: do not start Phase 4C unless explicitly instructed. Use `ai-harness/program/execution-state.md` and `bash scripts/ai-program-next.sh` to confirm state before further controlled execution.

## Objective

Define and present the permitted customer insights that may inform safe money movement decisions, while keeping customer consent, source, freshness, correction and trace visibility explicit.

## Current Status

- Phase 4A reframed the product as Money Movement Intelligence.
- Phase 4B is complete locally.
- Customer View is the default, simple, outcome-led layer.
- Bank Intelligence is now optional behind-the-scenes context for controls, AI role, route evidence, map caveats and approval boundaries.
- Detailed route evidence and control-room content are no longer the first thing a customer sees.
- No backend route decision logic, payment execution logic, API contracts, deployment files, dependencies, customer profile logic or scoring logic changed in Phase 4B.

## Expected Phase 4C Scope

- Define a frontend-visible Customer Insight Context model.
- Show which customer insights are consented, bank-held, user-declared, inferred, stale or missing.
- Explain whether each insight can be used for gates, scoring, explanation, audit or customer correction.
- Keep insight usage transparent and bank-safe.
- Do not change route scoring or backend decision logic unless a separate gate explicitly approves it.

## Constraints

- Do not push without explicit approval.
- Do not deploy without explicit approval.
- Do not change backend route logic.
- Do not change payment execution logic.
- Do not change API contracts unless explicitly approved by a gate.
- Do not change deployment files.
- Do not add dependencies.
- Do not touch `.claude/worktrees`.

## Expected Outputs For Phase 4C

- Files inspected.
- Files changed.
- Customer insight model and UI summary.
- Safety/consent wording summary.
- Commands run and results.
- Acceptance criteria result.
- Local commit only if checks pass.
