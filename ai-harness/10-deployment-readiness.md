# Deployment Readiness

This file captures the next deployment-readiness pass for Payment Route Intelligence.

## Current Deployment Concern

The UI was viewed via the local Vite development server during Phase 1 work. Cloud Run must serve production-built frontend assets from the deployed container.

The current Docker path builds the Vite app and copies `frontend/dist/` into `backend/src/main/resources/META-INF/resources/` before packaging Quarkus. The deployment readiness pass must verify that Cloud Run is serving those fresh production assets, not stale frontend output.

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
- Deployed UI shows Payment Route Intelligence Phase 1 journey.
- No live payment integrations, real secrets or production data are introduced.
