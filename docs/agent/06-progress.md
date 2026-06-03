# 06 — Progress

Codex must update this file after every completed or blocked backlog item.

## Current status
Decision Trace and route-decision APIs complete. Backend and frontend skeletons build successfully.

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

## In progress
None.

## Blocked
None.

## Last commands run
- `cd backend && ./mvnw test`

## Next task
23. Build ScenarioSelector component.

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
