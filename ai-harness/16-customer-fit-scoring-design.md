# Bounded Customer-Fit Scoring Design

Phase: 4E-design

Status: Design complete. No runtime scoring, API, backend route decision, payment execution, dependency, push or deploy changes were made.

## Purpose

Customer insight may help the bank explain and, in a future implementation, gently rank otherwise eligible money movement routes. It must never weaken hard controls, give Gemini decision authority, or make unsafe claims about eligibility, finality or execution.

Product thesis:

> The customer asks to move money. The bank uses consented customer insight, controls and route intelligence to choose the best safe way. AI structures and explains; the bank decides; the customer approves.

## Current Route Decision Model

### Entry Point

- `POST /api/route-decisions` is implemented by `backend/src/main/java/com/routenavigator/api/RouteDecisionResource.java`.
- `RouteDecisionRequest` currently accepts either:
  - `scenarioId`
  - `paymentIntent`
- There is no customer insight field in the request today.

### Eligibility And Gates

- `RouteDecisionService.decide(intent)` calls `GateEvaluationService.evaluate(intent, routeCatalogueService.findAll())`.
- `GateEvaluationService` evaluates all catalogue routes through:
  - `UniversalHardGateEvaluator`
  - `RouteSpecificGateEvaluator`
- A route becomes `AVAILABLE` only if all blocking gates pass.
- A route becomes `EXCLUDED` if any blocking gate fails.
- Only surviving `AVAILABLE` routes are sent to scoring.

Current universal hard gates:

- `COMPLIANCE`
- `SANCTIONS`
- `VALID_AMOUNT`
- `LIQUIDITY`
- `ROUTE_HEALTH`

Current route-specific gates:

- `CUSTOMER_CONSTRAINT`
- `ROUTE_FAMILY_ELIGIBILITY`

Current code simulates several real-world gates. Future design language should map these to fraud, sanctions, limits, eligibility, regulatory restrictions, beneficiary validation, account/customer restrictions and scheme/rail availability.

### Scoring And Selection

- `RouteScoringService.score(intent, survivingRoutes)` scores only surviving routes.
- It rejects non-surviving routes with an `IllegalArgumentException`.
- Current route quality dimensions are:
  - `speed`
  - `cost`
  - `certainty`
  - `transparency`
- Objective weights come from `backend/src/main/resources/data/scoring-policies.json`.
- `RouteDecisionService` selects the route with the highest `ScoreResult.totalScore`, with route ID as deterministic tie-breaker.

### Current Limitations

- Customer insight exists only in frontend mock data.
- Backend route decision requests do not carry customer insight.
- `ScoreResult` has only `totalScore`, `dimensions` and `reasons`; it does not distinguish base route score, customer-fit adjustment or final score.
- Decision Trace does not expose customer-fit score contribution, cap, signals, consent state or no-insight state.
- Frontend explains customer fit, but route ranking is unchanged.

## Hard-Control Gating Model

Hard controls always run before customer-fit scoring. If a route fails a hard control, customer insight can never make it eligible.

Mandatory hard-control categories:

- Fraud controls
- Sanctions screening
- Payment and account limits
- Route and beneficiary eligibility
- Regulatory restrictions
- Beneficiary validation
- Account/customer restrictions
- Scheme, rail, corridor and route availability

Rules:

- Hard-control gates are binary eligibility boundaries.
- Customer-fit scoring is not evaluated for excluded routes.
- Customer-fit scoring cannot flip `EXCLUDED` to `AVAILABLE`.
- Customer-fit scoring cannot suppress, hide or relabel failed-gate reasons.
- Customer-fit scoring cannot justify a route that violates customer consent, route eligibility, destination restrictions or regulatory policy.

## Bounded Customer-Fit Score

Customer-fit scoring should be a capped adjustment applied only after hard controls pass.

Recommended model:

