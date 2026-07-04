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

## Premium Secure Session Landing Decisions

- Phase 3 UX-fix 2 was added after local UI review found the first Secure Session screen too plain and debug-like for an executive demo.
- Stage 1 now uses a premium secure-session landing layout with a central passkey/authentication visual, visible readiness sequence and in-card Continue to Intent Capture CTA.
- Initial route metrics are hidden until route analysis is complete so route labels, ETA and score do not dominate or concatenate on first load.
- Agent controls remain available as a collapsed secondary panel below the Secure Session landing, not as the primary first-screen content.
- Safety boundaries remain visible: the trusted agent can structure/explain intent only, cannot approve/execute/amend/cancel/move money, and final approval remains passkey-protected.
- No backend route logic, API contracts, deployment files, dependencies, Gemini/voice behaviour or payment execution logic were changed.
- Phase 3C remains the next phase after this UX fix.

## Secure Session Blank Render Recovery Decisions

- Phase 3 UX-fix 3 was added after local inspection reported a completely blank first page after the premium Secure Session polish.
- Fresh runtime smoke checks against `http://127.0.0.1:5173/` showed Secure Session content present in the DOM and visible in a browser screenshot, with no page-level JavaScript errors.
- A root app error boundary was added so a future local render/HMR error shows a visible recovery screen instead of leaving an empty root.
- Focused Secure Session visibility coverage now asserts that Stage 1 renders, the Continue to Intent Capture CTA is present, Stage 1 keeps intent capture hidden, and Continue opens Stage 2.
- Backend route logic, API contracts, deployment files, dependencies, Gemini/voice behaviour and payment execution logic remain unchanged.
- Phase 3C remains the next phase only after visual verification of the local app.

## Voice/Text Structured Intent Decisions

- Phase 3D wired Intent Capture so browser SpeechRecognition produces transcript text only; no raw audio is uploaded or sent to Gemini.
- Transcript/text is sent to `POST /api/intent/classify` to create a draft structured intent for customer review.
- `/api/intent/classify` remains backwards-compatible with `scenarioId`, `reason` and `classifiedBy`, and now also returns draft structured intent fields, fallback status, warnings and review metadata.
- Gemini may structure draft intent fields when `GEMINI_ENABLED=true` and `GEMINI_API_KEY` is configured; otherwise rules fallback structures a safe reviewable draft.
- Route analysis is disabled until the customer confirms the structured intent. Voice and Gemini cannot approve, execute, amend, cancel or move money.
- Backend route decision logic remains deterministic. Gemini/rules only structure intent and explain outcomes; they do not select, score, approve or update payment state.
- Route outcome explanation still uses `POST /api/explanations/route` and continues to expose `provider`, `geminiEnabled`, `explanation` and `redactedTrace` for honest source labelling.
- Phase 3C remains the next phase after this implementation.

## Live Transcript Confirmation Decisions

- Phase 3D-fix changed browser SpeechRecognition from final-only capture to live captioned capture with interim results enabled.
- Interim transcript is displayed in the browser as a live caption only; it is not copied into the main intent text and is not sent to Gemini or `/api/intent/classify`.
- Final captured transcript is shown in a review panel before structuring. The customer can use the transcript, try again or edit manually.
- A captured transcript is sent for Gemini/rules structuring only after the user confirms it or chooses the manual Structure intent action.
- No raw audio is uploaded. Voice cannot approve, execute, amend, cancel or move money. Passkey/customer approval remains the final movement boundary.
- Phase 3E remains the next release-gate phase after this fix.

## Money Movement Intelligence Reframing Decisions

- Phase 4A reframed the demo proposition from Payment Route Intelligence to Money Movement Intelligence.
- The customer-facing thesis is now: the customer asks to move money; the bank uses consented insight, controls and route intelligence to choose the best safe way; AI structures and explains; the bank decides; the customer approves.
- Visible stage framing now uses Secure Session, Money Movement Intent, Route Intelligence, Journey & Controls, and Approval & Tracking.
- Rail, SWIFT, stablecoin and DLT terminology remains secondary/background evidence where existing scenario or route detail already requires it.
- No backend route decision logic, payment execution logic, API contracts, deployment files or dependencies changed in Phase 4A.
- Customer insight screens, bank intelligence drawer and any customer profile/scoring model are deferred to Phase 4B/4C behind explicit product scope.
- Next phase is Phase 4B — Separate Customer View and Bank Intelligence drawer.

## Customer View / Bank Intelligence Decisions

- Phase 4B introduced a two-layer UI model: Customer View by default, with optional Bank Intelligence behind-the-scenes context.
- Bank Intelligence is opened from a secondary control on each stage and is closed by default.
- Stage-specific drawer content explains session trust, transcript handling, deterministic route evidence, representative map caveats, finality/PONR, approval boundaries and simulation status.
- Detailed route comparison/trace and control-room evidence are tucked behind customer-initiated evidence sections so the main journey remains outcome-led.
- Agent, voice and Gemini boundaries remain visible where they protect trust. More detailed authority/control/audit context now lives in Bank Intelligence.
- No route/scoring/profile logic, payment execution logic, API contracts, deployment files or dependencies changed in Phase 4B.
- Customer Insight Context remains future Phase 4C.

