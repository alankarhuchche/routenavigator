# 03 — Backlog

Work through these tasks in order. Do not skip ahead unless blocked.

## Epic 1 — Repository foundation
- [x] 1. Create monorepo folders: `backend/`, `frontend/`, `docs/agent/`, `deployment/`.
- [x] 2. Create backend Quarkus skeleton in `backend/`.
- [x] 3. Create frontend React + Vite + TypeScript skeleton in `frontend/`.
- [x] 4. Add root `README.md` explaining demo purpose and safety disclaimer.
- [x] 5. Add `.gitignore` for Java, Node, build outputs and local secrets.

## Epic 2 — Mock data and domain model
- [x] 6. Add mock data files under `backend/src/main/resources/data/`: `scenarios.json`, `route-catalogue.json`, `gate-policies.json`, `scoring-policies.json`, `reason-codes.json`, `mock-fx-quotes.json`, `mock-liquidity.json`, `mock-compliance.json`, `mock-route-health.json`, `mock-beneficiaries.json`, `execution-scripts.json`.
- [x] 7. Implement Java domain records/classes for PaymentIntent, RouteCandidate, CanonicalRoute, RouteLeg, GateResult, ScoreResult, DecisionTrace, EvidenceReference, ExecutionEvent.
- [x] 8. Implement ScenarioService and RouteCatalogueService loading data from JSON.
- [x] 9. Add unit tests for loading scenarios and routes.

## Epic 3 — Gate evaluation
- [x] 10. Implement UniversalHardGateEvaluator.
- [x] 11. Implement RouteSpecificGateEvaluator for UK domestic, correspondent banking, local payout, stablecoin bridge and wallet-to-wallet stablecoin.
- [x] 12. Ensure failed blocking gates mark route as EXCLUDED before scoring.
- [x] 13. Add tests proving excluded routes are not scored.

## Epic 4 — Scoring and route decision
- [x] 14. Implement scoring profiles: FASTEST, CHEAPEST, MOST_TRANSPARENT, HIGHEST_CERTAINTY, BALANCED.
- [x] 15. Implement RouteScoringService that scores only surviving routes.
- [x] 16. Implement RouteDecisionService orchestrating candidate generation, gates, scoring, selection and fallback candidate.
- [x] 17. Add tests for each scenario’s expected selected route.

## Epic 5 — Decision Trace
- [ ] 18. Implement DecisionTraceService creating full trace for every decision.
- [ ] 19. Include candidate routes, gates, exclusions, scores, selected route, alternatives, finality, fallback and evidence references.
- [ ] 20. Add Quarkus REST API endpoint `POST /api/route-decisions`.
- [ ] 21. Add Quarkus REST API endpoint `GET /api/route-decisions/{traceId}`.
- [ ] 22. Add tests verifying trace structure for stablecoin bridge and international bank transfer.

## Epic 6 — Frontend core UI
- [ ] 23. Build ScenarioSelector component.
- [ ] 24. Build PaymentIntent view.
- [ ] 25. Build RouteComparison view.
- [ ] 26. Build LeafletRouteMap with simulated route lines and clearly labelled illustrative geography.
- [ ] 27. Build DecisionTracePanel with customer/executive/technical tabs.
- [ ] 28. Build GateResultTable and ScoreBreakdown components.
- [ ] 29. Build disclaimer banner stating no live payment connectivity.

## Epic 7 — Gemini explanation
- [ ] 30. Implement TraceRedactionService.
- [ ] 31. Implement GeminiExplanationService interface and deterministic TemplateExplanationService fallback.
- [ ] 32. Add configuration flag `GEMINI_ENABLED`.
- [ ] 33. Add Quarkus REST API endpoint `POST /api/explanations/route`.
- [ ] 34. Add frontend GeminiExplanationPanel.
- [ ] 35. Add tests ensuring Gemini receives no PII fields in redacted trace.

## Epic 8 — Execution simulator and state machine
- [ ] 36. Implement PaymentState enum and PaymentStateMachineService.
- [ ] 37. Implement ExecutionSimulatorService using route legs.
- [ ] 38. Add Quarkus REST endpoints: `POST /api/payments/{traceId}/authorise`, `POST /api/payments/{traceId}/simulate/next`, `GET /api/payments/{traceId}/state`, `GET /api/payments/{traceId}/events`.
- [ ] 39. Build PaymentTracker UI.
- [ ] 40. Append execution events to Decision Trace.

## Epic 9 — Fallback scenario
- [ ] 41. Implement route degradation simulation before point-of-no-return.
- [ ] 42. Implement fallback evaluation and fallback event append.
- [ ] 43. Ensure post-point-of-no-return failures are not labelled fallback.
- [ ] 44. Add UI view for fallback event and updated route.

## Epic 10 — Control room and polish
- [ ] 45. Build ControlRoom view with current state, PONR, fallback, gates, score, trace, AI boundary and events.
- [ ] 46. Add README demo walkthrough.
- [ ] 47. Add deployment Dockerfile and Cloud Run demo notes.
- [ ] 48. Run full backend tests and frontend build.
- [ ] 49. Update `docs/agent/06-progress.md` with final status and known gaps.
