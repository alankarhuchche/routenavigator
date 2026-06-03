# Cloud Run Demo Deployment

This deployment path creates one container that serves the React demo UI and Quarkus REST APIs from the same Cloud Run URL.

No live payment rails, SWIFT, bank accounts, wallets, stablecoin networks, FX systems, sanctions systems, real customer data or production secrets are required.

## Local container build
```bash
docker build -f deployment/Dockerfile -t route-navigator:local .
docker run --rm -p 8080:8080 route-navigator:local
curl -I http://127.0.0.1:8080/
curl -s http://127.0.0.1:8080/api/health
```

## Cloud Run deploy
Set project variables:

```bash
export PROJECT_ID=<your-gcp-project>
export REGION=europe-west2
export SERVICE=route-navigator-demo
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/route-navigator/${SERVICE}:latest"
```

Create an Artifact Registry repository once:

```bash
gcloud artifacts repositories create route-navigator \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Route Navigator demo images"
```

Build and push:

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_IMAGE="${IMAGE}" \
  .
```

Deploy:

```bash
gcloud run deploy "${SERVICE}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars=GEMINI_ENABLED=false
```

After deploy, open the service URL and check:

```bash
curl -s "https://<cloud-run-url>/api/health"
```

## Runtime notes
- Quarkus listens on `0.0.0.0` and uses the Cloud Run `PORT` environment variable with a local default of `8080`.
- Gemini is disabled by default. Template explanations work without credentials.
- The MVP uses local JSON mock data and in-memory traces. PostgreSQL can be added later behind the existing service/repository boundary.
- If you enable Gemini later, keep it explanation-only and feed it only the redacted Decision Trace.
