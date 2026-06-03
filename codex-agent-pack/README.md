# Codex Agent Pack — Payment Route Orchestrator

Drop these files into the root of the repository before starting Codex.

## Files
- `AGENTS.md` — repo-level Codex instructions
- `docs/agent/00-mission.md` — product mission and safe scope
- `docs/agent/01-architecture-rules.md` — domain and architecture rules
- `docs/agent/02-build-plan.md` — phased build plan
- `docs/agent/03-backlog.md` — ordered task list
- `docs/agent/04-acceptance-criteria.md` — done criteria
- `docs/agent/05-demo-scenarios.md` — scenarios the app must support
- `docs/agent/06-progress.md` — status file Codex must maintain

## First Codex prompt
Paste this into Codex from the repository root:

```text
You are building the Payment Route Orchestrator demo.

Read AGENTS.md and all files under docs/agent/.
Work through docs/agent/03-backlog.md in order.

For each task:
1. Implement the smallest working change.
2. Add or update tests where practical.
3. Run the relevant build/test command.
4. Update docs/agent/06-progress.md.
5. Continue to the next unchecked task unless genuinely blocked.

Do not ask for confirmation between tasks. Stop only if a requirement is contradictory, a required credential is missing, a tool permission is denied, a security/compliance boundary would be violated, or the build cannot progress after reasonable local debugging.

This is a simulated demo only. Do not connect to live payment rails, SWIFT, bank accounts, wallets, stablecoin networks, FX systems, sanctions systems, or real customer data.

The deterministic route engine selects routes. Gemini explains the redacted Decision Trace only.
Begin with backlog item 1.
```
