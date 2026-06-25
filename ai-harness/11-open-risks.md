# Open Risks

| Risk | Severity | Blocks Phase 1 deployment? | Recommended phase | Notes |
| --- | --- | --- | --- | --- |
| Single-page journey may need wizard cleanup | Resolved locally | No | 3A-fix | Phase 3A-fix made active-stage content exclusive/page-like, strengthened Back/Continue navigation and kept locked stages explicit. |
| Journey map visibility regression | Resolved locally | No | 3A-fix | Local review found the map was not visible enough after the page-like shell. Journey & Controls now restores the map path, adds a visible map intro and invalidates Leaflet size on mount. |
| Secure Intent composer was too raw and could lose typed text | Resolved locally | No | 3B-fix | Secure Intent now has controlled input persistence, visible voice capture, preference cards and a clear analyse progression path. |
| Secure Session and intent capture were overloaded | Resolved locally | No | 3 UX-fix | Opening journey is now split into Secure Session first and Intent Capture second, keeping passkey/session readiness separate from voice/text payment outcome capture. |
| Secure Session looked too plain/debug-like | Resolved locally | No | 3 UX-fix 2 | Stage 1 now has a premium landing layout, visible Continue CTA, readiness sequence and no initial route metrics/debug-style summary above the journey. |
| Secure Session appeared blank in local in-app browser | Resolved locally | No | 3 UX-fix 3 | Fresh runtime smoke checks show Stage 1 visible with no page errors. Added a root render fallback and visibility test so future render failures do not leave a blank root. |
| `LeafletRouteMap.tsx` is chunky | Reduced | No | 2B | Journey derivation was extracted into a pure adapter. Further UI simplification can be considered later if needed. |
| Frontend/backend scenario data drift | Reduced | No | Gate before backend corridor support | Phase 2C-fix labels scenarios 7-11 as illustrative frontend-only corridor demos. Backend corridor support remains deferred behind route-logic/product-scope approval. |
| `.claude/worktrees` git noise | Low | No | 1K | Local worktree metadata appears modified. Do not touch it casually; exclude from deployment commits if unrelated. |
| Cloud Run may serve stale frontend assets if build packaging is wrong | Resolved | No | 1M | Resolved for Phase 1: deployed app served the new UI successfully after GitHub -> Cloud Build -> Cloud Run deployment. |
| Agent/MCP drawer is mocked only | Medium | No | Future | Keep labelled as mocked/advice-only. Do not imply real MCP/OAuth/tool calls. |
| Voice intent capture is demo-only | Reduced | No | 3D | Browser speech recognition still only produces transcript text; Phase 3D sends transcript/text to backend intent structuring with Gemini/rules fallback and requires customer confirmation before route analysis. |
| Map is representative, not live telemetry | Medium | No | Future | Keep safety line visible. Do not imply real correspondent network visibility. |
| No real payment execution | High | No | Future | This is correct for the demo. Do not add live rails or money movement without a separate approved architecture/security phase. |
| Gemini explanation is optional and must remain bounded | Medium | No | Future | Gemini may explain redacted traces only. It must not score, select, approve or update payment state. |
