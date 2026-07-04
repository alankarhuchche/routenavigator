# Current Phase

Phase 5B — Simplify customer journey and responsive stepper

Execution mode: do not start Phase 5B unless explicitly instructed. Use `ai-harness/program/execution-state.md` to confirm state before further controlled execution.

## Objective

Reduce customer-screen density and replace the large six-card journey navigation with compact responsive progress, without changing route, scoring or execution behavior.

## Current Status

- Phase 4A reframed the product as Money Movement Intelligence.
- Phase 4E bounded customer-fit scoring and Phase 4F regression QA are complete.
- Phase 5A corrected stale scoring claims and removed premature derived intent content.
- Customer View is the default, simple, outcome-led layer.
- Bank Intelligence is now optional behind-the-scenes context for controls, AI role, route evidence, map caveats and approval boundaries.
- Detailed route evidence and control-room content are no longer the first thing a customer sees.
- Phase 4C added Customer Insight Context as stage 3 in a six-stage journey.
- Customer insight is mocked/static, visible to the customer, and can be included or excluded before analysis.
- Route Intelligence and Bank Intelligence now show whether insight was used as context.
- Money Movement Intent now opens with an empty composer and optional demo example.
- Structured intent preview, confirmation and duplicate intent summary remain hidden until structuring completes.
- Transcript review remains hidden until browser voice capture produces a transcript.
- Customer Insight copy now accurately describes active, capped scoring after hard controls.
- Backend route scoring, API contracts, payment execution, Gemini boundaries and dependencies were unchanged in Phase 5A.

## Expected Phase 5B Scope

- Simplify the journey progress treatment on desktop and mobile.
- Reduce repeated customer-facing framing while retaining essential safety boundaries.
- Keep Bank Intelligence secondary and preserve the six-stage behavior.
- Do not begin Route Intelligence, map or approval redesign work reserved for later phases.

## Constraints

- Do not push without explicit approval.
- Do not deploy without explicit approval.
- Do not broaden customer insight, route logic or payment execution scope.
- Do not change API contracts or deployment files.
- Do not change deployment files.
- Do not add dependencies.
- Do not touch `.claude/worktrees`.

## Expected Outputs For Phase 5B

- Files inspected.
- Files changed.
- Journey simplification summary.
- Desktop/mobile progress behavior.
- Commands run and results.
- Acceptance criteria result.
- Local commit only if checks pass.
