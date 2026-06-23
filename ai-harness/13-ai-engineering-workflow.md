# AI Engineering Workflow

This is the standard workflow for Codex, Claude, or another AI assistant working on Payment Route Intelligence.

Use this loop for each phase:

1. Select phase
2. Read harness
3. Generate one task prompt
4. Execute only that task
5. Verify acceptance criteria
6. Report files changed
7. Run required commands
8. Human review
9. Commit hygiene
10. Decide next phase

## 1. Select Phase

- Start from `ai-harness/03-backlog.md` and `ai-harness/04-current-phase.md`.
- Work one phase at a time.
- Do not start the next phase until the current task is reported, reviewed and accepted.

## 2. Read Harness

Before implementation, read the required harness files for the phase. Usually this includes:

- `ai-harness/README.md`
- `ai-harness/00-product-context.md`
- `ai-harness/01-architecture-context.md`
- `ai-harness/02-delivery-principles.md`
- `ai-harness/03-backlog.md`
- `ai-harness/04-current-phase.md`
- `ai-harness/05-acceptance-criteria-template.md`
- `ai-harness/06-codex-task-template.md`
- relevant phase-specific files from `ai-harness/12-next-prompts.md`

## 3. Generate One Task Prompt

- Use one prompt from `ai-harness/12-next-prompts.md` or create one from `ai-harness/06-codex-task-template.md`.
- Include acceptance criteria inside every task prompt.
- State allowed files, disallowed files, required commands and output format.
- Do not rely on prior chat history for critical context.

## 4. Execute Only That Task

- No hidden scope expansion.
- No product feature changes during QA, deployment, documentation or harness phases.
- Do not modify backend, route decision logic, deployment files or API contracts unless explicitly scoped.
- If requirements conflict or required context is missing, report the blocker rather than guessing.

## 5. Verify Acceptance Criteria

- Check every acceptance criterion before reporting completion.
- Report pass/fail with exceptions.
- If app files changed, run the relevant lint, typecheck, build and test commands.
- If only docs/scripts changed, run the phase-specific validation commands instead.

## 6. Report Files Changed

Every task report should include:

- files created
- files updated
- files intentionally left untouched
- scope deviations, if any

## 7. Run Required Commands

- Run commands listed in the task prompt.
- Report command outcomes plainly.
- If a command cannot run because a tool is unavailable, report that as an environment limitation.

## 8. Human Review

- Use `ai-harness/07-review-template.md` and `ai-harness/15-ai-review-rubric.md`.
- The reviewer should check scope control, safety language, test evidence, deployment impact and git hygiene.
- Review should happen before commit or push/deploy actions.

## 9. Commit Hygiene

- Stage only intended files.
- Run `bash scripts/ai-precommit-check.sh` before committing.
- Report `git diff --cached --name-only` and `git diff --cached --stat` before commit.
- `.claude/worktrees` noise must not be staged.
- Do not stage unrelated local files.

## 10. Decide Next Phase

- Update `ai-harness/03-backlog.md` and `ai-harness/04-current-phase.md` only when the phase is complete.
- Keep the next phase small and explicit.
- Push is treated as deployment-triggering for this repository. Do not push unless the user explicitly intends to trigger GitHub/Cloud Build/Cloud Run.

## Standing Rules

- One phase at a time.
- Acceptance criteria inside every task.
- No hidden scope expansion.
- No product feature changes during QA/deploy/docs/harness phases.
- Push may trigger deployment.
- `.claude/worktrees` noise must not be staged.
- AI must report uncertainty or blockers rather than guessing.
