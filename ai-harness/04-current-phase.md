# Current Phase

Phase 2B — Extract payment journey adapter from LeafletRouteMap

## Objective

Extract the frontend-only payment journey adapter logic from `LeafletRouteMap.tsx` into a small typed helper module without changing visible map behavior.

## Expected Scope

- Frontend refactor only.
- Preserve current map behavior, copy and safety boundaries.
- Keep the Payment Journey Map representative, not live telemetry.
- Do not change backend code, route decision logic, deployment files or API contracts.
- Do not add dependencies.
- Do not deploy.

## Files Likely to Inspect

- `ai-harness/README.md`
- `ai-harness/09-handoff-to-ai.md`
- `ai-harness/03-backlog.md`
- `ai-harness/04-current-phase.md`
- `ai-harness/05-acceptance-criteria-template.md`
- `ai-harness/06-codex-task-template.md`
- `ai-harness/11-open-risks.md`
- `ai-harness/12-next-prompts.md`
- `ai-harness/13-ai-engineering-workflow.md`
- `frontend/src/components/LeafletRouteMap.tsx`
- frontend tests

## Key Risks

- Changing visible map behavior during extraction.
- Weakening safety copy around representative journey, finality or no-money-moved boundaries.
- Creating an over-abstracted helper that is harder to maintain than the current component.
- Missing focused tests for adapter behavior.

## Acceptance Criteria Summary

- `LeafletRouteMap.tsx` is smaller and easier to read.
- Extracted adapter logic is typed and readable.
- Map still shows representative journey, numbered nodes, controls, finality/PONR and alternatives.
- No unsafe wording is introduced.
- No backend, route logic, deployment or API contract changes.
- No dependencies are added.
- Frontend lint/typecheck/build/test pass.

## Expected Outputs

- Files changed.
- Refactor summary.
- Behavior preservation notes.
- Commands run and results.
- Acceptance criteria result.
- Risks/follow-up.
