# Porkbun DNS Setup for speakeasy-ai.app

## Quick Setup (5 minutes)

### Step 1: Log into Porkbun

1. Go to https://porkbun.com/account/domain
2. Click on **speakeasy-ai.app**
3. Click **DNS** in the sidebar

### Step 2: Update DNS Records

**Delete any existing A record pointing to 104.197.19.243**

**Add these 4 new A records:**

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| A | @ | 216.239.32.21 | 600 |
| A | @ | 216.239.34.21 | 600 |
| A | @ | 216.239.36.21 | 600 |
| A | @ | 216.239.38.21 | 600 |

**In Porkbun's interface:**
- Type: Select "A"
- Host: Leave blank or enter "@" (this means root domain)
- Answer: Enter each IP address (create 4 separate records)
- TTL: 600 (default is fine)
- Click "Add" for each one

### Step 3: Optional - Add WWW subdomain

If you want www.speakeasy-ai.app to work too:

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| CNAME | www | ghs.googlehosted.com | 600 |

### Step 4: Verify Domain Ownership

1. Go to https://search.google.com/search-console
2. Click "Add Property"
3. Enter: `speakeasy-ai.app`
4. Choose "DNS record" verification method
5. Google will give you a TXT record like:
   ```
   google-site-verification=xxxxxxxxxxxxx
   ```
6. Go back to Porkbun DNS settings
7. Add a TXT record:
   - Type: TXT
   - Host: @ (leave blank)
   - Answer: The verification string from Google
   - Click "Add"
8. Go back to Google Search Console and click "Verify"

### Step 5: Map Domain in Cloud Run

Once verified, run this command:

```bash
gcloud beta run domain-mappings create \
  --service=speakeasy-web \
  --domain=speakeasy-ai.app \
  --region=us-central1 \
  --project=modular-analog-476221-h8
```

### Step 6: Wait for DNS Propagation

DNS changes usually propagate in 15-30 minutes, but can take up to 48 hours.

**Check if DNS is updated:**
```bash
dig speakeasy-ai.app +short
```

Should show the 4 Google Cloud IPs.

**Test the website:**
```bash
curl -I https://speakeasy-ai.app
```

## Do NOT Change Nameservers

You don't need to change nameservers! Keep them at Porkbun:
- Nameserver 1: curitiba.ns.porkbun.com
- Nameserver 2: fortaleza.ns.porkbun.com
- Nameserver 3: maceio.ns.porkbun.com
- Nameserver 4: salvador.ns.porkbun.com

Just update the DNS records as shown above.

## Troubleshooting

**"Domain not verified" error when mapping:**
- Complete Step 4 (Google Search Console verification)
- Wait a few minutes after adding TXT record
- Make sure you clicked "Verify" in Search Console

**DNS not updating after 30 minutes:**
- Make sure you saved the DNS changes in Porkbun
- Check you're editing the correct domain
- Porkbun has a "DNS Management is Off" switch - make sure it's ON

**Old website still showing:**
- Clear your browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Try in incognito/private mode
- Wait a bit longer for DNS propagation

**SSL certificate error:**
- Google Cloud Run automatically provisions SSL certificates
- This happens after DNS points to Cloud Run
- Wait 15-30 minutes after DNS propagation

## Current Status

- ✅ **New Website:** https://speakeasy-web-823510409781.us-central1.run.app (working now!)
- ⏳ **Custom Domain:** https://speakeasy-ai.app (will work after DNS update)
- ✅ **Backend API:** https://speakeasy-backend-823510409781.us-central1.run.app

## Quick Reference: What Each Record Does

- **A records (216.239.32.21, etc.):** Points your domain to Google's Cloud Run servers
- **TXT record (google-site-verification):** Proves you own the domain to Google
- **CNAME (www -> ghs.googlehosted.com):** Makes www.speakeasy-ai.app work too

---

Need help? The new website is already live at the Cloud Run URL above - you can use it right now while DNS updates!
