# Route Navigator

Payment Route Orchestrator is a simulated executive demo for explainable payment route orchestration. It works like a payment route finder: given a confirmed payment intent and customer preferences, it evaluates possible value-movement routes, applies hard gates, scores executable routes, selects the best route, records a Decision Trace, explains that trace, and simulates payment tracking.

This is a demo only. It must not connect to live payment rails, SWIFT, bank accounts, wallets, stablecoin networks, FX systems, sanctions systems, real customer data, or production secrets.

## Planned stack
- Backend: Java + Quarkus
- API: REST endpoints served by Quarkus
- Frontend: React + Vite + TypeScript
- Map UI: Leaflet with simulated route visuals
- AI: Gemini explanation service only, behind the backend
- Data: local JSON/YAML mock data first
- Persistence: no database for MVP; PostgreSQL may be added later for saved routes, users, or audit history
- Deployment target: containerised app suitable for GCP Cloud Run later

## Agent instructions
Before coding, read:

- `AGENTS.md`
- `docs/agent/00-mission.md`
- `docs/agent/01-architecture-rules.md`
- `docs/agent/02-build-plan.md`
- `docs/agent/03-backlog.md`
- `docs/agent/04-acceptance-criteria.md`
- `docs/agent/05-demo-scenarios.md`
- `docs/agent/06-progress.md`

The deterministic route engine selects routes. Gemini may explain a redacted Decision Trace only.

## Suggested build prompt
```text
You are building the Payment Route Orchestrator demo in this repository.

First read:
- AGENTS.md
- docs/agent/00-mission.md
- docs/agent/01-architecture-rules.md
- docs/agent/02-build-plan.md
- docs/agent/03-backlog.md
- docs/agent/04-acceptance-criteria.md
- docs/agent/05-demo-scenarios.md
- docs/agent/06-progress.md

Treat those files as the source of truth. Work through docs/agent/03-backlog.md in order.

For each backlog item:
1. Implement the smallest working change.
2. Add or update tests where practical.
3. Run the relevant build/test/typecheck command.
4. Update docs/agent/06-progress.md with what changed, commands run, outcomes, and next task.
5. Commit completed working increments to git.
6. Push completed commits to GitHub.
7. Continue to the next unchecked task unless genuinely blocked.

Do not ask for confirmation between backlog items. Make reasonable engineering decisions using the docs. Stop only if:
- requirements contradict each other,
- required credentials are missing,
- a security/compliance boundary would be violated,
- a tool permission is denied,
- or the build cannot progress after reasonable local debugging.

This is a simulated demo. Do not connect to live payment rails, SWIFT, bank accounts, wallets, stablecoin networks, FX systems, sanctions systems, real customer data, or production secrets.

The deterministic route engine selects routes. Gemini explains the redacted Decision Trace only.

The target is a completed, tested, committed, and pushed MVP artifact ready for later GCP Cloud Run deployment work.
Begin with backlog item 1 and continue iteratively.
```
