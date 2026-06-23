# Phase 2E — Regression QA And Release Decision

## Task Name

Regression QA and release decision.

## Context

Phase 2 changes should be reviewed before any human-approved push or release. This phase checks behavior, safety language, tests, git hygiene and release readiness.

## Controlled Autonomy Rules

- QA and documentation only unless a small fix is required for a clear regression.
- Do not add product features.
- Do not push or deploy.
- Stop at release decision gate.

## Allowed Files

- `ai-harness/`
- tests or small fixes only if required by QA

## Disallowed Files

- new product features
- deployment changes unless explicitly approved
- dependencies
- route decision logic
- API contracts
- `.claude/worktrees`

## Required Work

1. Inspect git status and recent commits.
2. Review the user journey and safety language.
3. Run required checks.
4. Identify regressions or release blockers.
5. Record release readiness and stop for human approval before push/deploy.

## Acceptance Criteria

- Full Phase 2 scope is reviewed.
- Safety boundaries remain intact.
- Required checks pass or failures are explained.
- Release readiness is stated clearly.
- Human gate before push/deploy is preserved.
- No push/deploy is run.

## Commands To Run

- `git status --short --branch`
- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `cd frontend && npm run test`
- `cd backend && ./mvnw test`
- `bash scripts/ai-precommit-check.sh`

## Commit Rule

Commit locally only if QA docs or small fixes are changed and checks pass. Do not push.

## Stop / Report Format

1. Files inspected
2. Findings
3. Commands run and results
4. Release readiness decision
5. Acceptance criteria result
6. Commit hash, if committed
7. Confirmation: no push/deploy run
8. Remaining risks/follow-up
