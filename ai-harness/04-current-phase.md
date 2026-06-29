# Current Phase

Phase 4E-implementation — Bounded customer-fit scoring

Execution mode: do not start Phase 4E-implementation unless explicitly instructed. Use `ai-harness/program/execution-state.md` and `bash scripts/ai-program-next.sh` to confirm state before further controlled execution.

## Objective

Implement bounded customer-fit scoring only if the route-logic gate is explicitly approved.

## Current Status

- Phase 4A reframed the product as Money Movement Intelligence.
- Phase 4E-design is complete locally.
- Customer View is the default, simple, outcome-led layer.
- Bank Intelligence is now optional behind-the-scenes context for controls, AI role, route evidence, map caveats and approval boundaries.
- Detailed route evidence and control-room content are no longer the first thing a customer sees.
- Phase 4C added Customer Insight Context as stage 3 in a six-stage journey.
- Customer insight is mocked/static, visible to the customer, and can be included or excluded before analysis.
- Route Intelligence and Bank Intelligence now show whether insight was used as context.
- Phase 4D added customer-fit explanation when insight is used, plus a no-insight explanation path when it is not used.
- Trusted agent explanation now separates route outcome explanation from customer-fit explanation.
- Phase 4E-design documented a hard-control-first model, capped customer-fit scoring, no-insight behaviour, explainability, Gemini boundaries and data/privacy controls.
- No runtime app logic, backend route decision logic, payment execution logic, API contracts, deployment files, dependencies, customer profile scoring or ranking logic changed in Phase 4E-design.

## Expected Phase 4E Scope

- Implement the bounded customer-fit scoring model from `ai-harness/16-customer-fit-scoring-design.md`, only after gate approval.
- Keep hard controls, sanctions, fraud, eligibility, limits and regulatory checks non-overridable.
- Keep customer insight consent, visibility and no-real-data demo boundaries explicit.
- Update route decision logic only within the approved scope.
- Preserve Gemini/agent boundaries: AI may explain but must not score, select, approve, execute or update payment state.

## Constraints

- Do not push without explicit approval.
- Do not deploy without explicit approval.
- Do not change backend route logic.
- Do not change payment execution logic.
- Do not change API contracts unless explicitly approved by a gate.
- Do not change deployment files.
- Do not add dependencies.
- Do not touch `.claude/worktrees`.

## Expected Outputs For Phase 4E

- Files inspected.
- Files changed.
- Bounded scoring implementation summary.
- Safety/consent/hard-control boundary summary.
- Commands run and results.
- Acceptance criteria result.
- Local commit only if checks pass.
