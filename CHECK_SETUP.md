# Quick Setup Check - Is Everything Running?

## Step 1: Are Both Servers Running?

Check if you have **2 terminal windows** open:

### Terminal 1: API Server (Port 3001)
Should show:
```
Gallery Manager API running on port 3001
GitHub integration: Enabled
Repository: MatthewMcManness/Computer_Store_KS
```

### Terminal 2: Web Server (Port 8000)
Should show:
```
Server running at http://localhost:8000/
Access the Gallery Manager:
  Admin login: http://localhost:8000/admin-login.html
```

**If you DON'T have both terminals:**
1. Close any open browsers
2. Navigate to: `C:\Users\Matthew\Documents\GitHub\Computer_Store_KS`
3. Double-click: `start-both-servers.bat`
4. Wait for both windows to open
5. Browser should auto-open to login page

---

## Step 2: Check Your Browser URL

Look at the address bar - it should say:

✅ **CORRECT:**
```
http://localhost:8000/admin-gallery.html
```

❌ **WRONG:**
```
file:///C:/Users/Matthew/Documents/GitHub/Computer_Store_KS/admin-gallery.html
```

**If you see `file:///`:**
- You're opening the file directly - this won't work!
- Modals require a web server due to browser security
- Use `start-both-servers.bat` instead

---

## Step 3: Test If It's Working

### Option A: Use the Debug Page

1. Make sure servers are running (Step 1)
2. Open browser to: `http://localhost:8000/MODAL_DEBUG.html`
3. Click all the test buttons
4. Look for green ✅ checkmarks
5. Follow any red ❌ error messages

### Option B: Quick Manual Test

1. Open: `http://localhost:8000/admin-login.html`
2. Enter password: `52389!CS`
3. Should redirect to gallery
4. Click "🎉 Black Friday: OFF" button
5. Should see toast notification
6. Click "+ Add Computer"
7. **Modal should appear!**

If modal DOESN'T appear:
- Press F12 to open browser console
- Look for red error messages
- Take a screenshot and share it

---

## Common Problems & Solutions

### Problem: "start-both-servers.bat doesn't work"

**Solution:**
```cmd
REM Start API manually:
cd api
npm start

REM In another terminal, start web server:
cd ..
node test-server.js
```

### Problem: "Port already in use"

**Solution:**
- Kill any Node processes
- Or change port in test-server.js
- Restart servers

### Problem: "Modals appear but are blank"

**Solution:**
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Restart browser

### Problem: "Can't connect to API"

**Solution:**
- Make sure API server is running
- Check it shows "GitHub integration: Enabled"
- Test: http://localhost:3001/api/health

---

## Checklist

Use this to verify everything:

- [ ] Two terminal windows are open (API + Web Server)
- [ ] API shows "GitHub integration: Enabled"
- [ ] Web server shows "Server running at http://localhost:8000"
- [ ] Browser URL starts with `http://localhost:8000/`
- [ ] Can login with password `52389!CS`
- [ ] Can see computers loading in gallery
- [ ] Clicking Black Friday button shows toast notification
- [ ] Clicking "+ Add Computer" opens modal
- [ ] Modal has form fields visible
- [ ] Can type in form fields
- [ ] Can close modal with X or Cancel button

**If ALL checkmarks: You're good to go! ✅**

**If ANY missing: Follow the step for that item above**

---

## Quick Restart

If something's not working, do a full restart:

1. **Close all terminals** (both API and Web Server)
2. **Close browser**
3. **Navigate to project folder**
4. **Double-click:** `start-both-servers.bat`
5. **Wait for browser to auto-open**
6. **Test again**

---

## Need More Help?

1. Run the debug page: `http://localhost:8000/MODAL_DEBUG.html`
2. Click all test buttons
3. Screenshot the results
4. Check browser console (F12) for errors

The debug page will tell you exactly what's wrong!
