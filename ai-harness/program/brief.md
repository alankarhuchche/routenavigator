# Phase 2 Program Brief

Improve maintainability and demo reliability of Payment Route Intelligence without changing the Phase 1 deployed customer proposition.

## In Scope

- Align route data between frontend and backend.
- Clean approval step transition if needed.
- Run regression QA.
- Preserve deterministic route-engine boundary.
- Preserve agent/payment safety language.
- Preserve current deployed behavior unless explicitly approved.

## Out Of Scope

- New product features.
- Real MCP integration.
- Real passkey or microphone integration.
- Backend route logic changes unless explicitly approved.
- Deployment unless explicitly approved.
- Live payment rails, SWIFT, bank accounts, wallets, stablecoin networks, FX systems, sanctions systems, real customer data or production secrets.

## Product Boundaries

- GenAI structures and explains; the deterministic route engine decides.
- The trusted banking agent is advice-only.
- No money moves until customer approval.
- Map and agent concepts remain representative/mocked unless explicitly scoped otherwise.
