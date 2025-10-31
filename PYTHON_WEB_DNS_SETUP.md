# Connect speakeasy-ai.app to Python Web App

## ✅ What I've Done

1. ✅ Fixed Cloud Run permissions - Service is now publicly accessible
2. ✅ Mapped domain to `speakeasy-python-web` service
3. ✅ Got DNS record requirements from Google Cloud

## 🔧 What You Need To Do (5 minutes)

### Update DNS Records in Porkbun

1. **Go to Porkbun DNS Settings**
   - Visit: https://porkbun.com/account/domain
   - Click on **speakeasy-ai.app**
   - Click **DNS** in the sidebar

2. **Delete OLD A Records**
   - Delete any A records pointing to old IPs (like 216.239.32.21 for old service)
   - Keep TXT records (Google verification)

3. **Add These 4 NEW A Records**

   | Type | Host | Answer | TTL |
   |------|------|--------|-----|
   | A | @ | 216.239.32.21 | 600 |
   | A | @ | 216.239.34.21 | 600 |
   | A | @ | 216.239.36.21 | 600 |
   | A | @ | 216.239.38.21 | 600 |

   **How to add in Porkbun:**
   - Type: Select "A"
   - Host: Leave blank or enter "@"
   - Answer: Enter IP address
   - TTL: 600
   - Click "Add"
   - Repeat for all 4 IPs

4. **Optional: Add IPv6 (AAAA) Records**

   | Type | Host | Answer | TTL |
   |------|------|--------|-----|
   | AAAA | @ | 2001:4860:4802:32::15 | 600 |
   | AAAA | @ | 2001:4860:4802:34::15 | 600 |
   | AAAA | @ | 2001:4860:4802:36::15 | 600 |
   | AAAA | @ | 2001:4860:4802:38::15 | 600 |

5. **Save Changes**
   - Make sure to click "Save" or "Update" in Porkbun
   - Verify "DNS Management" is ON

## 🕐 Wait for DNS Propagation

DNS changes take **15-30 minutes** (can be up to 48 hours).

### Check DNS Status

```bash
# Should show the 4 Google Cloud IPs
dig speakeasy-ai.app +short

# Expected output:
# 216.239.32.21
# 216.239.34.21
# 216.239.36.21
# 216.239.38.21
```

### Test Domain Access

```bash
# Wait for 200 OK response
curl -I https://speakeasy-ai.app

# Or just visit in browser
open https://speakeasy-ai.app
```

## 📝 Summary

**Before (Error 403):**
- Cloud Run service didn't have public access
- Domain was mapped to old `speakeasy-web` service

**After (Fixed):**
- ✅ Cloud Run service has public access via IAM policy
- ✅ Domain mapped to `speakeasy-python-web` service
- ⏳ Waiting for you to update DNS in Porkbun

**Temporary URL (works now):**
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app

**Custom Domain (will work after DNS update):**
https://speakeasy-ai.app

## 🔍 Current Status

```bash
# Check domain mapping
gcloud beta run domain-mappings list --region=us-central1

# Output:
#    DOMAIN            SERVICE                REGION
# ✔  speakeasy-ai.app  speakeasy-python-web  us-central1
```

## 🐛 Troubleshooting

**Still getting 403:**
- Wait a few more minutes for DNS propagation
- Clear browser cache (Cmd+Shift+R)
- Try incognito mode

**DNS not updating:**
- Verify you saved changes in Porkbun
- Check "DNS Management" is ON
- Make sure you're editing speakeasy-ai.app (not another domain)

**SSL certificate error:**
- This is normal initially
- Google automatically provisions SSL certificates
- Wait 15-30 minutes after DNS points to Cloud Run

**Old website showing:**
- Clear browser cache
- DNS might still be propagating
- Use `dig` command to verify DNS has updated

## 🎉 What's on the New Python Web App

Once DNS updates, speakeasy-ai.app will show:

- ✅ SpeakEasy logo and branding
- ✅ Animated AI teacher (4 expressions)
- ✅ Story generation
- ✅ Chat practice
- ✅ Word explanations
- ✅ Beautiful gradient UI
- ✅ Pure Python (no React Native!)

---

**DNS Records Needed:** 4 A records (provided above)
**Expected Wait Time:** 15-30 minutes after DNS update
**Fallback URL:** https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app
