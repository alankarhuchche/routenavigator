# Codex Task Template

Copy this template into future Codex prompts and fill it in.

## Task

You are working in:

`/Users/alankarapple/Documents/GitHub/routenavigator`

Task: `<phase and title>`

## Context

Read first:

- `ai-harness/README.md`
- `ai-harness/00-product-context.md`
- `ai-harness/01-architecture-context.md`
- `ai-harness/02-delivery-principles.md`
- `ai-harness/03-backlog.md`
- `ai-harness/04-current-phase.md`

Relevant product context:

`<short summary>`

## Product Principles

- GenAI structures and explains; it does not choose the route.
- The route engine applies policy, controls and scoring.
- The trusted banking agent cannot initiate, approve, execute, amend, cancel or move money.
- No money moves until the customer approves.
- Mocked/demo concepts must be labelled safely.

## Constraints

- `<frontend/backend/docs/deployment scope>`
- Do not modify backend unless explicitly scoped.
- Do not modify route decision logic unless explicitly scoped.
- Do not modify Docker, Cloud Run, deployment files or API contracts unless explicitly scoped.
- Do not deploy unless explicitly scoped.

## Required Changes

1. `<change>`
2. `<change>`
3. `<change>`

## Acceptance Criteria

Paste or adapt `ai-harness/05-acceptance-criteria-template.md` here. Every prompt must include acceptance criteria inside the prompt.

## Self-Verification Checklist

- [ ] Inspect diff.
- [ ] Confirm files changed are within scope.
- [ ] Confirm no unsafe AI/agent/payment wording.
- [ ] Confirm existing behavior remains available.
- [ ] Confirm acceptance criteria pass/fail.

## Commands To Run

- `<command>`
- `<command>`

If app files change, usually run:

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `cd frontend && npm run test`

## Output Required

1. Files changed
2. Summary
3. Acceptance criteria result
4. Commands run and results
5. Risks/follow-up
6. Confirmation: no deploy run unless explicitly scoped

