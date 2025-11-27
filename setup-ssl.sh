#!/bin/bash

echo "=========================================="
echo "SSL Setup for Computer Store KS"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo bash setup-ssl.sh"
    exit 1
fi

echo ""
echo "Step 1: Updating Nginx config with domains..."
cp "/home/matthew/Computer Store V2/Computer_Store_KS/nginx-computerstoreks.conf" /etc/nginx/sites-available/computerstoreks
nginx -t && systemctl reload nginx
echo "✓ Nginx updated"

echo ""
echo "Step 2: Installing Certbot..."
apt install -y certbot python3-certbot-nginx
echo "✓ Certbot installed"

echo ""
echo "Step 3: Obtaining SSL certificates..."
echo "This will request certificates for all your domains."
echo ""

certbot --nginx -d computerstoreks.com -d www.computerstoreks.com -d thecomputerstoreks.com -d www.thecomputerstoreks.com

echo ""
echo "Step 4: Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer
echo "✓ Auto-renewal configured"

echo ""
echo "=========================================="
echo "SSL Setup Complete!"
echo "=========================================="
echo ""
echo "Your sites are now available at:"
echo "  https://computerstoreks.com"
echo "  https://thecomputerstoreks.com"
echo ""
echo "Certificates will auto-renew before expiration."
echo ""
