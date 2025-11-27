#!/bin/bash

echo "=========================================="
echo "Computer Store KS V2 - Self-Hosting Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run this script with sudo:${NC}"
    echo "sudo bash setup.sh"
    exit 1
fi

echo -e "${YELLOW}Step 1: Installing Nginx...${NC}"
apt update
apt install -y nginx
echo -e "${GREEN}✓ Nginx installed${NC}"
echo ""

echo -e "${YELLOW}Step 2: Installing PM2 globally...${NC}"
npm install -g pm2
echo -e "${GREEN}✓ PM2 installed${NC}"
echo ""

echo -e "${YELLOW}Step 3: Configuring Nginx...${NC}"
# Copy nginx config
cp "/home/matthew/Computer Store V2/Computer_Store_KS/nginx-computerstoreks.conf" /etc/nginx/sites-available/computerstoreks

# Enable the site
ln -sf /etc/nginx/sites-available/computerstoreks /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx configuration valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration error${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 4: Starting Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx started and enabled${NC}"
echo ""

echo -e "${YELLOW}Step 5: Starting API with PM2...${NC}"
cd "/home/matthew/Computer Store V2/Computer_Store_KS"

# Kill existing API processes
pkill -f "gallery-api.js" 2>/dev/null

# Start with PM2 as the user (not root)
sudo -u matthew pm2 start ecosystem.config.js
sudo -u matthew pm2 save

# Setup PM2 startup
env PATH=$PATH:/usr/bin pm2 startup systemd -u matthew --hp /home/matthew
echo -e "${GREEN}✓ API started with PM2${NC}"
echo ""

echo -e "${YELLOW}Step 6: Configuring Firewall...${NC}"
ufw allow ssh
ufw allow 'Nginx HTTP'
ufw --force enable
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Your website is now available at:"
echo -e "  ${GREEN}http://localhost${NC}"
echo ""
echo "Admin panel:"
echo -e "  ${GREEN}http://localhost/admin-login.html${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check API status"
echo "  pm2 logs            - View API logs"
echo "  pm2 restart all     - Restart API"
echo "  sudo systemctl status nginx - Check Nginx status"
echo ""
