# Human Approval Gates

Human approval is required before:

- push
- deploy
- dependency addition
- backend API contract change
- route decision logic change
- product scope expansion
- new integration
- moving from regression QA to release

AI may proceed without human approval only inside the current approved phase when acceptance criteria are clear and no gate above is crossed.

If a task needs to cross a gate, stop and report:

- what gate is involved
- why the gate is needed
- what files or systems would be affected
- what exact approval is required

## Current Release Gate

- Phase 4F regression QA result: passed.
- Release decision: `READY_TO_PUSH_FALLBACK_ONLY`.
- Approved runtime posture for the candidate: `GEMINI_ENABLED=false` with rules/template fallback.
- Push, Cloud Build and Cloud Run deployment still require explicit human approval.
- Live Gemini enablement is a separate gate because its credentials and runtime behavior were not validated in Phase 4F.
