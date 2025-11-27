# Infrastructure Security Remediation Guide

Complete guide for fixing all identified security issues in priority order.

---

## Table of Contents

1. [Critical Fixes (Day 1)](#critical-fixes)
2. [High Priority Fixes (Days 2-3)](#high-priority-fixes)
3. [Medium Priority Fixes (Week 1)](#medium-priority-fixes)
4. [Testing & Validation](#testing--validation)
5. [Ongoing Maintenance](#ongoing-maintenance)

---

## Critical Fixes

### Fix 1: HTTPS/TLS Configuration

**Current State:** HTTP only, no SSL/TLS
**Target:** HTTPS with auto-renewing certificates
**Time:** 1-2 hours

#### Implementation

**Step 1: Update Nginx Configuration**

Create `/tmp/nginx-https-update.conf`:
```bash
cat > /tmp/nginx-https-update.conf << 'CONF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name computerstoreks.com www.computerstoreks.com
               thecomputerstoreks.com www.thecomputerstoreks.com;

    # Certbot validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name computerstoreks.com www.computerstoreks.com
               thecomputerstoreks.com www.thecomputerstoreks.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/computerstoreks.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/computerstoreks.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'self';" always;
    add_header Permissions-Policy "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" always;

    # Static files
    root "/home/matthew/Computer Store V2/Computer_Store_KS";
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2|woff|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
CONF

# Replace current config
sudo cp /tmp/nginx-https-update.conf /etc/nginx/sites-available/computerstoreks

# Test syntax
sudo nginx -t
```

**Step 2: Install Certbot**
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

**Step 3: Obtain SSL Certificates**
```bash
# Request certificate for all domains
sudo certbot certonly --nginx \
  -d computerstoreks.com \
  -d www.computerstoreks.com \
  -d thecomputerstoreks.com \
  -d www.thecomputerstoreks.com \
  --email contact@computerstoreks.com \
  --agree-tos \
  --non-interactive \
  --preferred-challenges http

# If domains already have certificates:
sudo certbot renew --force-renewal

# Verify certificates
sudo certbot certificates
```

**Step 4: Enable HTTPS in Nginx**
```bash
# Reload Nginx with new HTTPS config
sudo systemctl reload nginx

# Verify
sudo systemctl status nginx
```

**Step 5: Set Up Auto-Renewal**
```bash
# Enable certbot timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify timer is running
sudo systemctl status certbot.timer

# Test renewal process (dry run)
sudo certbot renew --dry-run

# Check renewal logs
sudo tail -20 /var/log/letsencrypt/letsencrypt.log
```

#### Verification

```bash
# Test HTTPS connection
curl -I https://computerstoreks.com
# Should return HTTP/2 200 or HTTP/1.1 200

# Verify certificate
openssl s_client -connect computerstoreks.com:443 -showcerts << /dev/null | \
  openssl x509 -noout -dates -subject
# Should show:
# notBefore=... notAfter=...
# subject=CN = computerstoreks.com

# Verify HTTP redirects to HTTPS
curl -I http://computerstoreks.com
# Should return HTTP/1.1 301 Moved Permanently
# Location: https://computerstoreks.com

# Check HSTS header
curl -I https://computerstoreks.com | grep -i "strict-transport"
# Should show: Strict-Transport-Security: max-age=31536000...

# Test with SecurityHeaders.com
# Visit: https://securityheaders.com/?q=computerstoreks.com
```

---

### Fix 2: API Security Headers

**Current State:** Missing CSP, HSTS, Permissions-Policy
**Target:** All security headers configured
**Time:** 1 hour

#### Implementation

**Update gallery-api.js:**

```javascript
// After app.use(helmet()) middleware

// Additional security headers
app.use((req, res, next) => {
  // Prevent caching of sensitive responses
  if (req.path.includes('/auth/') || req.path.includes('/upload')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  } else {
    // Allow caching of other responses
    res.set({
      'Cache-Control': 'private, must-revalidate, max-age=3600'
    });
  }

  // Additional security headers not covered by helmet
  res.set({
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  });

  next();
});

// Verify headers are applied
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Security headers applied`);
  next();
});
```

#### Verification

```bash
# Check response headers
curl -I https://computerstoreks.com/api/health

# Should show:
# Strict-Transport-Security: max-age=31536000...
# Content-Security-Policy: default-src 'self'...
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
```

---

### Fix 3: Rate Limiting Enhancement

**Current State:** Permissive general rate limiting (60/min)
**Target:** Strict limits with multiple zones
**Time:** 2-4 hours

#### Implementation

**Update gallery-api.js:**

```javascript
// Tighten rate limiting configuration

// Strict general rate limiting
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down' },
  skip: (req) => {
    // Don't count health checks
    return req.method === 'GET' && req.path === '/api/health';
  },
  keyGenerator: (req) => {
    // Rate limit by IP address
    return req.ip || req.connection.remoteAddress;
  }
});

