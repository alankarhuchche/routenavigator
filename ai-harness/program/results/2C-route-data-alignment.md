# Phase 2C Result — Route Data Alignment Frontend/Backend

## Summary

Phase 2C found a real frontend/backend data drift, but the safe fix is not data-only.

Frontend demo data includes scenarios `SCN-001` through `SCN-011`. Backend mock scenario data currently includes `SCN-001` through `SCN-006`.

The missing frontend scenarios are:

- `SCN-007` GBP to India (INR)
- `SCN-008` GBP to China (CNY)
- `SCN-009` GBP to EU (EUR)
- `SCN-010` GBP to Australia (AUD)
- `SCN-011` GBP to UAE (AED)

## Files Inspected

- `frontend/src/data/demoData.ts`
- `backend/src/main/resources/data/scenarios.json`
- `backend/src/main/resources/data/route-catalogue.json`
- `backend/src/main/resources/data/mock-compliance.json`
- `backend/src/main/resources/data/mock-route-health.json`
- `backend/src/main/java/com/routenavigator/service/RouteSpecificGateEvaluator.java`
- `backend/src/main/java/com/routenavigator/service/RouteScoringService.java`
- `backend/src/test/java/com/routenavigator/api/RouteDecisionEdgeCasesTest.java`
- `backend/src/test/java/com/routenavigator/service/ScenarioServiceTest.java`

## Mismatches Found

| Area | Frontend | Backend | Impact |
| --- | --- | --- | --- |
| Scenario coverage | `SCN-001` to `SCN-011` | `SCN-001` to `SCN-006` | Selecting scenarios 7-11 in the UI causes the API call to miss backend scenario data and fall back to static demo data. |
| Corridor-specific route IDs | Uses IDs such as `route-correspondent-banking-india`, `route-local-payout-eu`, `route-stablecoin-bridge-au` | Catalogue has only generic route IDs such as `route-correspondent-banking`, `route-local-payout-partner`, `route-stablecoin-bridge-fiat-payout` | Data-only alignment would either require adding many catalogue routes or remapping frontend scenarios. |
| Corridor eligibility | India, China, EU, Australia and UAE corridor scenarios exist in frontend copy | Route-specific gates only allow UK domestic, US bank account payout, US stablecoin payout and USDC wallet routes | Supporting corridor scenarios in backend would require route eligibility logic changes, which is a human gate. |
| Compliance/health fixtures | Frontend has scenarios 7-11 | Backend `mock-compliance.json` and `mock-route-health.json` only cover existing generic routes/scenarios | Adding fixture rows alone would not make backend decisions valid. |
| Tests | Frontend scenarios 7-11 are demo fixtures | Backend tests assert six backend scenarios | Expanding backend scenario count safely requires route logic and test updates. |

## Decision

No frontend/backend data changes were made in this phase because true alignment for scenarios 7-11 requires a backend route eligibility decision.

This crosses the human gate for route decision logic / product scope because the backend currently does not model non-US international payout corridors.

## 2C-fix Resolution

The approved hybrid option was applied as a frontend-only fix.

Scenarios `SCN-007` through `SCN-011` remain available as illustrative corridor demos, but are now explicitly labelled as static frontend scenarios. They do not imply backend deterministic route-engine support.

When one of these corridor scenarios is analysed, the frontend uses the existing static trace directly and shows a clear notice that backend corridor route support is deferred. Backend route-decision, classifier and explanation endpoints are not called for those static corridor demos.

No backend route support was added. No backend route decision logic, API contracts or deployment files were changed.

## Recommended Next Decision

Choose one of these before implementing alignment:

1. **Backend corridor support:** explicitly approve adding corridor-aware backend route/data support for India, China, EU, Australia and UAE.
2. **Frontend scenario reduction:** remove or hide scenarios 7-11 from API-backed flows and keep them as static demo-only examples.
3. **Hybrid:** keep scenarios 7-11 frontend-only but label them as static corridor demos until backend support is approved. Applied by Phase 2C-fix.

## Safety Result

No unsafe claims were introduced. No live integrations, real rails, production data or settlement guarantees were added.
