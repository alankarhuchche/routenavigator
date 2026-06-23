# Decision Log

## Seed Decisions

- GenAI explains; the deterministic route engine decides.
- The trusted banking agent is advice-only.
- The trusted banking agent cannot initiate, approve, execute, amend, cancel or move money.
- MCP/context gateway concepts are mocked expert detail only unless explicitly scoped later.
- Final customer approval is required before execution.
- No money moves until the customer approves.
- The payment journey map is representative, not live telemetry.
- The map does not show real correspondent bank data, live scheme telemetry or real FX data.
- Phase 1 is frontend-first unless explicitly scoped otherwise.
- Acceptance criteria must be inside every Codex prompt.
- Codex must report acceptance criteria pass/fail.
- Approval step may need later transition cleanup.

## Handoff Decisions

- Create a Claude-ready handoff pack before deployment because Codex credits may be limited.
- Keep critical project context inside repo-local `ai-harness` files so another AI assistant can continue without chat history.
- Treat the single-page guided journey as acceptable for Phase 1.
- Defer multi-page/wizard restructuring to Phase 2 unless it becomes a deployment or demo blocker.
