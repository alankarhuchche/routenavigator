# Open Risks

| Risk | Severity | Blocks Phase 1 deployment? | Recommended phase | Notes |
| --- | --- | --- | --- | --- |
| Single-page journey may need wizard cleanup | Resolved locally | No | 3A-fix | Phase 3A-fix made active-stage content exclusive/page-like, strengthened Back/Continue navigation and kept locked stages explicit. |
| Journey map visibility regression | Resolved locally | No | 3A-fix | Local review found the map was not visible enough after the page-like shell. Journey & Controls now restores the map path, adds a visible map intro and invalidates Leaflet size on mount. |
| `LeafletRouteMap.tsx` is chunky | Reduced | No | 2B | Journey derivation was extracted into a pure adapter. Further UI simplification can be considered later if needed. |
| Frontend/backend scenario data drift | Reduced | No | Gate before backend corridor support | Phase 2C-fix labels scenarios 7-11 as illustrative frontend-only corridor demos. Backend corridor support remains deferred behind route-logic/product-scope approval. |
| `.claude/worktrees` git noise | Low | No | 1K | Local worktree metadata appears modified. Do not touch it casually; exclude from deployment commits if unrelated. |
| Cloud Run may serve stale frontend assets if build packaging is wrong | Resolved | No | 1M | Resolved for Phase 1: deployed app served the new UI successfully after GitHub -> Cloud Build -> Cloud Run deployment. |
| Agent/MCP drawer is mocked only | Medium | No | Future | Keep labelled as mocked/advice-only. Do not imply real MCP/OAuth/tool calls. |
| Voice intent capture is demo-only | Medium | No | 3B | Phase 3B uses browser speech recognition only to populate/edit payment intent. It cannot approve or execute payment. |
| Map is representative, not live telemetry | Medium | No | Future | Keep safety line visible. Do not imply real correspondent network visibility. |
| No real payment execution | High | No | Future | This is correct for the demo. Do not add live rails or money movement without a separate approved architecture/security phase. |
| Gemini explanation is optional and must remain bounded | Medium | No | Future | Gemini may explain redacted traces only. It must not score, select, approve or update payment state. |
