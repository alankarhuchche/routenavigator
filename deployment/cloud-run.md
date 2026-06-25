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

The repository also keeps a root `Dockerfile` that mirrors `deployment/Dockerfile`, so the simpler Cloud Build command below is valid too:

```bash
gcloud builds submit --tag "${IMAGE}" .
```

The Docker build uses the official Maven/JDK 21 image for the backend stage. Local development still uses `backend/mvnw`, but container builds do not depend on Maven Wrapper downloading Maven.

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

After deploy, open the service URL and check:

```bash
curl -s "https://<cloud-run-url>/api/health"
```

## Runtime notes
- Quarkus listens on `0.0.0.0` and uses the Cloud Run `PORT` environment variable with a local default of `8080`.
- Gemini is disabled by default. Rules/template fallbacks work without credentials.
- The MVP uses local JSON mock data and in-memory traces. PostgreSQL can be added later behind the existing service/repository boundary.
- `--max-instances=1` keeps the in-memory trace/state demo coherent until PostgreSQL or another shared persistence layer is added.
- If you enable Gemini, it may draft structured intent from transcript text and explain redacted route outcomes only. It must not select routes, score routes, approve execution, update payment state or move money.

## Gemini configuration

The app runs safely without Gemini. In fallback mode:
- `/api/intent/classify` uses deterministic rules to create a draft structured intent for customer review.
- `/api/explanations/route` uses a template explanation.
- Browser voice capture remains local SpeechRecognition transcript text only; no raw audio is uploaded.

To enable Gemini in Cloud Run, provide the following environment variables without committing secrets:

```bash
gcloud run services update "${SERVICE}" \
  --region="${REGION}" \
  --set-env-vars=GEMINI_ENABLED=true,GEMINI_MODEL=gemini-2.0-flash \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest
```

Required properties/env vars:
- `GEMINI_ENABLED=true`
- `GEMINI_API_KEY`, preferably mounted from Secret Manager
- `GEMINI_MODEL`, optional; defaults to `gemini-2.0-flash`

Keep the demo boundary clear: Gemini structures draft intent and explains outcomes. The deterministic route engine recommends the route, and customer passkey approval remains required before simulated execution.
