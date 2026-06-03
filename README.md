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
- Persistence: no database for MVP, but backend services should keep data access isolated so PostgreSQL can be added later for saved routes, users, or audit history
- Deployment target: containerised app suitable for a GCP Cloud Run demo URL

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
1. Implement the smallest working change that satisfies the current task and relevant acceptance criteria.
2. Add or update tests where practical, especially for route decisions, gates, scoring, trace redaction, and API behavior.
3. Run the relevant build/test/typecheck commands.
4. If a frontend app exists, run a local smoke check where practical.
5. Update docs/agent/06-progress.md with what changed, files changed, commands run, outcomes, next task, and blockers if any.
6. Commit stable working increments to git.
7. Push completed commits to GitHub.
8. Continue to the next unchecked backlog item unless genuinely blocked.

Do not ask for confirmation between backlog items. Make reasonable engineering decisions using the docs. If some prep items are already done, verify them, mark them complete in progress, and continue.

Stop only if:
- requirements contradict each other,
- required credentials are missing,
- a security/compliance boundary would be violated,
- a tool permission is denied,
- or the build cannot progress after reasonable local debugging.

This is a simulated demo. Do not connect to live payment rails, SWIFT, bank accounts, wallets, stablecoin networks, FX systems, sanctions systems, real customer data, or production secrets.

The deterministic route engine selects routes. Gemini explains the redacted Decision Trace only. Gemini must never select routes, score routes, approve execution, update payment state, or move money. Gemini must default off unless credentials/config are explicitly available; template explanations must work without Gemini.

The planned stack is Java Quarkus backend, Quarkus REST APIs, React + Vite + TypeScript frontend, Leaflet for simulated route visuals, local JSON/YAML mock data first, and no database for the MVP. Keep backend data access isolated behind services/repositories so PostgreSQL can be added later without rewriting decision logic.

The target is a completed, tested, committed, and pushed MVP artifact that can be deployed as a GCP Cloud Run demo URL. Add container/Cloud Run deployment files and README deployment notes where practical, but do not require live GCP credentials to build or test locally. If the full MVP cannot be completed in one run, get as far as possible, keep the repo in a clean working state, commit and push the completed working increments, and leave exact next steps in docs/agent/06-progress.md.
Begin with backlog item 1 and continue iteratively.
```
