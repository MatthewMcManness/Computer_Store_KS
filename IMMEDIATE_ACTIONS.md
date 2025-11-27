# IMMEDIATE ACTIONS - Critical Security Fixes

**Timeline: Complete within 24 hours**

---

## Action 1: Rotate Admin Password (15 minutes)

### Step 1.1: Generate Strong Password
```bash
# Generate cryptographically secure password
openssl rand -base64 32 | tr -d '=' | cut -c1-25

# Example output (DO NOT USE THIS):
# A9mK7xL2qP4wR6vN8zT3bF5d
```

### Step 1.2: Update .env File
```bash
# Edit api/.env
nano "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env"

# Replace line:
# ADMIN_PASSWORD=TestPassword123!
# With:
# ADMIN_PASSWORD=YourNewGeneratedPassword123

# Save (Ctrl+O, Enter, Ctrl+X)
```

### Step 1.3: Restart API
```bash
cd "/home/matthew/Computer Store V2/Computer_Store_KS"
pm2 restart computerstoreks-api
pm2 logs computerstoreks-api
# Wait for "Gallery Manager API running on port 3001"
```

### Step 1.4: Verify Login
```bash
# Test new password works
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"YourNewGeneratedPassword123"}'

# Should return: {"success":true,"message":"Authentication successful"}
```

---

## Action 2: Rotate Gmail App Password (20 minutes)

### Step 2.1: Revoke Old App Password
1. Go to https://myaccount.google.com/apppasswords
2. Sign in if prompted
3. Select "Mail" and "Windows Computer"
4. Click "Delete" button
5. Wait 5 minutes

### Step 2.2: Generate New App Password
1. Return to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Click "Generate"
4. Copy the 16-character password (with spaces)
   - Format: xxxx xxxx xxxx xxxx

### Step 2.3: Update .env
```bash
# Edit api/.env
nano "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env"

# Replace line:
# EMAIL_PASS=oiyx byhi xuog etgy
# With:
# EMAIL_PASS=xxxx xxxx xxxx xxxx (the new 16-char password)

# Save (Ctrl+O, Enter, Ctrl+X)
```

### Step 2.4: Restart API and Test
```bash
pm2 restart computerstoreks-api
pm2 logs computerstoreks-api

# Test contact form (will send real email)
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"your-test-email@gmail.com",
    "message":"Test message"
  }'

# Should return: {"success":true,"message":"Thank you..."}

# Check Gmail for:
# 1. Incoming notification to contact@computerstoreks.com
# 2. Confirmation email to your-test-email@gmail.com
```

---

## Action 3: Remove Secrets from Git History (30 minutes)

### Step 3.1: Verify What's in History
```bash
cd "/home/matthew/Computer Store V2/Computer_Store_KS"

# Check if .env is in git history
git log --all --full-history -- api/.env | head -10

# Should show commits from Sept 2025 that modified api/.env
```

### Step 3.2: Remove from History (Force Push Required)
```bash
# This will rewrite git history - affects all developers
# WARNING: Only do this if you're the only developer or have coordinated with others

# First, create a backup
git tag backup-before-secret-removal

# Remove .env from ALL history
git filter-branch --tree-filter 'rm -f api/.env' HEAD

# Update all branches
git filter-branch -f --tree-filter 'rm -f api/.env' -- --all

# Force push to remote (DESTRUCTIVE - overwrites remote history)
git push origin --force --all
git push origin --force --tags

# Notify team that history was rewritten
echo "Git history cleaned. All developers must re-clone the repository."
```

### Step 3.3: Verify Removal
```bash
# Search for any credentials remaining
git log -p --all | grep -i "password\|email_pass\|admin_pass" | grep -v ".env.example"

# Should return nothing (empty)

# Verify .env is NOT in latest commit
git show HEAD:api/.env 2>&1
# Should show: error: path 'api/.env' does not exist in 'HEAD'
```

### Step 3.4: Restore .env Locally
```bash
# Create new .env from example (with new credentials)
cp "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env.example" \
   "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env"

# Edit with new values
nano "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env"

# Update:
# - ADMIN_PASSWORD (use new one from Action 1)
# - EMAIL_PASS (use new one from Action 2)
# - SITE_URL (for your domain)

# Verify .env is in .gitignore
grep "api/.env" "/home/matthew/Computer Store V2/Computer_Store_KS/.gitignore"
# Should show: api/.env

# Stage .gitignore update if needed
git add .gitignore
git commit -m "Ensure api/.env is in gitignore"

# Do NOT stage api/.env
git status
# Should NOT show api/.env as staged
```

---

## Action 4: Fix File Permissions (15 minutes)

### Step 4.1: Fix .env File Permissions
```bash
# .env should be readable only by owner
chmod 600 "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env"
chmod 600 "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env.example"

# Verify
ls -la "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env"
# Should show: -rw------- (0600) matthew matthew
```

### Step 4.2: Fix Configuration File Permissions
```bash
# Configuration files should be readable but not executable
chmod 644 "/home/matthew/Computer Store V2/Computer_Store_KS/ecosystem.config.js"
chmod 644 "/home/matthew/Computer Store V2/Computer_Store_KS/nginx-computerstoreks.conf"
chmod 644 "/home/matthew/Computer Store V2/Computer_Store_KS/.gitignore"

# Verify
ls -la "/home/matthew/Computer Store V2/Computer_Store_KS/ecosystem.config.js"
# Should show: -rw-r--r-- (0644) matthew matthew
```

