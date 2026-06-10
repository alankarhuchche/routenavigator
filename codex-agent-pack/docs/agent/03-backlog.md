# 03 — Backlog

Work through these tasks in order. Do not skip ahead unless blocked.

## Epic 1 — Repository foundation
- [ ] 1. Create monorepo folders: `backend/`, `frontend/`, `docs/agent/`, `deployment/`.
- [ ] 2. Create backend Quarkus skeleton in `backend/`.
- [ ] 3. Create frontend React TypeScript skeleton in `frontend/`.
- [ ] 4. Add root `README.md` explaining demo purpose and safety disclaimer.
- [ ] 5. Add `.gitignore` for Java, Node, build outputs and local secrets.

## Epic 2 — Mock data and domain model
- [ ] 6. Add mock data files under `backend/src/main/resources/data/`: `scenarios.json`, `route-catalogue.json`, `gate-policies.json`, `scoring-policies.json`, `reason-codes.json`, `mock-fx-quotes.json`, `mock-liquidity.json`, `mock-compliance.json`, `mock-route-health.json`, `mock-beneficiaries.json`, `execution-scripts.json`.
- [ ] 7. Implement Java domain records/classes for PaymentIntent, RouteCandidate, CanonicalRoute, RouteLeg, GateResult, ScoreResult, DecisionTrace, EvidenceReference, ExecutionEvent.
- [ ] 8. Implement ScenarioService and RouteCatalogueService loading data from JSON.
- [ ] 9. Add unit tests for loading scenarios and routes.

## Epic 3 — Gate evaluation
- [ ] 10. Implement UniversalHardGateEvaluator.
- [ ] 11. Implement RouteSpecificGateEvaluator for UK domestic, correspondent banking, local payout, stablecoin bridge and wallet-to-wallet stablecoin.
- [ ] 12. Ensure failed blocking gates mark route as EXCLUDED before scoring.
- [ ] 13. Add tests proving excluded routes are not scored.

## Epic 4 — Scoring and route decision
- [ ] 14. Implement scoring profiles: FASTEST, CHEAPEST, MOST_TRANSPARENT, HIGHEST_CERTAINTY, BALANCED.
- [ ] 15. Implement RouteScoringService that scores only surviving routes.
- [ ] 16. Implement RouteDecisionService orchestrating candidate generation, gates, scoring, selection and fallback candidate.
- [ ] 17. Add tests for each scenario’s expected selected route.

## Epic 5 — Decision Trace
- [ ] 18. Implement DecisionTraceService creating full trace for every decision.
- [ ] 19. Include candidate routes, gates, exclusions, scores, selected route, alternatives, finality, fallback and evidence references.
- [ ] 20. Add API endpoint `POST /api/route-decisions`.
- [ ] 21. Add API endpoint `GET /api/route-decisions/{traceId}`.
- [ ] 22. Add tests verifying trace structure for stablecoin bridge and international bank transfer.

## Epic 6 — Frontend core UI
- [ ] 23. Build ScenarioSelector component.
- [ ] 24. Build PaymentIntent view.
- [ ] 25. Build RouteComparison view.
- [ ] 26. Build DecisionTracePanel with customer/executive/technical tabs.
- [ ] 27. Build GateResultTable and ScoreBreakdown components.
- [ ] 28. Build disclaimer banner stating no live payment connectivity.

## Epic 7 — Gemini explanation
- [ ] 29. Implement TraceRedactionService.
- [ ] 30. Implement GeminiExplanationService interface and deterministic TemplateExplanationService fallback.
- [ ] 31. Add configuration flag `GEMINI_ENABLED`.
- [ ] 32. Add API endpoint `POST /api/explanations/route`.
- [ ] 33. Add frontend GeminiExplanationPanel.
- [ ] 34. Add tests ensuring Gemini receives no PII fields in redacted trace.

## Epic 8 — Execution simulator and state machine
- [ ] 35. Implement PaymentState enum and PaymentStateMachineService.
- [ ] 36. Implement ExecutionSimulatorService using route legs.
- [ ] 37. Add endpoints: `POST /api/payments/{traceId}/authorise`, `POST /api/payments/{traceId}/simulate/next`, `GET /api/payments/{traceId}/state`, `GET /api/payments/{traceId}/events`.
- [ ] 38. Build PaymentTracker UI.
- [ ] 39. Append execution events to Decision Trace.

## Epic 9 — Fallback scenario
- [ ] 40. Implement route degradation simulation before point-of-no-return.
- [ ] 41. Implement fallback evaluation and fallback event append.
- [ ] 42. Ensure post-point-of-no-return failures are not labelled fallback.
- [ ] 43. Add UI view for fallback event and updated route.

## Epic 10 — Control room and polish
- [ ] 44. Build ControlRoom view with current state, PONR, fallback, gates, score, trace, AI boundary and events.
- [ ] 45. Add README demo walkthrough.
- [ ] 46. Add deployment Dockerfile and optional Cloud Run notes.
- [ ] 47. Run full backend tests and frontend build.
- [ ] 48. Update `docs/agent/06-progress.md` with final status and known gaps.
