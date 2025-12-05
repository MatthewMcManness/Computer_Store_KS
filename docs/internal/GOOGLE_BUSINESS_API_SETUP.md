# Google Business Profile API Setup Guide

This guide walks you through setting up the Google Business Profile API to display live reviews, posts, and business information on your Computer Store KS website.

## Prerequisites

Before you begin, ensure you have:

- [ ] A Google Account with Owner or Manager access to your Google Business Profile
- [ ] Your Google Business Profile has been **verified and active for at least 60 days**
- [ ] Your business profile is complete (hours, address, photos, etc.)
- [ ] Your business website is listed on the profile

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Click the project dropdown at the top of the page

3. Click **"New Project"**

4. Enter project details:
   - **Project name:** `Computer-Store-KS-GBP` (or similar)
   - **Organization:** Leave as default or select your organization

5. Click **"Create"**

6. Wait for the project to be created, then select it from the project dropdown

7. **Note your Project Number** (found on the Dashboard) - you'll need this later

---

## Step 2: Enable Required APIs

1. In Google Cloud Console, go to **APIs & Services > Library**

2. Search for and enable each of these APIs:
   - **My Business Business Information API**
   - **My Business Account Management API**
   - **My Business Verifications API**

3. Click on each API and click **"Enable"**

---

## Step 3: Create OAuth 2.0 Credentials

### 3.1 Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**

2. Select **External** user type (unless you have Google Workspace)

3. Click **"Create"**

4. Fill in the required fields:
   - **App name:** `Computer Store KS Website`
   - **User support email:** Your email
   - **Developer contact email:** Your email

5. Click **"Save and Continue"**

6. On the Scopes page, click **"Add or Remove Scopes"**

7. Add these scopes:
   ```
   https://www.googleapis.com/auth/business.manage
   ```

8. Click **"Save and Continue"**

9. Add yourself as a test user (your Google account email)

10. Click **"Save and Continue"**, then **"Back to Dashboard"**

### 3.2 Create OAuth Client ID

1. Go to **APIs & Services > Credentials**

2. Click **"+ Create Credentials"** > **"OAuth client ID"**

3. Select **Application type:** `Web application`

4. Enter a name: `Computer Store KS Web Client`

5. Under **Authorized redirect URIs**, add:
   ```
   https://developers.google.com/oauthplayground
   ```

6. Click **"Create"**

7. **Save the Client ID and Client Secret** - you'll need these!

---

## Step 4: Apply for API Access

1. Go to the [Business Profile API Access Request Form](https://docs.google.com/forms/d/e/1FAIpQLSfDnpcfFxXRP_GZh_JvN0QhkiB_zKhC0fBOEHPSJ-_eHLqiPw/viewform)

2. Fill out the form:
   - **Project Number:** From Step 1
   - **Use case:** Select "Application for Basic API Access"
   - **Email:** Use an email that is Owner/Manager on your Business Profile
   - **Business justification:** Explain you want to display reviews on your website

3. Submit and wait for approval (can take several days to a few weeks)

### Check Approval Status

1. Go to **APIs & Services > Enabled APIs & services**
2. Find "My Business Account Management API"
3. Check the quota:
   - **0 QPM** = Not yet approved
   - **300 QPM** = Approved!

---

## Step 5: Get a Refresh Token

Once approved, you need to get a refresh token using the OAuth Playground:

1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground)

2. Click the **gear icon** (⚙️) in the top right

3. Check **"Use your own OAuth credentials"**

4. Enter your **Client ID** and **Client Secret** from Step 3

5. Close the settings

6. In the left panel, find **"Business Profile APIs"** or manually enter:
   ```
   https://www.googleapis.com/auth/business.manage
   ```

7. Click **"Authorize APIs"**

8. Sign in with your Google account (must be Owner/Manager of the Business Profile)

9. Grant the requested permissions

10. Click **"Exchange authorization code for tokens"**

11. **Copy the Refresh Token** - this is what you'll add to your .env file

---

## Step 6: Find Your Account and Location IDs

### Find Account ID

1. Go to [Google Business Profile Manager](https://business.google.com/)

2. Look at the URL - it will contain your account ID:
   ```
   https://business.google.com/dashboard/l/XXXXXXXXXXXXXXXXXX
   ```
   The number after `/l/` is your **Location ID**

3. Or use the API (via OAuth Playground):
   - Select the `accounts.list` method
   - The response will show your account ID

### Find Location ID

1. In Business Profile Manager, select your location

2. The URL will show the location ID:
   ```
   https://business.google.com/edit/l/XXXXXXXXXXXXXXXXXX
   ```

3. Or click on **"Info"** in the left menu, the location ID is in the URL

---

## Step 7: Configure Environment Variables

Add these to your `.env` file:

```bash
# Google Business Profile API
GOOGLE_BUSINESS_CLIENT_ID=your_client_id_here
GOOGLE_BUSINESS_CLIENT_SECRET=your_client_secret_here
GOOGLE_BUSINESS_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_BUSINESS_ACCOUNT_ID=your_account_id_here
GOOGLE_BUSINESS_LOCATION_ID=your_location_id_here
```

---

## Step 8: Test the Integration

1. Restart your development server:
   ```bash
   bun run dev
   ```

2. Visit `http://localhost:3000/api/google-business` to test the API

3. You should see a JSON response with your reviews, posts, and business info

4. Check the homepage and `/reviews` page to see live data

---

## Troubleshooting

### "Google Business Profile not configured"
- Verify all 5 environment variables are set in `.env`
- Restart the development server after adding variables

### "Failed to refresh access token"
- Your refresh token may have expired - generate a new one via OAuth Playground
- Verify your Client ID and Secret are correct

### "Failed to fetch reviews"
- Verify your Account ID and Location ID are correct
- Ensure your account has Owner/Manager access to the location
- Check that the API access has been approved (300 QPM quota)

### Reviews not showing
- The widget only displays 4-5 star reviews
- If you have no reviews meeting this criteria, fallback reviews are shown
- Check the browser console for any error messages

---

## API Endpoints

Once configured, these endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `GET /api/google-business` | All data (reviews, posts, business info) |
| `GET /api/google-business/reviews` | Reviews with stats |
| `GET /api/google-business/posts` | Business posts/updates |
| `GET /api/google-business/info` | Business information |

---

## Data Caching

The API responses are cached for **15 minutes** to:
- Reduce API calls and stay within quotas
- Improve page load performance
- Provide faster responses

To force a refresh, restart the server or wait for the cache to expire.

---

## Security Notes

- **Never commit** your `.env` file to version control
- Keep your Client Secret and Refresh Token private
- The refresh token grants access to your Business Profile data
- Rotate credentials if you suspect they've been compromised

---

## Support

If you encounter issues:
1. Check the [Google Business Profile API documentation](https://developers.google.com/my-business)
2. Review error messages in the server console
3. Verify your API access is approved in Google Cloud Console
