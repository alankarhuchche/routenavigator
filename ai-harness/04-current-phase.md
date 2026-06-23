# Current Phase

Phase 2C — Route data alignment frontend/backend

## Objective

Review and align frontend scenario/demo data with backend mock route data so route names, IDs, currencies, ETA, fees, finality, rejected reasons and safety copy stay consistent without changing deterministic route decision logic.

## Expected Scope

- Data/copy alignment only unless a specific mismatch requires a carefully reviewed code change.
- Inspect both frontend demo data and backend mock data before editing.
- Preserve deterministic route engine behavior.
- Do not connect to live systems.
- Do not change deployment files or API contracts.
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
- `frontend/src/data/demoData.ts`
- `backend/src/main/resources/data`
- `backend/src/main/java`
- frontend tests
- backend tests

## Key Risks

- Accidentally changing route decision behavior during data alignment.
- Introducing unsafe or over-specific payment/finality claims.
- Creating frontend/backend drift by fixing one side without documenting the other.
- Touching backend contracts when only data/copy alignment is needed.

## Acceptance Criteria Summary

- Frontend/backend data mismatches are inventoried.
- Any implemented changes are limited to safe data/copy alignment unless explicitly justified.
- Route engine behavior remains deterministic.
- No unsafe claims are introduced.
- Frontend and backend checks pass for touched areas.
- No deployment or API contract changes.
- No dependencies are added.

## Expected Outputs

- Files inspected.
- Mismatches found.
- Files changed, if any.
- Commands run and results.
- Acceptance criteria result.
- Risks/follow-up.