// Strict login rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  skipFailedRequests: false,
  skipSuccessfulRequests: false
});

// Image upload limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Image upload limit exceeded (10 per hour)' },
  standardHeaders: true
});

// Contact form limiting
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many contact submissions, please try again later' },
  standardHeaders: true
});

// Apply limiters
app.use(generalLimiter);

// Apply upload limiter to image endpoint
app.post('/api/gallery/upload-image',
  authenticate,
  uploadLimiter,  // Add upload limiter
  upload.single('image'),
  async (req, res) => {
    // ... existing code ...
  }
);
```

**Update Nginx for additional rate limiting:**

```nginx
# In /etc/nginx/sites-available/computerstoreks

# Define rate limiting zones
limit_req_zone $binary_remote_addr zone=api_login:10m rate=3r/m;
limit_req_zone $binary_remote_addr zone=api_upload:10m rate=10r/h;
limit_req_zone $binary_remote_addr zone=contact_form:10m rate=3r/h;

# In server block, add location directives:

location /api/auth/login {
    limit_req zone=api_login burst=2 nodelay;
    limit_req_status 429;

    proxy_pass http://127.0.0.1:3001;
    # ... other proxy headers ...
}

location /api/gallery/upload-image {
    limit_req zone=api_upload burst=2 nodelay;
    limit_req_status 429;

    proxy_pass http://127.0.0.1:3001;
    # ... other proxy headers ...
}

location /api/contact {
    limit_req zone=contact_form burst=1 nodelay;
    limit_req_status 429;

    proxy_pass http://127.0.0.1:3001;
    # ... other proxy headers ...
}
```

#### Verification

```bash
# Test login rate limiting (should fail after 3 attempts)
for i in {1..5}; do
  echo "Attempt $i:"
  curl -X POST https://computerstoreks.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"password":"wrong"}' \
    -s | jq '.error' || echo "Rate limited"
  sleep 1
done

# Test that Retry-After header is present
curl -i https://computerstoreks.com/api/contact \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}' | grep -i "retry-after"
```

---

### Fix 4: CORS Security Update

**Current State:** Allows HTTP origins, allows no-origin requests
**Target:** HTTPS-only, validated origins only
**Time:** 1-2 hours

#### Implementation

**Update gallery-api.js:**

```javascript
// Updated CORS configuration

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? [
      'https://computerstoreks.com',
      'https://www.computerstoreks.com',
      'https://thecomputerstoreks.com',
      'https://www.thecomputerstoreks.com'
    ]
  : [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:5173'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Reject requests with no origin in production
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Origin required'));
      }
      return callback(null, true);
    }

    // Validate origin
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS rejected: ${origin}`);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
  optionsSuccessStatus: 200
}));
```

**Update .env:**

```bash
# In api/.env
NODE_ENV=production
```

**Update ecosystem.config.js:**

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3001
}
```

#### Verification

```bash
# Test allowed origin (should work)
curl -H "Origin: https://computerstoreks.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS https://computerstoreks.com/api/auth/login -v

# Should see: Access-Control-Allow-Origin: https://computerstoreks.com

# Test disallowed origin (should fail)
curl -H "Origin: https://evil.com" \
  -X OPTIONS https://computerstoreks.com/api/auth/login -v

# Should NOT have Access-Control-Allow-Origin header
```

---

## High Priority Fixes

### Fix 5: Email Configuration Validation

**Location:** `api/gallery-api.js` lines 446-450
**Time:** 1 hour

#### Implementation

```javascript
// In gallery-api.js, after environment variable loading

// Validate email configuration
function validateEmailConfig() {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || null,
    pass: process.env.EMAIL_PASS || null,
    notificationEmail: process.env.NOTIFICATION_EMAIL || 'contact@computerstoreks.com'
  };

  // Validate port
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    console.warn('Invalid EMAIL_PORT, using default 587');
    config.port = 587;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (config.user && !emailRegex.test(config.user)) {
    console.error('ERROR: EMAIL_USER is not a valid email address');
    process.exit(1);
  }

  if (!emailRegex.test(config.notificationEmail)) {
    console.error('ERROR: NOTIFICATION_EMAIL is not a valid email address');
    process.exit(1);
  }

  // Warn if incomplete
  if (!config.user || !config.pass) {
    console.warn('WARNING: Email configuration incomplete. Contact form will not send emails.');
  }

  return config;
}

const emailConfig = validateEmailConfig();

// Use emailConfig throughout app
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, message, website } = req.body;

    // Honeypot check
    if (website) {
      return res.json({
        success: true,
        message: 'Thank you for your message!'
      });
    }

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Name, email, and message are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email address'
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim().substring(0, 100),
      email: email.trim().toLowerCase().substring(0, 254),
      phone: phone ? phone.trim().substring(0, 20) : '',
      message: message.trim().substring(0, 5000)
    };

    // If email not configured
    if (!emailConfig.user || !emailConfig.pass) {
      console.log('Contact form submission (email not configured):', sanitizedData);
      return res.json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });
    }

    // Create transporter with validated config
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.port === 465,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
      }
    });

    // Send emails
    await Promise.all([
      // Notification to business
      transporter.sendMail({
        from: `"Computer Store Kansas" <${emailConfig.user}>`,
        to: emailConfig.notificationEmail,
        replyTo: sanitizedData.email,
        subject: `New Contact: ${sanitizedData.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizedData.name}</p>
          <p><strong>Email:</strong> ${sanitizedData.email}</p>
          <p><strong>Phone:</strong> ${sanitizedData.phone || 'Not provided'}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${sanitizedData.message.replace(/\n/g, '<br>')}</p>
        `
      }),

      // Confirmation to user
      transporter.sendMail({
        from: `"Computer Store Kansas" <${emailConfig.user}>`,
        to: sanitizedData.email,
        subject: 'We received your message - Computer Store Kansas',
        html: `
          <h2>Thank you for contacting us!</h2>
          <p>Dear ${sanitizedData.name},</p>
          <p>We have received your message and will get back to you within 24 hours.</p>
          <p>For immediate assistance, call (785) 267-3223.</p>
        `
      })
    ]);

    res.json({
      success: true,
      message: 'Thank you for your message! We will get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).json({
      error: 'Failed to send message. Please try again or call (785) 267-3223.'
    });
  }
});
```

---

## Medium Priority Fixes

### Fix 6: PM2 Logging Configuration

**Time:** 2 hours

#### Implementation

**Update ecosystem.config.js:**

```javascript
module.exports = {
  apps: [{
    name: 'computerstoreks-api',
    cwd: '/home/matthew/Computer Store V2/Computer_Store_KS/api',
    script: 'gallery-api.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',

    // Log configuration
    out_file: '/var/log/pm2/computerstoreks-api-out.log',
    error_file: '/var/log/pm2/computerstoreks-api-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },

    // Process management
    kill_timeout: 5000,
    listen_timeout: 3000,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,

    // Disable console for production
    node_args: '--no-warnings'
  }]
};
```

**Create log directory:**

```bash
sudo mkdir -p /var/log/pm2
sudo chown matthew:matthew /var/log/pm2
sudo chmod 755 /var/log/pm2
```

**Apply new configuration:**

```bash
cd "/home/matthew/Computer Store V2/Computer_Store_KS"
pm2 stop computerstoreks-api
pm2 delete computerstoreks-api
pm2 start ecosystem.config.js
pm2 save
```

**Set up log rotation:**

```bash
sudo tee /etc/logrotate.d/pm2-computerstoreks > /dev/null <<'EOF'
/var/log/pm2/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 matthew matthew
    sharedscripts
    postrotate
        pm2 restart computerstoreks-api > /dev/null 2>&1 || true
    endscript
}
EOF

sudo logrotate -d /etc/logrotate.d/pm2-computerstoreks
```

---

### Fix 7: Create api/.gitignore

**Time:** 15 minutes

```bash
cat > "/home/matthew/Computer Store V2/Computer_Store_KS/api/.gitignore" << 'EOF'
# Dependencies
node_modules/
npm-debug.log
npm-error.log

# Environment
.env
.env.local

# Build
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF

# Verify
git status api/
# Should show .gitignore as new file
```

---

### Fix 8: Security Monitoring Setup

**Time:** 4-6 hours

#### Implement Event Logging

```javascript
// Add to gallery-api.js

const fs = require('fs').promises;
const path = require('path');

class SecurityEventLogger {
  constructor() {
    this.logDir = path.join(__dirname, '..', '.logs');
  }

  async ensureLogDir() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      // Set restrictive permissions on log directory
      fs.chmod(this.logDir, 0o700);
    } catch (error) {
      console.error('Failed to create log directory:', error.message);
    }
  }

  async log(eventType, details = {}) {
    try {
      await this.ensureLogDir();

      const event = {
        timestamp: new Date().toISOString(),
        eventType,
        ...details
      };

      const dateStr = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `security-${dateStr}.log`);

      await fs.appendFile(
        logFile,
        JSON.stringify(event) + '\n'
      );

      // Set restrictive permissions
      fs.chmod(logFile, 0o600);
    } catch (error) {
      console.error('Failed to log security event:', error.message);
    }
  }
}

const securityLogger = new SecurityEventLogger();

// Log failed login attempts
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    await securityLogger.log('INVALID_LOGIN', {
      reason: 'Missing password',
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    return res.status(400).json({
      success: false,
      error: 'Password is required'
    });
  }

  if (secureCompare(password, ADMIN_PASSWORD)) {
    await securityLogger.log('SUCCESSFUL_LOGIN', {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    res.json({
      success: true,
      message: 'Authentication successful'
    });
  } else {
    await securityLogger.log('FAILED_LOGIN', {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    res.status(401).json({
      success: false,
      error: 'Invalid password'
    });
  }
});

// Log file operations
app.post('/api/gallery/upload-image', authenticate, uploadLimiter, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { type } = req.body;

    if (!type || !['desktop', 'laptop'].includes(type)) {
      return res.status(400).json({ error: 'Invalid computer type' });
    }

    // ... existing validation ...

    await securityLogger.log('IMAGE_UPLOAD', {
      type,
      filename: filename,
      filesize: req.file.size,
      ip: req.ip
    });

    // ... rest of upload logic ...
  } catch (error) {
    await securityLogger.log('IMAGE_UPLOAD_ERROR', {
      error: error.message,
      ip: req.ip
    });
    // ... error handling ...
  }
});

app.delete('/api/gallery/image/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const safeFilename = sanitizeFilename(filename);

    if (!safeFilename) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // ... validation ...

    await securityLogger.log('IMAGE_DELETE', {
      filename: safeFilename,
      ip: req.ip
    });

    // ... delete logic ...
  } catch (error) {
    await securityLogger.log('IMAGE_DELETE_ERROR', {
      error: error.message,
      ip: req.ip
    });
    // ... error handling ...
  }
});
```

---

## Testing & Validation

### Comprehensive Test Suite

```bash
#!/bin/bash
# run-security-tests.sh

echo "=== Security Testing ==="

# 1. HTTPS/TLS Tests
echo ""
echo "[1] HTTPS/TLS Tests"
echo "- Certificate validity:"
openssl s_client -connect computerstoreks.com:443 -showcerts 2>&1 << /dev/null | grep -A2 "subject="

echo "- HTTP redirect:"
curl -I http://computerstoreks.com | grep -i "location"

echo "- HSTS header:"
curl -I https://computerstoreks.com | grep -i "strict-transport"

# 2. Security Headers
echo ""
echo "[2] Security Headers"
curl -I https://computerstoreks.com | grep -i "x-frame\|x-content\|csp\|permissions"

# 3. Rate Limiting
echo ""
echo "[3] Rate Limiting Tests"
echo "- Login rate limiting:"
for i in {1..5}; do
  curl -X POST https://computerstoreks.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"password":"test"}' \
    -s | jq '.error' 2>/dev/null
done

# 4. CORS
echo ""
echo "[4] CORS Tests"
echo "- Allowed origin:"
curl -H "Origin: https://computerstoreks.com" -X OPTIONS https://computerstoreks.com/api/auth/login -s | grep -i "access-control"

echo "- Disallowed origin:"
curl -H "Origin: https://evil.com" -X OPTIONS https://computerstoreks.com/api/auth/login -s | grep -i "access-control"

# 5. File Permissions
echo ""
echo "[5] File Permissions"
ls -la "/home/matthew/Computer Store V2/Computer_Store_KS/api/.env"

# 6. Environment Validation
echo ""
echo "[6] Environment Variables"
cd "/home/matthew/Computer Store V2/Computer_Store_KS"
node -e "
  require('dotenv').config({ path: 'api/.env' });
  const missing = [];
  const required = ['ADMIN_PASSWORD', 'PORT'];
  required.forEach(v => {
    if (!process.env[v]) missing.push(v);
  });
  if (missing.length) {
    console.log('ERROR: Missing env vars:', missing.join(', '));
  } else {
    console.log('✓ All required env vars present');
  }
"

echo ""
echo "=== Testing Complete ==="
```

---

## Ongoing Maintenance

### Monthly Tasks

```bash
#!/bin/bash
# monthly-security-maintenance.sh

echo "=== Monthly Security Maintenance ==="
DATE=$(date +%Y-%m-%d)

# 1. Dependency updates
echo "[1] Checking for dependency updates..."
npm outdated

# 2. Audit check
echo ""
echo "[2] Running npm audit..."
npm audit --production

# 3. Certificate expiry
echo ""
echo "[3] Checking certificate expiry..."
sudo certbot certificates

# 4. Log review
echo ""
echo "[4] Checking security logs..."
tail -100 "/home/matthew/Computer Store V2/Computer_Store_KS/.logs"/* 2>/dev/null | grep -E "FAILED_LOGIN|ERROR"

# 5. Disk space
echo ""
echo "[5] Checking disk space..."
df -h /var/log

# 6. Create backup
echo ""
echo "[6] Creating backup..."
git tag "backup-${DATE}"

echo ""
echo "=== Maintenance Complete ==="
```

---

## Emergency Procedures

### If Credentials Are Compromised

```bash
# 1. Immediately revoke all credentials
# - Change ADMIN_PASSWORD
# - Rotate email app password
# - Rotate GitHub token

# 2. Review logs
tail -1000 "/home/matthew/Computer Store V2/Computer_Store_KS/.logs"/* | grep -E "FAILED_LOGIN|SUCCESSFUL"

# 3. Restart services
pm2 restart computerstoreks-api

# 4. Notify users if necessary
# - Email notification
# - Website banner
```

### If SSL Certificate Fails

```bash
# 1. Check certificate status
sudo certbot certificates

# 2. Attempt manual renewal
sudo certbot renew --force-renewal

# 3. Check DNS
nslookup computerstoreks.com

# 4. Temporarily disable SSL (emergency only)
# Revert nginx to HTTP-only config
# Restart nginx

# 5. Debug certbot
sudo certbot renew -vvv
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

