# 01 — Architecture Rules

## Stack rules
Backend must be Java Quarkus. APIs must be REST endpoints served by Quarkus. Frontend must be React + Vite + TypeScript. Map-style route visuals must use Leaflet. Gemini integration must be wrapped behind a backend service. Initial data must be local JSON/YAML mock data. Do not add a database for the initial MVP; PostgreSQL is the preferred later database if saved routes, users, or persistent audit/history become required.

## Service boundaries
Implement these backend concepts as separate classes/services even if in one Quarkus app initially:
- PaymentIntentService
- ScenarioService
- RouteCatalogueService
- GateEvaluationService
- RouteScoringService
- RouteDecisionService
- DecisionTraceService
- TraceRedactionService
- GeminiExplanationService
- PaymentStateMachineService
- ExecutionSimulatorService
- AuditEventService
- MockEvidenceService

## Domain flow
```text
ConfirmedPaymentIntent
  -> CandidateRoutes
  -> UniversalHardGates
  -> RouteSpecificHardGates
  -> Exclusions/Referrals
  -> ScoringOfSurvivingRoutes
  -> SelectedRoute
  -> FallbackCandidate
  -> DecisionTrace
  -> RedactedTrace
  -> GeminiExplanation
```

## Hard gates before scoring
Never score a route that failed a blocking hard gate. Excluded routes should appear in the Decision Trace as `EXCLUDED`, not as low-scoring alternatives.

## Decision Trace
Every route decision must produce a Decision Trace containing:
- trace header and versions;
- customer intent;
- candidate routes;
- gate results;
- excluded routes;
- score results;
- selected route;
- why alternatives did not win;
- finality and reversibility;
- point-of-no-return;
- fallback model;
- evidence references;
- AI explanation metadata;
- execution events when simulated.

## Gemini boundary
Gemini service may expose:
- generateRouteExplanation(redactedDecisionTrace)
- generateAlternativeExplanation(redactedDecisionTrace, routeId)
- generatePaymentStatusExplanation(redactedState)
- generateExceptionSummary(redactedTraceAndEvents)

Gemini service must not expose:
- selectRoute()
- scoreRoutes()
- approvePayment()
- executePayment()
- updatePaymentState()
- overrideCompliance()

## Terminology rules
Customer labels:
- Instant UK bank transfer
- High-value UK bank transfer
- European instant bank transfer
- International bank transfer
- Local payout route
- Fast digital-dollar route
- Digital-dollar wallet transfer
- Same-platform transfer
- Bank token route

Internal families:
- UK_DOMESTIC_INSTANT
- UK_HIGH_VALUE_DOMESTIC
- EUROPEAN_INSTANT_CREDIT_TRANSFER
- CORRESPONDENT_BANKING
- LOCAL_PAYOUT_PARTNER
- INTERNAL_BOOK_TRANSFER
- STABLECOIN_BRIDGE_FIAT_PAYOUT
- WALLET_TO_WALLET_STABLECOIN
- TOKENISED_DEPOSIT

Do not use `SWIFT_GPI` as a route family.

## State machine rules
- Route selection is not execution.
- Execution is not finality.
- Token confirmation is not always beneficiary usable value.
- gpi tracking is not finality.
- Fallback only pre-point-of-no-return.
- Post-point-of-no-return issues are servicing/investigation flows.

## UI rules
Customer view must be simple. Internal/control-room view must show technical depth.

Show three levels:
1. Customer route recommendation.
2. Executive explanation.
3. Technical Decision Trace.

Use Leaflet for any map-style or route-path visualization. Keep the map visual illustrative and simulated; it must not imply live geospatial routing, live payment connectivity, or real partner availability.

## Demo safety rules
All demo data must be simulated. Include visible disclaimer in UI.
