# Decision Log

## Seed Decisions

- GenAI explains; the deterministic route engine decides.
- The trusted banking agent is advice-only.
- The trusted banking agent cannot initiate, approve, execute, amend, cancel or move money.
- MCP/context gateway concepts are mocked expert detail only unless explicitly scoped later.
- Final customer approval is required before execution.
- No money moves until the customer approves.
- The payment journey map is representative, not live telemetry.
- The map does not show real correspondent bank data, live scheme telemetry or real FX data.
- Phase 1 is frontend-first unless explicitly scoped otherwise.
- Acceptance criteria must be inside every Codex prompt.
- Codex must report acceptance criteria pass/fail.
- Approval step may need later transition cleanup.

## Handoff Decisions

- Create a Claude-ready handoff pack before deployment because Codex credits may be limited.
- Keep critical project context inside repo-local `ai-harness` files so another AI assistant can continue without chat history.
- Treat the single-page guided journey as acceptable for Phase 1.
- Defer multi-page/wizard restructuring to Phase 2 unless it becomes a deployment or demo blocker.

## Deployment Decisions

- Phase 1 deployed successfully.
- Commit: `053f9ce` (`Upgrade payment route prototype to Payment Route Intelligence`).
- Deployment path: GitHub -> Cloud Build -> Cloud Run.
- Manual validation confirmed the deployed app is working.
- Phase 1 is complete.
- Next phase is Phase 2A — Harness automation improvements.

## Harness Automation Decisions

- Harness automation was added to make AI-assisted engineering repeatable across Codex, Claude and similar assistants.
- The standard workflow is Plan -> Execute -> Verify -> Review -> Commit.
- Push remains deployment-triggering and requires explicit intent.
- `.claude/worktrees` local noise must not be staged unless explicitly requested.

## Frontend Refactor Decisions

- Payment journey derivation was extracted from `LeafletRouteMap.tsx` into a pure frontend adapter.
- The adapter has no React, Leaflet or DOM dependency.
- The map component remains responsible for rendering, Leaflet components, node selection and visual styling.
- Representative journey and no-money-moved safety wording were preserved.
- Next phase is Phase 2C — Route data alignment frontend/backend.

## Program Execution Decisions

- Program execution harness added to reduce chat copy/paste and allow controlled iterative AI execution from repo-owned phase files.
- Autonomy is allowed within a phase when acceptance criteria are clear.
- Human gates remain required for push, deploy, product scope, contract, dependency and route decision logic changes.

## Route Data Alignment Decisions

- Phase 2C found that frontend scenarios `SCN-007` through `SCN-011` are not represented in backend scenario data.
- Backend route catalogue and gates currently support generic UK/US routes, not the frontend's India, China, EU, Australia and UAE corridor-specific route IDs.
- No backend data changes were made because true alignment requires a human-approved route decision logic / product scope decision.
- Phase 2C result is recorded in `ai-harness/program/results/2C-route-data-alignment.md`.
- Phase 2C-fix applied the approved hybrid decision: keep `SCN-007` through `SCN-011` as labelled static frontend corridor demos.
- Static corridor demos use frontend traces only and do not call backend route-decision, classifier or explanation endpoints.
- Backend corridor route support remains deferred behind the route decision logic / product scope gate.

## Demo Journey Shell Decisions

- Phase 3A refactored the frontend presentation into four page-like stages: Secure Intent, Route Intelligence, Journey & Controls, and Approval & Tracking.
- The app remains a single React app with internal state navigation; no URL routing was added.
- Route analysis state is preserved across Back/Continue navigation after analysis completes.
- Journey & Controls now separates the payment journey map and control evidence from route scoring and approval.
- Approval & Tracking now owns final approval, mocked passkey approval, tracker and secondary simulation controls.
- No backend route logic, API contracts, deployment files or dependencies were changed.
- Phase 3A-fix was added after local demo review found the shell still felt too much like a long page and the map was not visible enough in the journey.
- The active stage remains exclusive, Back/Continue labels now read like page transitions, locked stages are explicitly labelled, and Journey & Controls has a visible map-focused entry card.
- Leaflet map visibility is protected by an invalidate-size pass after the map mounts in the active stage.
- The map regression is treated as resolved locally; Phase 3C remains the next phase after this fix.

## Voice Intent and Explanation Decisions

- Phase 3B added browser speech recognition for demo intent capture only.
- Voice capture may fill or append to the editable payment intent field, but cannot approve, execute, amend, cancel or move money.
- Browser speech recognition safely degrades when unsupported.
- The trusted banking agent explanation panel uses the existing route explanation path and provider status where available.
- The UI labels "Gemini explanation" only when the backend provider is `GEMINI`; template and static paths are labelled as fallback/demo explanations.
- Browser read-aloud uses `speechSynthesis` only and does not use the microphone or affect payment state.
- Passkey/customer approval remains the only approval mechanism.
- Phase 3B-fix was added after local demo review found Secure Intent visually weak and the intent/voice/progression path broken.
- Payment intent text is now controlled by `App` so typed text persists across rerenders and route analysis uses the entered text.
- Secure Intent now uses a premium composer layout with a prominent textarea, visible speech-capture affordance, preference cards and a safety boundary.
- The voice boundary remains unchanged: voice captures intent only; passkey approval is required before anything moves.
- Phase 3C remains the next phase after this fix.

## Secure Session / Intent Capture Split Decisions

- Phase 3 UX-fix split the opening journey into five stages: Secure Session, Intent Capture, Route Intelligence, Journey & Controls, and Approval & Tracking.
- Secure Session now focuses on customer verification, scoped trusted-agent consent and execution lock messaging before any payment outcome is captured.
- Intent Capture now owns the natural-language composer, browser voice capture, preferences, structured intent preview and secondary demo scenarios.
- The route engine still recommends routes only after the customer reaches Intent Capture and starts route analysis.
- The agent and Gemini authority boundaries remain unchanged: they may structure/explain intent but cannot select routes, approve, execute, amend, cancel or move money.
- Passkey remains an approval boundary in Approval & Tracking, not an intent-capture shortcut.
- Phase 3C remains the next phase after this UX fix.
