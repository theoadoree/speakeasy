# DNS Setup for speakeasy-ai.app

## Current Status

✅ **Backend API**: Live at https://speakeasy-backend-823510409781.us-central1.run.app
✅ **Web App**: Live at https://speakeasy-web-823510409781.us-central1.run.app
⏳ **Custom Domain**: Requires verification and DNS configuration

## Quick Test

The web app is already live! You can access it at:
```
https://speakeasy-web-823510409781.us-central1.run.app
```

## Option 1: Simple CNAME (Recommended)

If you want `www.speakeasy-ai.app` to work:

**At your domain registrar, add:**
```
Type: CNAME
Name: www
Value: ghs.googlehosted.com
```

Then update your Cloud Run service to map the www subdomain:
```bash
gcloud beta run domain-mappings create \
  --service speakeasy-web \
  --domain www.speakeasy-ai.app \
  --platform managed \
  --region us-central1 \
  --project=modular-analog-476221-h8
```

## Option 2: Root Domain (speakeasy-ai.app)

For the root domain to work, you need to:

### Step 1: Verify Domain Ownership

Visit: https://search.google.com/search-console

1. Add property: `speakeasy-ai.app`
2. Choose DNS verification method
3. Add the TXT record provided by Google to your DNS
4. Click "Verify"

### Step 2: Add DNS Records

Once verified, add these records at your domain registrar:

```
Type: A
Name: @
Values:
  216.239.32.21
  216.239.34.21
  216.239.36.21
  216.239.38.21

Type: AAAA (optional, for IPv6)
Name: @
Values:
  2001:4860:4802:32::15
  2001:4860:4802:34::15
  2001:4860:4802:36::15
  2001:4860:4802:38::15
```

### Step 3: Map Domain in Cloud Run

```bash
gcloud beta run domain-mappings create \
  --service speakeasy-web \
  --domain speakeasy-ai.app \
  --platform managed \
  --region us-central1 \
  --project=modular-analog-476221-h8
```

## Option 3: Quick Test with Redirect

As a temporary solution, you can set up a redirect:

**At your domain registrar:**
```
Type: URL Redirect
From: speakeasy-ai.app
To: https://speakeasy-web-823510409781.us-central1.run.app
```

## Verification

After DNS changes propagate (can take up to 48 hours, usually 15-30 minutes):

```bash
# Check DNS propagation
dig speakeasy-ai.app

# Test the site
curl -I https://speakeasy-ai.app

# Or open in browser
open https://speakeasy-ai.app
```

## SSL Certificate

Google Cloud Run automatically provisions SSL certificates for mapped domains via Let's Encrypt. This happens automatically after:
1. Domain is verified
2. DNS records are configured
3. Domain mapping is created

The certificate usually issues within 15-30 minutes.

## Current Working URLs

Until DNS is configured, use these URLs:

- **Web App**: https://speakeasy-web-823510409781.us-central1.run.app
- **Backend API**: https://speakeasy-backend-823510409781.us-central1.run.app

## Troubleshooting

**Domain mapping fails with "domain not verified":**
- Complete Step 1 above (Google Search Console verification)

**DNS changes not taking effect:**
- Wait 15-30 minutes for propagation
- Check with: `dig speakeasy-ai.app` or `nslookup speakeasy-ai.app`
- Clear your browser cache

**SSL certificate not issuing:**
- Verify DNS records are correct
- Wait up to 30 minutes after DNS propagation
- Check Cloud Run logs for errors

## Support

For more help:
- Cloud Run Custom Domains: https://cloud.google.com/run/docs/mapping-custom-domains
- DNS Verification: https://search.google.com/search-console
- Check deployment status: `gcloud run services describe speakeasy-web --region us-central1`
