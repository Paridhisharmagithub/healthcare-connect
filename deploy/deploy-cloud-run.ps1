# Safe defaults for always-free Cloud Run (us-central1, scale to zero, cap instances).
# Usage: .\deploy\deploy-cloud-run.ps1 -ProjectId YOUR_PROJECT -GeminiKey ... -MongoUri ...

param(
  [Parameter(Mandatory = $true)][string]$ProjectId,
  [Parameter(Mandatory = $true)][string]$FlaskEnvVars,
  [string]$Region = "us-central1",
  [string]$AllowedOrigins = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$common = @(
  "--project", $ProjectId,
  "--region", $Region,
  "--platform", "managed",
  "--allow-unauthenticated",
  "--min-instances", "0",
  "--max-instances", "2"
)

Write-Host "Deploying AI service..."
Push-Location "$PSScriptRoot\..\backend\ai-service"
gcloud run deploy healthcare-ai `
  @common `
  --source . `
  --memory 512Mi `
  --cpu 1 `
  --timeout 120 `
  --concurrency 10 `
  --set-env-vars $FlaskEnvVars
$aiUrl = (gcloud run services describe healthcare-ai --region $Region --format="value(status.url)")
Pop-Location

Write-Host "AI URL: $aiUrl"

Write-Host "Deploying API gateway..."
Push-Location "$PSScriptRoot\..\backend\api-gateway"
gcloud run deploy healthcare-api `
  @common `
  --source . `
  --memory 256Mi `
  --cpu 1 `
  --timeout 120 `
  --concurrency 80 `
  --set-env-vars "FLASK_AI_URL=$aiUrl,ALLOWED_ORIGINS=$AllowedOrigins"
$apiUrl = (gcloud run services describe healthcare-api --region $Region --format="value(status.url)")
Pop-Location

Write-Host "Done."
Write-Host "Set REACT_APP_API_URL=$apiUrl in frontend before npm run build"
