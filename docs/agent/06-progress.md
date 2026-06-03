# 06 — Progress

Codex must update this file after every completed or blocked backlog item.

## Current status
README demo walkthrough complete. Control Room UI complete. Fallback scenario complete with pre-PONR route activation and post-PONR investigation handling.

## Completed tasks
- 1. Create monorepo folders: `backend/`, `frontend/`, `docs/agent/`, `deployment/`.
- 2. Create backend Quarkus skeleton in `backend/`.
- 3. Create frontend React + Vite + TypeScript skeleton in `frontend/`.
- 4. Add root `README.md` explaining demo purpose and safety disclaimer.
- 5. Add `.gitignore` for Java, Node, build outputs and local secrets.
- 6. Add mock data files under `backend/src/main/resources/data/`.
- 7. Implement Java domain records/classes.
- 8. Implement ScenarioService and RouteCatalogueService loading data from JSON.
- 9. Add unit tests for loading scenarios and routes.
- 10. Implement UniversalHardGateEvaluator.
- 11. Implement RouteSpecificGateEvaluator for UK domestic, correspondent banking, local payout, stablecoin bridge and wallet-to-wallet stablecoin.
- 12. Ensure failed blocking gates mark route as EXCLUDED before scoring.
- 13. Add tests proving excluded routes are not scored.
- 14. Implement scoring profiles: FASTEST, CHEAPEST, MOST_TRANSPARENT, HIGHEST_CERTAINTY, BALANCED.
- 15. Implement RouteScoringService that scores only surviving routes.
- 16. Implement RouteDecisionService orchestrating candidate generation, gates, scoring, selection and fallback candidate.
- 17. Add tests for each scenario’s expected selected route.
- 18. Implement DecisionTraceService creating full trace for every decision.
- 19. Include candidate routes, gates, exclusions, scores, selected route, alternatives, finality, fallback and evidence references.
- 20. Add Quarkus REST API endpoint `POST /api/route-decisions`.
- 21. Add Quarkus REST API endpoint `GET /api/route-decisions/{traceId}`.
- 22. Add tests verifying trace structure for stablecoin bridge and international bank transfer.
- 23. Build ScenarioSelector component.
- 24. Build PaymentIntent view.
- 25. Build RouteComparison view.
- 26. Build LeafletRouteMap with simulated route lines and clearly labelled illustrative geography.
- 27. Build DecisionTracePanel with customer/executive/technical tabs.
- 28. Build GateResultTable and ScoreBreakdown components.
- 29. Build disclaimer banner stating no live payment connectivity.
- 30. Implement TraceRedactionService.
- 31. Implement GeminiExplanationService interface and deterministic TemplateExplanationService fallback.
- 32. Add configuration flag `GEMINI_ENABLED`.
- 33. Add Quarkus REST API endpoint `POST /api/explanations/route`.
- 34. Add frontend GeminiExplanationPanel.
- 35. Add tests ensuring Gemini receives no PII fields in redacted trace.
- 36. Implement PaymentState enum and PaymentStateMachineService.
- 37. Implement ExecutionSimulatorService using route legs.
- 38. Add Quarkus REST endpoints: `POST /api/payments/{traceId}/authorise`, `POST /api/payments/{traceId}/simulate/next`, `GET /api/payments/{traceId}/state`, `GET /api/payments/{traceId}/events`.
- 39. Build PaymentTracker UI.
- 40. Append execution events to Decision Trace.
- 41. Implement route degradation simulation before point-of-no-return.
- 42. Implement fallback evaluation and fallback event append.
- 43. Ensure post-point-of-no-return failures are not labelled fallback.
- 44. Add UI view for fallback event and updated route.
- 45. Build ControlRoom view with current state, PONR, fallback, gates, score, trace, AI boundary and events.
- 46. Add README demo walkthrough.

## In progress
None.

## Blocked
None.

