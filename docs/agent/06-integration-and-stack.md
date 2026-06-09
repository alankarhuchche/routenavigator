# 06 — Integration & Tech Stack

## A. Persistence (system of record)
Scope: Used (mock only for MVP)
Technology: local JSON files under backend/src/main/resources/data/ for MVP. PostgreSQL
deferred — data access is behind services/repositories so it can be swapped in later without
rewriting route decision logic.
Mock files: scenarios.json, route-catalogue.json, gate-policies.json, scoring-policies.json,
reason-codes.json, mock-fx-quotes.json, mock-liquidity.json, mock-compliance.json,
mock-route-health.json, mock-beneficiaries.json, execution-scripts.json.
In-memory trace and execution state (Map in DecisionTraceService / ExecutionSimulatorService).
Cloud Run: --max-instances=1 until shared persistence is added.

## B. Caching / fast state
Scope: Not used (MVP). In-memory Maps serve as the idempotency and state store.

## C. Event streaming
Scope: Not used (MVP).

## D. Message queues / host integration
Scope: Not used (MVP).

## E. Synchronous APIs (outbound & inbound)
Scope: Used
- Inbound REST (Quarkus): POST /api/route-decisions, GET /api/route-decisions/{traceId},
  POST /api/explanations/route, POST /api/payments/{traceId}/authorise,
  POST /api/payments/{traceId}/simulate/next, POST /api/payments/{traceId}/simulate/degradation,
  GET /api/payments/{traceId}/state, GET /api/payments/{traceId}/events.
- Outbound REST (Gemini): MicroProfile REST Client in RealGeminiExplanationService. Activates
  only when GEMINI_ENABLED=true AND GEMINI_API_KEY set. Fails back to TemplateExplanationService
  on any error — never blocks the decision.
- Testing method: Quarkus @QuarkusTest in-process for inbound; Gemini stubbed via
  GeminiExplanationService interface + TemplateExplanationService in tests.

## F. SOAP / legacy XML
Scope: Not used (demo only).

## G. File transfer / batch
Scope: Not used (demo only). Mock data loaded from classpath JSON at startup.

## H. Data egress / analytics
Scope: Not used (demo only).

## I. Cryptography & secrets
Scope: Used (minimal — see 07-security-and-secrets.md)
Only secret: GEMINI_API_KEY, injected at runtime via environment variable. Never committed.

## J. Reference data, FX, calendars, limits
Scope: Used (simulated)
All data is illustrative demo data — not real scheme limits, fees, FX rates, or regulatory
claims. Clearly marked as such in the UI and data files.

## K. Reconciliation & exception management
Scope: Not used (demo only). Simulated route decisions have no real value to reconcile.

## L. Observability across boundaries
Scope: Partial. Quarkus default logging. Structured correlation not yet wired (gap noted in
known gaps). Key paths emit basic Quarkus logs.

## M. UI & test automation stack
UI framework: React 18 + Vite + TypeScript
Design system: custom CSS (App.css, index.css); Leaflet for route map visuals; lucide-react icons
Test automation: Vitest (unit + component); no E2E/UI automation tool wired yet (gap —
browser visual smoke not verified; browser runtime unavailable in original build session)
Unit: cd frontend && npm test -- --run
Build/type-check: cd frontend && npm run typecheck && npm run build
