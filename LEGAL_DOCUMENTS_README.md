# Legal Documents Guide

This directory contains the Terms of Service and Privacy Policy for SpeakEasy.

## Documents Created

### 1. [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md)
**Comprehensive Terms of Service covering:**
- ✅ Account registration and eligibility (13+ with parental consent under 18)
- ✅ Subscription plans and pricing ($4.99 - $19.99/month + 7-day trial)
- ✅ Payment terms and auto-renewal policies
- ✅ Acceptable use policy and prohibited activities
- ✅ Intellectual property rights
- ✅ AI-specific disclaimers and limitations
- ✅ Third-party service acknowledgment (OpenAI, Apple, Google)
- ✅ Liability limitations and indemnification
- ✅ Termination rights and procedures
- ✅ Dispute resolution and governing law (California)

### 2. [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
**GDPR/CCPA-Compliant Privacy Policy covering:**
- ✅ What data we collect (account, learning, usage, device)
- ✅ How we collect it (direct input, automatic, third-party)
- ✅ How we use data (personalization, AI, analytics)
- ✅ Who we share with (OpenAI, payment processors, cloud providers)
- ✅ **Clear statement: We do NOT sell data**
- ✅ Data retention and deletion policies
- ✅ User privacy rights (access, delete, export, opt-out)
- ✅ Regional compliance (CCPA for California, GDPR for EU)
- ✅ Children's privacy (COPPA compliance)
- ✅ Data security measures (encryption, OAuth)
- ✅ AI-specific considerations (OpenAI processing)
- ✅ Cookie and tracking disclosure
- ✅ International data transfer notices

## Important Notes

### ⚠️ BEFORE GOING LIVE - REQUIRED UPDATES

1. **Contact Information** - Update with real contact details:
   ```
   legal@speakeasy-ai.app
   privacy@speakeasy-ai.app
   dpo@speakeasy-ai.app (if EU operations)
   ```

2. **Mailing Address** - Add physical address:
   ```
   PRIVACY_POLICY.md Line 510: [Address to be added]
   ```

3. **Legal Entity** - Update company name/entity if different from "SpeakEasy"

4. **Governing Law** - Verify California is correct (change if incorporated elsewhere)

5. **Third-Party Agreements** - Review and link to:
   - OpenAI Terms of Service and Privacy Policy
   - Apple Developer Agreement
   - Google Play Developer Agreement
   - RevenueCat Terms
   - Stripe Terms

### 📱 App Store Requirements

