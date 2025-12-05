# Domain Migration Guide

This guide walks you through migrating `thecomputerstoreks.com` and `computerstoreks.com` from the static site to the Next.js application on Render.

## Current Setup

| Component | URL | Status |
|-----------|-----|--------|
| Static HTML Site | `thecomputerstoreks.com` / `computerstoreks.com` | To be retired |
| Next.js App | `computer-store-ks.onrender.com` | New production site |

## Migration Overview

1. Point your domains to the Render Next.js app
2. Verify everything works
3. Delete the old static site hosting

---

## Step 1: Add Custom Domain to Render

### 1.1 Open Render Dashboard

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click on your **computer-store-ks** web service
3. Navigate to **Settings** → **Custom Domains**

### 1.2 Add Primary Domain

1. Click **Add Custom Domain**
2. Enter: `thecomputerstoreks.com`
3. Click **Save**
4. Render will show you the required DNS records

### 1.3 Add www Subdomain

1. Click **Add Custom Domain** again
2. Enter: `www.thecomputerstoreks.com`
3. Click **Save**

### 1.4 Add Alternate Domain (if using both)

If you also use `computerstoreks.com`:

1. Click **Add Custom Domain**
2. Enter: `computerstoreks.com`
3. Click **Save**
4. Repeat for `www.computerstoreks.com`

---

## Step 2: Update DNS Records

### 2.1 Access Your DNS Provider

Log into wherever you manage DNS for your domain (likely Cloudflare based on the current setup).

### 2.2 Update A/CNAME Records

Render will provide specific values, but typically you need:

**For root domain (`thecomputerstoreks.com`):**

