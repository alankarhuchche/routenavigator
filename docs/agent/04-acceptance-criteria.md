# 04 — Acceptance Criteria

## Global acceptance criteria
- The app must clearly state it is a simulated demo.
- No real payment, SWIFT, wallet, stablecoin, FX, liquidity, sanctions, fraud or customer-data integrations.
- Route decisions must be deterministic and reproducible.
- Gemini must not be required for route selection or execution simulation.
- Every route decision must produce a Decision Trace.
- Excluded routes must show hard-gate failure reasons.
- Available but not selected routes must show comparative reasons.
- Stablecoin bridge must not be described as complete until beneficiary usable value is confirmed.
- International bank transfer must be modelled as correspondent banking, with SWIFT as messaging and gpi as tracking where available.

## Scenario acceptance criteria
1. UK instant payment selects Instant UK bank transfer.
2. USD fastest selects Fast digital-dollar route when gates pass.
3. USDC wallet-to-wallet selects Digital-dollar wallet transfer.
4. USD cheapest selects Local payout route.
5. Traditional bank-transfer-only selects International bank transfer and excludes digital routes.
6. Fallback scenario triggers fallback only before point-of-no-return.

## Backend acceptance criteria
- `POST /api/route-decisions` returns selected route, candidates, gates, scores and trace ID.
- `GET /api/route-decisions/{traceId}` returns full trace.
- Gate evaluation happens before scoring.
- Scoring service receives only routes that pass blocking gates.
- Trace redaction removes or masks PII-like fields before Gemini.
- Template explanation works when Gemini disabled.
- Mock data loading is isolated behind services/repositories so PostgreSQL can be introduced later without rewriting route decision logic.

## Frontend acceptance criteria
- Scenario selector loads scenario intent.
- Route comparison shows selected, available-not-selected and excluded routes distinctly.
- Decision Trace panel exposes hard gates, score, route anatomy, finality, fallback and AI boundary.
- Payment tracker shows simulated lifecycle states.
- Control room shows PONR and fallback status.

## Test acceptance criteria
- Backend unit tests cover scenario route selection.
- Backend tests prove excluded routes are not scored.
- Backend tests prove Gemini is not called during route decision if disabled.
- Frontend builds successfully.
- No test or code should require live external credentials.
- Container/Cloud Run deployment notes exist, but local build/test does not require GCP credentials.
