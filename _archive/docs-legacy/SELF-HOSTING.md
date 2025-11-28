# Self-Hosting Guide for Computer Store KS V2

This guide covers deploying the Computer Store KS website on your own server.

## Requirements

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- Nginx (for reverse proxy)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt - free)

## Quick Start (Development/Testing)

```bash
# 1. Clone or copy the project to your server
cd /path/to/Computer_Store_KS

# 2. Install API dependencies
cd api
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your settings:
# - PORT=3001
# - ADMIN_PASSWORD=YourSecurePassword123!
# - SITE_URL=http://your-domain.com

# 4. Start the API
npm start

# 5. In another terminal, serve the static files
cd /path/to/Computer_Store_KS
npx serve -p 8080
```

## Production Setup

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Setup Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/computerstoreks
sudo chown $USER:$USER /var/www/computerstoreks

# Copy files to server
cp -r /path/to/Computer_Store_KS/* /var/www/computerstoreks/

# Install API dependencies
cd /var/www/computerstoreks/api
npm install --production
```

### 3. Configure Environment

```bash
# Create production .env file
cat > /var/www/computerstoreks/api/.env << 'EOF'
PORT=3001
ADMIN_PASSWORD=YourSecurePasswordHere!
SITE_URL=https://your-domain.com
NODE_ENV=production
EOF

# Secure the file
chmod 600 /var/www/computerstoreks/api/.env
```

### 4. Setup PM2 Process Manager

```bash
# Create PM2 ecosystem file
cat > /var/www/computerstoreks/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'computerstoreks-api',
    cwd: '/var/www/computerstoreks/api',
    script: 'gallery-api.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start the API with PM2
cd /var/www/computerstoreks
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command
```

### 5. Configure Nginx

```bash
# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/computerstoreks << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Static files
    root /var/www/computerstoreks;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # File upload size limit
        client_max_body_size 10M;
    }

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2|woff|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Handle SPA routing (if needed)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/computerstoreks /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

### 7. Configure Firewall

```bash
# Setup UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Updating the Site

```bash
# Pull latest changes or copy new files
cd /var/www/computerstoreks

# Restart API if changed
pm2 restart computerstoreks-api

# Nginx automatically serves updated static files
```

## Monitoring

```bash
# View API logs
pm2 logs computerstoreks-api

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check API status
pm2 status
```

## Backup

```bash
# Backup gallery data
cp -r /var/www/computerstoreks/api/data /backup/location/

# Backup uploaded images
cp -r /var/www/computerstoreks/images /backup/location/
```

## Troubleshooting

### API not responding
```bash
pm2 restart computerstoreks-api
pm2 logs computerstoreks-api --lines 50
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Permission issues
```bash
sudo chown -R www-data:www-data /var/www/computerstoreks
sudo chmod -R 755 /var/www/computerstoreks
```

## Security Checklist

- [ ] Change default admin password
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Configure firewall (UFW)
- [ ] Keep system and Node.js updated
- [ ] Regular backups of data directory
- [ ] Monitor logs for suspicious activity

## Docker Alternative (Optional)

If you prefer Docker:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy static files
COPY . .

# Install API dependencies
WORKDIR /app/api
RUN npm install --production

# Expose ports
EXPOSE 3001

CMD ["node", "gallery-api.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - ADMIN_PASSWORD=YourSecurePassword
    volumes:
      - ./api/data:/app/api/data
      - ./images:/app/images
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
    restart: unless-stopped
```

## Support

For issues with this setup, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `/var/log/nginx/`
3. System logs: `journalctl -xe`
