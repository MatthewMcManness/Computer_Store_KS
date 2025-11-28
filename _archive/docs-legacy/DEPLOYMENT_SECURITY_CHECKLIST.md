# Deployment Security Checklist

Pre-deployment verification for Computer Store KS website security hardening.

---

## Pre-Deployment Phase

### Credentials & Secrets
- [ ] All credentials rotated (passwords, keys, tokens)
- [ ] .env file NOT in git: `git log --all -- api/.env` shows 0 commits after cleanup
- [ ] No credentials in source code: `git grep -n "password\|secret\|token" HEAD` returns nothing
- [ ] Verify .env in .gitignore: `grep "api/.env" .gitignore`
- [ ] Backup of current credentials in secure location (password manager)

### SSL/TLS Configuration
- [ ] Let's Encrypt certificates obtained: `sudo certbot certificates` shows all domains
- [ ] Certificate validity verified: `openssl x509 -enddate -in /etc/letsencrypt/live/computerstoreks.com/cert.pem`
- [ ] Auto-renewal configured: `sudo systemctl status certbot.timer` shows "active"
- [ ] HTTPS redirect configured in nginx
- [ ] HSTS header enabled: `add_header Strict-Transport-Security...`

### Security Headers
- [ ] Content-Security-Policy header configured
- [ ] X-Frame-Options set to SAMEORIGIN
- [ ] X-Content-Type-Options set to nosniff
- [ ] X-XSS-Protection enabled
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured
- [ ] Test headers: `curl -I https://computerstoreks.com | grep -i "strict-transport\|csp"`

### File Permissions
- [ ] .env file permissions: 0600
  ```bash
  stat api/.env | grep "Access:"
  # Should show: (0600/-rw-------)
  ```
- [ ] Configuration files permissions: 0644
  ```bash
  ls -l ecosystem.config.js nginx-computerstoreks.conf
  # Should show: -rw-r--r--
  ```
- [ ] Web root readable but not writable: 0755
- [ ] Log directories with appropriate permissions
- [ ] Verify with: `umask` shows 0077

### Nginx Configuration
- [ ] nginx.conf syntax valid: `sudo nginx -t`
- [ ] All domains configured in server block
- [ ] HTTP redirects to HTTPS
- [ ] API proxy configured correctly
- [ ] Rate limiting zones defined
- [ ] Gzip compression enabled
- [ ] Static file caching configured

### API Configuration
- [ ] gallery-api.js loads environment variables correctly
- [ ] ADMIN_PASSWORD validation: length >= 16 chars
- [ ] Rate limiters configured:
  - [ ] Login: 3 attempts per 15 minutes
  - [ ] General: 30 requests per minute
  - [ ] Contact form: 3 per hour
  - [ ] Image upload: 10 per hour
- [ ] CORS whitelist verified (HTTPS origins only)
- [ ] Email configuration validated
- [ ] All required npm packages installed: `npm list`

### Logging & Monitoring
- [ ] PM2 log directory created: `/var/log/pm2`
- [ ] PM2 log rotation configured in logrotate
- [ ] Nginx access/error logs configured
- [ ] Security event logging enabled in API
- [ ] Log permissions: 0640 or 0600
- [ ] Verify PM2 logs: `pm2 logs computerstoreks-api`

### Database & Data
- [ ] Asset directory writable by API process
- [ ] Gallery images directory exists: `/assets/gallery`
- [ ] Backup of all images created
- [ ] Upload size limits configured: 5MB per file, 10MB total
- [ ] File type validation in place (JPEG/PNG only)

### Dependencies
- [ ] npm audit clean: `npm audit --production` shows 0 vulnerabilities
- [ ] All dependencies up to date: `npm update --save`
- [ ] No dev dependencies in production
- [ ] Check critical packages:
  - [ ] express
  - [ ] helmet
  - [ ] express-rate-limit
  - [ ] cors
  - [ ] dotenv
- [ ] package-lock.json present and committed

### Environment
- [ ] Node.js version >= 18: `node --version`
- [ ] npm version current: `npm --version`
- [ ] Environment variables defined in Render dashboard (if using Render)
- [ ] .env.example matches actual required vars
- [ ] Test with dummy .env: `cp .env.example .env.test && npm start`

### Testing Environment
- [ ] Create test database/data if needed
- [ ] Test all API endpoints:
  ```bash
  # Health check
  curl https://localhost:3001/api/health

  # Login endpoint
  curl -X POST https://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"password":"TEST_PASSWORD"}'

  # Contact form
  curl -X POST https://localhost:3001/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","message":"Test"}'
  ```
