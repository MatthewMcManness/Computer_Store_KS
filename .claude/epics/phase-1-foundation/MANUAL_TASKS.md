# Manual Tasks - Phase 1 Foundation

Tasks that require manual action in external dashboards/systems.

---

## Supabase Dashboard ✅ COMPLETED

- [x] **Enable Email Provider**
- [x] **Configure Resend SMTP**
- [x] **Copy Email Templates** (all 13 templates created)
- [x] **Set Rate Limits**
- [x] **Configure Auth Settings**

## Google OAuth Setup ✅ COMPLETED

- [x] **Create OAuth Credentials** (Google Cloud Console)
- [x] **Configure OAuth Consent Screen**
- [x] **Enable Google Provider** (Supabase Dashboard)

## Render MCP Setup ✅ COMPLETED

- [x] **Get Render API Key**
- [x] **Add MCP Server to Claude Code**
- [x] **Add NEXT_PUBLIC_APP_URL to CSK-Production**
  - Set to: `https://computerstoreks.com`
  - Deploy triggered automatically

## Environment Variables ✅ COMPLETED

- [x] **CSK-Production** - `NEXT_PUBLIC_APP_URL=https://computerstoreks.com`
- [x] **CSK-Development** - `NEXT_PUBLIC_APP_URL=https://computer-store-ks-dev.onrender.com`
  - Note: CSK-Development is suspended (billing), env var set but won't deploy until unsuspended

---

## NinjaOne API (PENDING - User Action Required)

**Status:** The code (`src/lib/ninjaone.ts`) is built for **OAuth2 authentication**.

**Required Environment Variables:**
```
NINJAONE_API_URL=https://app.ninjarmm.com
NINJAONE_CLIENT_ID=<your-client-id>
NINJAONE_CLIENT_SECRET=<your-client-secret>
```

**To Set Up OAuth2 Credentials:**

1. **Create OAuth2 App in NinjaOne:**
   - Go to: NinjaOne Admin > Administration > Apps > API
   - Create a new API application
   - Select "Client Credentials" grant type
   - Request scopes: `monitoring`, `management`
   - Copy the Client ID and Client Secret

2. **Add to Local Development:**
   - Add credentials to `.env.local`

3. **Add to Render Production:**
   - Once you have credentials, tell Claude to add them via Render MCP:
     - `NINJAONE_API_URL`
     - `NINJAONE_CLIENT_ID`
     - `NINJAONE_CLIENT_SECRET`

**Note:** If your current NinjaOne account only has Legacy API keys (Access Key ID/Secret), you'll need to create an OAuth2 app. Legacy API authentication is not supported by the current implementation.

---

*Last updated: 2025-12-29*
