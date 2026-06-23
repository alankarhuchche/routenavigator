# Program Phase Plan

## 2C — Route Data Alignment Frontend/Backend

Objective: Inventory and align frontend demo scenario data with backend mock route data.

Allowed files:

- `frontend/src/data/demoData.ts`
- backend mock data under `backend/src/main/resources/data`
- focused frontend/backend tests when needed
- `ai-harness/`

Disallowed files:

- deployment files
- package/dependency files
- route decision logic unless explicitly approved
- API contracts unless explicitly approved

Acceptance criteria summary:

- mismatches are listed
- implemented changes are data/copy scoped unless explicitly justified
- deterministic route engine behavior is preserved
- unsafe claims are not introduced
- checks pass for touched areas

Required commands:

- `git status --short --branch`
- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `cd frontend && npm run test`
- `cd backend && ./mvnw test`

Stop condition: stop after local commit and execution-state update. Do not push.

## 2D — Approval Step Transition Cleanup

Objective: Make Approval & Tracking feel like a clearer customer step without changing backend behavior.

Allowed files:

- frontend components and CSS related to approval/tracking
- frontend tests
- `ai-harness/`

Disallowed files:

- backend files
- deployment files
- dependencies
- route decision logic
- API contracts

Acceptance criteria summary:

- approval step is visually/narratively clearer
- customer approval remains explicit and mocked where appropriate
- agent cannot approve or move money
- simulator/tracker behavior remains available
- frontend checks pass

Required commands:

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `cd frontend && npm run test`

Stop condition: stop after local commit and execution-state update. Do not push.

## 2E — Regression QA And Release Decision

Objective: Review the Phase 2 changes end to end and decide whether the branch is ready for a human-approved push/release.

Allowed files:

- docs/harness updates
- small test fixes only if required by QA

Disallowed files:

- new product features
- backend route logic changes
- deployment changes unless explicitly approved
- dependencies

Acceptance criteria summary:

- full app behavior is reviewed against safety boundaries
- frontend checks pass
- backend checks pass if data/backend files changed in Phase 2
- release readiness is stated clearly
- human approval gate is preserved before push/deploy

Required commands:

- `git status --short --branch`
- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `cd frontend && npm run test`
- `cd backend && ./mvnw test`

Stop condition: stop at release decision. Do not push/deploy without explicit approval.

## 3A — Demo Journey Shell / Page-Like Wizard

Objective: Make the executive demo feel like a cleaner page-like guided journey without changing backend behavior.

Allowed files:

- frontend presentation components and CSS
- focused frontend tests
- `ai-harness/`

Disallowed files:

- backend files
- deployment files
- dependencies
- route decision logic
- API contracts
- real voice/audio, real Gemini behavior or new integrations

Acceptance criteria summary:

- four stages exist: Secure Intent, Route Intelligence, Journey & Controls, Approval & Tracking
- navigation between stages exists
- route analysis, map, approval, tracking and simulation behavior remain available
- safety language is preserved
- frontend and backend checks pass

Required commands:

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `cd frontend && npm run test`
- `cd backend && ./mvnw test`

Stop condition: stop after local commit. Do not push or deploy.

## 3B — Voice Intent and Gemini Route Explanation Demo

Objective: Add a demo-safe voice intent and bounded Gemini explanation layer without giving GenAI route decision authority.

Allowed files:

- frontend/demo presentation files
- focused frontend tests
- `ai-harness/`

Disallowed files:

- backend route logic
- API contracts unless explicitly approved
- deployment files
- dependencies
- real audio capture
- live payment integrations
- Gemini route selection, scoring, approval or state mutation

Acceptance criteria summary:

- browser voice capture is demo intent entry only
- Gemini remains explanation-only
- deterministic route engine boundary remains visible
- passkey approval remains the only approval mechanism
- checks pass

Stop condition: stop after local commit and human review. Do not push or deploy without explicit approval.

## 3C — Demo Launch Pack and Walkthrough

Objective: Prepare launch-ready demo documentation and verification guidance.

Allowed files:

- `ai-harness/`
- docs/demo walkthrough files
- README updates if explicitly scoped

Disallowed files:

- product feature code
- backend route logic
- API contracts
- deployment files unless explicitly approved
- dependencies

Acceptance criteria summary:

- demo walkthrough is clear for an executive audience
- safety talking points are documented
- GCP/GitHub/Cloud Run verification guidance is included
- no push or deploy is run without explicit approval

Stop condition: stop after local commit and human review. Do not push or deploy without explicit approval.
