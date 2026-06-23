# Delivery Principles

- Work one task at a time.
- Keep phases small and reviewable.
- Default to frontend-only unless backend, deployment or data work is explicitly scoped.
- Do not deploy unless deployment is explicitly scoped.
- Do not change route decision logic unless explicitly scoped.
- Do not introduce unsafe AI, agent or payment wording.
- Acceptance criteria must be included inside every Codex prompt.
- Codex must self-verify and report acceptance criteria pass/fail.
- When app files change, run relevant lint/typecheck/build/test commands.
- Report files changed, commands run, outcomes and scope deviations.
- Preserve existing simulator and demo functionality unless a task explicitly changes it.
- Treat MCP/context gateway, passkey, voice, agent and biometric concepts as mocked UI unless explicitly scoped otherwise.

## Safety Language Rules

Use:

- route engine recommended
- GenAI explained
- advice-only mode
- final approval required
- expected journey
- representative journey
- mocked demo

Avoid:

- AI selected the route
- Gemini chose the route
- agent approved the payment
- autonomous execution
- money moved before approval
- guaranteed settlement
- guaranteed atomicity
- live correspondent telemetry

