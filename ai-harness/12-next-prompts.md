# Next Prompts

These prompts are ready to paste into Claude, Codex, or another AI coding assistant.

## A. Phase 1K Deployment Readiness And Cloud Run Deploy

```text
You are working in:

/Users/alankarapple/Documents/GitHub/routenavigator

Task: Phase 1K — Deployment readiness and Cloud Run deploy.

Context:
Read first:
- ai-harness/README.md
- ai-harness/00-product-context.md
- ai-harness/01-architecture-context.md
- ai-harness/02-delivery-principles.md
- ai-harness/03-backlog.md
- ai-harness/04-current-phase.md
- ai-harness/09-handoff-to-ai.md
- ai-harness/10-deployment-readiness.md
- ai-harness/11-open-risks.md

Constraints:
- Do not change route decision logic.
- Do not change app behavior unless a clear deployment blocker is found.
- Do not add dependencies.
- Do not deploy until you explicitly ask me and I confirm.
- Keep Gemini disabled by default.

Required changes:
1. Inspect Dockerfile, deployment/Dockerfile, cloudbuild.yaml and deployment/cloud-run.md.
2. Verify production frontend build assets are copied into the Quarkus container.
3. Run frontend lint, typecheck, build and tests.
4. Run backend tests/package if practical.
5. If Docker is available, build and smoke-test the local container.
6. Report exact deploy command and ask for confirmation before running it.
7. If I confirm, deploy to Cloud Run and verify /api/health and the UI URL.

Acceptance criteria:
- Deployment files are inspected.
- Frontend checks pass.
- Backend/package checks pass or any failure is clearly explained.
- Local container smoke test passes if Docker is available.
- No deploy is run without explicit user confirmation.
- If deployed, Cloud Run URL and health result are reported.
- No live payment integrations, secrets or production data are introduced.

Commands to run:
- git status --short --branch
- cd frontend && npm run lint
- cd frontend && npm run typecheck
- cd frontend && npm run build
- cd frontend && npm run test
- cd backend && ./mvnw test
- cd backend && ./mvnw package -DskipTests
- docker build -f deployment/Dockerfile -t route-navigator:local .  # if Docker is available

Output format:
1. Files inspected
2. Files changed, if any
3. Build/test results
4. Local container result
5. Deployment readiness result
6. Exact deploy command
7. Whether deployment was run
8. Risks/follow-up
```

## B. Phase 2A Harness Automation Improvements

```text
You are working in:

/Users/alankarapple/Documents/GitHub/routenavigator

Task: Phase 2A — harness automation improvements.

Context:
Read ai-harness/README.md, 00-product-context.md, 02-delivery-principles.md, 03-backlog.md, 04-current-phase.md, 09-handoff-to-ai.md and 12-next-prompts.md.

Constraints:
- Documentation/scripts only.
- Do not modify frontend app behavior.
- Do not modify backend, route logic, deployment files or API contracts.
- Do not add dependencies unless strictly necessary.
- Do not deploy.

Required changes:
1. Inspect scripts/ai-next-task.sh and ai-harness files.
2. Improve the lightweight harness workflow if needed so a future assistant can quickly see the current phase and relevant files.
3. Keep scripts simple and shell-only if possible.
4. Update ai-harness docs if workflow changes.

Acceptance criteria:
- The next task/current phase can be discovered from repo-local files.
- Any script is simple, readable and safe.
- No application source behavior changes.
- No dependencies added.
- git status is reported.

Commands to run:
- git status --short
- find ai-harness -maxdepth 1 -type f | sort
- ./scripts/ai-next-task.sh  # only if present and executable

Output format:
1. Files changed
2. Workflow summary
3. Commands run and results
4. Acceptance criteria result
5. Risks/follow-up
6. Confirmation: no deploy run
```

## C. Phase 2B Extract Map Journey Adapter

