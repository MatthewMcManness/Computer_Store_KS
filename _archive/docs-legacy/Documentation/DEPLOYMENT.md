# Deployment Guide

This guide covers deploying Computer Store KS Version 3.0 to a production server using Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Server Requirements](#server-requirements)
- [Docker Deployment](#docker-deployment)
- [Nginx Configuration](#nginx-configuration)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Environment Variables](#environment-variables)
- [Updating the Site](#updating-the-site)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- A server with root or sudo access
- Docker and Docker Compose installed
- Domain name pointing to server IP (computerstoreks.com)
- GitHub Personal Access Token with `repo` scope
- SSL certificate (Let's Encrypt recommended)

### Install Docker (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

## Server Requirements

### Minimum Specifications
- **CPU:** 1 vCPU
- **RAM:** 1 GB
- **Storage:** 10 GB SSD
- **OS:** Ubuntu 22.04 LTS or Debian 11+

### Recommended Specifications
- **CPU:** 2 vCPU
- **RAM:** 2 GB
- **Storage:** 20 GB SSD
- **OS:** Ubuntu 22.04 LTS

### Required Ports
- **80** - HTTP (redirects to HTTPS)
- **443** - HTTPS
- **3000** - Next.js application (internal)
- **3001** - Gallery API (internal)

## Docker Deployment

### Step 1: Clone Repository

```bash
# Create app directory
sudo mkdir -p /opt/computer-store-ks
cd /opt/computer-store-ks

# Clone repository
git clone https://github.com/MatthewMcManness/Computer_Store_KS.git .

# Checkout version-3.0 branch
git checkout version-3.0
```

### Step 2: Configure Environment

```bash
# Create environment file
nano .env
```

Add the following content:

```env
# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=MatthewMcManness
GITHUB_REPO=Computer_Store_KS
GITHUB_BRANCH=Computer-Store-KS

# Admin Authentication
ADMIN_PASSWORD=your_secure_password_here

# Application
NEXT_PUBLIC_APP_URL=https://computerstoreks.com

# Email (Resend)
RESEND_API_KEY=re_your_key_here
CONTACT_EMAIL=contact@computerstoreks.com
```

### Step 3: Create Docker Network

```bash
# Create external network for Nginx reverse proxy
docker network create webnet
```

### Step 4: Build and Start Containers

```bash
# Build and start in detached mode
docker compose up -d --build

# Verify containers are running
docker compose ps

# Check logs
docker compose logs -f
```

### Step 5: Verify Deployment

```bash
# Test health endpoints
curl http://localhost:3000
curl http://localhost:3001/api/health
```

## Nginx Configuration

### Install Nginx

```bash
sudo apt install nginx -y
```

### Create Site Configuration

```bash
sudo nano /etc/nginx/sites-available/computerstoreks.com
```

Add the following configuration:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name computerstoreks.com www.computerstoreks.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS - Main Site
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name computerstoreks.com www.computerstoreks.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/computerstoreks.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/computerstoreks.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Logging
    access_log /var/log/nginx/computerstoreks.access.log;
    error_log /var/log/nginx/computerstoreks.error.log;

    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Static files with caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Image assets
    location /assets {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # API routes
    location /api {
        proxy_pass http://localhost:3001;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;

        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }

    # Admin pages (for gallery manager)
    location ~ ^/(admin-login|admin-gallery) {
        proxy_pass http://localhost:3000;
    }

    # Main application
    location / {
        proxy_pass http://localhost:3000;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
}
```

### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/computerstoreks.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## SSL Certificate Setup

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain Certificate

```bash
# Initial certificate (before Nginx SSL config)
sudo certbot certonly --standalone -d computerstoreks.com -d www.computerstoreks.com

# Or with Nginx already running
sudo certbot --nginx -d computerstoreks.com -d www.computerstoreks.com
```

### Auto-Renewal

Certbot sets up automatic renewal. Verify with:

```bash
# Test renewal
sudo certbot renew --dry-run

# Check timer
systemctl list-timers | grep certbot
```

### Manual Renewal

```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Environment Variables

### Production Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token with `repo` scope | Yes |
| `GITHUB_OWNER` | GitHub repository owner | Yes |
| `GITHUB_REPO` | GitHub repository name | Yes |
| `GITHUB_BRANCH` | Git branch for gallery updates | Yes |
| `ADMIN_PASSWORD` | Admin panel password | Yes |
| `NEXT_PUBLIC_APP_URL` | Public URL of the site | Yes |
| `RESEND_API_KEY` | Resend email API key | Yes |
| `CONTACT_EMAIL` | Email to receive contact form submissions | Yes |
| `NODE_ENV` | Environment (production) | Auto-set |
| `PORT` | API server port (3001) | Auto-set |

### Security Notes

- Never commit `.env` file to version control
- Use strong passwords (16+ characters)
- Rotate tokens periodically
- Restrict GITHUB_TOKEN to only required repositories

## Updating the Site

### Standard Update

```bash
cd /opt/computer-store-ks

# Pull latest changes
git pull origin version-3.0

# Rebuild and restart containers
docker compose down
docker compose up -d --build

# Verify deployment
docker compose ps
curl http://localhost:3001/api/health
```

### Zero-Downtime Update

```bash
cd /opt/computer-store-ks

# Pull changes
git pull origin version-3.0

# Build new image
docker compose build

# Rolling restart
docker compose up -d --no-deps --build computer-store-ks

# Verify
docker compose ps
```

### Update with Database Migrations (Future)

```bash
# Stop containers
docker compose down

# Pull changes
git pull origin version-3.0

# Run migrations (if any)
docker compose run --rm app bun run migrate

# Start containers
docker compose up -d --build
```

## Rollback Procedures

### Quick Rollback

```bash
cd /opt/computer-store-ks

# Find previous commit
git log --oneline -10

# Rollback to specific commit
git checkout <commit-hash>

# Rebuild
docker compose down
docker compose up -d --build
```

### Rollback to Previous Version

```bash
cd /opt/computer-store-ks

# Stash current changes if any
git stash

# Checkout previous tag or commit
git checkout v3.0.0  # or specific commit

# Rebuild
docker compose down
docker compose up -d --build
```

### Emergency Rollback (Using Docker Images)

If you've tagged your images:

```bash
# Stop current containers
docker compose down

# Update docker-compose.yml to use specific image tag
# Then start with old image
docker compose up -d
```

### Restore from Backup

Gallery backups are stored in `/opt/computer-store-ks/backups/`:

```bash
# List backups
ls -la backups/

# Copy backup to restore
cp backups/index_backup_YYYYMMDD_HHMMSS.html index.html

# Rebuild
docker compose down
docker compose up -d --build
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs computer-store-ks

# Common issues:
# - Port already in use
# - Missing environment variables
# - Build errors

# Check port usage
sudo lsof -i :3000
sudo lsof -i :3001

# Verify .env file exists
cat .env
```

### Nginx 502 Bad Gateway

```bash
# Check if containers are running
docker compose ps

# Check container logs
docker compose logs -f

# Verify network connectivity
docker network inspect webnet

# Restart containers
docker compose restart
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check certificate paths match Nginx config
ls -la /etc/letsencrypt/live/computerstoreks.com/
```

### Gallery API Not Responding

```bash
# Check API logs
docker compose logs computer-store-ks | grep -i api

# Test health endpoint
curl http://localhost:3001/api/health

# Check environment variables
docker compose exec computer-store-ks env | grep GITHUB
```

### Images Not Loading

```bash
# Check gallery directory permissions
docker compose exec computer-store-ks ls -la /app/assets/gallery

# Verify volume mounting
docker compose exec computer-store-ks cat /app/assets/gallery/desktop-1.jpg > /dev/null && echo "OK" || echo "FAIL"
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Limit memory in docker-compose.yml
# Add under service:
#   deploy:
#     resources:
#       limits:
#         memory: 1G

# Restart with limits
docker compose down
docker compose up -d
```

### Slow Response Times

```bash
# Check Nginx access logs
tail -f /var/log/nginx/computerstoreks.access.log

# Enable Nginx caching (see Nginx config above)

# Check for errors
tail -f /var/log/nginx/computerstoreks.error.log
```

### Database Connection Issues (Future)

If using a database:

```bash
# Test connection from container
docker compose exec computer-store-ks nc -zv db-host 5432

# Check database logs
docker compose logs db
```

## Monitoring

### Basic Health Checks

```bash
# Create monitoring script
cat > /opt/computer-store-ks/health-check.sh << 'EOF'
#!/bin/bash
curl -sf http://localhost:3000 > /dev/null || exit 1
curl -sf http://localhost:3001/api/health > /dev/null || exit 1
echo "OK: $(date)"
EOF

chmod +x /opt/computer-store-ks/health-check.sh
```

### Set Up Cron Job

```bash
# Add to crontab
crontab -e

# Check every 5 minutes
*/5 * * * * /opt/computer-store-ks/health-check.sh >> /var/log/computer-store-ks-health.log 2>&1
```

## Related Documentation

- [README.md](./README.md) - Project overview
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Local development setup
- [GALLERY_SYSTEM.md](./GALLERY_SYSTEM.md) - Gallery management

---

For additional support, check the Docker and Nginx documentation or review the application logs.
