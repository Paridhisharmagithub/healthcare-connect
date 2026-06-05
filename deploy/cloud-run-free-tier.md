# Deploy Healthcare Connect on Cloud Run (zero paid usage goal)

This guide targets **Google Cloud “always free” Cloud Run quotas**, not the **$300 trial credit**. Trial credit is only consumed if you exceed free-tier limits while on a trial billing account.

## Suitability summary

| Component | Cloud Run fit | Notes |
|-----------|---------------|--------|
| Node API gateway | Good | Small image, scales to zero |
| Flask AI + OCR | OK with limits | Heavy image (Tesseract); long requests use more **GiB-seconds** |
| React frontend | **Do not** host on Cloud Run | Use **Firebase Hosting** (free CDN/static) instead |
| Firebase Auth/Firestore | External (Firebase) | Spark plan free limits; not Cloud Run |
| MongoDB medicine DB | External (Atlas M0) | Free cluster; not GCP |
| Gemini API | External (AI Studio) | Free quota; can bill if exceeded |
| Jitsi video | External (`meet.jit.si`) | Free third-party |

You need **two** Cloud Run services (gateway + AI) unless you merge them later.

## Always-free Cloud Run limits (per billing account / month)

Deploy only in: **`us-central1`**, **`us-east1`**, or **`us-west1`**.

- 2,000,000 requests
- 360,000 GiB-seconds memory
- 180,000 vCPU-seconds
- 1 GB egress (North America)

Exceeding these on a **paid** billing account charges your card. On a **trial** account, overages eat **$300 credit** — avoid that by staying in free quotas and setting budgets (below).

## Billing account reality

Google typically requires a **billing account** (card on file) for Cloud Run, even when usage stays $0. That is not the same as spending money. To avoid trial credit use:

1. Prefer a **paid billing account** with a **$0 budget alert**, or
2. Stay well under always-free limits so trial credit is never touched.

## Safe deploy commands

Replace `PROJECT_ID` and URLs. Run from repo root.

### 1. AI service (deploy first)

```bash
cd backend/ai-service

gcloud run deploy healthcare-ai \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 120 \
  --concurrency 10 \
  --min-instances 0 \
  --max-instances 2 \
  --set-env-vars "MONGO_URI=...,DB_NAME=...,COLLECTION_NAME=...,GEMINI_API_KEY=...,GEMINI_MODEL=models/gemini-2.5-flash"
```

Copy the service URL (e.g. `https://healthcare-ai-xxxxx-uc.a.run.app`).

### 2. API gateway

```bash
cd backend/api-gateway

gcloud run deploy healthcare-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --timeout 120 \
  --concurrency 80 \
  --min-instances 0 \
  --max-instances 2 \
  --set-env-vars "FLASK_AI_URL=https://healthcare-ai-xxxxx-uc.a.run.app,ALLOWED_ORIGINS=https://YOUR_PROJECT.web.app"
```

### 3. Firestore rules and indexes (one-time)

```bash
firebase deploy --only firestore
```

### 4. Frontend (Firebase Hosting — free, not Cloud Run)

```bash
cd frontend
# Set REACT_APP_* and REACT_APP_API_URL in .env.production.local then:
npm run build
cd ..
firebase deploy --only hosting
```

Set `REACT_APP_API_URL` to the **healthcare-api** Cloud Run URL (no `/api` suffix).

Appointments are stored in **Firestore** (no extra Cloud Run cost). Patients must enter the doctor's **exact registered name** when booking.

## Cost guards (required)

```bash
# Budget alert at $1 (email when anything bills)
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="healthcare-zero-spend" \
  --budget-amount=1USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

Never set `--min-instances` above `0`. Never add a **Cloud Load Balancer** in front of Cloud Run (~$18+/mo). Avoid **VPC connectors**, **Cloud SQL**, and **min-instances** on AI.

## What can still charge you (outside Cloud Run free tier)

| Risk | Why | Mitigation |
|------|-----|------------|
| Traffic spike | Many instances × long OCR/AI | `--max-instances 2`, budget alert |
| Wrong region | No free-tier credit | `us-central1` only |
| Gemini over quota | AI Studio billing | Monitor AI Studio quotas |
| Firebase Blaze overage | Reads/writes/storage | Stay on Spark; watch Firestore limits |
| MongoDB Atlas | Paid tier / backup | Stay on M0 free |
| Egress > 1 GB/mo | Large file downloads | Limit uploads (gateway already 5 MB) |
| Artifact Registry storage | Old images | Delete unused images |
| Cloud Logging volume | Verbose logs | Use default retention; avoid debug floods |
| Secret Manager | Per-access fees | Use Cloud Run env vars for class projects |

## Health checks

- Gateway: `GET https://healthcare-api-.../health`
- AI: `GET https://healthcare-ai-.../health` → `mongo_configured`, `gemini_configured`
