# Current Phase

Phase 5C — Rebuild Route Intelligence outcome-first and refine Bank Intelligence

Execution mode: do not start Phase 5C unless explicitly instructed. Use `ai-harness/program/execution-state.md` to confirm state before further controlled execution.

## Objective

Make Route Intelligence outcome-first for customers and retain detailed scoring, controls and evidence in Bank Intelligence without changing deterministic decisions.

## Current Status

- Phase 4A reframed the product as Money Movement Intelligence.
- Phase 4E bounded customer-fit scoring and Phase 4F regression QA are complete.
- Phase 5A corrected stale scoring claims and removed premature derived intent content.
- Phase 5B replaced the large six-card stepper with compact progress on desktop and numbered markers on mobile.
- Customer View is the default, simple, outcome-led layer.
- Bank Intelligence is now optional behind-the-scenes context for controls, AI role, route evidence, map caveats and approval boundaries.
- Detailed route evidence and control-room content are no longer the first thing a customer sees.
- Phase 4C added Customer Insight Context as stage 3 in a six-stage journey.
- Customer insight is mocked/static, visible to the customer, and can be included or excluded before analysis.
- Route Intelligence and Bank Intelligence now show whether insight was used as context.
- Current, completed, unlocked and locked journey states remain accessible and navigable under the existing rules.
- Stage count moved into the compact progress summary and duplicate `Stage X of 6` chrome was removed.
- Stage shell is unframed, Stage 1 has one primary CTA, and Bank Intelligence becomes icon-only on narrow screens.
- Visual QA found no horizontal overflow; progress remains about 80px high on desktop/mobile.
- Backend route/scoring logic, API contracts, payment execution, Gemini behavior and dependencies were unchanged in Phase 5B.

## Expected Phase 5C Scope

- Put the customer recommendation and material trade-off first in Route Intelligence.
- Move detailed scoring signals, candidate metrics and analysis mechanics behind Bank Intelligence or progressive disclosure.
- Preserve hard-control, customer-fit and Gemini authority boundaries.
- Do not start map or approval redesign work reserved for later phases.

## Constraints

- Do not push without explicit approval.
- Do not deploy without explicit approval.
- Do not broaden customer insight, route logic or payment execution scope.
- Do not change API contracts or deployment files.
- Do not change deployment files.
- Do not add dependencies.
- Do not touch `.claude/worktrees`.

## Expected Outputs For Phase 5C

- Files inspected.
- Files changed.
- Outcome-first Route Intelligence summary.
- Customer View and Bank Intelligence evidence separation.
- Commands run and results.
- Acceptance criteria result.
- Local commit only if checks pass.
