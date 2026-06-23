# Program Execution Harness

This directory lets Codex, Claude, or another AI assistant execute agreed work from repo-owned phase files instead of long chat prompts.

Operating model:

1. Read `brief.md`.
2. Read `execution-state.md`.
3. Read `phase-plan.md`.
4. Read the current phase file under `phases/`.
5. Execute only the current phase.
6. Use controlled autonomy inside that phase only.
7. Self-verify against the phase acceptance criteria.
8. Commit locally when the phase says to commit and checks pass.
9. Update execution state after completion.
10. Stop at human gates.

Never push or deploy without explicit approval. For this repository, `git push` may trigger GitHub, Cloud Build and Cloud Run.

## Controlled Autonomy

AI may proceed without human approval only inside the current approved phase when:

- scope is clear
- acceptance criteria are clear
- required commands are available
- no human gate is crossed

If scope, safety, contracts, dependencies or deployment are unclear, stop and ask.

## Human Gates

Human approval is required for push, deploy, dependency changes, backend API contract changes, route decision logic changes, product scope expansion, new integrations and release decisions.
