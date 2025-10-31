# Web App Usage Guide

## URLs

- **Login Page**: https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html
- **Main App**: https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/index.html

## How to Use

### 1. Sign In

Go to the login page:
```
https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app/static/auth-unified.html
```

Click either:
- "Continue with Google"
- "Continue with Apple"

After successful authentication, you'll be redirected to the main app.

### 2. Main App

Once authenticated, you'll see:
- **Story Generator** - Create personalized learning stories
- **Lessons** - Structured language lessons
- **Practice** - AI conversation practice
- **Profile** - Manage your learning preferences
- **Progress** - Track your XP and achievements

### 3. Logout

The logout button is in the **top-right corner** of the main app page.

Click "Logout" and it will:
- Clear your session token
- Clear user data from browser
- Redirect you back to the login page

**Location of Logout Button:**
- File: `/Users/scott/dev/speakeasy/python-web/static/index.html`
- Line: 1216
- Function: Lines 1495-1501

The logout function:
```javascript
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/static/auth-unified.html';
    }
}
```

## Authentication Flow

1. **User visits login page** → `auth-unified.html`
2. **Clicks Google/Apple Sign-In** → Authenticates with provider
3. **App sends token to backend** → `https://speakeasy-backend-823510409781.us-central1.run.app/api/auth/*`
4. **Backend validates and returns session** → Session token stored in localStorage
5. **Redirects to main app** → `index.html`
6. **Main app checks for token** → If no token, redirects back to login

## Current Status

✅ **Login Page** - Fixed! Sends correct data to backend
✅ **Logout Button** - Already exists in main app
✅ **Backend** - Simple debug backend running (accepts all auth)
⏳ **Google Origin** - Already added (may need to wait 5 minutes for propagation)

## Testing

1. **Open login page**
2. **Try Google Sign-In**
   - Should show Google account picker
   - Should authenticate successfully
   - Should redirect to main app
3. **See logout button** in top-right corner
4. **Click logout** to return to login page

## If You Don't See the Logout Button

Check that you're on the main app page (`index.html`), not the login page (`auth-unified.html`).

The login page doesn't have a logout button (no need - you're not logged in yet!).

After successful authentication, you should be automatically redirected to `index.html` where the logout button is located.
