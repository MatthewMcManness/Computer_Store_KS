# Deploy Gallery Manager to Live Website

## Overview

To make the Gallery Manager work on your live website (computerstoreks.com), you need to deploy the API to a hosting service. I recommend **Render.com** since you're already using it for your main site.

## What Was Updated

✅ **admin-gallery.js** - Auto-detects localhost vs live site
✅ **admin-login.html** - Auto-detects localhost vs live site
✅ **API ready for deployment** - Added render.yaml configuration

## Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

1. **Open GitHub Desktop**
2. **Commit all changes**:
   - Summary: "Add web gallery manager with API"
   - Description: "Web-based admin panel for managing gallery"
3. **Push to GitHub**

### Step 2: Deploy API to Render

1. **Go to**: https://render.com/
2. **Sign in** with your GitHub account
3. **Click**: "New +" → "Web Service"
4. **Connect** your Computer_Store_KS repository
5. **Configure the service**:
   - **Name**: `computer-store-gallery-api`
   - **Root Directory**: `api`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable":

   ```
   GITHUB_TOKEN = your_github_token_here
   GITHUB_OWNER = MatthewMcManness
   GITHUB_REPO = Computer_Store_KS
   GITHUB_BRANCH = Computer-Store-KS
   ADMIN_PASSWORD = 52389!CS
   PORT = 3001
   ```

7. **Click**: "Create Web Service"
8. **Wait** for deployment (2-3 minutes)
9. **Copy the URL** - it will look like:
   ```
   https://computer-store-gallery-api.onrender.com
   ```

### Step 3: Update API URL in Code

1. **Open**: `admin-gallery.js`
2. **Find line 7** (around):
   ```javascript
   : 'https://computer-store-gallery-api.onrender.com';
   ```
3. **Replace** with your actual Render URL from Step 2
4. **Do the same** in `admin-login.html` (around line 230)

### Step 4: Push Changes Again

1. **Commit** the URL update
2. **Push** to GitHub
3. **Wait** for Render to re-deploy your main site (2-3 minutes)

### Step 5: Test on Live Site!

1. **Go to**: https://computerstoreks.com
2. **Scroll to footer**
3. **Click**: "Administrator Login"
4. **Enter password**: `52389!CS`
5. **Should redirect** to gallery manager
6. **Try clicking** "+ Add Computer"
7. **Modal should open!** ✅

## How It Works

### Auto-Detection

The code automatically detects where it's running:

```javascript
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'  // Local development
    : 'https://computer-store-gallery-api.onrender.com'; // Live site
```

**Localhost**: Uses `http://localhost:3001`
**Live Site**: Uses `https://computer-store-gallery-api.onrender.com`

### API Deployment

The API runs as a separate Render service:
- **Your main site**: https://computerstoreks.com (static files)
- **Gallery API**: https://computer-store-gallery-api.onrender.com (backend)

Both work together seamlessly!

## Testing Both Environments

### Local Development:
1. Run `start-both-servers.bat`
2. Access: http://localhost:8000/admin-login.html
3. Uses: http://localhost:3001 API

### Live Production:
1. Visit: https://computerstoreks.com
2. Click "Administrator Login"
3. Uses: https://computer-store-gallery-api.onrender.com API

## Render Free Tier Notes

**Good News**: API qualifies for Render's free tier!

**Important**:
- Free services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds to wake up
- Solution: Upgrade to $7/month for always-on service (optional)

## Troubleshooting

### API URL Not Found

**Problem**: Gallery manager can't connect to API

**Solution**:
1. Check API is deployed on Render
2. Verify API URL matches in code
3. Check API service is running (not failed)

### CORS Errors

**Problem**: Browser blocks cross-origin requests

**Solution**: Already handled! The API includes CORS headers:
```javascript
app.use(cors());
```

### Environment Variables Missing

**Problem**: API shows "GitHub integration: Disabled"

**Solution**:
1. Go to Render dashboard
2. Select your API service
3. Go to "Environment" tab
4. Add missing variables
5. Redeploy

### Authentication Fails

**Problem**: Can't login on live site

**Solution**:
1. Check `ADMIN_PASSWORD` is set in Render environment variables
2. Make sure it matches the password you're entering
3. Check browser console (F12) for errors

## Cost Breakdown

**Current Setup** (Free):
- Main website: Free (static)
- API: Free (with spin-down)
- **Total**: $0/month

**Upgraded** (Always-On):
- Main website: Free (static)
- API: $7/month (always-on)
- **Total**: $7/month

## Security Notes

✅ **HTTPS**: API uses HTTPS automatically on Render
✅ **Environment Variables**: Secrets stored securely in Render
✅ **CORS**: Configured to allow requests from your domain
✅ **Password Auth**: Required for all API operations

## Alternative: Static-Only Version

If you don't want to deploy the API, you can use a **simplified version** that:
- ❌ Can't publish to GitHub automatically
- ✅ Can edit gallery locally
- ✅ Manually copy changes to GitHub

Let me know if you want this simpler version!

## Summary

1. ✅ **Push code to GitHub**
2. ✅ **Deploy API to Render**
3. ✅ **Update API URL in code**
4. ✅ **Push updated code**
5. ✅ **Test on live site**

**Then your gallery manager works on computerstoreks.com!** 🎉
