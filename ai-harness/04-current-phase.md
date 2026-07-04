# Current Phase

Phase 4F — Customer-fit regression QA and release decision

Execution mode: do not start Phase 4F unless explicitly instructed. Use `ai-harness/program/execution-state.md` to confirm state before further controlled execution.

## Objective

Verify the complete six-stage journey after bounded customer-fit scoring and make a release recommendation without pushing or deploying.

## Current Status

- Phase 4A reframed the product as Money Movement Intelligence.
- Phase 4E-design and Phase 4E-implementation are complete locally.
- Customer View is the default, simple, outcome-led layer.
- Bank Intelligence is now optional behind-the-scenes context for controls, AI role, route evidence, map caveats and approval boundaries.
- Detailed route evidence and control-room content are no longer the first thing a customer sees.
- Phase 4C added Customer Insight Context as stage 3 in a six-stage journey.
- Customer insight is mocked/static, visible to the customer, and can be included or excluded before analysis.
- Route Intelligence and Bank Intelligence now show whether insight was used as context.
- Phase 4E-implementation added optional mocked customer insight to route-decision requests.
- Hard gates remain first; only `AVAILABLE` routes receive deterministic customer-fit scoring.
- Customer-fit adjustment is capped at `-5` to `+10`; missing, disabled or unconsented insight applies `0`.
- Route responses and the UI expose base score, bounded adjustment, final score, reasons and cap state.
- Gemini remains explanation-only and payment execution/approval boundaries are unchanged.

## Expected Phase 4F Scope

- Re-run frontend lint, typecheck, build and tests plus backend tests and package.
- Regression-check insight and no-insight paths, voice/text structuring, explanation, map, approval and tracking.
- Inspect the committed diff and production packaging without changing deployment files.
- Recommend push or do not push; stop at the human release gate.

## Constraints

- Do not push without explicit approval.
- Do not deploy without explicit approval.
- Fix only small regressions directly caused by Phase 4E.
- Do not broaden customer insight, route logic or payment execution scope.
- Do not change API contracts or deployment files.
- Do not change deployment files.
- Do not add dependencies.
- Do not touch `.claude/worktrees`.

## Expected Outputs For Phase 4F

- Files inspected.
- Files changed.
- Regression scope and results.
- Release recommendation.
- Commands run and results.
- Acceptance criteria result.
- Local commit only if checks pass.
