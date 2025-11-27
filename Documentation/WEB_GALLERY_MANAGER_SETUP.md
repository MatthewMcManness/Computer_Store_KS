# Web Gallery Manager Setup Guide
## Computer Store Kansas - Web-Based Admin Panel

This guide will help you set up and use the web-based Gallery Manager that allows employees to manage the website gallery from any browser.

---

## 🎯 What's Included

The web gallery manager consists of:

1. **Admin Login Page** (`admin-login.html`) - Secure password-protected entry
2. **Gallery Dashboard** (`admin-gallery.html`) - Manage computers, add/edit/delete
3. **Backend API** (`api/gallery-api.js`) - Handles GitHub commits and image uploads
4. **Auto Integration** - Administrator Login button on main website redirects to login

---

## 📋 Prerequisites

Before setting up, ensure you have:

- Node.js 18+ installed ([Download](https://nodejs.org/))
- Git installed and configured
- GitHub Personal Access Token (we'll create this)
- Access to the Computer Store KS repository

---

## 🚀 Installation Steps

### Step 1: Install API Dependencies

**IMPORTANT**: If you get a PowerShell execution policy error, see `api/INSTALL_FIX.md` for solutions. The easiest fix is to use Command Prompt (cmd.exe) instead of PowerShell.

Navigate to the API directory and install dependencies:

**Using Command Prompt (Recommended on Windows):**
```cmd
cd C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api
npm install
```

**Or using PowerShell (if policies allow):**
```powershell
cd "C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api"
npm install
```

**Or using Bun (if installed):**
```bash
cd "C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api"
bun install
```

This will install:
- `express` - Web server framework
- `@octokit/rest` - GitHub API client
- `cors` - Cross-origin request handling
- `multer` - File upload handling
- `sharp` - Image optimization

### Step 2: Create GitHub Personal Access Token

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a descriptive name: "Computer Store Gallery Manager"
4. Set expiration: Choose your preference (recommend: No expiration for production)
5. Select scopes:
   - ✅ **repo** (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`
6. Click **"Generate token"**
7. **IMPORTANT**: Copy the token immediately - you won't see it again!

### Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cd "C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api"
copy .env.example .env
```

2. Edit the `.env` file with your information:

```env
# Server Port
PORT=3001

# GitHub Configuration
GITHUB_TOKEN=ghp_your_actual_github_token_here
GITHUB_OWNER=matthewholman
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=Computer-Store-KS

# Admin Authentication
ADMIN_PASSWORD=your_secure_password_here
```

**IMPORTANT SECURITY NOTES**:
- Replace `your_secure_password_here` with a strong password
- Never commit the `.env` file to Git (it's already in `.gitignore`)
- Keep your GitHub token secret - treat it like a password

### Step 4: Add .env to .gitignore

Make sure your `.env` file is NOT tracked by Git:

```bash
cd "C:\Users\Matthew\Documents\GitHub\Computer_Store_KS"
echo api/.env >> .gitignore
echo .env >> .gitignore
```

### Step 5: Start the API Server

```bash
cd "C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api"
bun start
```

Or with npm:

```bash
npm start
```

You should see:

```
Gallery Manager API running on port 3001
GitHub integration: Enabled
Repository: matthewholman/Computer_Store_KS
Branch: Computer-Store-KS
```

**For Development**: Use `bun dev` or `npm run dev` to auto-restart on changes.

---

## 🌐 Accessing the Gallery Manager

### From the Website

1. Visit your website: https://computerstoreks.com
2. Scroll to the footer
3. Click **"Administrator Login"** button
4. Enter the admin password you set in `.env`
5. Start managing your gallery!

### Direct Access

- **Login Page**: `https://computerstoreks.com/admin-login.html`
- **Dashboard**: `https://computerstoreks.com/admin-gallery.html` (requires login)

---

## 📖 How to Use

### Adding a New Computer

1. Click **"+ Add Computer"** button
2. Fill in the form:
   - **Computer Name**: e.g., "Gaming Pro Desktop"
   - **Type**: Desktop or Laptop
   - **Category**:
     - Desktop: Custom Build or Refurbished
     - Laptop: New or Refurbished
   - **Price**: Include $ sign, e.g., "$1,299"
   - **Image**: Click upload area, select JPG/PNG (max 5MB)
   - **Specifications**: Fill all 4 spec fields
3. Click **"Save Computer"**
4. Computer appears in gallery (not yet published)

### Editing a Computer

1. **Single-click** a computer card to select it
2. **Double-click** the card to edit
3. Make your changes
4. Click **"Save Computer"**

### Deleting a Computer

1. Select the computer card
2. Press **Delete** key on keyboard
3. Confirm deletion
4. Computer is removed (not yet published)

### Publishing Changes

1. Make all your changes (add/edit/delete)
2. Click **"Publish Changes"** button (green)
3. Confirm you want to publish
4. Wait for success message
5. Website updates in 2-3 minutes via Render deployment

### Filtering View

Use the filter tabs to view:
- **All** - Show everything
- **Desktops** - Only desktop computers
- **Laptops** - Only laptops
- **Custom** - Only custom builds
- **Refurbished** - Only refurbished
- **New** - Only new computers

---

## 🔐 Security Features

### Session Management
- Sessions expire after 8 hours of inactivity
- Automatic logout on session expiry
- Password required for all API operations

### Auto-Save Prevention
- Warning before leaving page with unsaved changes
- Must explicitly publish to update live website

### Git Integration
- All changes are committed to Git
- Automatic backups created in `backups/` folder
- Full version history maintained

### Input Validation
- Image type validation (JPG/PNG only)
- File size limits (5MB max)
- Path traversal prevention
- Secure filename handling

---

## 🛠️ Troubleshooting

### "API error: 401" or "Unauthorized"

**Problem**: Authentication failed

**Solutions**:
1. Check that API server is running
2. Verify `ADMIN_PASSWORD` in `.env` matches login password
3. Clear browser session and login again
4. Check browser console for errors

### "API error: 500" or "Failed to publish"

**Problem**: GitHub commit failed

**Solutions**:
1. Verify `GITHUB_TOKEN` is correct and hasn't expired
2. Check token has `repo` scope permissions
3. Verify repository name and branch are correct
4. Check API console logs for detailed error

### Images not uploading

**Solutions**:
1. Check file is JPG or PNG format
2. Ensure file is under 5MB
3. Verify `assets/gallery/` directory exists
4. Check API has write permissions to folder

### Changes not appearing on live website

**Solutions**:
1. Wait 2-3 minutes for Render to deploy
2. Clear browser cache (Ctrl+F5)
3. Check Render deployment dashboard
4. Verify GitHub commit was successful

### API server won't start

**Solutions**:
1. Check Node.js is installed: `node --version`
2. Reinstall dependencies: `bun install` or `npm install`
3. Check port 3001 isn't already in use
4. Review `.env` file for syntax errors

### "Session expired" immediately after login

**Problem**: System time issue or session storage disabled

**Solutions**:
1. Check system clock is accurate
2. Enable cookies/session storage in browser
3. Try a different browser
4. Check browser privacy settings

---

## 🔄 Running in Production

### Option 1: Local Server (Recommended for Small Team)

Keep the API running on your local machine:

```bash
# In a terminal that stays open
cd "C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api"
bun start
```

**Pros**: Simple, no hosting costs
**Cons**: API only works when your computer is on

### Option 2: Deploy API to Cloud

Deploy the API to a service like:

- **Render.com** (Free tier available)
- **Railway.app** (Free tier available)
- **Heroku** (Paid)
- **AWS/Azure** (More complex)

Then update API URL in `admin-gallery.js`:

```javascript
// Change from:
const response = await fetch('http://localhost:3001/api/gallery/update', {

// To:
const response = await fetch('https://your-api.render.com/api/gallery/update', {
```

### Running as Windows Service

To keep API running in background:

1. Install `pm2`: `npm install -g pm2`
2. Start API: `pm2 start api/gallery-api.js --name gallery-api`
3. Enable auto-start: `pm2 startup`
4. Save configuration: `pm2 save`

---

## 📁 File Structure

```
Computer_Store_KS/
├── admin-login.html          ← Admin login page
├── admin-gallery.html        ← Gallery dashboard
├── admin-gallery.js          ← Dashboard JavaScript
├── index.html                ← Main website (managed by gallery)
├── script.js                 ← Updated with login redirect
├── api/
│   ├── gallery-api.js        ← Backend API server
│   ├── package.json          ← API dependencies
│   ├── .env.example          ← Environment template
│   └── .env                  ← Your config (not committed)
├── assets/
│   └── gallery/              ← Computer images
└── backups/                  ← Automatic HTML backups
```

---

## 🎨 Customization

### Changing the Admin Password

1. Edit `api/.env`
2. Change `ADMIN_PASSWORD=your_new_password`
3. Restart API server
4. Use new password when logging in

### Changing Session Timeout

In `admin-login.html` and `admin-gallery.js`, find:

```javascript
// 8 hours = 28800000 ms
if (currentTime - loginTime < 28800000) {
```

Change `28800000` to your desired milliseconds:
- 1 hour = 3600000
- 4 hours = 14400000
- 12 hours = 43200000

### Changing API Port

1. Edit `api/.env` → Change `PORT=3001`
2. Edit `admin-gallery.js` → Update fetch URLs
3. Restart API server

---

## 🆘 Support

### Common Questions

**Q: Can multiple people use this at once?**
A: Yes, but be careful! Last person to publish wins. Coordinate with team.

**Q: Can I use this from my phone?**
A: Yes! The interface is mobile-responsive. Just access the admin-login page from any browser.

**Q: What happens if I close the browser mid-edit?**
A: Unsaved changes are lost. The system warns you before leaving.

**Q: Can I undo a published change?**
A: Yes! Check `backups/` folder for previous versions, or use Git to revert.

**Q: Do I need to keep the desktop app?**
A: No! This web version replaces it. But keep it as backup if needed.

### Getting Help

1. Check this documentation
2. Review API console logs for errors
3. Check browser console (F12) for JavaScript errors
4. Verify `.env` configuration
5. Check GitHub token permissions

---

## ✅ Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`bun install`)
- [ ] GitHub Personal Access Token created
- [ ] `.env` file configured with token and password
- [ ] `.env` added to `.gitignore`
- [ ] API server started (`bun start`)
- [ ] Can access admin-login.html
- [ ] Can login with password
- [ ] Can see gallery dashboard
- [ ] Administrator Login button works on main site

---

## 🎉 You're Ready!

Your web-based gallery manager is now set up! Employees can:

✅ Login from any device with the admin password
✅ Add, edit, and delete computers in the gallery
✅ Upload and manage images
✅ Publish changes that automatically deploy to the live website
✅ Work collaboratively (with coordination)

**Happy gallery managing!** 🖥️✨
