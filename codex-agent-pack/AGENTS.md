# AGENTS.md — Payment Route Orchestrator Demo

## Mission
Build a simulated executive demo for the Payment Route Orchestrator. The demo converts a confirmed customer payment intent into the most efficient executable value-movement route, records the decision evidence in a Decision Trace, explains it using Gemini, and simulates route execution and tracking.

This is not a live payment platform. Do not connect to live payment rails, SWIFT, bank accounts, wallets, stablecoin networks, FX systems, sanctions systems, real customer data, or production secrets.

## Required stack
- Backend: Java Quarkus
- Frontend: React TypeScript
- AI: Gemini explanation service only
- Data: local JSON/YAML mock data first
- Demo deployment target: containerised app suitable for Cloud Run later

## Non-negotiable domain rules
1. The route engine is deterministic. Gemini must never select routes, score routes, override gates, approve execution, update state, or move money.
2. Hard gates run before scoring. Compliance, sanctions, fraud, liquidity, reachability, route health, eligibility, route limits, wallet screening and cut-off checks are blocking controls, not scoring factors.
3. Only routes that pass blocking gates are scored.
4. Decision Trace is the single source of truth for route explanation.
5. Gemini receives only a redacted Decision Trace and generates explanation text. If Gemini is unavailable, use deterministic template explanations.
6. Fallback is allowed only before the route-specific point of no return. After point of no return, use servicing, recall, repair, return, investigation or reconciliation-break handling; do not call it fallback.
7. SWIFT gpi is not a route. The route is international bank transfer / correspondent banking. SWIFT is the message layer. gpi is tracking capability where available.
8. Stablecoin has two separate route patterns: stablecoin bridge plus fiat payout, and wallet-to-wallet stablecoin transfer.
9. Speed means time to beneficiary usable value, not first-leg confirmation.
10. Tokenised securities/collateral settlement is outside core payment routing and belongs to a future settlement-orchestration zone.

## Working method
Work through `docs/agent/03-backlog.md` in order. For each backlog item:
1. Read the relevant docs under `docs/agent/`.
2. Implement the smallest working change.
3. Add or update tests where practical.
4. Run the relevant build/test command.
5. Update `docs/agent/06-progress.md` with what changed, commands run, outcome, and next task.
6. Continue to the next unchecked backlog item unless genuinely blocked.

Do not ask for confirmation between backlog items. Stop only if:
- requirements contradict each other;
- required credentials are missing;
- a tool permission is denied;
- a security/compliance boundary would be violated;
- a build cannot progress after reasonable local debugging.

## Expected commands
Use these when applicable. If the repo is not yet initialised, create the structure first.

Backend:
```bash
cd backend
./mvnw test
./mvnw package
```

Frontend:
```bash
cd frontend
npm install
npm run typecheck
npm test -- --run
npm run build
```

Repository-level checks, once available:
```bash
find . -name '*.md' -maxdepth 4 -print
```

If a command is unavailable because the project is not created yet, create the required project scaffold in the relevant backlog item.

## Implementation quality bar
- Keep changes small and reviewable.
- Prefer clean domain models over hardcoded UI logic.
- Mock external systems via data files and services, not scattered constants.
- Keep customer-facing terminology simple.
- Keep technical/internal terminology precise.
- Include simulation flags in demo data.
- Do not invent real scheme limits, partner capabilities, fees, FX rates or regulatory claims. Mark them as illustrative demo data.
- Preserve a clean separation between demo architecture and future production reference architecture.

## Files to read before coding
- `docs/agent/00-mission.md`
- `docs/agent/01-architecture-rules.md`
- `docs/agent/02-build-plan.md`
- `docs/agent/03-backlog.md`
- `docs/agent/04-acceptance-criteria.md`
- `docs/agent/05-demo-scenarios.md`
- `docs/agent/06-progress.md`

