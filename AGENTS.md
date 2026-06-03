# AGENTS.md — Payment Route Orchestrator Demo

## Mission
Build a simulated executive demo for the Payment Route Orchestrator. The demo converts a confirmed customer payment intent into the most efficient executable value-movement route, records the decision evidence in a Decision Trace, explains it using Gemini, and simulates route execution and tracking.

This is not a live payment platform. Do not connect to live payment rails, SWIFT, bank accounts, wallets, stablecoin networks, FX systems, sanctions systems, real customer data, or production secrets.

## Required stack
- Backend: Java Quarkus
- API: REST endpoints served by Quarkus
- Frontend: React + Vite + TypeScript
- Map UI: Leaflet for simulated route visuals and map-style comparisons
- AI: Gemini explanation service only
- Data: local JSON/YAML mock data first
- Persistence: no database for the initial MVP, but isolate data access behind services/repositories so PostgreSQL can be added later when saved routes, users, or audit persistence are required
- Demo deployment target: containerised app suitable for a GCP Cloud Run demo URL

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
Project-specific instructions in this file and under `docs/agent/` take priority over general agent behavior guidance. Use the guidance below to shape how work is done; use the mission, architecture rules, backlog, and acceptance criteria to decide what work is done.

## General agent behavior
Adapted from the Karpathy-style `CLAUDE.md` pattern: reduce common LLM coding mistakes by being explicit, simple, surgical, and verification-driven.

1. Think before coding.
   - State assumptions when they affect implementation.
   - Surface meaningful tradeoffs instead of silently choosing.
   - Ask only when ambiguity would cause wasted or unsafe work.
   - Push back if a request conflicts with the mission, architecture rules, compliance boundaries, or existing code.

2. Prefer simplicity.
   - Build the minimum code that satisfies the current backlog item and acceptance criteria.
   - Do not add speculative features, unused abstractions, or configurability without a concrete requirement.
   - If an implementation becomes larger than the problem warrants, simplify it before moving on.

3. Make surgical changes.
   - Touch only files needed for the current task.
   - Match the existing project style and structure.
   - Do not refactor adjacent code, rename unrelated concepts, or reformat unrelated files.
   - Clean up unused imports, variables, functions, or files introduced by the current change.
   - Mention unrelated issues when useful, but do not fix them unless asked or required by the task.

4. Execute against verifiable goals.
   - Convert each task into a concrete success condition before implementation.
   - Add or update tests where practical, especially for route logic, gates, scoring, and API behavior.
   - Run the relevant checks and record the commands and outcomes in `docs/agent/06-progress.md`.
   - Continue iterating until the change is implemented, verified, or genuinely blocked.

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
- Keep mock data access behind narrow services/repositories so PostgreSQL can replace local files later without rewriting route decision logic.
- Keep customer-facing terminology simple.
- Keep technical/internal terminology precise.
- Include simulation flags in demo data.
- Do not invent real scheme limits, partner capabilities, fees, FX rates or regulatory claims. Mark them as illustrative demo data.
- Preserve a clean separation between demo architecture and future production reference architecture.
- Add container/Cloud Run deployment files and notes where practical, but do not require live GCP credentials for local build/test verification.

## Files to read before coding
- `docs/agent/00-mission.md`
- `docs/agent/01-architecture-rules.md`
- `docs/agent/02-build-plan.md`
- `docs/agent/03-backlog.md`
- `docs/agent/04-acceptance-criteria.md`
- `docs/agent/05-demo-scenarios.md`
- `docs/agent/06-progress.md`
