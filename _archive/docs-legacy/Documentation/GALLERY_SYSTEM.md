# Gallery System Documentation

This document describes the gallery management system for Computer Store KS, which allows administrators to add, edit, and delete computer listings through a web-based interface.

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Admin Panel Usage](#admin-panel-usage)
- [Adding Computers](#adding-computers)
- [Editing Computers](#editing-computers)
- [Deleting Computers](#deleting-computers)
- [Image Upload Requirements](#image-upload-requirements)
- [GitHub Integration](#github-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The gallery system was preserved from Version 2.x and provides a secure, web-based interface for managing the computer inventory displayed on the website. Changes made through the admin panel are automatically committed to GitHub, triggering an automatic deployment to the live site.

### Key Features

- Web-based administration (no software installation required)
- Secure password authentication with 8-hour session timeout
- Automatic image optimization and resizing
- Git version control for all changes
- Automatic backups before each publish
- Works on desktop and mobile devices

### System Components

| Component | File | Description |
|-----------|------|-------------|
| Login Page | `admin-login.html` | Secure login interface |
| Dashboard | `admin-gallery.html` | Main management interface |
| Client Logic | `admin-gallery.js` | Frontend JavaScript |
| Backend API | `api/gallery-api.js` | Express.js server |

## How It Works

### Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────┐
│   Admin User    │ ─────────────> │  Admin Panel    │
│   (Browser)     │                │  (Frontend)     │
└─────────────────┘                └────────┬────────┘
                                            │
                                            │ API Calls
                                            ▼
                                   ┌─────────────────┐
                                   │  Gallery API    │
                                   │  (Express.js)   │
                                   └────────┬────────┘
                                            │
                                 ┌──────────┴──────────┐
                                 │                     │
                                 ▼                     ▼
                        ┌─────────────┐       ┌─────────────┐
                        │   GitHub    │       │   Local     │
                        │    API      │       │   Files     │
                        └──────┬──────┘       └─────────────┘
                               │
                               │ Webhook
                               ▼
                        ┌─────────────┐
                        │  Render/    │
                        │  Docker     │
                        └─────────────┘
                               │
                               │ Auto-deploy
                               ▼
                        ┌─────────────┐
                        │  Live Site  │
                        └─────────────┘
```

### Workflow

1. Admin logs in at `/admin-login.html`
2. Enters admin password
3. Redirected to gallery dashboard
4. Views current computer listings
5. Makes changes (add/edit/delete)
6. Clicks "Publish Changes"
7. API commits changes to GitHub
8. GitHub webhook triggers deployment
9. Live site updates in 2-3 minutes

## Admin Panel Usage

### Accessing the Admin Panel

**Production:**
1. Go to https://computerstoreks.com
2. Scroll to footer
3. Click "Administrator Login"
4. Enter admin password

**Local Development:**
1. Start both servers using `start-both-servers.bat` or:
   ```bash
   # Terminal 1: Static file server
   bunx serve -l 8000

   # Terminal 2: API server
   cd api && bun start
   ```
2. Go to http://localhost:8000/admin-login.html
3. Enter admin password

### Dashboard Overview

The dashboard displays:

- **Header:** Logo, status indicators, action buttons
- **Gallery Grid:** All current computer listings as cards
- **Status Bar:** GitHub connection status, last publish time

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` | Delete selected computer |
| `Escape` | Close modal |
| `Enter` | Submit form (when in modal) |

## Adding Computers

### Step-by-Step

1. Click **"+ Add Computer"** button
2. Fill out the form:
   - **Name:** Computer display name (e.g., "HP ProDesk 400 G3")
   - **Type:** Select "Desktop" or "Laptop"
   - **Category:** Budget, Standard, Premium, or Gaming
   - **Price:** Enter price without $ (e.g., "299")
   - **Image:** Click to upload or drag-and-drop
   - **Specifications:** Enter specs (one per line or comma-separated)
3. Click **"Save Computer"**
4. Review the card in the gallery
5. Click **"Publish Changes"** when ready

### Specification Format

Enter specifications in a clear format:

```
Intel Core i5-6500
16GB DDR4 RAM
256GB SSD
Windows 11 Pro
```

Or comma-separated:
```
Intel Core i5, 16GB RAM, 256GB SSD, Windows 11
```

### Best Practices

- Use descriptive names that customers will search for
- Include brand, model, and key specs in the name
- Choose accurate categories for filtering
- Upload high-quality, well-lit photos
- List most important specs first

## Editing Computers

### Step-by-Step

1. **Double-click** the computer card to edit
2. Modify any field in the form
3. Click **"Save Computer"**
4. Review changes in the gallery
5. Click **"Publish Changes"** when ready

### Editing Tips

- You can change the image by uploading a new one
- All fields can be modified
- Changes are not live until you publish
- Multiple computers can be edited before publishing

## Deleting Computers

### Step-by-Step

1. **Click** the computer card to select it (card will highlight)
2. Press **Delete** key on keyboard
3. Confirm deletion in the dialog
4. Click **"Publish Changes"** when ready

### Important Notes

- Deletion removes the computer from the gallery
- The image file is also deleted from GitHub
- Deleted computers cannot be recovered (use backups)
- Changes are not live until you publish

## Image Upload Requirements

### Specifications

| Property | Requirement |
|----------|-------------|
| **Format** | JPEG or PNG |
| **Max Size** | 5 MB |
| **Recommended Resolution** | 1200x900 pixels or higher |
| **Aspect Ratio** | 4:3 recommended |

### Automatic Processing

When you upload an image, the system automatically:

1. Validates file type and size
2. Resizes to 1200x900 pixels (maintaining aspect ratio)
3. Converts to progressive JPEG
4. Compresses to 85% quality
5. Names file automatically (e.g., `desktop-1.jpg`, `laptop-3.jpg`)

### Image Guidelines

**Do:**
- Use natural lighting or soft diffused light
- Capture the full computer from a front angle
- Ensure the background is clean and uncluttered
- Include peripherals if sold together

**Don't:**
- Use blurry or low-resolution images
- Include people or personal information
- Use heavily filtered or edited photos
- Use stock photos

### Naming Convention

Images are automatically named by the system:

- Desktops: `desktop-1.jpg`, `desktop-2.jpg`, etc.
- Laptops: `laptop-1.jpg`, `laptop-2.jpg`, etc.

The system finds the next available number for each type.

## GitHub Integration

### How It Works

The gallery system uses the GitHub API to commit changes directly to the repository. This provides:

- Version control for all changes
- Automatic deployment through webhooks
- Ability to rollback to previous versions
- Audit trail of who made changes

### Required Configuration

In `api/.env`:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=MatthewMcManness
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=Computer-Store-KS
```

### Creating a GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name
4. Select scopes:
   - `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy and save the token immediately

### Commit Messages

The system generates automatic commit messages:

- Adding: "Add [computer-name] to gallery via Web Gallery Manager"
- Editing: "Update [computer-name] via Web Gallery Manager"
- Deleting: "Delete [computer-name] from gallery via Web Gallery Manager"
- Images: "Add gallery image: desktop-5.jpg"

### Viewing History

View commit history at:
```
https://github.com/MatthewMcManness/Computer_Store_KS/commits/Computer-Store-KS
```

## Troubleshooting

### Cannot Log In

**Problem:** Login fails or redirects back to login page

**Solutions:**
1. Verify the API is running:
   ```bash
   curl http://localhost:3001/api/health
   ```
2. Check the password in `api/.env`
3. Clear browser cookies and cache
4. Try incognito/private mode
5. Check browser console (F12) for errors

### Add Computer Button Not Working

**Problem:** Modal doesn't open when clicking "+ Add Computer"

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify `admin-gallery.js` is loaded
3. Clear browser cache
4. Try a different browser

### Image Upload Fails

**Problem:** Image won't upload or shows error

**Solutions:**
1. Check file size (must be under 5MB)
2. Verify file type (JPEG or PNG only)
3. Check API logs for errors:
   ```bash
   docker compose logs computer-store-ks | grep upload
   ```
4. Verify Sharp library is installed correctly
5. Check disk space on server

### Publish Fails

**Problem:** "Publish Changes" shows error

**Solutions:**
1. Verify GitHub token is valid:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
   ```
2. Check token has `repo` scope
3. Verify repository and branch names in `.env`
4. Check API logs:
   ```bash
   docker compose logs computer-store-ks | grep GitHub
   ```
5. Verify you have write access to the repository

### Changes Not Appearing on Live Site

**Problem:** Published changes don't show on website

**Solutions:**
1. Wait 2-3 minutes for deployment
2. Clear browser cache (Ctrl+Shift+R)
3. Check deployment status on Render/hosting dashboard
4. Verify GitHub commit was successful:
   ```
   https://github.com/MatthewMcManness/Computer_Store_KS/commits
   ```
5. Check deployment logs for errors

### Session Expired

**Problem:** Logged out unexpectedly

**Solutions:**
1. Sessions expire after 8 hours
2. Log in again
3. Check if browser is clearing cookies
4. Verify system time is correct

### API Connection Error

**Problem:** "Cannot connect to API" message

**Solutions:**
1. Check API is running:
   ```bash
   curl http://localhost:3001/api/health
   ```
2. Verify ports aren't blocked by firewall
3. Check CORS configuration
4. Verify API URL in `admin-gallery.js`:
   ```javascript
   const API_URL = window.location.hostname === 'localhost'
       ? 'http://localhost:3001'
       : 'https://your-api-domain.com';
   ```

### Gallery Shows Old Data

**Problem:** Dashboard shows outdated computers

**Solutions:**
1. Refresh the page (F5)
2. Clear browser cache
3. Check if another admin made changes
4. Verify API is reading correct `index.html`

### Backup Recovery

**Problem:** Need to restore from backup

**Solutions:**
1. Locate backup in `backups/` directory:
   ```bash
   ls -la backups/
   ```
2. Copy backup to `index.html`:
   ```bash
   cp backups/index_backup_YYYYMMDD_HHMMSS.html index.html
   ```
3. Commit the restored file
4. Redeploy

## Security Considerations

### Password Security

- Use a strong password (16+ characters)
- Change password periodically
- Don't share password via insecure channels
- Rotate password if team member leaves

### Token Security

- Never commit tokens to version control
- Rotate tokens periodically (every 90 days)
- Use minimum required permissions
- Revoke tokens when no longer needed

### Session Security

- Sessions timeout after 8 hours
- Logout when finished
- Use HTTPS in production
- Don't save password in browser on shared computers

## Related Documentation

- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Server deployment
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Local development setup

---

For additional help, check the API logs or refer to the legacy documentation:
- [WEB_GALLERY_MANAGER_SETUP.md](./WEB_GALLERY_MANAGER_SETUP.md)
- [README_WEB_GALLERY.md](./README_WEB_GALLERY.md)
