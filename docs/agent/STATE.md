# STATE — live summary (rewritten each time)

- Confirmed scope — IN: route decision engine, gate evaluation, scoring, Decision Trace,
  Gemini explanation (with deterministic fallback), execution simulator, state machine,
  fallback/PONR handling, React frontend (3-step journey), Cloud Run deployment packaging.
- Confirmed scope — OUT: live payment rails, real secrets (except GEMINI_API_KEY at runtime),
  database (PostgreSQL deferred), tokenised securities settlement.
- Scope confirmed on: 2026-06-03 (MVP complete). Re-confirm if scope changes.
- Current phase: the supplier payment Studio is wired into the Cloud Build container.
- Last green run: `cd studio && npm test` passed 20 tests, `npm run build` succeeded, and
  `cd backend && ./mvnw -B package` passed 38 tests with the Studio assets bundled. All seven
  Playwright tests passed against the packaged Quarkus service.
- Next action: observe the Cloud Build image build and configured Cloud Run rollout.
- Open risk: Docker is unavailable locally. The Quarkus package and browser walkthrough
  were verified directly with JDK 21.
