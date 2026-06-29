# Current Phase

Phase 4D — Profile-aware route explanation

Execution mode: do not start Phase 4D unless explicitly instructed. Use `ai-harness/program/execution-state.md` and `bash scripts/ai-program-next.sh` to confirm state before further controlled execution.

## Objective

Make the customer and bank explanations show how consented customer insight relates to the recommendation, without changing deterministic route scoring or backend decision logic.

## Current Status

- Phase 4A reframed the product as Money Movement Intelligence.
- Phase 4C is complete locally.
- Customer View is the default, simple, outcome-led layer.
- Bank Intelligence is now optional behind-the-scenes context for controls, AI role, route evidence, map caveats and approval boundaries.
- Detailed route evidence and control-room content are no longer the first thing a customer sees.
- Phase 4C added Customer Insight Context as stage 3 in a six-stage journey.
- Customer insight is mocked/static, visible to the customer, and can be included or excluded before analysis.
- Route Intelligence and Bank Intelligence now show whether insight was used as context.
- No backend route decision logic, payment execution logic, API contracts, deployment files, dependencies, customer profile scoring or ranking logic changed in Phase 4C.

## Expected Phase 4D Scope

- Add customer-facing explanation copy that connects the confirmed intent, customer insight context and route recommendation.
- Keep profile-aware content clearly explanatory/demo only unless a route-scoring gate is explicitly approved.
- Show how insight signals may affect fit, assurance and customer preference in plain language.
- Keep hard controls, sanctions, fraud, eligibility, limits and regulatory checks as non-overridable.
- Preserve the current route result and deterministic route decision path.

## Constraints

- Do not push without explicit approval.
- Do not deploy without explicit approval.
- Do not change backend route logic.
- Do not change payment execution logic.
- Do not change API contracts unless explicitly approved by a gate.
- Do not change deployment files.
- Do not add dependencies.
- Do not touch `.claude/worktrees`.

## Expected Outputs For Phase 4D

- Files inspected.
- Files changed.
- Profile-aware explanation summary.
- Safety/consent/scoring-boundary wording summary.
- Commands run and results.
- Acceptance criteria result.
- Local commit only if checks pass.
