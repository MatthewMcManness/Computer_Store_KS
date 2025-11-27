# Web Gallery Manager

## Overview

A secure, web-based gallery management system for Computer Store Kansas that allows authorized employees to manage the website's computer gallery from any browser.

## Features

✅ **Secure Login** - Password-protected admin access
✅ **Add Computers** - Create new gallery entries with images
✅ **Edit Computers** - Modify existing entries
✅ **Delete Computers** - Remove outdated listings
✅ **Image Upload** - Automatic optimization and resizing
✅ **Live Preview** - See changes before publishing
✅ **Git Integration** - Auto-commit to GitHub
✅ **Auto-Deploy** - Changes go live via Render
✅ **Mobile Friendly** - Works on any device
✅ **Session Security** - 8-hour auto-logout
✅ **Auto Backups** - HTML backups before each publish

## System Components

### Frontend
- `admin-login.html` - Secure login page
- `admin-gallery.html` - Main dashboard interface
- `admin-gallery.js` - Client-side logic

### Backend
- `api/gallery-api.js` - Express API server
- GitHub API integration
- Image processing with Sharp

### Integration
- `script.js` - Login button redirect (modified)
- `index.html` - Administrator Login button (existing)

## Quick Links

- 📖 **[Full Setup Guide](WEB_GALLERY_MANAGER_SETUP.md)** - Complete installation instructions
- 🚀 **[Quick Start](QUICK_START.md)** - 5-minute setup guide
- 🎯 **[Desktop App Guide](GALLERY_MANAGER_README.md)** - Original Python app (legacy)

## Architecture

```
┌─────────────┐
│   Browser   │
│  (Admin UI) │
└─────┬───────┘
      │
      │ HTTPS
      ▼
┌─────────────┐
│  Express    │
│  API Server │ ← GitHub API
└─────┬───────┘
      │
      │ Commits
      ▼
┌─────────────┐
│   GitHub    │
│  Repository │
└─────┬───────┘
      │
      │ Webhook
      ▼
┌─────────────┐
│  Render.com │
│   Hosting   │
└─────────────┘
```

## Technology Stack

**Frontend:**
- HTML5 / CSS3
- Vanilla JavaScript (no frameworks)
- Responsive design

**Backend:**
- Node.js 18+
- Express.js
- Octokit (GitHub API)
- Sharp (image processing)
- Multer (file uploads)

**Deployment:**
- GitHub (version control)
- Render.com (hosting)

## Security

- Password authentication
- Session management (8hr timeout)
- Environment variable protection
- GitHub token encryption
- Input validation
- File type restrictions
- Path traversal prevention

## Workflow

1. Employee clicks "Administrator Login" on website
2. Enters admin password
3. Views current gallery in dashboard
4. Makes changes (add/edit/delete)
5. Clicks "Publish Changes"
6. API commits to GitHub
7. Render auto-deploys
8. Live website updates in 2-3 minutes

## System Requirements

- Node.js 18 or higher
- Git installed and configured
- GitHub repository access
- GitHub Personal Access Token with `repo` scope
- Internet connection

## Installation

See **[WEB_GALLERY_MANAGER_SETUP.md](WEB_GALLERY_MANAGER_SETUP.md)** for detailed instructions.

### TL;DR

```bash
# Install dependencies
cd api && bun install

# Configure environment
copy .env.example .env
# Edit .env with GitHub token and admin password

# Start API server
bun start

# Access admin panel
# https://computerstoreks.com/admin-login.html
```

## Usage

### Login
1. Navigate to website footer
2. Click "Administrator Login"
3. Enter admin password

### Add Computer
1. Click "+ Add Computer"
2. Fill form (name, type, category, price, image, specs)
3. Click "Save Computer"
4. Click "Publish Changes" when ready

### Edit Computer
1. Double-click computer card
2. Modify fields
3. Click "Save Computer"
4. Click "Publish Changes"

### Delete Computer
1. Select computer card
2. Press Delete key
3. Confirm deletion
4. Click "Publish Changes"