- [ ] Test rate limiting works
- [ ] Test CORS policies
- [ ] Test error handling

### Backup & Recovery
- [ ] Full system backup created
- [ ] Git tag created: `git tag deployment-YYYY-MM-DD`
- [ ] Recovery procedure documented
- [ ] Test recovery on staging environment
- [ ] Rollback procedure documented

---

## Deployment Phase

### Pre-Deployment
- [ ] Notify team of planned deployment
- [ ] Schedule maintenance window if needed
- [ ] Stop API gracefully: `pm2 stop computerstoreks-api`
- [ ] Verify stop: `pm2 list` shows "stopped"
- [ ] Kill any background processes: `pkill -f gallery-api.js`

### Deploy Code
- [ ] Pull latest code: `git pull origin main`
- [ ] Verify no uncommitted changes: `git status`
- [ ] Check deployment branch: `git branch -v`
- [ ] Install dependencies: `npm install --production`
- [ ] Verify installations: `npm list`
- [ ] Clear any old logs: `pm2 flush`

### Deploy Configuration
- [ ] Copy nginx config: `sudo cp nginx-computerstoreks.conf /etc/nginx/sites-available/computerstoreks`
- [ ] Test nginx: `sudo nginx -t`
- [ ] Reload nginx: `sudo systemctl reload nginx`
- [ ] Verify nginx running: `sudo systemctl status nginx`
- [ ] Update PM2 config if changed
- [ ] Verify ecosystem.config.js syntax: `node -e "require('./ecosystem.config.js')"`

### Start Services
- [ ] Start API with PM2: `pm2 start ecosystem.config.js`
- [ ] Verify startup: `pm2 list` shows "online"
- [ ] Check API logs: `pm2 logs computerstoreks-api | head -20`
- [ ] Wait for 10 seconds to ensure no immediate crashes
- [ ] Save PM2 state: `pm2 save`

### Post-Deployment Verification
- [ ] API responding: `curl https://computerstoreks.com/api/health`
- [ ] Returns valid JSON with status: 200
- [ ] Homepage loads: `curl https://computerstoreks.com`
- [ ] Admin panel accessible
- [ ] Security headers present: `curl -I https://computerstoreks.com`
- [ ] No certificate errors
- [ ] No error logs in PM2: `pm2 logs computerstoreks-api --lines=50`
- [ ] No errors in nginx: `sudo tail -20 /var/log/nginx/error.log`

### Functional Testing
- [ ] Test admin login with new credentials
- [ ] Test contact form submission
- [ ] Verify email notifications received
- [ ] Test image upload (if applicable)
- [ ] Test image deletion (if applicable)
- [ ] Check gallery displays correctly
- [ ] Test on multiple devices/browsers
- [ ] Verify HTTPS redirect works
- [ ] Check performance (page load time)

### Security Verification
- [ ] HTTPS working for all domains
- [ ] HTTP redirects to HTTPS
- [ ] Certificate valid: `openssl s_client -connect computerstoreks.com:443 -showcerts`
- [ ] HSTS header present
- [ ] CSP header present
- [ ] No sensitive data in logs
- [ ] No exposed credentials
- [ ] Rate limiting active
- [ ] CORS working correctly
- [ ] Test failed login (should be rate limited after 3 attempts)

### Monitoring Setup
- [ ] PM2 logs configured and rotating
- [ ] Nginx logs accessible: `sudo tail -f /var/log/nginx/computerstoreks/access.log`
- [ ] Set up log monitoring:
  ```bash
  # Check for errors in real-time
  tail -f /var/log/pm2/computerstoreks-api-error.log

  # Check for failures in real-time
  tail -f /var/log/pm2/computerstoreks-api-out.log | grep -i "error\|fail"
  ```
- [ ] Create monitoring dashboard (if applicable)
- [ ] Set up alerts for errors

### Final Sign-Off
- [ ] All checklist items completed
- [ ] All tests passing
- [ ] No critical errors in logs
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Team notified deployment complete

---

## Post-Deployment (First 24 Hours)

### Hour 1
- [ ] Monitor error logs continuously
- [ ] Check API resource usage: `pm2 monit`
- [ ] Verify all services stable
- [ ] Test all critical functionality
- [ ] Check uptime monitoring

### Hours 2-24
- [ ] Review logs every few hours
- [ ] Monitor error rate
- [ ] Check database/file usage
- [ ] Test functionality multiple times
- [ ] Monitor from different locations
- [ ] Check email notifications
- [ ] Verify no performance degradation

### Daily (First Week)
- [ ] Review logs for errors
- [ ] Check uptime percentage
- [ ] Verify backups running
- [ ] Test disaster recovery procedure
- [ ] Monitor certificate renewal

---

## Rollback Procedure

If deployment fails or causes issues:

### Immediate Actions
```bash
# 1. Stop current version
pm2 stop computerstoreks-api

# 2. Check the error
pm2 logs computerstoreks-api --lines=100

# 3. Identify issue from logs
# Is it:
# - Missing environment variable? Fix .env
# - Configuration error? Check nginx config
# - Dependency issue? Check npm install
# - Application crash? Review code changes
```

### Rollback Steps
```bash
# 1. Revert code
git checkout deployment-prev-tag  # Use previous tag name

# 2. Reinstall dependencies (if needed)
npm install --production

# 3. Clear PM2 cache
pm2 flush

# 4. Restart with previous version
pm2 start ecosystem.config.js

# 5. Reload nginx (if config changed)
sudo systemctl reload nginx

# 6. Verify
curl https://computerstoreks.com/api/health
```

### Post-Rollback
- [ ] Verify all systems working
- [ ] Check logs for errors
- [ ] Notify stakeholders
- [ ] Document what went wrong
- [ ] Plan fixes for next deployment
- [ ] Schedule follow-up deployment

---

## Common Issues & Fixes

### Issue: "ADMIN_PASSWORD must be set"
**Cause:** Environment variable not loaded
**Fix:**
```bash
# Verify .env exists
ls -la api/.env

# Verify variable is set
grep ADMIN_PASSWORD api/.env

# Manually set if needed
export ADMIN_PASSWORD=$(grep ADMIN_PASSWORD api/.env | cut -d= -f2)
```

### Issue: Nginx shows certificate error
**Cause:** Certificate path incorrect
**Fix:**
```bash
# Check certificate exists
sudo ls -la /etc/letsencrypt/live/computerstoreks.com/

# Update nginx config with correct path
sudo nano /etc/nginx/sites-available/computerstoreks
# ssl_certificate /etc/letsencrypt/live/computerstoreks.com/fullchain.pem;

# Reload nginx
sudo systemctl reload nginx
```

### Issue: PM2 process crashes immediately
**Cause:** Application error on startup
**Fix:**
```bash
# View crash message
pm2 logs computerstoreks-api --lines=50

# Check Node.js version compatibility
node --version  # Should be >= 18

# Try starting with console output
node api/gallery-api.js

# Look for error messages
```

### Issue: Rate limiting blocks legitimate users
**Cause:** Limits too strict or user hitting threshold
**Fix:**
```bash
# Adjust limits in gallery-api.js if needed
# Wait 15+ minutes for rate limit window to expire
# Or clear rate limit store if using Redis
```

### Issue: Email notifications not sending
**Cause:** Email credentials expired or incorrect
**Fix:**
```bash
# Verify email config in .env
grep EMAIL api/.env

# Check Gmail app password is valid
# Go to: https://myaccount.google.com/apppasswords

# Test email connectivity
node -e "
  require('dotenv').config({ path: 'api/.env' });
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  transporter.verify((err, valid) => {
    if (err) console.error('Email error:', err);
    else console.log('Email valid:', valid);
  });
"
```

---

## Success Metrics

After deployment, validate:

| Metric | Target | Command |
|--------|--------|---------|
| HTTPS Enabled | 100% | `curl -I https://computerstoreks.com` |
| API Uptime | > 99.9% | `pm2 status` |
| Response Time | < 500ms | `curl -w "@curl-format.txt"` |
| Error Rate | < 0.1% | `grep -c ERROR /var/log/pm2/*` |
| Certificate Valid | Yes | `certbot certificates` |
| Rate Limiting | Active | 4th login attempt blocked |
| Security Headers | All Present | Headers scan |

---

## Sign-Off

Deployment Date: _______________
Deployed By: _______________
Reviewed By: _______________

All checks completed: ☐ Yes / ☐ No

Notes: _______________________________________________

Issues Encountered: _______________________________________________

Rollback Used: ☐ Yes / ☐ No

Status: ☐ Success / ☐ Partial / ☐ Failed

---

## Support

### During Deployment Issues
1. Check logs: `pm2 logs computerstoreks-api`
2. Review nginx: `sudo tail -f /var/log/nginx/error.log`
3. Test connectivity: `curl https://computerstoreks.com`
4. If critical: Rollback using procedure above

### After Deployment
- Monitor for 24 hours
- Review logs daily for first week
- Check certificate renewal weekly
- Test functionality monthly

