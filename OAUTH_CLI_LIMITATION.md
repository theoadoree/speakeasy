# OAuth Configuration via CLI - Not Possible

## The Issue

Unfortunately, **Google OAuth 2.0 Client IDs cannot be modified via CLI tools**. Neither `gcloud` nor `firebase` CLI support updating OAuth client configurations (authorized origins, redirect URIs).

## Why?

OAuth client configuration is considered sensitive security configuration, and Google requires it to be done through the authenticated web console to ensure proper authorization and audit trails.

## What CLI Can Do

```bash
# ✅ Can list OAuth clients
gcloud alpha iap oauth-clients list

# ❌ Cannot add authorized origins
# No gcloud command exists for this

# ❌ Cannot update OAuth client settings
# No gcloud command exists for this
```

## Your Options

### Option 1: Use Web Console (30 seconds) ⭐ RECOMMENDED

1. Click "Web client (auto created by Google Service)" in your screenshot
2. Scroll to "Authorized JavaScript origins"
3. Click "+ ADD URI"
4. Add: `https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app`
5. Click "SAVE"

This is the fastest and officially supported way.

### Option 2: Create New OAuth Client via API (Complex)

You could use the Google OAuth2 API to create a new client, but:
- Requires OAuth2 API to be enabled
- Still requires manual consent screen configuration
- More complex than clicking in the console
- Would need to update your web app code with new client ID

### Option 3: Use Terraform (For Infrastructure as Code)

If you want to manage OAuth clients as code:

```hcl
resource "google_iap_client" "project_client" {
  display_name = "SpeakEasy Web Client"
  brand        = google_iap_brand.project_brand.name
}
```

But this still requires initial manual setup and doesn't provide the granular control you need for origins.

## Recommendation

**Just use the web console** - it's the official, supported, and fastest way. The CLI limitation exists for security reasons and won't be changing.

The configuration you need is already visible in your screenshot - just one click away!
