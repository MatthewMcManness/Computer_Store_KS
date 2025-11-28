# Deployment Guide

This guide covers deploying Computer Store KS to production.

## Current Production Setup

The site uses a **hybrid deployment**:

| Component | Platform | URL |
|-----------|----------|-----|
| Static Frontend | CDN/Static Host | computerstoreks.com |
| Next.js API (Resend) | Render | computer-store-ks.onrender.com |

The static HTML frontend makes API calls to the Next.js backend on Render for contact form submissions.

## Deployment Options

1. **Render** (Current Production) - Next.js API backend
2. **Docker** - Self-hosted with static site + Express API
3. **Manual** - Direct deployment with PM2

## Prerequisites

- Server with Node.js 20+ or Docker
- Domain name with SSL certificate
- GitHub token for gallery integration
- Resend API key for email

## Environment Variables

### Render Deployment (Next.js)

Required for `render.yaml`:

```bash
# Application
NODE_ENV=production

# GitHub Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_OWNER=MatthewMcManness
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=Computer-Store-KS

# Authentication
ADMIN_PASSWORD=your-secure-password

# Email (Resend) - CRITICAL for contact form
RESEND_API_KEY=re_xxxxxxxxxxxxx
NOTIFICATION_EMAIL=contact@computerstoreks.com
```

### Docker Deployment (Express API)

Additional variables for `docker-compose.yml`:

```bash
# Same as above, plus:
PORT=3001
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Render Deployment

### Current Setup

The `render.yaml` in the project root deploys the Next.js application:

```yaml
services:
  - type: web
    name: computer-store-ks
    env: node
    buildCommand: npm install && npm run build && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
    startCommand: node .next/standalone/server.js
    envVars:
      - key: NODE_VERSION
        value: 20.11.0
      - key: NODE_ENV
        value: production
      - key: RESEND_API_KEY
        sync: false
      - key: ADMIN_PASSWORD
        sync: false
      - key: GITHUB_TOKEN
        sync: false
      - key: GITHUB_OWNER
        value: MatthewMcManness
      - key: GITHUB_REPO
        value: Computer_Store_KS
      - key: GITHUB_BRANCH
        value: Computer-Store-KS
```

### Setting Up Render

1. **Create Render Account** at https://render.com
2. **Connect GitHub Repository**
3. **Create Web Service** from the repository
4. **Configure Environment Variables** in Render dashboard
5. **Deploy** - Render auto-deploys on push

### Setting Up Resend (Email)

1. Create account at https://resend.com
2. Get API key from https://resend.com/api-keys
3. Add `RESEND_API_KEY` to Render environment variables
4. Verify your sending domain in Resend dashboard

**Required DNS Records for Email Delivery:**

When verifying your domain in Resend, you'll need to add DNS records. Important considerations:

- **SPF Record**: Add `include:_spf.resend.com` to your existing SPF TXT record
  - Example: `v=spf1 include:_spf.google.com include:_spf.resend.com ~all`
- **DKIM Record**: Add the DKIM TXT record Resend provides
- **MX Records**: Do NOT add Resend's MX record unless you want Resend to receive inbound emails. Adding it can override your existing email provider (e.g., Google Workspace) and cause delivery issues.

### Verifying Deployment

```bash
# Check API health
curl https://computer-store-ks.onrender.com/api/health

# Test contact form
curl -X POST https://computer-store-ks.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","subject":"General","message":"Test message from deployment verification"}'
```

## Docker Deployment

For self-hosted environments, use Docker to run the static site with Express API.

### Build and Run

```bash
# Build the image
docker build -t computer-store-ks .

# Run the container
docker run -d \
  --name computer-store-ks \
  -p 3000:3000 \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e GITHUB_TOKEN=your-token \
  -e GITHUB_OWNER=MatthewMcManness \
  -e GITHUB_REPO=Computer_Store_KS \
  -e ADMIN_PASSWORD=your-password \
  computer-store-ks
```

### Using Docker Compose

```bash
# Create .env file with variables
cp .env.example .env
# Edit .env with production values

# Create network if it doesn't exist
docker network create webnet

# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Container Ports

| Port | Service |
|------|---------|
| 3000 | Static HTML site (via `serve`) |
| 3001 | Express API (gallery + contact) |

### Docker Architecture

```
┌─────────────────────────────────────┐
│           Docker Container          │
│                                     │
│  ┌─────────────┐  ┌──────────────┐  │
│  │   serve     │  │  Express API │  │
│  │  :3000      │  │    :3001     │  │
│  │             │  │              │  │
│  │ index.html  │  │ gallery-api  │  │
│  │ style.css   │  │   .js        │  │
│  │ script.js   │  │              │  │
│  └─────────────┘  └──────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Manual Deployment with PM2

### Server Setup

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Bun (optional but recommended)
curl -fsSL https://bun.sh/install | bash
```

### Application Setup

```bash
# Clone repository
git clone https://github.com/MatthewMcManness/Computer_Store_KS.git
cd Computer_Store_KS

# Install dependencies
bun install

# Build application
bun run build

# Start with PM2
pm2 start npm --name "computer-store-ks" -- start

# Save PM2 process list
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### PM2 Commands

```bash
pm2 status              # Check status
pm2 logs                # View logs
pm2 restart all         # Restart
pm2 stop all            # Stop
pm2 delete all          # Remove processes
```

## Nginx Reverse Proxy

### Basic Configuration

```nginx
server {
    listen 80;
    server_name computerstoreks.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name computerstoreks.com;

    ssl_certificate /etc/letsencrypt/live/computerstoreks.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/computerstoreks.com/privkey.pem;

    # Static files
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d computerstoreks.com

# Auto-renewal is configured automatically
```

## Static Site Hosting

The static HTML site can be hosted on any static file host:

- **GitHub Pages**
- **Netlify**
- **Cloudflare Pages**
- **Vercel** (static export)
- **AWS S3 + CloudFront**

### Important: Configure API URL

When hosting the static site separately, update `config.js`:

```javascript
api: {
  contact_endpoint: "https://computer-store-ks.onrender.com/api/contact",
  health_endpoint: "https://computer-store-ks.onrender.com/api/health"
}
```

## Health Checks

```bash
# Check Next.js API health
curl https://computer-store-ks.onrender.com/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Updating

### Render (Auto-deploy)

Push to `Computer-Store-KS` branch - Render auto-deploys.

### Docker

```bash
git pull
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Manual/PM2

```bash
git pull
bun install
bun run build
pm2 restart all
```

## Troubleshooting

### Contact Form Not Working

1. Check `RESEND_API_KEY` is set in Render environment
2. Verify API is responding: `curl https://computer-store-ks.onrender.com/api/health`
3. Check `config.js` points to correct API URL
4. Check browser console for CORS errors

### Images Not Loading

1. Verify `GITHUB_TOKEN` has `repo` scope
2. Check `GITHUB_OWNER` and `GITHUB_REPO` are correct
3. Ensure branch `Computer-Store-KS` exists

### Email Not Sending

1. Verify `RESEND_API_KEY` is valid
2. Check Resend dashboard at https://resend.com/emails for errors
3. Verify sending domain is configured in Resend
4. Check SPF record includes `include:_spf.resend.com`
5. Verify MX records point to your email provider (not Resend's inbound server)
6. Check spam/junk folder of recipient email

### Render Service Down

1. Check Render dashboard for deployment errors
2. View service logs
3. Verify all environment variables are set
4. Check build command succeeded

### SSL Issues

1. Check certificate expiration: `sudo certbot certificates`
2. Renew if needed: `sudo certbot renew`
3. Verify Nginx configuration: `sudo nginx -t`
