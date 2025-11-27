# Computer Store Kansas - Self-Hosting Guide

This guide will help you deploy the Computer Store website on your local computer for testing and development.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Configuration](#configuration)
5. [Running the Site](#running-the-site)
6. [Gallery Manager Setup](#gallery-manager-setup)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## System Requirements

### Minimum Requirements

- **Operating System**: Linux, macOS, or Windows
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 500MB for the application

### Check Your Installation

```bash
# Check Node.js version
node --version
# Should show v18.x.x or higher

# Check npm version
npm --version
# Should show 8.x.x or higher
```

### Installing Node.js (if not installed)

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS (using Homebrew):**
```bash
brew install node
```

**Windows:**
Download from https://nodejs.org/ and run the installer.

---

## Quick Start

```bash
# 1. Navigate to the project directory
cd "/home/matthew/Computer Store V2/Computer_Store_KS"

# 2. Install API dependencies
cd api
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your settings (see Configuration section)

# 4. Start the API server
npm start

# 5. Open another terminal and serve the website
cd "/home/matthew/Computer Store V2/Computer_Store_KS"
npx serve -p 8080

# 6. Access the site
# Website: http://localhost:8080
# Admin: http://localhost:8080/admin-login.html
```

---

## Detailed Setup

### Step 1: Project Structure

```
Computer_Store_KS/
├── index.html          # Main website
├── style.css           # Styles
├── script.js           # Frontend JavaScript
├── admin-login.html    # Admin authentication
├── admin-gallery.html  # Gallery management
├── add-computer.html   # Add new computer
├── edit-computer.html  # Edit computer
├── assets/
│   └── gallery/        # Computer images
├── api/
│   ├── gallery-api.js  # Backend API
│   ├── package.json    # API dependencies
│   └── .env            # Environment config
└── Documentation/      # Guides
```

### Step 2: Install Dependencies

```bash
# Navigate to API directory
cd "/home/matthew/Computer Store V2/Computer_Store_KS/api"

# Install all dependencies
npm install
```

This installs:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting protection
- `@octokit/rest` - GitHub API client
- `multer` - File upload handling
- `sharp` - Image optimization
- `dotenv` - Environment variables

### Step 3: Create Environment File

Create a `.env` file in the `api` directory:

```bash
cd "/home/matthew/Computer Store V2/Computer_Store_KS/api"
touch .env
```

---

## Configuration

### Required Environment Variables

Edit `api/.env` with the following:

```env
# ===========================================
# REQUIRED: Admin Authentication
# ===========================================
# Set a strong password (minimum 8 characters)
ADMIN_PASSWORD=YourSecurePassword123!

# ===========================================
# OPTIONAL: GitHub Integration
# ===========================================
# Only needed if you want to publish changes to GitHub
# Create token at: https://github.com/settings/tokens
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_OWNER=YourGitHubUsername
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=main

# ===========================================
# Server Configuration
# ===========================================
PORT=3001

# ===========================================
# CORS Configuration
# ===========================================
# Add your production URL here
SITE_URL=http://localhost:8080
```

### Password Requirements

Your `ADMIN_PASSWORD` must:
- Be at least 8 characters
- Include uppercase and lowercase letters
- Include numbers
- Include special characters (recommended)

**Good example**: `MyStore2024!Secure`
**Bad example**: `admin123`

---

## Running the Site

### Method 1: Using npx serve (Recommended for Testing)

```bash
# Terminal 1: Start the API
cd "/home/matthew/Computer Store V2/Computer_Store_KS/api"
npm start

# Terminal 2: Serve the website
cd "/home/matthew/Computer Store V2/Computer_Store_KS"
npx serve -p 8080
```

### Method 2: Using Python (Alternative)

```bash
# Terminal 1: Start the API
cd "/home/matthew/Computer Store V2/Computer_Store_KS/api"
npm start

# Terminal 2: Python 3
cd "/home/matthew/Computer Store V2/Computer_Store_KS"
python3 -m http.server 8080

# Or Python 2
python -m SimpleHTTPServer 8080
```

### Method 3: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Open the project folder
3. Right-click on `index.html` → "Open with Live Server"

### Access Points

Once running:
- **Main Website**: http://localhost:8080
- **Admin Login**: http://localhost:8080/admin-login.html
- **Gallery Manager**: http://localhost:8080/admin-gallery.html
- **API Health Check**: http://localhost:3001/api/health

---

## Gallery Manager Setup

### First-Time Login

1. Navigate to http://localhost:8080/admin-login.html
2. Enter the password you set in `ADMIN_PASSWORD`
3. Click "Login"

### Using the Gallery Manager

**Adding a Computer:**
1. Click "Add Computer" button
2. Fill in the details (name, type, category, price)
3. Upload an image
4. Enter specifications
5. Click "Save Computer"

**Editing a Computer:**
1. Click on a computer card to select it
2. Click "Edit Selected"
3. Make your changes
4. Click "Save Changes"

**Publishing Changes:**
1. Make your edits
2. Click "Publish to GitHub" (requires GitHub token)
3. Changes will be committed to your repository

### Image Guidelines

- Format: JPEG or PNG
- Maximum size: 5MB
- Recommended dimensions: 1200×900 pixels
- Images are automatically optimized on upload

---

## Security Considerations

### API Security Features

The API includes these security measures:

1. **Rate Limiting**
   - Login: 5 attempts per 15 minutes
   - General: 60 requests per minute

2. **Helmet Security Headers**
   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - XSS Protection

3. **CORS Restrictions**
   - Only allows configured origins

4. **Timing-Safe Password Comparison**
   - Prevents timing attacks

5. **File Upload Validation**
   - MIME type checking
   - Magic byte verification
   - Size limits

### Best Practices

1. **Change the default password** before deploying
2. **Use HTTPS** in production
3. **Keep dependencies updated**: `npm audit fix`
4. **Regularly rotate** your GitHub token
5. **Monitor access logs** for suspicious activity

### Firewall Configuration

For local network access only:

```bash
# Allow only local connections (Linux/iptables)
sudo iptables -A INPUT -p tcp --dport 3001 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3001 -j DROP
```

---

## Troubleshooting

### Common Issues

**Issue: "ADMIN_PASSWORD must be set"**
```
Solution: Create api/.env file with ADMIN_PASSWORD set
```

**Issue: CORS errors in browser console**
```
Solution: Ensure SITE_URL in .env matches your frontend URL
```

**Issue: "Cannot find module" errors**
```bash
Solution:
cd api
rm -rf node_modules
npm install
```

**Issue: Port already in use**
```bash
# Find what's using the port
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3002 npm start
```

**Issue: Images not loading**
```
Solution: Check that assets/gallery directory exists and has proper permissions
```

**Issue: Login not working**
```
Solution:
1. Clear browser sessionStorage
2. Check that API is running (visit http://localhost:3001/api/health)
3. Verify password matches .env file exactly
```

### Checking Logs

```bash
# API logs appear in the terminal where you started it
# Look for error messages starting with ERROR or ❌

# For more verbose logging, set:
DEBUG=* npm start
```

---

## Production Deployment

### Option 1: Render (Recommended for API)

1. Push your code to GitHub
2. Create account at https://render.com
3. Create new "Web Service"
4. Connect your GitHub repository
5. Set environment variables in Render dashboard
6. Deploy

### Option 2: DigitalOcean Droplet

```bash
# On your server
git clone your-repo
cd Computer_Store_KS/api
npm install --production

# Install PM2 for process management
npm install -g pm2
pm2 start gallery-api.js
pm2 startup
pm2 save
```

### Option 3: Docker

Create `Dockerfile` in the api directory:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "gallery-api.js"]
```

Build and run:

```bash
docker build -t computer-store-api .
docker run -p 3001:3001 --env-file .env computer-store-api
```

### Nginx Configuration (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve static files
    location / {
        root /var/www/computer-store;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/HTTPS (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Systemd Service (Linux)

Create `/etc/systemd/system/computer-store-api.service`:

```ini
[Unit]
Description=Computer Store Gallery API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/computer-store/api
ExecStart=/usr/bin/node gallery-api.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable computer-store-api
sudo systemctl start computer-store-api
sudo systemctl status computer-store-api
```

---

## Maintenance

### Updating Dependencies

```bash
cd api
npm update
npm audit fix
```

### Backing Up Data

```bash
# Backup the entire project
tar -czvf computer-store-backup-$(date +%Y%m%d).tar.gz \
    "/home/matthew/Computer Store V2/Computer_Store_KS"
```

### Monitoring

Check API status:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the API logs for errors
3. Ensure all environment variables are correctly set

**Contact**: Computer Store Kansas
**Phone**: (785) 267-3223
**Location**: Topeka, KS
