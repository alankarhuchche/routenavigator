# Current Phase

Phase 1K — Deployment readiness and Cloud Run deploy

## Objective

Verify that the current Payment Route Intelligence Phase 1 UI is production-build ready, then deploy to GCP Cloud Run only after explicit user confirmation.

## Expected Scope

- Deployment readiness review.
- Inspect Cloud Build, Docker and Cloud Run docs/config.
- Verify the Vite production build is copied into the Quarkus container.
- Run relevant frontend and backend checks.
- Build and smoke-test the local container if Docker is available.
- Do not deploy without explicit user confirmation.
- Do not change backend, route decision logic, deployment files or API contracts unless a clear deployment blocker is found.

## Files Likely to Inspect

- `ai-harness/09-handoff-to-ai.md`
- `ai-harness/10-deployment-readiness.md`
- `ai-harness/11-open-risks.md`
- `Dockerfile`
- `deployment/Dockerfile`
- `cloudbuild.yaml`
- `deployment/cloud-run.md`
- `frontend/package.json`
- `backend/pom.xml`
- `backend/src/main/resources/application.properties`

## Key Risks

- Cloud Run serving stale frontend assets if the production container packaging is wrong.
- Deploying before committing/pushing the intended source.
- Running deploy commands without explicit confirmation.
- Maven/Docker/Cloud Build differences between local and Cloud Build.
- In-memory demo state requiring `--max-instances=1` until persistence exists.
- Accidental introduction of secrets, live integrations or Gemini authority.

## Acceptance Criteria Summary

- Deployment files are inspected.
- Frontend lint/typecheck/build/test pass.
- Backend tests/package pass or any failure is clearly explained.
- Production frontend assets are confirmed to be included in the container build path.
- Local container smoke test passes if Docker is available.
- Cloud Run service/project/region are confirmed before deployment.
- No deploy is run without explicit user confirmation.
- No live payment integrations, production secrets or real customer data are introduced.