| Type | Name | Value |
|------|------|-------|
| A | @ | `216.24.57.1` (Render's IP) |

Or if your DNS provider supports CNAME flattening:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | `computer-store-ks.onrender.com` |

**For www subdomain:**

| Type | Name | Value |
|------|------|-------|
| CNAME | www | `computer-store-ks.onrender.com` |

### 2.3 If Using Cloudflare

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain
3. Go to **DNS** → **Records**
4. Delete or update existing A/CNAME records pointing to the old static host
5. Add the new records from Step 2.2
6. **Important**: Set proxy status to **DNS only** (gray cloud) initially for faster propagation
7. Once verified working, you can enable the orange cloud (proxied) for Cloudflare benefits

### 2.4 Cloudflare-Specific Settings

If using Cloudflare proxy (orange cloud):

1. Go to **SSL/TLS** → **Overview**
2. Set SSL mode to **Full (strict)**
3. Go to **SSL/TLS** → **Edge Certificates**
4. Ensure **Always Use HTTPS** is ON

---

## Step 3: Configure SSL on Render

1. In Render dashboard, go to your service
2. Navigate to **Settings** → **Custom Domains**
3. For each domain, click **Verify**
4. Render will automatically provision SSL certificates via Let's Encrypt
5. Wait for the status to show **Verified** and **Certificate Issued**

This may take a few minutes after DNS propagates.

---

## Step 4: Set Up Redirects (Optional but Recommended)

### 4.1 Redirect www to non-www (or vice versa)

In your Next.js app, you can add redirects in `next.config.mjs`:

```javascript
async redirects() {
  return [
    // Redirect www to non-www
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'www.thecomputerstoreks.com' }],
      destination: 'https://thecomputerstoreks.com/:path*',
      permanent: true,
    },
    // Redirect alternate domain to primary
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'computerstoreks.com' }],
      destination: 'https://thecomputerstoreks.com/:path*',
      permanent: true,
    },
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'www.computerstoreks.com' }],
      destination: 'https://thecomputerstoreks.com/:path*',
      permanent: true,
    },
  ];
},
```

### 4.2 Or Use Cloudflare Page Rules

If using Cloudflare, you can set up redirects there instead:

1. Go to **Rules** → **Page Rules**
2. Create a rule:
   - URL: `www.thecomputerstoreks.com/*`
   - Setting: **Forwarding URL** (301 Permanent)
   - Destination: `https://thecomputerstoreks.com/$1`

---

## Step 5: Verify the Migration

### 5.1 Test All Pages

After DNS propagates (can take up to 48 hours, usually much faster):

```bash
# Test homepage
curl -sI https://thecomputerstoreks.com | head -5

# Test admin login
curl -sI https://thecomputerstoreks.com/admin/login | head -5

# Test API health
curl -s https://thecomputerstoreks.com/api/health

# Test contact form API
curl -s https://thecomputerstoreks.com/api/contact -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","subject":"Test","message":"Migration test"}'
```

### 5.2 Check These Specific URLs

- [ ] Homepage: `https://thecomputerstoreks.com`
- [ ] About: `https://thecomputerstoreks.com/about`
- [ ] Services: `https://thecomputerstoreks.com/services`
- [ ] Gallery: `https://thecomputerstoreks.com/gallery`
- [ ] Contact: `https://thecomputerstoreks.com/contact`
- [ ] Reviews: `https://thecomputerstoreks.com/reviews`
- [ ] Admin Login: `https://thecomputerstoreks.com/admin/login`
- [ ] Admin Dashboard: `https://thecomputerstoreks.com/admin` (after login)
- [ ] Gallery Manager: `https://thecomputerstoreks.com/admin/gallery` (after login)

### 5.3 Test Contact Form

1. Go to `https://thecomputerstoreks.com/contact`
2. Fill out and submit the contact form
3. Verify you receive the email notification

### 5.4 Test Admin Panel

1. Go to `https://thecomputerstoreks.com/admin/login`
2. Log in with your RepairShopr credentials
3. Navigate to Gallery
4. Try adding/editing a computer
5. Test the "Publish to Website" button

---

## Step 6: Update Environment Variables

In Render dashboard, update any URLs that reference the old setup:

1. Go to **Environment** tab
2. Update `NEXT_PUBLIC_SITE_URL` to `https://thecomputerstoreks.com`
3. Click **Save Changes**
4. Render will automatically redeploy

---

## Step 7: Delete the Old Static Site

Once you've verified everything works on the new domain:

### 7.1 If Old Site is on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find the old static site service
3. Click on it
4. Go to **Settings**
5. Scroll to the bottom
6. Click **Delete Web Service**
7. Confirm deletion

### 7.2 If Old Site is on Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages**
4. Find the static site project
5. Click on it
6. Go to **Settings** → **General**
7. Scroll down and click **Delete project**

### 7.3 If Old Site is on GitHub Pages

1. Go to the repository settings
2. Navigate to **Pages**
3. Under **Source**, select **None**
4. This disables GitHub Pages

### 7.4 If Old Site is on Another Host

Follow that provider's instructions for deleting/disabling the site.

---

## Step 8: Post-Migration Cleanup

### 8.1 Update Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Verify you own the domain (if not already)
3. Submit sitemap: `https://thecomputerstoreks.com/sitemap.xml`

### 8.2 Update Google Business Profile

1. Go to [Google Business Profile](https://business.google.com)
2. Verify your website URL is correct
3. Update if needed

### 8.3 Update Social Media Links

Update any links on:
- Facebook
- Instagram
- Google Business
- Yelp
- Any other directories

### 8.4 Test Google Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Verify data is being collected from the new site
3. The tracking code (G-EQ3ML3VTCZ) should already be in the Next.js app

---

## Troubleshooting

### DNS Not Propagating

- Use [DNS Checker](https://dnschecker.org) to see propagation status
- Try flushing your local DNS cache:
  - Windows: `ipconfig /flushdns`
  - Mac: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
  - Linux: `sudo systemd-resolve --flush-caches`

### SSL Certificate Issues

- Ensure DNS is pointed correctly to Render
- If using Cloudflare proxy, set SSL mode to "Full (strict)"
- Wait a few minutes for Render to provision the certificate
- Check Render dashboard for certificate status

### 404 Errors on Admin Pages

- Ensure the Next.js app deployed successfully
- Check Render logs for build errors
- Verify middleware is not blocking routes incorrectly

### Contact Form Not Working

- Verify `RESEND_API_KEY` is set in Render environment
- Check that the domain is verified in Resend
- Review Render logs for API errors

---

## Rollback Plan

If something goes wrong:

1. **Immediately**: Update DNS records back to the old static site host
2. DNS will propagate (may take time, but usually fast for decreasing TTL)
3. Debug the issue with the Next.js app
4. Try the migration again once fixed

---

## Summary Checklist

- [ ] Add custom domains in Render dashboard
- [ ] Update DNS records (A record or CNAME)
- [ ] Wait for DNS propagation
- [ ] Verify SSL certificates are issued
- [ ] Test all pages and functionality
- [ ] Test contact form
- [ ] Test admin panel login and features
- [ ] Update NEXT_PUBLIC_SITE_URL environment variable
- [ ] Delete old static site hosting
- [ ] Update Google Search Console
- [ ] Update Google Business Profile
- [ ] Verify Google Analytics is working

---

## Support

If you encounter issues:

1. Check Render dashboard for deployment/build errors
2. Review Render logs for runtime errors
3. Check Cloudflare (if used) for any blocking rules
4. Test with `curl` commands to isolate issues

For Render-specific issues: [Render Documentation](https://render.com/docs)
For Cloudflare issues: [Cloudflare Documentation](https://developers.cloudflare.com)
