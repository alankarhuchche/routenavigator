# AI Engineering Harness

This directory is the repo-local operating context for AI-assisted delivery on Payment Route Intelligence. It exists so future Codex work is backlog-driven, phase-based, acceptance-criteria-driven, and context-preserving without copying large amounts of context between tools.

Use this harness before starting every future Codex task:

1. Read `00-product-context.md`.
2. Read `01-architecture-context.md`.
3. Read `02-delivery-principles.md`.
4. Check `03-backlog.md` and `04-current-phase.md`.
5. Compose the task using `06-codex-task-template.md`.
6. Include acceptance criteria inside the task prompt, using `05-acceptance-criteria-template.md`.
7. Ask Codex to report acceptance criteria pass/fail at the end.

Every task prompt must state explicit scope boundaries: frontend/backend/deployment/data/test/docs, what may change, and what must not change.

Codex should use these files as source context before implementation. If a request conflicts with these files, Codex should stop and report the contradiction rather than guessing.

## How To Use This Harness

1. Run `bash scripts/ai-next-task.sh` to see the current phase, recommended context files and git warnings.
2. Ask the AI assistant to read the relevant harness files before changing anything.
3. Use one prompt from `ai-harness/12-next-prompts.md` or compose a scoped prompt from `ai-harness/06-codex-task-template.md`.
4. Keep acceptance criteria inside the prompt and require a pass/fail report.
5. Run `bash scripts/ai-precommit-check.sh` before committing.
6. Human-review the diff before any commit, push or deployment.
7. Treat `git push` as deployment-triggering for this repository unless proven otherwise.
