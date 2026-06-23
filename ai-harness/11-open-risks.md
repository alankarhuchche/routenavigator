# Open Risks

| Risk | Severity | Blocks Phase 1 deployment? | Recommended phase | Notes |
| --- | --- | --- | --- | --- |
| Single-page journey may need wizard cleanup | Medium | No | 2D | Phase 1 accepts a guided single-page journey. A clearer approval transition would improve customer narrative. |
| `LeafletRouteMap.tsx` is chunky | Reduced | No | 2B | Journey derivation was extracted into a pure adapter. Further UI simplification can be considered later if needed. |
| Frontend/backend scenario data drift | Medium | No | Gate before implementation | Phase 2C inventory found frontend scenarios 7-11 need route-logic/product-scope approval before backend alignment. |
| `.claude/worktrees` git noise | Low | No | 1K | Local worktree metadata appears modified. Do not touch it casually; exclude from deployment commits if unrelated. |
| Cloud Run may serve stale frontend assets if build packaging is wrong | Resolved | No | 1M | Resolved for Phase 1: deployed app served the new UI successfully after GitHub -> Cloud Build -> Cloud Run deployment. |
| Agent/MCP drawer is mocked only | Medium | No | Future | Keep labelled as mocked/advice-only. Do not imply real MCP/OAuth/tool calls. |
| Passkey and mic are mocked only | Medium | No | Future | Keep labelled as demo/mocked until real auth or audio is explicitly scoped. |
| Map is representative, not live telemetry | Medium | No | Future | Keep safety line visible. Do not imply real correspondent network visibility. |
| No real payment execution | High | No | Future | This is correct for the demo. Do not add live rails or money movement without a separate approved architecture/security phase. |
| Gemini explanation is optional and must remain bounded | Medium | No | Future | Gemini may explain redacted traces only. It must not score, select, approve or update payment state. |
