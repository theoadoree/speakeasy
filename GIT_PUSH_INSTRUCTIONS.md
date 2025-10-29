# Git Push Instructions - Secret Scanning Block

## 🚨 GitHub Blocked Push Due to Secrets

GitHub's secret scanning found credentials in git history:

1. **Google Cloud Service Account** in `gcloud-sa-key.json` (commit 5c57a2f)
2. **OpenAI API Key** in `backend/cloudbuild-deploy.yaml` (commits 5c57a2f and d3fc19a)

## ✅ Already Fixed in Latest Commit

I've already secured the repository:
- ✅ Removed secrets from current files
- ✅ Added secrets to `.gitignore`
- ✅ Configured to use Google Cloud Secret Manager
- ✅ Committed security fixes (commit d9b54fc)

## 🔑 Options to Push

### Option 1: Allow Secrets via GitHub (Quick)

**If these secrets are already rotated/revoked:**

1. Visit these URLs to allow the secrets:
   - [Allow Google Cloud SA Key](https://github.com/theoadoree/speakeasy/security/secret-scanning/unblock-secret/34iyI2lg2TWUvqMBzjlIY8AqaJn)
   - [Allow OpenAI API Key](https://github.com/theoadoree/speakeasy/security/secret-scanning/unblock-secret/34iyI6VxvZ7UCXvwKLUIp4pQMvh)

2. Then push:
   ```bash
   git push origin main
   ```

### Option 2: Clean Git History (Recommended)

**Completely remove secrets from git history:**

#### Step 1: Install git-filter-repo
```bash
brew install git-filter-repo
```

#### Step 2: Clean history
```bash
# Remove sensitive file from all history
git filter-repo --path gcloud-sa-key.json --invert-paths

# Remove specific lines with secrets (more complex)
# This requires creating a replacement file
```

#### Step 3: Force push
```bash
git push origin main --force
```

⚠️ **Warning**: This rewrites history and will affect anyone else working on the repo.

### Option 3: Create New Repo (Nuclear Option)

If secrets are compromised and you want a clean slate:

1. **Rotate ALL credentials immediately**:
   - Revoke OpenAI API key
   - Delete Google Cloud service account
   - Generate new credentials

2. **Create fresh repository**:
   ```bash
   # Create new branch without history
   git checkout --orphan clean-main
   git add -A
   git commit -m "Initial commit with clean history"

   # Force push to create new history
   git push origin clean-main:main --force
   ```

## 🔐 Rotate These Secrets NOW

**You must rotate these exposed credentials:**

1. **OpenAI API Key**
   - Go to: https://platform.openai.com/api-keys
   - Revoke: `sk-proj-uTw5FFa1XRqjfyDL...`
   - Generate new key
   - Store in Google Secret Manager:
     ```bash
     echo -n "YOUR_NEW_KEY" | gcloud secrets create openai-api-key --data-file=-
     ```

2. **Apple Private Key**
   - The Base64-encoded key in cloudbuild-deploy.yaml
   - Revoke in Apple Developer Console
   - Generate new key
   - Store in Secret Manager

3. **Google Cloud Service Account**
   - Delete the service account in GCP Console
   - Create new service account
   - Download new key file
   - Keep it LOCAL only (already in .gitignore)

## 🎯 Recommended Approach

**For immediate push** (if keys already rotated):
1. Use Option 1 - Allow secrets via GitHub URLs above
2. Push your code: `git push origin main`

**For long-term security** (do this after push):
1. Rotate all exposed credentials (see above)
2. Verify secrets are in Secret Manager, not code
3. Never commit credentials again

## ✅ Future Prevention

Already set up for you:

```gitignore
# .gitignore now includes:
gcloud-sa-key.json
*.pem
*.key
*.p8
.env.local
.env.production
```

**Deployment now uses Secret Manager:**
```yaml
# backend/cloudbuild-deploy.yaml
# Secrets stored in GCP Secret Manager
# Set via: gcloud run services update speakeasy-backend \
#   --update-secrets=OPENAI_API_KEY=openai-api-key:latest
```

## 🚀 Quick Push Command

**After handling secrets above, run:**

```bash
git push origin main
```

## Need Help?

If GitHub still blocks after allowing secrets:
```bash
# Check current status
git log --oneline -5

# View URLs in error message and click to allow
# Then retry push
```
