# 04 — Acceptance Criteria

Every change is accepted only when the applicable checks below pass, with evidence (AGENTS.md
§2 Verification). Mark one "not applicable" explicitly with a reason — silence is not
acceptance. Functionality and Security always apply. Resilience, RTO and SLA may be not
applicable with a recorded reason for this demo.

> These are the checks for review and sign-off. The actual rules live in AGENTS.md §1–§2 and
> docs 06–08 — this file points to them, not repeats them.

## A. Functionality
- The app clearly states it is a simulated demo with no live connectivity.
- Route decisions are deterministic and reproducible.
- Each scenario in 05 produces the expected winning route.
- Excluded routes show the blocking gate reason; available-not-selected routes show why they lost.
- Decision Trace is the single source of truth; views derive from it and cannot alter it.
- Gemini is not required for route selection or execution — template fallback always works.
- Stablecoin bridge is not marked complete until beneficiary usable value is confirmed.
- SWIFT is messaging; gpi is tracking — neither is a route family.
- POST /api/route-decisions returns selected route, candidates, gates, scores and trace ID.
- GET /api/route-decisions/{traceId} returns the full trace.
- Gate evaluation happens before scoring; scoring service only receives routes that passed.
- Payment tracker shows simulated lifecycle states; PONR and fallback status visible in control room.

## B. Resilience
- Not applicable for MVP demo (no production traffic). The always-on rules in AGENTS.md §2
  still apply: idempotency, exception handling, fail-closed gate paths.

## C. Security
- No live secrets in code, config, or fixtures. GEMINI_API_KEY injected via environment
  variable only, never committed.
- Trace redaction removes or masks sensitive fields before any data reaches Gemini.
- Gemini tests prove no PII-like fields reach the model.
- Template explanation works when Gemini is disabled.
- No live external credentials needed for local build or test.
- Input validated at API boundaries; no injection vectors.

## D. RTO (recovery)
- Not applicable for MVP demo (in-memory state; single instance by design). Documented in
  deployment notes: --max-instances=1 until shared persistence is added.

## E. SLA (performance / availability)
- Not applicable for MVP demo. Local build and test run without live infra. Cloud Run
  deployment notes exist but GCP credentials are not needed locally.
