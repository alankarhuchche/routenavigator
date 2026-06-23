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

## Deployment Decisions

- Phase 1 deployed successfully.
- Commit: `053f9ce` (`Upgrade payment route prototype to Payment Route Intelligence`).
- Deployment path: GitHub -> Cloud Build -> Cloud Run.
- Manual validation confirmed the deployed app is working.
- Phase 1 is complete.
- Next phase is Phase 2A — Harness automation improvements.

## Harness Automation Decisions

- Harness automation was added to make AI-assisted engineering repeatable across Codex, Claude and similar assistants.
- The standard workflow is Plan -> Execute -> Verify -> Review -> Commit.
- Push remains deployment-triggering and requires explicit intent.
- `.claude/worktrees` local noise must not be staged unless explicitly requested.

## Frontend Refactor Decisions

- Payment journey derivation was extracted from `LeafletRouteMap.tsx` into a pure frontend adapter.
- The adapter has no React, Leaflet or DOM dependency.
- The map component remains responsible for rendering, Leaflet components, node selection and visual styling.
- Representative journey and no-money-moved safety wording were preserved.
- Next phase is Phase 2C — Route data alignment frontend/backend.
