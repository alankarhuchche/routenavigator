# Open Risks

| Risk | Severity | Blocks Phase 1 deployment? | Recommended phase | Notes |
| --- | --- | --- | --- | --- |
| Single-page journey may need wizard cleanup | Medium | No | 2D | Phase 1 accepts a guided single-page journey. A clearer approval transition would improve customer narrative. |
| `LeafletRouteMap.tsx` is chunky | Medium | No | 2B | The frontend-only journey adapter is useful but should be extracted once deployment is stable. |
| Frontend/backend scenario data drift | Medium | No | 2C | Frontend demo copy and backend route fixtures may diverge over time. Align data once backend scope is approved. |
| `.claude/worktrees` git noise | Low | No | 1K | Local worktree metadata appears modified. Do not touch it casually; exclude from deployment commits if unrelated. |
| Cloud Run may serve stale frontend assets if build packaging is wrong | High | Yes | 1K | Verify container build copies current `frontend/dist` into Quarkus static resources and deployed URL shows the new UI. |
| Agent/MCP drawer is mocked only | Medium | No | Future | Keep labelled as mocked/advice-only. Do not imply real MCP/OAuth/tool calls. |
| Passkey and mic are mocked only | Medium | No | Future | Keep labelled as demo/mocked until real auth or audio is explicitly scoped. |
| Map is representative, not live telemetry | Medium | No | Future | Keep safety line visible. Do not imply real correspondent network visibility. |
| No real payment execution | High | No | Future | This is correct for the demo. Do not add live rails or money movement without a separate approved architecture/security phase. |
| Gemini explanation is optional and must remain bounded | Medium | No | Future | Gemini may explain redacted traces only. It must not score, select, approve or update payment state. |
