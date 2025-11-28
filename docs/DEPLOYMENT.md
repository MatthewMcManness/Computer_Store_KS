# Deployment Guide

This guide covers deploying Computer Store KS to production.

## Deployment Options

1. **Docker** (Recommended) - Containerized deployment
2. **Manual** - Direct deployment with PM2
3. **Platform** - Vercel, Render, etc.

## Prerequisites

- Server with Node.js 20+ or Docker
- Domain name with SSL certificate
- GitHub token for gallery integration
- Resend API key for email

## Environment Variables

All deployments require these environment variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# GitHub Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo
GITHUB_BRANCH=main

# Authentication
ADMIN_PASSWORD=your-secure-password
NEXTAUTH_SECRET=generated-32-byte-secret
NEXTAUTH_URL=https://yourdomain.com

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
NOTIFICATION_EMAIL=contact@yourdomain.com
```

## Docker Deployment

### Build and Run

```bash
# Build the image
docker build -t computer-store-ks .

# Run the container
docker run -d \
  --name computer-store-ks \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GITHUB_TOKEN=your-token \
  -e GITHUB_OWNER=your-username \
  -e GITHUB_REPO=your-repo \
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
| 3000 | Next.js application |
| 3001 | Legacy API (if using) |

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
git clone https://github.com/your-username/Computer_Store_KS.git
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
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

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
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

## Platform Deployment

### Vercel

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Build command: `bun install && bun run build`
4. Start command: `bun run start`
5. Add environment variables

## Health Checks

The application provides a health endpoint:

```bash
# Check application health
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Updating

### Docker

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Manual/PM2

```bash
# Pull latest code
git pull

# Install any new dependencies
bun install

# Rebuild
bun run build

# Restart
pm2 restart all
```

## Troubleshooting

### Application Won't Start

1. Check environment variables are set
2. Verify Node.js version (`node --version`)
3. Check logs: `pm2 logs` or `docker compose logs`

### Images Not Loading

1. Verify `GITHUB_TOKEN` has `repo` scope
2. Check `GITHUB_OWNER` and `GITHUB_REPO` are correct
3. Ensure branch exists

### Email Not Working

1. Verify `RESEND_API_KEY` is valid
2. Check Resend dashboard for errors
3. Verify sending domain is configured

### SSL Issues

1. Check certificate expiration: `sudo certbot certificates`
2. Renew if needed: `sudo certbot renew`
3. Verify Nginx configuration: `sudo nginx -t`
