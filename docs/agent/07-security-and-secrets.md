# 07 — Security & Secrets

This is a simulated demo with no live payment connectivity. The security bar is therefore
lower than a production system — but the following rules are still non-negotiable.

## Data classification (demo)
| Level | Data in this app | Where stored |
|-------|-----------------|--------------|
| Public | All demo/mock data, UI content | In repo (JSON fixtures, frontend code) |
| Internal | Quarkus config, build config | In repo (application.properties — no secrets) |
| Restricted | GEMINI_API_KEY | Environment variable at runtime only |

## Secret rule (one rule, no exceptions)
GEMINI_API_KEY is the only secret. It is:
- Never committed to the repo, config files, Dockerfiles, or build args.
- Injected at runtime via environment variable (Cloud Run: set via gcloud run deploy --set-env-vars).
- Not logged, not traced, not sent to any endpoint other than the Gemini API.
- The app works fully (with template explanations) when it is not set.

## No other secrets
All other data is simulated. Do not add real: API keys, bank credentials, wallet keys, OAuth
tokens, database passwords, or customer PII. If a future feature needs a real secret, add it
to this file and follow the rule above.

## Transport
- Frontend → Backend: local dev only (no TLS required locally). Cloud Run serves HTTPS.
- Backend → Gemini: HTTPS (enforced by MicroProfile REST Client / Gemini endpoint).

## Input validation
- All REST endpoints validate and reject malformed requests.
- Trace redaction (TraceRedactionService) removes or masks PII-like fields before any data
  reaches Gemini or is logged.

## Secret scan
- No secret scanner is configured yet (gap — demo priority was low).
- Before using this as a template for a real app, add a secret-scan step to CI.