```text
base_route_score = weighted route quality score from speed/cost/certainty/transparency
customer_fit_raw = sum of bounded insight signal adjustments
customer_fit_adjustment = clamp(customer_fit_raw, -5, +10)
final_score = clamp(base_route_score + customer_fit_adjustment, 0, 100)
```

Alternative percentage model:

```text
base_route_score contributes at least 85-90% of ranking
customer_fit contributes at most 10-15% of ranking
```

Guardrails:

- Customer fit applies only to routes that passed all blocking gates.
- Customer fit can break ties or gently nudge between eligible routes.
- Customer fit cannot override material speed, cost, certainty, finality or control disadvantages unless there is an explicit policy reason and the route remains eligible.
- Negative customer-fit adjustments are allowed when prior experience, consent or preferences make an eligible route less suitable.
- If customer insight is stale, missing, unconsented or switched off, customer-fit adjustment must be `0`.

## Customer-Fit Signals

| Signal | Input | Scoring Effect | Cap | Explanation Wording | Safety Caveat |
| --- | --- | --- | --- | --- | --- |
| Purpose fit | `purposeDetected`, structured intent purpose | Boost routes aligned to the purpose outcome, such as family support needing speed/certainty | `+2` | "This route fits the stated purpose because certainty and timely receipt matter." | Purpose must be declared or consented; do not infer sensitive purpose. |
| Beneficiary familiarity | `beneficiaryRelationship` | Small boost for routes suitable for a previously paid beneficiary | `+1.5` | "The beneficiary is represented as previously paid, reducing friction in this demo context." | Familiarity cannot bypass beneficiary validation or sanctions. |
| Typical amount range | `typicalAmountRange`, current amount | Boost normal-pattern routes; small negative if outside pattern requiring more care | `+1.5 / -2` | "The amount is within the customer's usual movement range." | Outside-pattern status must not imply wrongdoing; it may only trigger care/explanation. |
| Tracking preference | `trackingPreference`, route transparency dimension | Boost high-transparency routes when tracking preference is high | `+2` | "This route supports the customer's preference for visibility and tracking." | Tracking preference cannot override failed controls or route unavailability. |
| Speed preference | `speedPreference`, route speed dimension | Boost faster eligible routes when speed preference is high | `+2` | "The route better fits the customer's preference for timely receipt." | Do not claim guaranteed instant settlement. |
| Fee sensitivity | `feeSensitivity`, route cost dimension | Boost lower-cost eligible routes when fee sensitivity is high | `+1.5` | "This route better balances cost for a fee-sensitive customer." | Fee preference cannot override certainty or compliance requirements. |
| Previous route delay | `previousRouteExperience`, route family | Negative adjustment for a route family with prior delay; positive for routes that avoid it | `+2 / -3` | "This recommendation avoids a route family that previously caused delay." | Prior experience is explanatory and must be auditable; do not overfit one incident. |
| Digital route consent | `digitalRoutesAllowed`, route family | Permit customer-fit consideration for digital routes only when consent allows | `+1` | "Digital options were considered because the customer allowed them." | Consent does not replace route eligibility, wallet/off-ramp checks or regulation. |
| Risk normality | `riskNormality` | Small boost when amount and beneficiary are normal; no boost when unknown | `+1` | "The movement is represented as within the customer's normal pattern." | Must not use protected characteristics or infer vulnerability without governance. |

Maximum positive adjustment should be capped at `+10` points or 10-15% of total scoring weight. Maximum negative adjustment should be capped so a route remains explainable and reviewable, for example `-5`, unless a future risk-control model explicitly moves a concern into hard-gate logic.

## No-Insight Behaviour

If the customer chooses "Analyse without customer insight":

- No customer-fit score is applied.
- Customer-fit adjustment is `0`.
- Ranking uses confirmed intent, route conditions, hard controls and base route quality only.
- Decision Trace should record that insight was not used.
- Route Intelligence should say customer insight was not used.
- Bank Intelligence should show no customer-fit signals, no profile adjustment and no profile-derived ranking effect.

