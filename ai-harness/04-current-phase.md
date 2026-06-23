# Current Phase

Phase 2A — Harness automation improvements

## Objective

Improve the lightweight AI engineering harness so future assistants can quickly discover the current phase, relevant context, task templates and acceptance criteria without relying on previous chat history.

## Expected Scope

- Documentation and small helper scripts only.
- Inspect `ai-harness` files and `scripts/ai-next-task.sh`.
- Improve the workflow for finding the next task and loading required context.
- Keep changes simple, readable and repo-local.
- Do not change frontend app behavior.
- Do not change backend code, route decision logic, deployment files or API contracts.
- Do not deploy.

## Files Likely to Inspect

- `ai-harness/README.md`
- `ai-harness/03-backlog.md`
- `ai-harness/04-current-phase.md`
- `ai-harness/05-acceptance-criteria-template.md`
- `ai-harness/06-codex-task-template.md`
- `ai-harness/09-handoff-to-ai.md`
- `ai-harness/11-open-risks.md`
- `ai-harness/12-next-prompts.md`
- `scripts/ai-next-task.sh`

## Key Risks

- Over-engineering the harness with brittle automation.
- Accidentally changing application code during a docs/scripts phase.
- Letting current-phase/backlog docs drift apart.
- Creating scripts that depend on local-only tools or credentials.

## Acceptance Criteria Summary

- The next task/current phase can be discovered from repo-local files.
- Any helper script remains simple, readable and safe.
- Documentation clearly points future assistants to Phase 2A and beyond.
- No application source behavior changes.
- No backend, route logic, deployment or API contract changes.
- No dependencies are added.
- Git status is reported.

## Expected Outputs

- Updated harness workflow docs if needed.
- Updated next-task prompt or helper script if needed.
- Clear report of files changed, commands run, acceptance criteria result and follow-up risks.
