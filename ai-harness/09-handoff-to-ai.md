# AI Handoff

This file is the repo-local handoff for Claude, Codex, or another AI coding assistant. It is intended to let a new assistant continue without prior chat history.

## Product

Product name: Payment Route Intelligence

One-line proposition: A future-facing banking demo where a customer expresses a payment outcome and the bank recommends the safest executable route with evidence, controls and final approval.

## Current Journey

1. Secure Intent
2. Route Intelligence
3. Approval & Tracking

Current layout note: the app is currently a single-page guided journey. This is expected for Phase 1. Do not convert to multi-page unless explicitly tasked in Phase 2.

## Completed Phases

- 0H AI harness skeleton: repo-local AI context, backlog, templates and decision log.
- 1A Trusted session: secure session banner, outcome-led input, mocked Speak button and secondary demo scenarios.
- 1B Intent confirmation: structured intent card before route analysis.
- 1C Route intelligence panel: deterministic analysis lanes and route metrics.
- 1D Recommendation hero: customer-readable recommendation before technical details.
- 1E Journey shell: product header and Secure Intent / Route Intelligence / Approval & Tracking framing.
- 1F Payment journey map: representative journey map with nodes, controls, finality/PONR and alternatives.
- 1F-fix Map clarity: numbered nodes, clearer recommended route dominance and safety copy.
- 1G Agent context gateway: mocked advice-only agent governance drawer.
- 1H Final approval polish: final approval boundary and secondary simulation controls.
- 1I End-to-end QA: copy safety pass and build/test verification.
- 1J Claude-ready handoff pack: this documentation pack.

## Product Boundaries

- GenAI structures and explains; the deterministic route engine decides.
- The trusted banking agent is advice-only.
- The trusted banking agent cannot initiate, approve, execute, amend, cancel or move money.
- No money moves until customer approval.
- MCP/context layer is mocked only.
- Passkey, microphone, voice, biometrics and agent controls are mocked unless explicitly scoped later.
- The map is a representative/expected journey, not live telemetry.
- Do not imply settlement, instant settlement or atomicity is guaranteed.
- Do not connect to live payment rails, SWIFT, bank accounts, wallets, stablecoin networks, FX systems, sanctions systems, real customer data or production secrets.

## Key Files

- `ai-harness/README.md`: how to use the harness before future AI tasks.
- `ai-harness/00-product-context.md`: product proposition, journey and safety boundaries.
- `ai-harness/01-architecture-context.md`: current stack and key files.
- `ai-harness/02-delivery-principles.md`: delivery rules and safe wording.
- `ai-harness/03-backlog.md`: phase backlog and status.
- `ai-harness/04-current-phase.md`: active next phase.
- `ai-harness/05-acceptance-criteria-template.md`: reusable acceptance criteria.
- `ai-harness/06-codex-task-template.md`: prompt template.
- `ai-harness/07-review-template.md`: review template.
- `ai-harness/08-decision-log.md`: decisions that should survive across AI sessions.
- `ai-harness/10-deployment-readiness.md`: deployment readiness checklist and placeholders.
- `ai-harness/11-open-risks.md`: known risks and recommended phases.
- `ai-harness/12-next-prompts.md`: ready-to-use prompts for likely next tasks.
- `frontend/src/App.tsx`: single-page journey composition and step flow.
- `frontend/src/App.css`: primary styling for the Phase 1 UI.
- `frontend/src/components/StepIndicator.tsx`: Secure Intent / Route Intelligence / Approval & Tracking step labels.
- `frontend/src/components/PaymentIntentIntake.tsx`: outcome prompt, mocked Speak button and intent copy.
- `frontend/src/components/TrustedSessionBanner.tsx`: secure session banner and collapsed agent controls entry.
- `frontend/src/components/AgentContextGateway.tsx`: mocked agent/context governance drawer.
- `frontend/src/components/IntentConfirmationCard.tsx`: structured intent confirmation before route analysis.
- `frontend/src/components/RouteIntelligencePanel.tsx`: deterministic analysis lanes and metrics.
- `frontend/src/components/RecommendationHeroCard.tsx`: customer-facing route recommendation.
- `frontend/src/components/LeafletRouteMap.tsx`: representative payment journey map.
- `frontend/src/components/FinalApprovalCard.tsx`: final approval boundary and passkey mock.
- `frontend/src/components/PaymentTracker.tsx`: simulated post-approval tracking view.
- `frontend/src/components/ControlRoom.tsx`: internal simulation controls/evidence.
- `backend/src/main/resources/data`: backend local mock data.
- `Dockerfile`, `deployment/Dockerfile`, `cloudbuild.yaml`, `deployment/cloud-run.md`: container and Cloud Run deployment path.

## Current Known Caveat

Approval action may still be structurally close to Route Intelligence because the app is one-page. This is accepted for Phase 1. Consider a cleaner wizard-style transition in Phase 2.

## Recommended Next Phases

1. Phase 1K: Deployment readiness and Cloud Run deploy, only after explicit user confirmation to deploy.
2. Phase 2A: Improve harness automation so the next task and required context are easier to load.
3. Phase 2B: Extract the map journey adapter from `LeafletRouteMap.tsx`.
4. Phase 2C: Align frontend scenario fixtures with backend route data.
5. Phase 2D: Clean up the approval step transition into a clearer dedicated customer moment.
