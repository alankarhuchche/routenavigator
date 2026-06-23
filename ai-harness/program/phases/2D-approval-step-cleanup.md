# Phase 2D — Approval Step Transition Cleanup

## Task Name

Approval step transition cleanup.

## Context

Phase 1 accepts a single-page guided journey. Approval currently sits structurally close to Route Intelligence. This phase may improve the transition into Approval & Tracking while preserving behavior.

## Controlled Autonomy Rules

- Work only inside this phase.
- Fix and rerun checks up to three times if validation fails.
- Do not add real passkeys, biometrics, execution rails or payment integrations.
- Do not push or deploy.

## Allowed Files

- frontend approval/tracking components
- frontend CSS
- frontend tests
- `ai-harness/`

## Disallowed Files

- backend files
- deployment files
- dependencies
- route decision logic
- API contracts
- `.claude/worktrees`

## Required Work

1. Inspect approval/tracking components and current journey composition.
2. Improve transition clarity only if needed.
3. Keep final approval boundary explicit.
4. Keep internal simulator controls secondary.
5. Update tests where practical.
6. Update program execution state after completion.

## Acceptance Criteria

- Approval & Tracking is visually and narratively distinct.
- Customer approval remains explicit and mocked where appropriate.
- Agent cannot approve or move money.
- Existing simulator/tracker behavior remains available.
- No backend, deployment or dependency changes.
- Frontend checks pass.
- Local commit is created if changes are made and checks pass.
- No push is run.

## Commands To Run

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `cd frontend && npm run test`
- `bash scripts/ai-precommit-check.sh`
- `git status --short --branch`

## Commit Rule

Commit locally only after checks pass and only intended files are staged. Do not push.

## Stop / Report Format

1. Files inspected
2. Files changed
3. Journey transition summary
4. Commands run and results
5. Acceptance criteria result
6. Commit hash, if committed
7. Confirmation: no push/deploy run
8. Remaining risks/follow-up
