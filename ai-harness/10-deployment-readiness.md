# Deployment Readiness

This file captures deployment-readiness notes for Money Movement Intelligence, formerly Payment Route Intelligence.

## Last Successful Deployment

- Date: 2026-06-23
- Commit: `053f9ce`
- Status: successful
- Deployment path: GitHub -> Cloud Build -> Cloud Run
- Validation: manually confirmed working

## Current Deployment Concern

The UI was viewed via the local Vite development server during Phase 1 work. Cloud Run must serve production-built frontend assets from the deployed container.

The current Docker path builds the Vite app and copies `frontend/dist/` into `backend/src/main/resources/META-INF/resources/` before packaging Quarkus. The deployment readiness pass must verify that Cloud Run is serving those fresh production assets, not stale frontend output.

## Last Local Release-Gate QA

- Date: 2026-06-25
- Commit under review: `eee49cb` plus local Phase 3E blocker fix
- Automated validation: frontend lint/typecheck/build/test passed; backend test and package passed; `scripts/ai-precommit-check.sh` passed
- Runtime smoke: Vite UI plus local backend fallback mode completed the five-stage journey with no page-level JavaScript errors
- Deployment mode: Cloud Run Docker path still builds Vite assets and copies `frontend/dist/` into Quarkus static resources before packaging
- Gemini mode: fallback mode is ready without secrets; live Gemini still requires explicit `GEMINI_ENABLED`, `GEMINI_API_KEY` and optional `GEMINI_MODEL` configuration

## Voice Transcript Deployment Note

- Phase 3D-fix keeps browser SpeechRecognition local to the client. Interim transcript captions are displayed only in the browser.
- Final captured transcript must be confirmed before it is sent as text to `/api/intent/classify`.
- No raw audio is uploaded or sent to Gemini.

## Phase 4A Deployment Note

- Phase 4A reframed visible product language to Money Movement Intelligence.
- No route decision logic, payment execution logic, API contracts, deployment files or dependencies changed.
- Customer insight screen and Bank Intelligence drawer are future Phase 4B/4C items.
- Before the next push/deploy, verify the production build serves the Money Movement Intelligence header and Money Movement Intent stage.

## Phase 4B Deployment Note

- Phase 4B adds a frontend-only Bank Intelligence drawer and lighter Customer View framing.
- No route decision logic, payment execution logic, API contracts, deployment files, dependencies or customer profile/scoring logic changed.
- Before the next push/deploy, verify the drawer opens and closes on all five stages and remains secondary to the customer journey.
- Customer Insight Context was added in Phase 4C as a frontend/demo context stage only. It uses mock/static data and does not change route scoring, backend route decision logic or deployment packaging.

## Phase 4C Deployment Note

- Phase 4C is local-only until a human-approved push/release gate.
- The Vite production build passes locally with the six-stage journey.
- Backend tests and packaging pass locally.
- Customer insight context is mocked/static and does not require secrets, production data or external services.
- No deploy was run for Phase 4C.

## Phase 4D Deployment Note

- Phase 4D is local-only until a human-approved push/release gate.
- Profile-aware explanation is frontend-only and does not change backend route decision logic, route scoring/ranking, API contracts or deployment packaging.
- Customer insight remains mocked/static and explanation context only.
- No deploy was run for Phase 4D.

## Phase 4E Deployment Note

- Phase 4E-implementation is local-only until regression QA and explicit human approval to push.
- Route-decision requests remain backwards-compatible and may carry optional mocked customer insight.
- Customer-fit runs only after hard controls, only for `AVAILABLE` routes, and is capped at `-5` to `+10`.
- Missing, declined or unconsented insight applies zero adjustment.
- No deployment files, dependencies, payment execution logic, secrets or live integrations changed.
- Before release, verify both insight and no-insight journeys from the production-built frontend and confirm the Bank Intelligence score evidence.
- No deploy was run for Phase 4E.

## Phase 4F Customer-Fit Release Gate

- Date: 2026-07-04
- Commit under review: `cdb3646` (`Implement bounded customer-fit scoring`)
- Decision: `READY_TO_PUSH_FALLBACK_ONLY`
- Frontend validation: lint, typecheck, production build and all 40 tests passed.
- Backend validation: all 38 tests and Quarkus packaging passed.
- Behavioral API QA: insight off, insight on, unconsented and missing-context requests all returned valid score evidence.
- Hard-control result: excluded routes were absent from score results and could not be rescued by customer fit.
- Bounded-score result: positive adjustment capped at `+10`; observed negative adjustment was `-3` and code enforces a `-5` lower bound.
- No-insight result: disabled, unconsented and missing insight all produced adjustment `0` with `insightUsed=false`.
- Insight comparison (`SCN-003`): selected route remained `route-wallet-to-wallet-stablecoin`; off was `90.65 + 0 = 90.65`, on was `90.65 + 10 = 100` with cap status and seven reasons.
- Local runtime: Vite served `200` at `http://127.0.0.1:5173/` and proxied `/api/health` successfully to Quarkus.
- Production packaging: `cloudbuild.yaml` builds `deployment/Dockerfile`; Vite `dist/` is copied into Quarkus `META-INF/resources` before backend packaging. Root and deployment Dockerfiles match.
- Local Docker verification: not run because Docker is not installed on this machine.
- Gemini: fallback mode is release-ready; live Gemini was not validated. Gemini remains outside route scoring/ranking/selection.
- Secret scan: no private-key or Google API-key patterns found in tracked files.
- No push or deployment was run during Phase 4F.

