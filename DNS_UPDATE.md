# DNS Update Instructions for speakeasy-ai.app

## Current Status

✅ **New Website Deployed:** https://speakeasy-web-823510409781.us-central1.run.app
❌ **Custom Domain:** Currently points to old server (104.197.19.243)

## What Needs to Happen

Your domain `speakeasy-ai.app` needs to point to Google Cloud Run instead of the old server.

## Step 1: Find Your Domain Registrar

Visit where you registered `speakeasy-ai.app`:
- **Google Domains** (most likely)
- GoDaddy
- Namecheap
- Cloudflare

## Step 2: Update DNS Records

Log into your domain registrar and update these DNS records:

### Delete Old Record
```
Type: A
Name: @
Value: 104.197.19.243
```

### Add New Google Cloud Run Records
```
Type: A
Name: @
Values (add all 4):
  216.239.32.21
  216.239.34.21
  216.239.36.21
  216.239.38.21
```

### Optional: Add IPv6 Records (AAAA)
```
Type: AAAA
Name: @
Values:
  2001:4860:4802:32::15
  2001:4860:4802:34::15
  2001:4860:4802:36::15
  2001:4860:4802:38::15
```

## Step 3: Verify Domain Ownership

Visit Google Search Console and verify domain ownership:
https://search.google.com/search-console

1. Click "Add Property"
2. Enter: `speakeasy-ai.app`
3. Choose "DNS verification"
4. Add the TXT record they provide to your DNS
5. Click "Verify"

## Step 4: Map Domain in Cloud Run

Once DNS is updated and verified, run this command:

```bash
gcloud beta run domain-mappings create \
  --service=speakeasy-web \
  --domain=speakeasy-ai.app \
  --region=us-central1 \
  --project=modular-analog-476221-h8
```

## Step 5: Wait for Propagation

DNS changes can take 15 minutes to 48 hours to propagate globally.

Check status:
```bash
dig speakeasy-ai.app +short
```

Should return:
```
216.239.32.21
216.239.34.21
216.239.36.21
216.239.38.21
```

## Alternative: Quick Setup with Google Domains

If you registered with Google Domains, you can use Cloud Domains:

```bash
# Check if domain is in Google Domains
gcloud domains registrations list --project=modular-analog-476221-h8
```

If it shows up, the domain mapping should work automatically after verification.

## Troubleshooting

**Domain not verified error:**
- Complete Step 3 (Google Search Console verification)

**DNS not updating:**
- Check you're editing the correct domain registrar
- Wait 30 minutes for propagation
- Clear your browser cache

**SSL certificate not issuing:**
- Wait 15-30 minutes after DNS propagation
- Certificate is automatically issued by Google Cloud Run

## Current URLs

Until DNS is updated:

- **NEW Website (working):** https://speakeasy-web-823510409781.us-central1.run.app
- **OLD Website (will be replaced):** https://speakeasy-ai.app
- **Backend API:** https://speakeasy-backend-823510409781.us-central1.run.app

---

Need help? The new website is already live and working at the Cloud Run URL above!
