# 09 — Traceability Matrix

Links each hard rule and scenario to the backlog item that built it, the test that proves it,
and the evidence.

## Hard rules and core controls
| ID | Rule | Backlog item | Test | Evidence |
|----|------|-------------|------|----------|
| INV-1 | Route engine is deterministic; Gemini never decides | 10-17 | RouteDecisionServiceTest | 18/18 passed 2026-06-03 |
| INV-2 | Hard gates run before scoring; failed gate = EXCLUDED | 10-13 | GateEvaluationServiceTest | 18/18 passed |
| INV-3 | Gemini receives only redacted trace; no PII | 30, 35 | TraceRedactionServiceTest | 18/18 passed |
| INV-4 | Fallback only before PONR; post-PONR = investigation | 41-43 | PaymentExecutionResourceTest | 18/18 passed |
| INV-5 | Decision Trace is the single source of truth | 18-19 | DecisionTraceServiceTest | 18/18 passed |
| INV-6 | Template fallback when Gemini unavailable | 31 | RouteExplanationResourceTest | 18/18 passed |
| CORE-IDEM | Idempotent endpoints | 20-21, 38 | RouteDecisionResourceTest, PaymentExecutionResourceTest | passed |
| CORE-SEC | No live secrets; GEMINI_API_KEY env only | 32 | RouteExplanationResourceTest (disabled path) | passed |
| CORE-AUD | Decision Trace records all decisions and events | 18-19, 40 | DecisionTraceServiceTest | passed |

## Scenarios
| Scenario | Expected winner | Backlog item | Test | Evidence |
|----------|----------------|-------------|------|----------|
| SCN-001 UK instant | UK_DOMESTIC_INSTANT | 17 | RouteDecisionServiceTest | passed |
| SCN-002 USD fastest | STABLECOIN_BRIDGE_FIAT_PAYOUT | 17 | RouteDecisionServiceTest | passed |
| SCN-003 USDC wallet | WALLET_TO_WALLET_STABLECOIN | 17 | RouteDecisionServiceTest | passed |
| SCN-004 USD cheapest | LOCAL_PAYOUT_PARTNER | 17 | RouteDecisionServiceTest | passed |
| SCN-005 Traditional only | CORRESPONDENT_BANKING | 17 | RouteDecisionServiceTest | passed |
| SCN-006 Fallback pre-PONR | Fallback to CORRESPONDENT_BANKING | 41-42 | PaymentExecutionResourceTest | passed |

## Known gaps
- Browser/UI visual smoke not verified (browser runtime unavailable in build session).
- No E2E automation tool wired; UI tested only via manual check + build/typecheck.
- Prompt-injection resistance not tested (acceptable for demo; required before production use).