## Customer Insight Context Decisions

- Phase 4C added Customer Insight Context as stage 3 in a six-stage Money Movement Intelligence journey.
- Customer insight is represented by a typed frontend mock profile only; no real customer data, real accounts, external services or production data are used.
- The customer can choose to use the insight context for the analysis or continue without it.
- Route Intelligence and Bank Intelligence show whether customer insight was used, but explicitly state that profile-aware scoring/ranking has not been implemented in this phase.
- Customer insight cannot override fraud, sanctions, limits, eligibility or regulatory controls.
- No backend route decision logic, payment execution logic, API contracts, deployment files or dependencies changed in Phase 4C.
- Next phase is Phase 4D — Profile-aware route explanation.

## Profile-Aware Explanation Decisions

- Phase 4D added customer-fit explanation in Route Intelligence when the customer chose to use mocked customer insight.
- The customer-fit explanation uses demo insight signals such as purpose, usual movement range, beneficiary relationship, tracking preference and previous route experience.
- When the customer analyses without insight, Route Intelligence explicitly says customer insight was not used and no customer profile context was applied.
- Trusted agent explanation now separates route outcome explanation from customer-fit explanation and keeps the explanation-only boundary visible.
- Bank Intelligence shows insight source, explanation signals, that profile-aware scoring is not implemented yet, and that scoring/ranking are unchanged in this phase.
- No backend route decision logic, route scoring/ranking, payment execution logic, API contracts, deployment files or dependencies changed in Phase 4D.
- Next phase is Phase 4E — Bounded customer-fit scoring, which remains gated because it may affect route logic.

## Bounded Customer-Fit Scoring Design Decisions

- Phase 4E-design produced `ai-harness/16-customer-fit-scoring-design.md`.
- Current backend route decisions run hard gates first, score only `AVAILABLE` routes, and select the highest deterministic score from `speed`, `cost`, `certainty` and `transparency` dimensions.
- The design requires customer-fit scoring to run only after hard controls pass.
- Customer-fit contribution is capped and may nudge eligible routes, but can never make an excluded route eligible or override fraud, sanctions, limits, eligibility, regulatory, beneficiary, account/customer or scheme/rail restrictions.
- No-insight analysis must apply zero customer-fit adjustment and say customer profile context was not used.
- Gemini may structure and explain, but must not calculate scores, rank routes, select routes, override controls, approve, execute or update payment state.
- The design records consent, data minimisation, transparency, retention, audit and protected-characteristic boundaries for any future real implementation.
- No runtime app logic, backend route logic, API contracts, payment execution logic, dependencies, push or deploy changed in Phase 4E-design.
- Next phase is Phase 4E-implementation — Bounded customer-fit scoring, gated for explicit route-logic approval.

## Bounded Customer-Fit Scoring Implementation Decisions

- Phase 4E-implementation was explicitly approved and implements the design in `ai-harness/16-customer-fit-scoring-design.md`.
- `POST /api/route-decisions` remains backwards-compatible and now accepts optional `customerInsightUsed` and mocked `customerInsightContext` fields.
- Hard gates still execute first. Only surviving `AVAILABLE` routes enter base and customer-fit scoring; excluded routes cannot be rescued.
- The deterministic customer-fit adjustment is capped at `-5` to `+10`. It applies only when insight use and personalised-routing consent are both true.
- Missing, declined or unconsented insight produces a zero adjustment and preserves base deterministic selection.
- Score evidence includes base score, customer-fit adjustment, final score, fit reasons, cap state, insight state and `customer-fit-v1-demo` version.
- Route Intelligence keeps score impact compact; Bank Intelligence carries detailed evidence and the hard-controls-first boundary.
- Gemini does not participate in scoring, ranking or route selection. Approval, execution and payment state logic are unchanged.
- Only mocked/static demo context is sent; no real customer data or external customer-data service is used.
- Next phase is Phase 4F — Customer-fit regression QA and release decision. Push and deploy remain human-gated.

## Phase 5A Intent Reveal And Scoring Copy Decisions

- Phase 5A corrected Customer Insight copy that incorrectly described scoring as future or context-only after Phase 4E implementation.
- Customer-facing copy now says consented insight may personalise eligible route ranking only after bank controls pass and cannot override hard controls.
- Bank Intelligence now states that bounded customer-fit scoring is active, capped and restricted to `AVAILABLE` routes after hard controls.
- Money Movement Intent now opens with an empty textarea and placeholder; the former default sentence is available only through a secondary `Use demo example` action.
- Structured intent preview, confirmation controls and the duplicate intent summary are hidden until the customer explicitly structures the entered or confirmed transcript text.
- Transcript review remains event-driven and is not visible before voice capture.
- Failure simulation moved into collapsed demo controls; static scenario functionality remains secondary and intact.
- No backend route scoring, payment execution, API contract, dependency, push or deployment change was made.
- Next phase is Phase 5B — Simplify customer journey and responsive stepper.