## Last commands run
- `cd backend && ./mvnw test`
- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`

## Next task
47. Add deployment Dockerfile and Cloud Run demo notes.

## Change log format
When updating, use this format:

```text
YYYY-MM-DD HH:MM — Task <number>: <task title>
Change: <what changed>
Files: <files changed>
Commands: <commands run>
Result: <passed/failed/not run and why>
Next: <next backlog item>
Blockers: <none or details>
```

2026-06-03 22:18 — Task 1-5: Repository foundation
Change: Created monorepo folders, generated Quarkus backend skeleton, generated React + Vite + TypeScript frontend skeleton, verified existing README and root .gitignore, pinned backend Java release and JVM Docker image to Java 21, and added a frontend typecheck script.
Files: `backend/`, `frontend/`, `deployment/.gitkeep`, `README.md`, `.gitignore`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: `mvn io.quarkus.platform:quarkus-maven-plugin:create ...`, `npm create vite@latest frontend -- --template react-ts`, `cd frontend && npm install`, `cd backend && ./mvnw test`, `cd frontend && npm run typecheck`, `cd frontend && npm run build`
Result: passed. Backend tests passed with 1 test. Frontend typecheck and production build passed.
Next: Task 6. Add mock data files under `backend/src/main/resources/data/`.
Blockers: none

2026-06-03 22:22 — Task 6-9: Mock data and domain model
Change: Added simulated scenario, route catalogue, policy, evidence and execution-script JSON data; added Java domain records; added resource reader plus scenario, route catalogue and mock evidence services; added loader tests for scenarios and routes.
Files: `backend/src/main/java/com/routenavigator/domain/`, `backend/src/main/java/com/routenavigator/data/DataResourceReader.java`, `backend/src/main/java/com/routenavigator/service/`, `backend/src/main/resources/data/`, `backend/src/test/java/com/routenavigator/service/`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: `cd backend && ./mvnw test`
Result: passed. Backend tests passed with 3 tests.
Next: Task 10. Implement UniversalHardGateEvaluator.
Blockers: none

2026-06-03 22:24 — Task 10-13: Gate evaluation
Change: Added universal and route-specific hard gate evaluators, gate evaluation outcome model, pre-scoring surviving/excluded route boundary, and tests for traditional-only exclusions, wallet-to-wallet eligibility, and excluded route separation before scoring.
Files: `backend/src/main/java/com/routenavigator/domain/GateEvaluationOutcome.java`, `backend/src/main/java/com/routenavigator/service/UniversalHardGateEvaluator.java`, `backend/src/main/java/com/routenavigator/service/RouteSpecificGateEvaluator.java`, `backend/src/main/java/com/routenavigator/service/GateEvaluationService.java`, `backend/src/test/java/com/routenavigator/service/GateEvaluationServiceTest.java`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: `cd backend && ./mvnw test`
Result: passed. Backend tests passed with 6 tests.
Next: Task 14. Implement scoring profiles.
Blockers: none

2026-06-03 22:26 — Task 14-17: Scoring and route decision
Change: Added scoring profile loader, scoring service that accepts only surviving routes, route decision service that orchestrates gates, scoring, route selection and fallback candidate, and tests for all six scenario winners plus excluded-route scoring protection.
Files: `backend/src/main/java/com/routenavigator/domain/RouteDecisionResult.java`, `backend/src/main/java/com/routenavigator/service/ScoringProfileService.java`, `backend/src/main/java/com/routenavigator/service/RouteScoringService.java`, `backend/src/main/java/com/routenavigator/service/RouteDecisionService.java`, `backend/src/test/java/com/routenavigator/service/RouteDecisionServiceTest.java`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: `cd backend && ./mvnw test`
Result: passed. Backend tests passed with 9 tests.
Next: Task 18. Implement DecisionTraceService.
Blockers: none

2026-06-03 22:28 — Task 18-22: Decision Trace and APIs
Change: Added DecisionTraceService with in-memory trace storage, expanded trace fields for exclusions, alternatives, finality, PONR, fallback, evidence and AI boundary, added route-decision request DTO and REST endpoints for creating and retrieving traces, and added API plus trace-structure tests.
Files: `backend/src/main/java/com/routenavigator/domain/DecisionTrace.java`, `backend/src/main/java/com/routenavigator/api/RouteDecisionRequest.java`, `backend/src/main/java/com/routenavigator/api/RouteDecisionResource.java`, `backend/src/main/java/com/routenavigator/service/DecisionTraceService.java`, `backend/src/test/java/com/routenavigator/api/RouteDecisionResourceTest.java`, `backend/src/test/java/com/routenavigator/service/DecisionTraceServiceTest.java`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: `cd backend && ./mvnw test`
Result: passed. Backend tests passed with 12 tests.
Next: Task 23. Build ScenarioSelector component.
Blockers: none

2026-06-03 22:33 — Task 23-29: Frontend core UI
Change: Replaced the generated Vite starter with the Route Navigator dashboard, added static demo scenario data, scenario selector, payment intent view, route comparison, Leaflet route map, Decision Trace tabs, gate result table, score breakdown and visible simulation disclaimer.
Files: `frontend/src/App.tsx`, `frontend/src/App.css`, `frontend/src/index.css`, `frontend/src/types.ts`, `frontend/src/data/demoData.ts`, `frontend/src/components/`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/index.html`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: `cd frontend && npm install leaflet react-leaflet lucide-react`, `cd frontend && npm install -D @types/leaflet`, `cd frontend && npm run lint`, `cd frontend && npm run typecheck`, `cd frontend && npm run build`, `curl -I http://127.0.0.1:5173/`
Result: passed. Frontend lint, typecheck and production build passed. Local dev server returned HTTP 200. In-app browser visual smoke was attempted but the browser runtime failed to start in this session.
Next: Task 30. Implement TraceRedactionService.
Blockers: none

