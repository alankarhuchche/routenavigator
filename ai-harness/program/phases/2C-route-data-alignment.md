# Phase 2C — Route Data Alignment Frontend/Backend

## Task Name

Route data alignment frontend/backend.

## Context

Phase 1 is deployed and complete. Phase 2B extracted the payment journey adapter. This phase aligns frontend scenario/demo data with backend mock route data without changing deterministic route decision logic.

## Controlled Autonomy Rules

- Work only inside this phase.
- Fix and rerun checks up to three times if validation fails.
- Stop if alignment requires route logic, API contract or product scope changes.
- Do not push or deploy.

## Allowed Files

- `frontend/src/data/demoData.ts`
- backend mock data under `backend/src/main/resources/data`
- focused frontend/backend tests if needed
- `ai-harness/`

## Disallowed Files

- deployment files
- dependencies
- backend API contracts
- route decision logic unless explicitly approved
- unrelated frontend UI components
- `.claude/worktrees`

## Required Work

1. Inventory frontend route/scenario data.
2. Inventory backend mock route/scenario data.
3. Identify mismatches in route names, IDs, currencies, ETA, fees, finality, rejected reasons and safety copy.
4. Implement only safe data/copy alignment if clearly warranted.
5. Add or update focused tests where practical.
6. Update program execution state after completion.

## Acceptance Criteria

- Mismatches are listed.
- Any changes are data/copy scoped unless explicitly justified.
- Route engine behavior remains deterministic.
- No unsafe claims are introduced.
- Frontend and backend checks pass for touched areas.
- No deployment files changed.
- No dependencies added.
- `.claude/worktrees` is not staged.
- Local commit is created if changes are made and checks pass.
- No push is run.

## Commands To Run

- `git status --short --branch`
- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `cd frontend && npm run test`
- `cd backend && ./mvnw test`
- `bash scripts/ai-precommit-check.sh`

## Commit Rule

Commit locally only after checks pass and only intended files are staged. Do not push.

## Stop / Report Format

1. Files inspected
2. Mismatches found
3. Files changed
4. Commands run and results
5. Acceptance criteria result
6. Commit hash, if committed
7. Confirmation: no push/deploy run
8. Remaining risks/follow-up
