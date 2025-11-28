# Troubleshooting: Modal Not Opening

## The Problem

When clicking "+ Add Computer" or trying to edit, the screen turns grey but no modal appears.

## Root Cause

**You need to access the admin page through a web server**, not by opening the file directly!

### Why?

When you open `admin-gallery.html` directly as a file (`file:///C:/...`), the JavaScript can't fetch `index.html` due to browser security restrictions (CORS). This causes the gallery to fail loading.

## Solution: Use a Web Server

### Option 1: Use the Startup Script (Easiest!)

1. **Double-click**: `start-both-servers.bat`
2. **Wait** for both servers to start (2 terminal windows will open)
3. **Browser opens automatically** to http://localhost:8000/admin-login.html
4. **Login** with password: `52389!CS`
5. **Everything works!** ✅

### Option 2: Manual Start

**Terminal 1 - Start API:**
```cmd
cd api
npm start
```

**Terminal 2 - Start Web Server:**
```cmd
node test-server.js
```

**Browser:**
```
http://localhost:8000/admin-login.html
```

### Option 3: Use Python (if installed)

```cmd
cd C:\Users\Matthew\Documents\GitHub\Computer_Store_KS
python -m http.server 8000
```

Then visit: `http://localhost:8000/admin-login.html`

### Option 4: Use VS Code Live Server

1. Open folder in VS Code
2. Right-click `admin-login.html`
3. Select "Open with Live Server"

## What Each Server Does

### API Server (Port 3001)
- Handles GitHub commits
- Processes image uploads
- Manages authentication
- **Must be running** to publish changes

### Web Server (Port 8000)
- Serves HTML/CSS/JS files
- Allows JavaScript to fetch `index.html`
- **Must be running** to use the admin panel

## Testing the Fix

### Before (Not Working):
- URL looks like: `file:///C:/Users/Matthew/...`
- Screen goes grey, no modal
- Console shows CORS errors

### After (Working):
- URL looks like: `http://localhost:8000/...`
- Modals open perfectly
- Everything works!

## Quick Test

1. **Run**: `start-both-servers.bat`
2. **Browser opens** to login page
3. **Enter password**: `52389!CS`
4. **See computers** loading in gallery
5. **Click "+ Add Computer"**
6. **Modal opens!** ✅

## Debugging Console Errors

Press **F12** in browser to open Developer Tools, then check:

### Console Tab
Look for errors like:
- ❌ `CORS policy` - You're opening as file, need web server
- ❌ `Failed to fetch` - Web server not running
- ❌ `401 Unauthorized` - API server not running or wrong password
- ✅ `Gallery loaded successfully!` - Everything working!

### Network Tab
Check if requests are going to:
- ✅ `http://localhost:8000/` - Good!
- ❌ `file:///C:/Users/...` - Wrong! Need web server

## Common Issues

### Issue: "start-both-servers.bat doesn't work"
**Solution**: Make sure Node.js is installed
- Check: Run `node --version` in cmd
- If not found, install from https://nodejs.org/

### Issue: "Port 8000 already in use"
**Solution**: Change port in test-server.js
- Open test-server.js
- Change `const PORT = 8000;` to `const PORT = 8001;`
- Update URLs to use new port

### Issue: "API server shows GitHub: Disabled"
**Solution**: Restart API server
- Close the API terminal
- Run `cd api && npm start` again
- Should now show "GitHub integration: Enabled"

### Issue: "Modal opens but is blank"
**Solution**: Hard refresh browser
- Press **Ctrl+Shift+R** or **Ctrl+F5**
- Clears cache and reloads everything

## Files Created for This Fix

- ✅ `test-server.js` - Simple web server
- ✅ `start-both-servers.bat` - Auto-starts both servers
- ✅ Added console logging to admin-gallery.js
- ✅ Added error alerts to openAddModal()

## Success Checklist

- [ ] Both terminal windows are open (API + Web)
- [ ] API shows "GitHub integration: Enabled"
- [ ] Browser URL starts with `http://localhost:8000/`
- [ ] Can login with password `52389!CS`
- [ ] See computers loading in gallery
- [ ] "+ Add Computer" opens modal
- [ ] Double-click computer opens edit modal
- [ ] Filters work
- [ ] Everything clickable!

---

**TL;DR: Double-click `start-both-servers.bat` and use http://localhost:8000/admin-login.html** 🎉