### Step 4.3: Set Default Permissions for Future Files
```bash
# Add to ~/.bashrc to set default permissions
echo "umask 0077" >> ~/.bashrc
source ~/.bashrc

# Verify new umask
umask
# Should show: 0077
```

### Step 4.4: Verify Security
```bash
# Try to read .env as another user (if possible)
sudo -u www-data cat "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env" 2>&1

# Should show: Permission denied
# This proves .env is not readable by web server
```

---

## Action 5: Enable HTTPS with Let's Encrypt (1-2 hours)

### Step 5.1: Run SSL Setup Script
```bash
# The setup script is already prepared
sudo bash "/home/matthew/Computer Store V2/Computer_Store_KS/setup-ssl.sh"

# This will:
# 1. Update Nginx configuration
# 2. Install certbot
# 3. Request SSL certificates for all domains
# 4. Configure auto-renewal
# 5. Reload Nginx with HTTPS

# Follow prompts:
# - Enter email for certificate notifications
# - Agree to Let's Encrypt terms
# - Answer yes to redirect HTTP to HTTPS
```

### Step 5.2: Verify HTTPS Works
```bash
# Test HTTPS connection
curl https://computerstoreks.com
# Should return HTML (no certificate errors)

# Check certificate details
openssl s_client -connect computerstoreks.com:443 -showcerts
# Should show certificate issued by Let's Encrypt
# Subject: CN = computerstoreks.com

# Verify all domains have certificates
sudo certbot certificates
# Should list all 4 domains with valid certificates
```

### Step 5.3: Verify HTTP Redirects to HTTPS
```bash
# Test redirect
curl -I http://computerstoreks.com
# Should show: HTTP/1.1 301 Moved Permanently
# Location: https://computerstoreks.com

# Test in browser (should automatically redirect)
# Open http://computerstoreks.com in browser
# Should end up at https://computerstoreks.com with lock icon
```

### Step 5.4: Set Up Auto-Renewal
```bash
# Verify certbot timer is running
sudo systemctl status certbot.timer
# Should show: active (running)

# Test renewal process (dry run)
sudo certbot renew --dry-run
# Should show: (dry run: skipping install step)

# Set up automatic renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Monitor renewals (logs)
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## Verification Checklist

After completing all 5 actions:

```bash
# 1. Admin password changed
curl -X POST https://computerstoreks.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"YourNewPassword"}'
# Should succeed with new password, fail with old

# 2. Email credentials rotated
# Check Gmail: https://myaccount.google.com/apppasswords
# Old app password should be deleted

# 3. Credentials removed from git
git log -p --all | grep "ADMIN_PASSWORD=TestPassword"
# Should return nothing

# 4. File permissions secure
ls -la "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env"
# Should show: -rw------- (0600)

# 5. HTTPS working
curl -I https://computerstoreks.com
# Should show: HTTP/2 200 or HTTP/1.1 200
# Check for lock icon in browser
```

---

## Verification Results Template

```
Completion Date: ___________
Completed By: ___________

Action 1: Admin Password Rotated ☐
- Verified in gallery-api.js: ☐
- Tested login: ☐

Action 2: Email Password Rotated ☐
- Old app password deleted: ☐
- New app password set: ☐
- Contact form tested: ☐

Action 3: Secrets Removed from Git ☐
- Git history cleaned: ☐
- Force push completed: ☐
- Team notified: ☐

Action 4: File Permissions Fixed ☐
- .env is 0600: ☐
- Config files are 0644: ☐
- Tested permission denied: ☐

Action 5: HTTPS Enabled ☐
- Certificates obtained: ☐
- HTTP redirects to HTTPS: ☐
- Auto-renewal configured: ☐

All Critical Issues Resolved: ☐ YES / ☐ NO
```

---

## Troubleshooting

### Issue: "ADMIN_PASSWORD must be set" on restart
**Solution:** Verify .env file has ADMIN_PASSWORD line:
```bash
grep "ADMIN_PASSWORD" "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env"
# Should show: ADMIN_PASSWORD=YourNewPassword
```

### Issue: Gmail says "invalid app password"
**Solution:** Regenerate app password:
1. Go to https://myaccount.google.com/apppasswords
2. Make sure "2-Step Verification" is enabled
3. Select "Mail" and "Windows Computer"
4. Generate new password
5. Copy exactly with spaces

### Issue: Certbot says "DNS validation failed"
**Solution:**
1. Verify DNS is configured: `nslookup computerstoreks.com`
2. Wait 15 minutes for DNS propagation
3. Ensure firewall allows port 80: `sudo ufw allow 'Nginx HTTP'`
4. Run again: `sudo bash setup-ssl.sh`

### Issue: PM2 won't restart
**Solution:**
```bash
# Kill existing process
pm2 kill

# Restart PM2 daemon
pm2 start ecosystem.config.js

# Verify
pm2 list
pm2 logs computerstoreks-api
```

---

## Emergency Contact

For production issues during HTTPS migration:

1. **Rollback HTTPS** (if needed):
   ```bash
   # Restore backup of nginx config
   sudo systemctl reload nginx
   ```

2. **Restart API**:
   ```bash
   pm2 restart computerstoreks-api
   ```

3. **Check logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   pm2 logs computerstoreks-api
   ```

---

## Next Steps After Immediate Actions

Once critical issues are resolved:

1. **Within 4 hours:** Implement missing security headers (see SECURITY_AUDIT_REPORT.md, section 2.2)
2. **Within 24 hours:** Tighten rate limiting (section 2.3)
3. **Within 1 week:** Add security monitoring and logging (section 3.4)
4. **Within 2 weeks:** Set up Web Application Firewall (section 3.3)

