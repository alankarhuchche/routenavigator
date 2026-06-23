# AI Review Rubric

Use this rubric to review Codex, Claude, or another AI assistant's output before commit, push or deploy.

Status scale:

- Pass: acceptable as-is.
- Watch: acceptable with noted risk.
- Fix: must be corrected before proceeding.
- Blocked: cannot proceed without user input or external setup.

| Area | Status | What To Check | Reviewer Notes |
| --- | --- | --- | --- |
| Scope control |  | Did the assistant change only allowed files and avoid hidden scope expansion? |  |
| Safety/control language |  | Does the output preserve GenAI/route-engine/agent/payment boundaries? |  |
| Architecture impact |  | Are boundaries, APIs, route logic and deployment assumptions preserved unless explicitly scoped? |  |
| Test evidence |  | Were the required commands run and were failures explained? |  |
| Deployment impact |  | Could push/deploy be triggered accidentally? Were deploy files or commands touched intentionally? |  |
| Git hygiene |  | Were only intended files staged? Was `.claude/worktrees` excluded? |  |
| Unsupported claim risk |  | Did the assistant claim facts not proven by files, commands or user-provided context? |  |
| Next step clarity |  | Is the next action clear, small and aligned with the backlog? |  |

## Quick Review Questions

- What was the requested phase?
- Which files changed?
- Which files should not have changed?
- Did the assistant run the required commands?
- Did the assistant report acceptance criteria pass/fail?
- Is any risk being deferred, and is that acceptable?
- Would pushing this branch trigger deployment?
- Is the next phase clearly named in `ai-harness/04-current-phase.md`?

## Review Outcome

- Recommendation: keep / fix / revert / ask user
- Highest-severity issue:
- Required fix before commit:
- Required fix before push/deploy:
