# Fix: PowerShell Execution Policy Error

## Problem

When running `bun install` or `npm install`, you get this error:

```
bun : The term 'bun' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

Or:

```
File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
PSSecurityException
```

## Solution

You have **3 options** to fix this:

---

## Option 1: Use Command Prompt (Easiest)

Instead of PowerShell, use Command Prompt (cmd.exe):

1. Press **Windows Key + R**
2. Type `cmd` and press Enter
3. Navigate to the API folder:
   ```cmd
   cd C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api
   ```
4. Run the install command:
   ```cmd
   npm install
   ```

**This bypasses PowerShell entirely!**

---

## Option 2: Enable PowerShell Scripts (Recommended)

Allow PowerShell to run scripts temporarily:

1. **Open PowerShell as Administrator**:
   - Press Windows Key
   - Type "PowerShell"
   - Right-click "Windows PowerShell"
   - Select "Run as administrator"

2. **Run this command**:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Confirm** by typing `Y` and pressing Enter

4. **Now run your install**:
   ```powershell
   cd C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api
   npm install
   ```

5. **Optional - Restore security** after install:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Restricted -Scope CurrentUser
   ```

---

## Option 3: Bypass for Single Command

Run with bypass flag (less secure):

```powershell
powershell -ExecutionPolicy Bypass -Command "npm install"
```

---

## Recommended: Use Option 1 (Command Prompt)

The simplest solution is to just use `cmd` instead of PowerShell:

```cmd
cd C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api
npm install
copy .env.example .env
notepad .env
npm start
```

**All commands work the same in cmd.exe!**

---

## After Installing Dependencies

Once `npm install` completes successfully:

1. **Configure `.env`**:
   ```cmd
   copy .env.example .env
   notepad .env
   ```

2. **Add your credentials** to `.env`:
   - GitHub Personal Access Token
   - Admin password

3. **Start the API**:
   ```cmd
   npm start
   ```

4. **Test it**:
   - Open browser
   - Go to `http://localhost:3001/api/health`
   - Should see: `{"status":"ok",...}`

---

## Quick Reference

### Using Command Prompt (cmd.exe)

```cmd
REM Navigate to API folder
cd C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api

REM Install dependencies
npm install

REM Setup environment
copy .env.example .env
notepad .env

REM Start server
npm start
```

### Using PowerShell (after fixing policy)

```powershell
# Navigate to API folder
cd C:\Users\Matthew\Documents\GitHub\Computer_Store_KS\api

# Install dependencies
npm install

# Setup environment
Copy-Item .env.example .env
notepad .env

# Start server
npm start
```

---

## Troubleshooting

### "npm is not recognized"

**Solution**: Install Node.js from https://nodejs.org/

### "Cannot find module express"

**Solution**: Dependencies didn't install. Run `npm install` again.

### "ENOENT: no such file or directory, open '.env'"

**Solution**: Create `.env` file:
```cmd
copy .env.example .env
```

---

## Need Help?

1. Make sure Node.js is installed: `node --version`
2. Use Command Prompt instead of PowerShell
3. Run as Administrator if permission errors
4. Check you're in the correct folder: `dir` should show `package.json`