## File Structure

```
Computer_Store_KS/
├── admin-login.html              # Login page
├── admin-gallery.html            # Dashboard
├── admin-gallery.js              # Dashboard logic
├── api/
│   ├── gallery-api.js           # Backend server
│   ├── package.json             # Dependencies
│   ├── .env                     # Config (not committed)
│   └── .env.example             # Config template
├── assets/
│   └── gallery/                 # Computer images
├── backups/                     # HTML backups
├── WEB_GALLERY_MANAGER_SETUP.md # Full guide
├── QUICK_START.md               # Quick reference
└── README_WEB_GALLERY.md        # This file
```

## Maintenance

### Updating Dependencies

```bash
cd api
bun update
```

### Viewing Logs

API server logs to console. For production, use:

```bash
pm2 logs gallery-api
```

### Backups

Automatic backups created in `backups/` folder before each publish:
- Format: `index_backup_YYYYMMDD_HHMMSS.html`
- Retained indefinitely
- Can restore manually if needed

### Rotating Admin Password

1. Edit `api/.env`
2. Change `ADMIN_PASSWORD`
3. Restart API: `pm2 restart gallery-api`
4. Share new password with team

### Rotating GitHub Token

1. Create new token at https://github.com/settings/tokens
2. Update `api/.env` with `GITHUB_TOKEN`
3. Restart API
4. Revoke old token on GitHub

## Troubleshooting

### API Won't Start

```bash
# Check Node version
node --version  # Should be 18+

# Reinstall dependencies
cd api
rm -rf node_modules
bun install

# Check .env exists
ls .env  # Should exist

# Try verbose mode
DEBUG=* bun start
```

### Can't Login

- Verify API is running
- Check password in `api/.env`
- Clear browser cache and cookies
- Try incognito/private mode

### Publish Fails

- Check GitHub token is valid
- Verify `repo` scope on token
- Check branch name is correct
- Review API console logs

See **[WEB_GALLERY_MANAGER_SETUP.md](WEB_GALLERY_MANAGER_SETUP.md)** for comprehensive troubleshooting.

## Comparison: Desktop vs Web

| Feature | Desktop App | Web App |
|---------|-------------|---------|
| Platform | Windows only | Any device |
| Install | Python + deps | Browser only |
| Access | Local machine | Anywhere |
| Multi-user | No | Yes |
| Mobile | No | Yes |
| Auto-backup | Yes | Yes |
| Git commit | Local git | GitHub API |
| Session | Always | 8 hours |

## Migration from Desktop App

The desktop Python app (`gallery_manager.py`) still works but is now legacy. To fully migrate:

1. ✅ Set up web gallery manager (this guide)
2. ✅ Test all features
3. ✅ Train team on new interface
4. ⚠️ Keep desktop app as backup
5. 📦 Archive desktop app when confident

## Future Enhancements

Potential improvements:

- [ ] Multi-user authentication (individual accounts)
- [ ] Role-based permissions (admin vs editor)
- [ ] Audit log of changes
- [ ] Undo/redo functionality
- [ ] Batch operations
- [ ] Image CDN integration
- [ ] Real-time collaboration
- [ ] Mobile app (PWA)

## Support

For issues or questions:

1. Check **[WEB_GALLERY_MANAGER_SETUP.md](WEB_GALLERY_MANAGER_SETUP.md)** troubleshooting section
2. Review **[QUICK_START.md](QUICK_START.md)** for common tasks
3. Check API console logs for errors
4. Verify `.env` configuration
5. Test with minimal example

## License

Proprietary - Computer Store Kansas Internal Use Only

## Credits

- **Developer**: Kaya (Claude Code AI Assistant)
- **Client**: Computer Store Kansas
- **Version**: 1.0.0
- **Date**: November 2025

---

**Ready to get started?** → See [WEB_GALLERY_MANAGER_SETUP.md](WEB_GALLERY_MANAGER_SETUP.md)
