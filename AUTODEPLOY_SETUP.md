# Auto-Deploy Setup Guide

## Overview

This guide will help you set up automatic deployment for the SpeakEasy web app. Once configured, every push to the `main` branch on GitHub will automatically:

1. Build the Expo web app
2. Create a Docker image
3. Deploy to Google Cloud Run
4. Update https://speakeasy-ai.app

## Prerequisites

✅ GitHub repository: `theoadoree/speakeasy`  
✅ GitHub token saved to Secret Manager  
✅ Cloud Build configuration: `cloudbuild-web.yaml`  
✅ Dockerfile for web deployment  

## Setup Steps

### 0. Configure GitHub Authentication (one-time, ~5 minutes)

Before creating build triggers, make sure GitHub Actions can authenticate to Google Cloud **without JSON keys**.

```bash
# Run the helper script (prompts for project + repo)
./scripts/setup-gcloud.sh
```

This will:
- Enable required APIs (Run, Cloud Build, Artifact Registry, Secret Manager)
- Create service account `gh-actions-cloudrun@<project>.iam.gserviceaccount.com`
- Assign minimal roles: `run.admin`, `artifactregistry.admin`, `cloudbuild.builds.editor`
- Create Workload Identity Pool/Provider (`gh-oidc-pool` / `gh-provider`)
- Grant your GitHub repo permission to impersonate the service account
- Print the values to add as GitHub secrets:
  - `GCP_PROJECT_ID`
  - `GCP_WORKLOAD_IDENTITY_PROVIDER`
  - `GCP_SERVICE_ACCOUNT_EMAIL`
  - `GCP_ARTIFACT_REPOSITORY` (defaults to `cloud-run`)
  - `OLLAMA_URL`
  - `EXPO_TOKEN`

> Prefer to do it manually? See the command reference at the end of this guide.

### 1. Open Cloud Build Triggers

Visit: https://console.cloud.google.com/cloud-build/triggers?project=modular-analog-476221-h8

### 2. Click "CREATE TRIGGER"

### 3. Connect Your GitHub Repository

1. Select **"GitHub (Cloud Build GitHub App)"**
2. Click **"CONNECT NEW REPOSITORY"**
3. **Authenticate with GitHub** (OAuth popup will open)
4. Select repository: **theoadoree/speakeasy**
5. Click **"CONNECT"**
6. Click **"DONE"**

### 4. Configure the Trigger

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `deploy-web-on-push` |
| **Description** | `Auto-deploy web app to Cloud Run on push to main` |
| **Event** | Push to a branch |
| **Source** | Repository: theoadoree/speakeasy |
| **Branch** | `^main$` (regex pattern) |
| **Configuration** | Cloud Build configuration file (yaml or json) |
| **Location** | Repository |
| **Cloud Build configuration file** | `/cloudbuild-web.yaml` |

### 5. Click "CREATE"

## What Happens Next

Once the trigger is created:

1. **Push to GitHub**: Any push to `main` branch triggers a build
2. **Cloud Build runs**: Executes steps in `cloudbuild-web.yaml`
3. **Web app builds**: Runs `expo export --platform web`
4. **Docker image created**: Builds container from `Dockerfile`
5. **Deploys to Cloud Run**: Updates the `speakeasy-web` service
6. **Domain updated**: https://speakeasy-ai.app serves the new version

## Build Process (cloudbuild-web.yaml)

```yaml
steps:
  1. Install dependencies (npm install)
  2. Build Expo web app (npm run build:web)
  3. Build Docker image
  4. Push to Container Registry
  5. Deploy to Cloud Run
```

**Build time**: ~3-5 minutes  
**Machine**: E2_HIGHCPU_8  
**Timeout**: 20 minutes max  

## Testing the Setup

### Method 1: Test with This Commit

After setting up the trigger, push the current changes:

```bash
git push
```

Watch the build progress:
https://console.cloud.google.com/cloud-build/builds?project=modular-analog-476221-h8

### Method 2: Make a Small Change

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: trigger auto-deploy"
git push
```

### Method 3: Manual Trigger

In the Cloud Console:
1. Go to the trigger you created
2. Click "RUN"
3. Select branch: `main`
4. Click "RUN TRIGGER"

## Monitoring Builds

**Build History**: https://console.cloud.google.com/cloud-build/builds?project=modular-analog-476221-h8

**Cloud Run Service**: https://console.cloud.google.com/run/detail/us-central1/speakeasy-web?project=modular-analog-476221-h8

**Live Website**: https://speakeasy-ai.app

## Troubleshooting

### Build Fails: "npm install" Error

**Solution**: Check package.json is valid and committed

### Build Fails: "expo export" Error

**Solution**: Ensure all dependencies are in package.json

### Build Succeeds But Site Doesn't Update

**Solution**: 
1. Check Cloud Run deployment logs
2. Verify domain mapping: `gcloud run domain-mappings list`
3. Clear browser cache

### Trigger Doesn't Fire

**Solution**:
1. Verify trigger is enabled in Cloud Console
2. Check branch name matches exactly: `main`
3. Ensure GitHub App has repository access
4. Confirm GitHub secrets `GCP_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, and `GCP_SERVICE_ACCOUNT_EMAIL` are set

## Build Costs

**Estimated cost per build**: $0.05 - $0.15  
**Free tier**: 120 build-minutes/day  
**Typical builds**: 3-5 minutes each  

Most users stay within free tier with occasional deployments.

## Alternative: Manual Deployment

If you prefer to deploy manually:

```bash
npm run deploy:web
```

This runs the same build process locally.

## Security Notes

- ✅ GitHub token stored in Secret Manager
- ✅ No secrets in cloudbuild-web.yaml
- ✅ Cloud Run service uses managed service account
- ✅ Domain SSL certificate auto-renewed
- ✅ GitHub Actions authenticates via Workload Identity Federation (no long-lived keys)

## Command Reference: Manual WIF Setup

If you skipped the helper script, run these commands once (replace placeholders):

```bash
PROJECT_ID=your-project-id
REGION=us-central1
SA_NAME=gh-actions-cloudrun
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
POOL_ID=gh-oidc-pool
PROVIDER_ID=gh-provider
GITHUB_REPO=OWNER/REPO    # e.g. theoadoree/speakeasy

# Service account + roles
gcloud iam service-accounts create $SA_NAME --project $PROJECT_ID
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/cloudbuild.builds.editor"

# Artifact Registry repository (optional if already created)
gcloud artifacts repositories create cloud-run \
  --project=$PROJECT_ID \
  --repository-format=DOCKER \
  --location=us-central1 \
  --description="Docker images for SpeakEasy Cloud Run services"

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  --project $PROJECT_ID

# Workload Identity pool + provider
gcloud iam workload-identity-pools create $POOL_ID \
  --project=$PROJECT_ID --location=global --display-name="GitHub OIDC Pool"
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_ID \
  --project=$PROJECT_ID --location=global --workload-identity-pool=$POOL_ID \
  --display-name="GitHub Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref"

WIP="projects/$(gcloud iam workload-identity-pools describe $POOL_ID --project=$PROJECT_ID --location=global --format='value(name)')/providers/$PROVIDER_ID"
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/$WIP/attribute.repository:$GITHUB_REPO"
```

## Next Steps

After setup is complete:

1. ✅ Every push to `main` auto-deploys
2. ✅ Web app always shows latest code
3. ✅ Language selection changes will go live immediately
4. ✅ No manual deployment needed

---

**Need help?** Run: `./setup-autodeploy.sh`