## Phase 5A Deployment Note

- Phase 5A is frontend and harness only; no backend route scoring, API contract, payment execution or deployment file changed.
- Money Movement Intent starts empty, offers an explicit demo example and reveals structured/confirmation content only after customer action.
- Customer Insight and Bank Intelligence copy now match the implemented bounded customer-fit scoring model.
- Before release, verify the initial Stage 2 composer is empty, the demo example is labelled, and both manual and voice structuring still unlock confirmation.
- No push or deployment was run during Phase 5A.

### Pre-Push Gate

- Confirm the approved release range and `main` branch.
- Confirm only `.claude/worktrees` noise is uncommitted.
- Confirm fallback-only release posture with `GEMINI_ENABLED=false`.
- Require explicit human approval before `git push origin main`.

### Post-Deploy Verification

- Confirm Cloud Build completes from the approved commit and uses `deployment/Dockerfile`.
- Confirm Cloud Run revision is healthy and `/api/health` returns `ok`.
- Confirm the production URL serves the six-stage Money Movement Intelligence UI.
- Exercise insight on and off; verify base, adjustment and final score evidence.
- Confirm excluded routes remain unscored and the no-insight adjustment remains zero.
- Confirm fallback intent structuring and template explanation work with `GEMINI_ENABLED=false`.
- Confirm representative-map, no-live-telemetry and passkey approval boundaries remain visible.
- Do not enable live Gemini until its Secret Manager configuration and explanation-only behavior are separately verified.

## Do Not Deploy Without Confirmation

Do not run Cloud Build or Cloud Run deployment commands without explicit user confirmation in the active task.

## Files To Inspect

- `Dockerfile`
- `deployment/Dockerfile`
- `cloudbuild.yaml`
- `deployment/cloud-run.md`
- `frontend/package.json`
- `backend/pom.xml`
- `backend/src/main/resources/application.properties`

## Deployment Readiness Checklist

- [ ] Inspect root `Dockerfile`.
- [ ] Inspect `deployment/Dockerfile`.
- [ ] Inspect `cloudbuild.yaml`.
- [ ] Inspect `deployment/cloud-run.md`.
- [ ] Run frontend lint/typecheck/build/test.
- [ ] Confirm Vite build output is copied into the deployed container.
- [ ] Confirm Cloud Run service name, project and region with the user.
- [ ] Avoid stale frontend assets by building from the current committed source.
- [ ] Confirm Gemini remains disabled unless explicitly configured.
- [ ] Confirm intent structuring falls back to rules when Gemini is disabled or unavailable.
- [ ] If enabling Gemini, set `GEMINI_ENABLED=true`, provide `GEMINI_API_KEY` via Secret Manager, and optionally set `GEMINI_MODEL`.
- [ ] Confirm no production secrets are required.
- [ ] Confirm `/api/health` works after local container run or deployment.
- [ ] Confirm the deployed URL shows the Phase 1 UI, not an old UI.

## Known Local Verification Commands

```bash
cd frontend && npm run lint
cd frontend && npm run typecheck
cd frontend && npm run build
cd frontend && npm run test
```

From `deployment/cloud-run.md`, local container verification is:

```bash
docker build -f deployment/Dockerfile -t route-navigator:local .
docker run --rm -p 8080:8080 route-navigator:local
curl -I http://127.0.0.1:8080/
curl -s http://127.0.0.1:8080/api/health
```

## Known Cloud Build And Deploy Commands

Only run these after explicit user confirmation.

```bash
export PROJECT_ID=<your-gcp-project>
export REGION=europe-west2
export SERVICE=route-navigator-demo
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/route-navigator/${SERVICE}:latest"
```

Create the Artifact Registry repository once:

```bash
gcloud artifacts repositories create route-navigator \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Route Navigator demo images"
```

Build and push with the repo Cloud Build config:

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_IMAGE="${IMAGE}" \
  .
```

The repo docs also note that the root `Dockerfile` mirrors `deployment/Dockerfile`, so this simpler build command is valid:

```bash
gcloud builds submit --tag "${IMAGE}" .
```

Deploy:

```bash
gcloud run deploy "${SERVICE}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --max-instances=1 \
  --set-env-vars=GEMINI_ENABLED=false
```

After deploy:

```bash
curl -s "https://<cloud-run-url>/api/health"
```

## Deployment Placeholders

- Service name: `<confirm before deploy>`
- Region: `<confirm before deploy>`
- Project: `<confirm before deploy>`
- Deployed URL: `<fill after deploy>`
- Last deploy date: `<fill after deploy>`

## Deployment Acceptance

- Frontend lint/typecheck/build/test pass.
- Docker or Cloud Build builds from current source.
- Production container serves fresh Vite assets.
- Cloud Run health endpoint responds.
- Deployed UI shows the current Money Movement Intelligence journey.
- No live payment integrations, real secrets or production data are introduced.