```text
You are working in:

/Users/alankarapple/Documents/GitHub/routenavigator

Task: Phase 2B — extract map journey adapter.

Context:
The Payment Journey Map works, but LeafletRouteMap.tsx is getting large. Extract frontend-only route-to-journey adapter logic without changing visible behavior.

Constraints:
- Frontend only.
- Do not modify backend, route decision logic, deployment files or API contracts.
- Do not change map copy or product behavior except tiny clarity fixes if required.
- Do not add dependencies.
- Do not deploy.

Required changes:
1. Inspect frontend/src/components/LeafletRouteMap.tsx.
2. Extract the route/journey node adapter into a small helper module, likely under frontend/src.
3. Add or update focused tests if practical.
4. Preserve current map behavior and safety wording.

Acceptance criteria:
- LeafletRouteMap.tsx is smaller and easier to read.
- Adapter logic is typed and covered where practical.
- Map still shows representative journey, numbered nodes, controls, finality/PONR and alternatives.
- No unsafe wording is introduced.
- Lint, typecheck, build and tests pass.

Commands to run:
- cd frontend && npm run lint
- cd frontend && npm run typecheck
- cd frontend && npm run build
- cd frontend && npm run test

Output format:
1. Files changed
2. Refactor summary
3. Behavior preservation notes
4. Commands run and results
5. Acceptance criteria result
6. Risks/follow-up
```

## D. Phase 2C Frontend/Backend Route Data Alignment

```text
You are working in:

/Users/alankarapple/Documents/GitHub/routenavigator

Task: Phase 2C — route data alignment between frontend and backend.

Context:
Frontend scenario/demo data and backend mock route data may drift. Align them carefully without changing the deterministic route engine unless explicitly needed and reviewed.

Constraints:
- Inspect both frontend and backend data first.
- Do not change route decision logic unless a specific mismatch requires it and you report it.
- Do not connect to live systems.
- Do not add dependencies.
- Do not deploy.

Required changes:
1. Inventory frontend demo data and backend mock data.
2. Identify mismatches in route names, IDs, currencies, ETA, fees, finality, rejected reasons and safety copy.
3. Propose the smallest alignment plan.
4. Implement only low-risk data/copy alignment if safe.
5. Add/update tests where practical.

Acceptance criteria:
- Mismatches are listed.
- Any changes are data/copy scoped unless explicitly justified.
- Route engine behavior remains deterministic.
- No unsafe claims are introduced.
- Frontend and backend checks pass for touched areas.

Commands to run:
- git status --short --branch
- cd frontend && npm run lint
- cd frontend && npm run typecheck
- cd frontend && npm run build
- cd frontend && npm run test
- cd backend && ./mvnw test

Output format:
1. Files inspected
2. Mismatches found
3. Files changed
4. Test/build results
5. Acceptance criteria result
6. Risks/follow-up
```

## E. Phase 2D Approval Step Transition Cleanup

```text
You are working in:

/Users/alankarapple/Documents/GitHub/routenavigator

Task: Phase 2D — approval step transition cleanup.

Context:
Phase 1 accepts a single-page guided journey. Approval currently sits structurally close to Route Intelligence. Make Approval & Tracking feel like a clearer customer step without rewriting backend or navigation.

Constraints:
- Frontend only.
- Do not modify backend, route decision logic, deployment files or API contracts.
- Do not add real passkeys, real execution, real biometrics or real payments.
- Preserve route comparison, trace, map, approval, tracker and simulator behavior.
- Do not deploy.

Required changes:
1. Inspect App.tsx, FinalApprovalCard.tsx, PaymentTracker.tsx and ControlRoom.tsx.
2. Improve the transition from route recommendation to final approval.
3. Keep final approval boundary explicit: no money moves until customer approval.
4. Keep internal simulator controls secondary.
5. Avoid adding major new panels unless needed.

Acceptance criteria:
- Approval & Tracking is visually and narratively distinct.
- Customer approval remains explicit and mocked where appropriate.
- Agent cannot approve or move money.
- Existing simulator/tracker functionality remains available.
- Lint, typecheck, build and tests pass.

Commands to run:
- cd frontend && npm run lint
- cd frontend && npm run typecheck
- cd frontend && npm run build
- cd frontend && npm run test

Output format:
1. Files changed
2. Journey transition summary
3. Copy safety result
4. Commands run and results
5. Acceptance criteria result
6. Risks/follow-up
```