## Explainability Requirements

Route Intelligence should show:

- Whether customer insight was used.
- Base route recommendation remains from the bank-owned deterministic route engine.
- Customer-fit contribution, if implemented.
- Which insight signals influenced fit.
- That hard controls passed independently.
- That customer-fit did not override any failed control.
- No-insight status when the customer opted out.

Bank Intelligence should show:

- Route score before customer-fit.
- Customer-fit raw score.
- Capped customer-fit adjustment.
- Final score.
- Signals used and per-signal caps.
- Controls pass/fail status.
- Excluded routes with failed-gate reasons.
- Gemini/template explanation provider.
- Explicit "no Gemini decision authority" wording.

Decision Trace should eventually include structured evidence such as:

- `baseScore`
- `customerFitAdjustment`
- `finalScore`
- `customerFitSignals`
- `customerInsightUsed`
- `customerInsightSource`
- `customerFitCap`
- `hardControlsOverridden: false`

## Gemini Boundary

Gemini may:

- Structure draft intent fields for customer review.
- Explain a redacted route outcome.
- Explain customer-fit reasons from already-computed signals.

Gemini must not:

- Calculate final route score.
- Select or rank routes.
- Override controls.
- Silently infer sensitive characteristics.
- Infer or use protected characteristics.
- Approve, execute, amend, cancel, update payment state or move money.

The deterministic route engine must own all gating, scoring, ranking and selected-route decisions.

## Data And Privacy Boundary

Current demo:

- Uses mocked/static customer insight only.
- Uses no real customer accounts, transaction history, beneficiaries, bank systems or external customer-data services.
- Does not call production profile systems.

Future real implementation would require:

- Explicit consent and purpose limitation.
- Data minimisation.
- Source transparency and customer correction process.
- Freshness and retention controls.
- Audit trail of signals used, score impact and decision trace.
- Controls for model drift, fairness and unintended discrimination.
- Human governance for vulnerable-customer or accessibility-related signals.

Forbidden or high-risk data:

- Protected characteristics must not be inferred or used.
- Vulnerability, health, accessibility, age or hardship signals require stricter governance and should not be used for scoring without a separate approved policy.
- Customer insight must not be used to steer customers into higher-fee routes without transparent, customer-beneficial justification.

## Future Phase 4E-Implementation Plan

1. Request/response model design
   - Add an optional, backwards-compatible `customerInsightContext` to `RouteDecisionRequest`.
   - Include `useCustomerInsight` and explicit consent/source metadata.
   - Keep existing `scenarioId` and `paymentIntent` requests valid.

2. Domain model additions
   - Add customer insight records under backend domain or API package.
   - Add customer-fit scoring evidence records.
   - Extend `ScoreResult` or add a companion result with base score, adjustment and final score.

3. Scoring service update
   - Keep `GateEvaluationService` unchanged as the first eligibility boundary.
   - Add `CustomerFitScoringService` that only receives surviving routes.
   - Cap adjustment and emit per-signal reasons.
   - Keep deterministic tie-breaker.

4. Tests
   - Excluded routes are never customer-fit scored.
   - Customer-fit cannot make a failed route eligible.
   - No-insight path produces zero adjustment.
   - Adjustment cap is enforced.
   - Existing scenario selections remain stable unless a test explicitly covers approved changes.
   - Gemini cannot affect score, ranking or selected route.

5. Frontend display
   - Show base score, customer-fit adjustment and final score.
   - Show no-insight state clearly.
   - Keep customer view compact and Bank Intelligence detailed.

6. QA gate
   - Run frontend lint/typecheck/build/test.
   - Run backend tests and package.
   - Review copy for unsafe claims.
   - Confirm no real customer data or live integrations.
   - Require human approval before push/deploy.

## Implementation Gate

Phase 4E-design does not authorize scoring implementation. Phase 4E-implementation must be separately approved because it can affect backend route scoring/ranking and public API evidence.