#### Apple App Store
1. Add Terms of Service URL to App Store Connect
2. Add Privacy Policy URL to App Store Connect
3. Complete Apple's Privacy Nutrition Label based on PRIVACY_POLICY.md
4. Required disclosures:
   - Data Linked to User: Email, Name, User ID, Learning Progress
   - Data Used to Track You: None (we don't track for advertising)
   - Data Not Linked to User: Crash Data, Performance Data

#### Google Play Store
1. Add Privacy Policy URL to Google Play Console
2. Complete Data Safety section based on PRIVACY_POLICY.md
3. Required disclosures:
   - Personal info collected: Name, Email
   - App activity: In-app actions, App interactions
   - Data encrypted in transit: Yes
   - Users can request data deletion: Yes

### 🌍 Regional Compliance

#### GDPR (European Union)
- ✅ Legal basis for processing defined
- ✅ User rights documented (access, delete, portability)
- ✅ Data transfer mechanisms specified (SCCs)
- ✅ 72-hour breach notification commitment
- ⚠️ Consider appointing EU representative if many EU users
- ⚠️ Consider Data Protection Impact Assessment (DPIA) for AI features

#### CCPA (California)
- ✅ Right to know disclosed
- ✅ Right to delete documented
- ✅ "We do not sell data" statement included
- ✅ Non-discrimination rights specified

#### COPPA (Children's Privacy)
- ✅ Age restriction (13+) specified
- ✅ Parental consent requirement documented
- ✅ Data deletion commitment if under-13 user discovered

### 🔐 Security Best Practices

Based on the Privacy Policy commitments:
- [ ] Implement TLS/SSL for all API communications (✅ Already done)
- [ ] Encrypt sensitive data at rest (database encryption)
- [ ] Regular security audits (schedule quarterly reviews)
- [ ] Employee access controls (principle of least privilege)
- [ ] Incident response plan (breach notification procedures)

### 📄 Displaying Documents in App

#### Mobile App (React Native)
Create screen components to display these documents:

```javascript
// src/screens/TermsOfServiceScreen.js
import React from 'react';
import { ScrollView, Text } from 'react-native';
import termsMarkdown from '../../TERMS_OF_SERVICE.md';

// Use markdown renderer like react-native-markdown-display
```

#### Web App
Create HTML versions and link from footer:

```html
<footer>
  <a href="/terms">Terms of Service</a>
  <a href="/privacy">Privacy Policy</a>
</footer>
```

#### Email Templates
Add footer to all emails:
```
By using SpeakEasy, you agree to our Terms of Service and Privacy Policy.
https://speakeasy-ai.app/terms
https://speakeasy-ai.app/privacy
```

### ✅ Implementation Checklist

- [ ] Review documents with legal counsel (STRONGLY RECOMMENDED)
- [ ] Update contact email addresses
- [ ] Add physical mailing address
- [ ] Create /terms and /privacy web pages
- [ ] Add Terms/Privacy screens to mobile app
- [ ] Update app.json with policy URLs
- [ ] Complete App Store privacy labels
- [ ] Complete Play Store data safety
- [ ] Add links to authentication screens
- [ ] Add acceptance checkboxes during signup
- [ ] Update email templates with policy links
- [ ] Set up privacy@speakeasy-ai.app inbox
- [ ] Set up legal@speakeasy-ai.app inbox
- [ ] Create user data export functionality
- [ ] Create account deletion functionality
- [ ] Test data export and deletion features
- [ ] Document data retention procedures
- [ ] Create breach notification procedures
- [ ] Train team on privacy requirements

### 📋 User Consent Flow

**During Signup:**
```
☐ I agree to the Terms of Service
☐ I agree to the Privacy Policy
☐ I am 13 years or older
☐ (Optional) Send me product updates and tips
```

**Example Code:**
```javascript
<Checkbox
  checked={agreedToTerms}
  onChange={setAgreedToTerms}
  label="I agree to the Terms of Service and Privacy Policy"
  required
/>
<Link to="/terms">Read Terms</Link>
<Link to="/privacy">Read Privacy Policy</Link>
```

### 🔄 Regular Reviews

Update these documents when:
- New features are added (especially data collection)
- Third-party services change
- Privacy laws change
- User rights expand
- Business model changes

**Recommended Review Schedule:** Quarterly

### 📞 User Requests

Be prepared to handle:
1. **Data Access Requests** - Provide all user data within 30 days
2. **Data Deletion Requests** - Delete within 30 days (with exceptions for legal requirements)
3. **Data Portability Requests** - Export in machine-readable format (JSON)
4. **Opt-Out Requests** - Disable analytics/marketing
5. **Privacy Questions** - Respond within 30 days

### 🎯 Key Differentiators

What makes these documents good:
- ✅ **Clear language** - Readable by non-lawyers
- ✅ **Comprehensive** - Covers all app features
- ✅ **User-friendly** - Summary sections and emojis
- ✅ **Compliant** - GDPR, CCPA, COPPA considerations
- ✅ **AI-specific** - Addresses AI and OpenAI usage
- ✅ **Transparent** - "We do not sell data" prominent
- ✅ **Regional** - Addresses California, EU, international users

## Quick Links

- [Terms of Service](TERMS_OF_SERVICE.md)
- [Privacy Policy](PRIVACY_POLICY.md)
- [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy)
- [Apple Privacy](https://www.apple.com/privacy/)
- [Google Privacy](https://policies.google.com/privacy)

---

**DISCLAIMER**: These documents are provided as templates. They are NOT a substitute for legal advice. Consult with a qualified attorney before using these in production.

**Last Updated:** October 30, 2025
