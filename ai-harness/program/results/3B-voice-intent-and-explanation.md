# Phase 3B Result — Voice Intent and Gemini Route Explanation Demo

## Summary

Phase 3B added a demo-safe voice intent and trusted-agent explanation layer to Payment Route Intelligence.

## Discovery

- Route explanation endpoint: `POST /api/explanations/route`.
- Frontend already calls the endpoint after backend-backed route decisions.
- Gemini is gated by `GEMINI_ENABLED` and requires `GEMINI_API_KEY`.
- `GEMINI_ENABLED` defaults to `false`.
- When Gemini is disabled or unavailable, backend returns template fallback providers such as `TEMPLATE_FALLBACK`, `TEMPLATE_FALLBACK_GEMINI_ENABLED` or `GEMINI_FALLBACK`.
- The response exposes `provider`, `geminiEnabled`, `explanation` and `redactedTrace`, which is enough for frontend source/status labelling.
- Cloud Run needs `GEMINI_ENABLED=true` and a valid Gemini API key environment variable for live Gemini; otherwise fallback explanation works.

## Implementation

- Browser speech recognition can capture payment intent into the editable intent field when supported.
- Unsupported browsers show a safe fallback and keep typed intent entry available.
- Voice capture cannot approve, execute, amend, cancel or move money.
- Trusted agent explanation appears in Route Intelligence after recommendation.
- The panel uses existing explanation text/provider status where available.
- The UI says "Gemini explanation" only for provider `GEMINI`.
- Template/static paths are labelled as template/demo fallback explanations.
- Browser read-aloud uses `speechSynthesis` only and safely degrades when unsupported.

## Safety Boundaries

- Deterministic route engine recommends routes.
- Gemini/GenAI explains and summarises only.
- Trusted banking agent cannot approve, execute, amend, cancel or move money.
- Passkey/customer approval remains the only approval mechanism.
- No backend route decision logic, payment execution logic, deployment files, API contracts or dependencies were changed.

## Next Phase

Phase 3C — Demo launch pack and walkthrough.

Do not start Phase 3C without an explicit user prompt.
