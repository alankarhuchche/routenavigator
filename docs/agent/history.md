# History — add-only log (never edit past entries; corrections are new entries)

## Entry format
```
YYYY-MM-DD HH:MM — Item <id>: <title>
Change: <what changed>
Files: <files>
Commands: <commands + real outputs>
Evidence: <test summary / build log / screenshot path>
ADRs: <refs, if any>
Result: passed / failed / blocked
Next: <next item>
Blockers: <none or detail>
```

---

2026-06-03 22:18 — Items 1-5: Repository foundation
Change: Monorepo folders, Quarkus backend skeleton, React+Vite+TS frontend skeleton, README, .gitignore.
Commands: mvn quarkus:create, npm create vite, cd backend && ./mvnw test, cd frontend && npm run typecheck && npm run build
Evidence: Backend 1/1 passed. Frontend typecheck and build clean.
Result: passed. Next: Item 6.

2026-06-03 22:22 — Items 6-9: Mock data and domain model
Change: Scenario/route/policy/evidence JSON data; Java domain records; ScenarioService, RouteCatalogueService, MockEvidenceService; loader tests.
Commands: cd backend && ./mvnw test
Evidence: 3/3 passed.
Result: passed. Next: Item 10.

2026-06-03 22:24 — Items 10-13: Gate evaluation
Change: UniversalHardGateEvaluator, RouteSpecificGateEvaluator, GateEvaluationService, GateEvaluationOutcome; tests for exclusions and scoring boundary.
Commands: cd backend && ./mvnw test
Evidence: 6/6 passed.
Result: passed. Next: Item 14.

2026-06-03 22:26 — Items 14-17: Scoring and route decision
Change: Scoring profiles (FASTEST/CHEAPEST/MOST_TRANSPARENT/HIGHEST_CERTAINTY/BALANCED), RouteScoringService, RouteDecisionService, RouteDecisionResult; tests for all 6 scenario winners.
Commands: cd backend && ./mvnw test
Evidence: 9/9 passed.
Result: passed. Next: Item 18.

2026-06-03 22:28 — Items 18-22: Decision Trace and APIs
Change: DecisionTraceService (in-memory), DecisionTrace domain (exclusions, alternatives, finality, PONR, fallback, evidence, AI boundary), RouteDecisionResource (POST + GET); API and trace-structure tests.
Commands: cd backend && ./mvnw test
Evidence: 12/12 passed.
Result: passed. Next: Item 23.

2026-06-03 22:33 — Items 23-29: Frontend core UI
Change: ScenarioSelector, PaymentIntentView, RouteComparison, LeafletRouteMap, DecisionTracePanel (3 tabs), GateResultTable, ScoreBreakdown, disclaimer banner; static demo data.
Commands: cd frontend && npm run lint && npm run typecheck && npm run build
Evidence: lint clean, 0 TS errors, production build clean. Dev server HTTP 200.
Result: passed. Next: Item 30.

2026-06-03 22:36 — Items 30-35: Gemini boundary
Change: TraceRedactionService, GeminiExplanationService interface, TemplateExplanationService fallback, gemini.enabled flag, /api/explanations/route endpoint, GeminiExplanationPanel; redaction and PII-mask tests.
Commands: cd backend && ./mvnw test · cd frontend && npm run lint && npm run typecheck && npm run build
Evidence: 14/14 backend passed. Frontend clean.
Result: passed. Next: Item 36.

2026-06-03 22:38 — Items 36-40: Execution simulator and state machine
Change: PaymentState enum, PaymentStateMachineService, ExecutionSimulatorService, authorise/simulate/state/events endpoints, PaymentTracker UI, execution-event append to DecisionTrace.
Commands: cd backend && ./mvnw test · cd frontend && npm run lint && npm run typecheck && npm run build
Evidence: 16/16 backend passed. Frontend clean.
Result: passed. Next: Item 41.

2026-06-03 22:42 — Items 41-44: Fallback scenario
Change: simulate/degradation endpoint, pre-PONR fallback to fallback candidate, post-PONR investigation (not labelled fallback), FallbackEventView UI.
Commands: cd backend && ./mvnw test · cd frontend && npm run lint && npm run typecheck && npm run build
Evidence: 18/18 backend passed. Frontend clean.
Result: passed. Next: Item 45.

2026-06-03 22:44 — Item 45: ControlRoom view
Change: ControlRoom dashboard (state, routes, PONR, fallback, gates, score, trace ID, AI boundary, events).
Commands: cd frontend && npm run lint && npm run typecheck && npm run build
Evidence: Frontend clean. Dev server HTTP 200. Browser visual smoke not run (runtime unavailable).
Result: passed with gap. Next: Item 46.

2026-06-03 22:45 — Item 46: README walkthrough
Change: Local run commands, test/build commands, 6-scenario walkthrough, API examples, AI boundary notes, PostgreSQL-ready notes.
Result: passed (docs only). Next: Item 47.

2026-06-03 22:47 — Item 47: Deployment packaging
Change: Multi-stage Dockerfile (builds React, serves from Quarkus), Cloud Run notes, Quarkus host/port config, .dockerignore.
Commands: cd backend && ./mvnw test && ./mvnw package -DskipTests · cd frontend && npm run build
Evidence: 18/18 backend passed. Package clean. Frontend build clean. Docker not installed locally — container build not verified here.
Result: passed with gap (Docker). Next: Item 48.

2026-06-03 22:48 — Items 48-49: Full verification and final status
Commands: cd backend && ./mvnw test && ./mvnw package -DskipTests · cd frontend && npm run lint && npm run typecheck && npm run build
Evidence: 18/18 backend. Package clean. Frontend lint/typecheck/build all clean.
Result: passed. MVP backlog complete.

2026-06-03 — Post-MVP: Real Gemini explanation service
Change: RealGeminiExplanationService (MicroProfile REST Client → Gemini 2.0 Flash), GeminiApiClient, GeminiServiceProducer (CDI, selects real vs template). Activates when GEMINI_ENABLED=true AND GEMINI_API_KEY set; falls back on any error.
Commands: cd backend && ./mvnw test
Evidence: 18/18 passed.
Result: passed.

2026-06-03 — Post-MVP: Journey-based UX restructure
Change: 3-step flow (Intent → Route Analysis → Execution); StepIndicator; DecisionTrace panel wider; ControlRoom in Step 3.
Commands: cd frontend && npm run typecheck && npm run build
Evidence: 0 TS errors, production build clean.
Result: passed.

2026-06-09 — Harness migration to payments-agent-harness v0.6.1 contract
Change: Replaced legacy AGENTS.md with the new contract; added STATE.md, history.md (this file), 04 updated to 5-bucket acceptance criteria, 05 renamed from 05-demo-scenarios.md, new docs 06–09, adr/ folder.
Result: migration complete.