2026-06-03 22:36 — Task 30-35: Gemini explanation boundary
Change: Added trace redaction, GeminiExplanationService interface, deterministic template fallback, default-off `gemini.enabled` config, route explanation API endpoint, frontend GeminiExplanationPanel and redaction/API tests proving PII-like fields are masked before explanation.
Files: `backend/src/main/resources/application.properties`, `backend/src/main/java/com/routenavigator/api/RouteExplanationRequest.java`, `backend/src/main/java/com/routenavigator/api/RouteExplanationResource.java`, `backend/src/main/java/com/routenavigator/domain/RouteExplanationResponse.java`, `backend/src/main/java/com/routenavigator/service/TraceRedactionService.java`, `backend/src/main/java/com/routenavigator/service/GeminiExplanationService.java`, `backend/src/main/java/com/routenavigator/service/TemplateExplanationService.java`, `backend/src/test/java/com/routenavigator/api/RouteExplanationResourceTest.java`, `backend/src/test/java/com/routenavigator/service/TraceRedactionServiceTest.java`, `frontend/src/components/GeminiExplanationPanel.tsx`, `frontend/src/components/DecisionTracePanel.tsx`, `frontend/src/App.css`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: `cd backend && ./mvnw test`, `cd frontend && npm run lint`, `cd frontend && npm run typecheck`, `cd frontend && npm run build`
Result: passed. Backend tests passed with 14 tests. Frontend lint, typecheck and production build passed.
Next: Task 36. Implement PaymentState enum and PaymentStateMachineService.
Blockers: none

2026-06-03 22:38 — Task 36-40: Execution simulator and state machine
Change: Added payment state enum, state machine service, execution simulator using selected route legs, authorise/simulate/state/events payment APIs, Decision Trace execution-event append support, backend tests, and frontend PaymentTracker component.
Files: `backend/src/main/java/com/routenavigator/domain/PaymentState.java`, `backend/src/main/java/com/routenavigator/domain/PaymentExecutionSnapshot.java`, `backend/src/main/java/com/routenavigator/api/PaymentExecutionResource.java`, `backend/src/main/java/com/routenavigator/service/PaymentStateMachineService.java`, `backend/src/main/java/com/routenavigator/service/ExecutionSimulatorService.java`, `backend/src/main/java/com/routenavigator/service/DecisionTraceService.java`, `backend/src/test/java/com/routenavigator/api/PaymentExecutionResourceTest.java`, `backend/src/test/java/com/routenavigator/service/PaymentStateMachineServiceTest.java`, `frontend/src/components/PaymentTracker.tsx`, `frontend/src/App.tsx`, `frontend/src/App.css`, `frontend/src/data/demoData.ts`, `frontend/src/types.ts`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: `cd backend && ./mvnw test`, `cd frontend && npm run lint`, `cd frontend && npm run typecheck`, `cd frontend && npm run build`
Result: passed. Backend tests passed with 16 tests. Frontend lint, typecheck and production build passed.
Next: Task 41. Implement route degradation simulation before point-of-no-return.
Blockers: none

2026-06-03 22:42 — Task 41-44: Fallback scenario
Change: Added `simulate/degradation` payment API, active-route execution snapshots, pre-PONR fallback activation to the deterministic fallback candidate, post-PONR investigation handling with no fallback labelling, backend API tests for both branches, and a frontend fallback event panel showing the updated active route.
Files: `backend/src/main/java/com/routenavigator/domain/PaymentExecutionSnapshot.java`, `backend/src/main/java/com/routenavigator/api/PaymentExecutionResource.java`, `backend/src/main/java/com/routenavigator/service/ExecutionSimulatorService.java`, `backend/src/test/java/com/routenavigator/api/PaymentExecutionResourceTest.java`, `frontend/src/components/FallbackEventView.tsx`, `frontend/src/App.tsx`, `frontend/src/App.css`, `frontend/src/data/demoData.ts`, `frontend/src/types.ts`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: `cd backend && ./mvnw test -Dtest=PaymentExecutionResourceTest`, `cd backend && ./mvnw test`, `cd frontend && npm run lint`, `cd frontend && npm run typecheck`, `cd frontend && npm run build`
Result: passed. Backend tests passed with 18 tests. Frontend lint, typecheck and production build passed.
Next: Task 45. Build ControlRoom view with current state, PONR, fallback, gates, score, trace, AI boundary and events.
Blockers: none

2026-06-03 22:44 — Task 45: ControlRoom view
Change: Added a ControlRoom dashboard band with current state, selected and active route, PONR status, fallback status, gate summary, selected-route score, trace ID, AI boundary and recent events.
Files: `frontend/src/components/ControlRoom.tsx`, `frontend/src/App.tsx`, `frontend/src/App.css`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: `cd frontend && npm run lint`, `cd frontend && npm run typecheck`, `cd frontend && npm run build`, `curl -I http://127.0.0.1:5173/`
Result: passed. Frontend lint, typecheck and production build passed. Local dev server returned HTTP 200. In-app browser visual smoke could not run because the browser runtime failed to start in this session.
Next: Task 46. Add README demo walkthrough.
Blockers: none

2026-06-03 22:45 — Task 46: README demo walkthrough
Change: Added local run commands, test/build commands, six-scenario demo walkthrough, backend API examples, AI boundary and PostgreSQL-ready persistence notes.
Files: `README.md`, `docs/agent/03-backlog.md`, `docs/agent/06-progress.md`
Commands: not run; documentation-only change.
Result: not run; documentation-only change.
Next: Task 47. Add deployment Dockerfile and Cloud Run demo notes.
Blockers: none
