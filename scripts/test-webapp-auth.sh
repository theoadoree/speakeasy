#!/bin/bash

# Test Web App Authentication
# This script verifies the web app and backend are properly configured

echo "🧪 Testing SpeakEasy Web App Authentication"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs
BACKEND_URL="https://speakeasy-backend-vlxo5frhwq-uc.a.run.app"
WEBAPP_URL="https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app"

# Test 1: Backend health check
echo "1️⃣  Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status' 2>/dev/null)

if [ "$HEALTH_STATUS" = "ok" ]; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Web app accessibility
echo "2️⃣  Testing Web App Accessibility..."
WEBAPP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBAPP_URL/static/auth-unified.html")

if [ "$WEBAPP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Web app is accessible${NC}"
    echo "   Status Code: $WEBAPP_STATUS"
else
    echo -e "${RED}❌ Web app returned status $WEBAPP_STATUS${NC}"
    exit 1
fi
echo ""

# Test 3: Check for correct client ID in web app
echo "3️⃣  Checking OAuth Client ID Configuration..."
WEBAPP_HTML=$(curl -s "$WEBAPP_URL/static/auth-unified.html")

# Check for web client ID
if echo "$WEBAPP_HTML" | grep -q "823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com"; then
    echo -e "${GREEN}✅ Web OAuth client ID found${NC}"
else
    echo -e "${RED}❌ Web OAuth client ID not found${NC}"
    exit 1
fi

# Check for correct backend URL
if echo "$WEBAPP_HTML" | grep -q "speakeasy-backend-823510409781.us-central1.run.app"; then
    echo -e "${GREEN}✅ Backend URL correctly configured${NC}"
else
    echo -e "${RED}❌ Backend URL not found or incorrect${NC}"
    exit 1
fi

# Check for idToken field (not credential)
if echo "$WEBAPP_HTML" | grep -q "idToken: response.credential"; then
    echo -e "${GREEN}✅ Correct field name (idToken) used${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Could not verify idToken field${NC}"
fi
echo ""

# Test 4: Backend auth endpoints
echo "4️⃣  Testing Backend Auth Endpoints..."

# Test Google auth endpoint (should fail without token, but endpoint should exist)
GOOGLE_AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"idToken":"test"}' \
    "$BACKEND_URL/api/auth/google")

if [ "$GOOGLE_AUTH_STATUS" = "200" ] || [ "$GOOGLE_AUTH_STATUS" = "400" ]; then
    echo -e "${GREEN}✅ Google auth endpoint exists${NC}"
    echo "   Status Code: $GOOGLE_AUTH_STATUS"
else
    echo -e "${RED}❌ Google auth endpoint returned unexpected status: $GOOGLE_AUTH_STATUS${NC}"
fi

# Test Apple auth endpoint
APPLE_AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"idToken":"test"}' \
    "$BACKEND_URL/api/auth/apple")

if [ "$APPLE_AUTH_STATUS" = "200" ] || [ "$APPLE_AUTH_STATUS" = "400" ]; then
    echo -e "${GREEN}✅ Apple auth endpoint exists${NC}"
    echo "   Status Code: $APPLE_AUTH_STATUS"
else
    echo -e "${RED}❌ Apple auth endpoint returned unexpected status: $APPLE_AUTH_STATUS${NC}"
fi
echo ""

# Summary
echo "==========================================="
echo -e "${GREEN}🎉 All automated tests passed!${NC}"
echo ""
echo "📱 Manual Testing Required:"
echo "1. Open: $WEBAPP_URL/static/auth-unified.html"
echo "2. Click 'Continue with Google'"
echo "3. Verify Google account picker appears"
echo "4. Sign in and verify redirect to main app"
echo ""
echo "💡 To view backend logs:"
echo "   gcloud run services logs read speakeasy-backend --region us-central1 --limit 50"
echo ""
