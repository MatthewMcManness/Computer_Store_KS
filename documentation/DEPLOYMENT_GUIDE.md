# Deployment Guide - Computer Store KS

> Complete deployment documentation for the Computer Store KS website, including local development setup, Render deployment, Supabase configuration, and external service integrations.

**Last Updated:** 2026-01-12

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Render Deployment](#2-render-deployment)
3. [Supabase Setup](#3-supabase-setup)
4. [External Service Setup](#4-external-service-setup)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Monitoring](#6-monitoring)
7. [Troubleshooting](#7-troubleshooting)
8. [Maintenance](#8-maintenance)

---

## 1. Environment Setup

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20.11.0+ (< 21.0.0) | Exact version specified in `engines` field |
| Bun | Latest | Preferred package manager |
| Git | Latest | Version control |

**Node.js Version Check:**
```bash
node --version  # Should be v20.x.x
```

The project enforces Node.js version via `package.json`:
```json
{
  "engines": {
    "node": ">=20.11.0 <21.0.0"
  }
}
```

### Local Development

**Install dependencies:**
```bash
bun install
```

**Start development server:**
```bash
bun run dev
```

**Available scripts:**
```bash
bun run dev          # Start development server (http://localhost:3000)
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run type-check   # TypeScript validation
bun run clean        # Remove .next, out, and node_modules
```

### Environment Variables

Create a `.env` file in the project root. Copy from `.env.example`:

```bash
cp .env.example .env
```

#### Required Variables

| Variable | Description | How to Obtain |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | Supabase Dashboard > Settings > API |
| `REPAIRSHOPR_SUBDOMAIN` | RepairShopr account subdomain | Your RepairShopr URL (e.g., "thecomputerstore" from thecomputerstore.repairshopr.com) |
| `SESSION_SECRET` | 64-character hex string | Generate: `openssl rand -hex 32` |
| `RESEND_API_KEY` | Email service API key | [Resend Dashboard](https://resend.com/api-keys) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare CAPTCHA site key | [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) |
| `TURNSTILE_SECRET_KEY` | Cloudflare CAPTCHA secret | [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub PAT for gallery images | - |
| `GITHUB_OWNER` | GitHub repository owner | MatthewMcManness |
| `GITHUB_REPO` | GitHub repository name | Computer_Store_KS |
| `GITHUB_BRANCH` | Target branch for images | Production |
| `NINJAONE_API_URL` | NinjaOne API endpoint | https://app.ninjarmm.com |
| `NINJAONE_CLIENT_ID` | NinjaOne OAuth client ID | - |
| `NINJAONE_CLIENT_SECRET` | NinjaOne OAuth secret | - |
| `GOOGLE_BUSINESS_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_BUSINESS_CLIENT_SECRET` | Google OAuth secret | - |
| `GOOGLE_BUSINESS_REFRESH_TOKEN` | Google OAuth refresh token | - |
| `GOOGLE_BUSINESS_ACCOUNT_ID` | Google Business account ID | - |
| `GOOGLE_BUSINESS_LOCATION_ID` | Google Business location ID | - |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager ID | - |
| `NOTIFICATION_EMAIL` | Contact form recipient | contact@computerstoreks.com |
| `AUTH_MODE` | Authentication mode | repairshopr |
| `ADMIN_PASSWORD` | Legacy admin password | - |

#### Development Test Keys

For local development, use these Cloudflare Turnstile test keys:
```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

---

## 2. Render Deployment

### Architecture Overview

The project deploys two separate environments on Render:

| Environment | Branch | Domain | Purpose |
|-------------|--------|--------|---------|
| **Production** | `Production` | computerstoreks.com | Live customer-facing site |
| **Development** | `Development` | csk-development.onrender.com | Internal testing/staging |

### Render Blueprint

The project uses a `render.yaml` blueprint for Infrastructure as Code deployment:

```yaml
services:
  # Production
  - type: web
    name: CSK-Production
    env: node
    branch: Production
    buildCommand: npm install && npm run build && cp -r .next/static .next/standalone/.next/static && rm -rf .next/standalone/public && cp -R public .next/standalone/ && cp -r node_modules .next/standalone/ && cp package.json .next/standalone/
    startCommand: cd .next/standalone && node server.js
    envVars:
      - key: NODE_VERSION
        value: 20.11.0
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: HOSTNAME
        value: 0.0.0.0

  # Development
  - type: web
    name: CSK-Development
    env: node
    branch: Development
    buildCommand: npm install && npm run build && cp -r .next/static .next/standalone/.next/static && rm -rf .next/standalone/public && cp -R public .next/standalone/ && cp -r node_modules .next/standalone/ && cp package.json .next/standalone/
    startCommand: cd .next/standalone && node server.js
```

### Production Environment

**Service Name:** CSK-Production
**Branch:** Production
**URL:** https://computerstoreks.com

**Build Command:**
```bash
npm install && npm run build && cp -r .next/static .next/standalone/.next/static && rm -rf .next/standalone/public && cp -R public .next/standalone/ && cp -r node_modules .next/standalone/ && cp package.json .next/standalone/
```

**Start Command:**
```bash
cd .next/standalone && node server.js
```

**Required Environment Variables in Render Dashboard:**

| Variable | Value | Sync |
|----------|-------|------|
| NODE_VERSION | 20.11.0 | Static |
| NODE_ENV | production | Static |
| PORT | 3000 | Static |
| HOSTNAME | 0.0.0.0 | Static |
| AUTH_MODE | repairshopr | Static |
| REPAIRSHOPR_SUBDOMAIN | thecomputerstore | Static |
| GITHUB_OWNER | MatthewMcManness | Static |
| GITHUB_REPO | Computer_Store_KS | Static |
| GITHUB_BRANCH | Production | Static |
| NEXT_PUBLIC_SITE_URL | https://computerstoreks.com | Static |
| RESEND_API_KEY | [secret] | Manual |
| SESSION_SECRET | [secret] | Manual |
| ADMIN_PASSWORD | [secret] | Manual |
| GITHUB_TOKEN | [secret] | Manual |
| NEXT_PUBLIC_SUPABASE_URL | [secret] | Manual |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | [secret] | Manual |
| SUPABASE_SERVICE_ROLE_KEY | [secret] | Manual |

### Development Environment

**Service Name:** CSK-Development
**Branch:** Development
**URL:** https://csk-development.onrender.com

Configuration mirrors Production with these differences:
- `GITHUB_BRANCH`: Development
- `NEXT_PUBLIC_SITE_URL`: https://csk-development.onrender.com

### Manual Deployment Steps

1. **Create Render account** at [render.com](https://render.com)

2. **Connect GitHub repository:**
   - Dashboard > New > Web Service
   - Connect MatthewMcManness/Computer_Store_KS

3. **Configure service:**
   - Name: CSK-Production (or CSK-Development)
   - Branch: Production (or Development)
   - Runtime: Node
   - Build Command: (see above)
   - Start Command: (see above)

4. **Add environment variables:**
   - Go to Environment tab
   - Add all required variables from the table above
   - Mark sensitive values as "Secret"

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete

6. **Configure custom domain (Production only):**
   - Settings > Custom Domain
   - Add: computerstoreks.com
   - Update DNS records as instructed

---

## 3. Supabase Setup

### Creating a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose organization and enter:
   - Project name: `computer-store-ks`
   - Database password: (save this securely)
   - Region: Choose closest to users

4. Note the project credentials from Settings > API:
   - Project URL
   - anon/public key
   - service_role key

### Database Schema

The database schema files are located in `docs/database/`. Run them in the Supabase SQL Editor in this order:

#### Core Tables (Required)

1. **Blog System** - `docs/database/blog-schema.sql`
   - `blog_posts` - Blog articles
   - `blog_categories` - Post categories
   - `blog_tags` - Tag definitions
   - `blog_post_tags` - Post-tag junction

2. **Ticket Status System** - `docs/database/ticket-statuses-schema.sql`
   - `ticket_status_definitions` - Custom status definitions
   - `ticket_status_overrides` - Per-ticket status overrides

3. **Gallery System** - `docs/database/gallery-schema.sql`
   - `gallery_computers` - Computer inventory
   - `gallery_sales` - Sale configurations

4. **User Profiles** - `docs/database/user-profiles-schema.sql`
   - `user_profiles` - User roles and metadata
   - `device_mappings` - RepairShopr/NinjaOne device links

#### Additional Tables

5. **Employee Management** - `docs/database/employee-audit-log-schema.sql`
6. **Customer Accounts** - `docs/database/customer-accounts-schema.sql`
7. **Customer Silver Plans** - `docs/database/customer-silver-plans-schema.sql`
8. **Asset Protection Plans** - `docs/database/asset-protection-plans-schema.sql`
9. **RepairShopr Sync** - `docs/database/repairshopr-sync-schema.sql`
10. **RBAC Migration** - `docs/database/rbac-migration.sql`
11. **Locations** - `docs/database/locations-migration.sql`
12. **Businesses** - `docs/database/businesses-table-migration.sql`
13. **Families** - `docs/database/families-table-migration.sql`

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:

**Blog Posts:**
- Public can view published posts
- Service role has full access

**Ticket Status:**
- Public can read status definitions
- Service role can update

**Gallery:**
- Public can view active computers
- Service role manages inventory

### Storage Buckets

Create these storage buckets in Supabase Dashboard > Storage:

1. **gallery-images**
   - Purpose: Computer photos
   - Public access: Yes
   - File size limit: 5MB

2. **blog-images**
   - Purpose: Blog post featured images
   - Public access: Yes
   - File size limit: 5MB

**Bucket Policy (for public read access):**
```sql
CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Service role manages gallery"
ON storage.objects FOR ALL
USING (bucket_id = 'gallery-images' AND auth.role() = 'service_role');

CREATE POLICY "Service role manages blog images"
ON storage.objects FOR ALL
USING (bucket_id = 'blog-images' AND auth.role() = 'service_role');
```

### Supabase Auth SMTP (Email)

Configure in Supabase Dashboard > Settings > Auth > SMTP:

| Setting | Value |
|---------|-------|
| Host | smtp.resend.com |
| Port | 465 |
| Username | resend |
| Password | (your RESEND_API_KEY) |
| Sender Email | noreply@computerstoreks.com |
| Sender Name | Computer Store KS |

---

## 4. External Service Setup

### RepairShopr

**Purpose:** CRM, ticketing, customer management, employee authentication

1. **Get API Key:**
   - Log in to RepairShopr Admin
   - Go to More > API Keys
   - Create new API key with appropriate permissions

2. **Configure subdomain:**
   - Your subdomain is the first part of your RepairShopr URL
   - Example: `thecomputerstore` from `thecomputerstore.repairshopr.com`

3. **Environment variables:**
   ```bash
   REPAIRSHOPR_SUBDOMAIN=thecomputerstore
   REPAIRSHOPR_API_KEY=your_api_key_here
   AUTH_MODE=repairshopr
   ```

### NinjaOne RMM

**Purpose:** Remote device monitoring and management

1. **Create OAuth Application:**
   - Log in to NinjaOne Admin
   - Administration > Apps > API
   - Create new application
   - Note Client ID and Secret

2. **Select regional URL:**
   - US: `https://app.ninjarmm.com`
   - EU: `https://eu.ninjarmm.com`
   - Oceania: `https://oc.ninjarmm.com`

3. **Required permissions:**
   - Device read
   - Custom fields read
   - Organization read

4. **Environment variables:**
   ```bash
   NINJAONE_API_URL=https://app.ninjarmm.com
   NINJAONE_CLIENT_ID=your_client_id
   NINJAONE_CLIENT_SECRET=your_client_secret
   ```

### GitHub (Gallery Images)

**Purpose:** Store and version gallery computer images

1. **Create Personal Access Token:**
   - Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
   - Generate new token (classic)
   - Select scopes: `repo` (full control)

2. **Environment variables:**
   ```bash
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_OWNER=MatthewMcManness
   GITHUB_REPO=Computer_Store_KS
   GITHUB_BRANCH=Production
   ```

### Resend (Email)

**Purpose:** Transactional emails for contact form

1. **Create account:** [resend.com](https://resend.com)

2. **Verify domain:**
   - Add DNS records as instructed
   - Wait for verification

3. **Create API key:**
   - Dashboard > API Keys > Create

4. **Environment variables:**
   ```bash
   RESEND_API_KEY=re_your_key_here
   NOTIFICATION_EMAIL=contact@computerstoreks.com
   ```

### Google Business Profile

**Purpose:** Display customer reviews and business posts

1. **Create OAuth credentials:**
   - [Google Cloud Console](https://console.cloud.google.com)
   - APIs & Services > Credentials
   - Create OAuth 2.0 Client ID

2. **Enable APIs:**
   - My Business Business Information API
   - My Business API

3. **Get refresh token:**
   - Use OAuth Playground or one-time script
   - Scope: `https://www.googleapis.com/auth/business.manage`

4. **Find Account/Location IDs:**
   - Account ID: In URL at business.google.com/dashboard/
   - Location ID: Via API or Business Profile settings

5. **Environment variables:**
   ```bash
   GOOGLE_BUSINESS_CLIENT_ID=your_client_id
   GOOGLE_BUSINESS_CLIENT_SECRET=your_client_secret
   GOOGLE_BUSINESS_REFRESH_TOKEN=your_refresh_token
   GOOGLE_BUSINESS_ACCOUNT_ID=your_account_id
   GOOGLE_BUSINESS_LOCATION_ID=your_location_id
   ```

### Cloudflare Turnstile

**Purpose:** Bot protection for contact form

1. **Create site:**
   - [Cloudflare Dashboard](https://dash.cloudflare.com) > Turnstile
   - Add site: computerstoreks.com
   - Widget mode: Managed

2. **Copy keys:**
   - Site Key (public)
   - Secret Key (private)

3. **Environment variables:**
   ```bash
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
   TURNSTILE_SECRET_KEY=your_secret_key
   ```

---

## 5. CI/CD Pipeline

### Git Workflow

The project uses a **Development/Production** branching model:

```
Production (live site)
    ^
    | merge
    |
Development (staging)
    ^
    | feature branches (optional)
```

**Workflow:**

1. **Development work:**
   ```bash
   git checkout Development
   # Make changes
   git add .
   git commit -m "feat: add new feature"
   git push origin Development
   ```

2. **Deploy to production:**
   ```bash
   git checkout Production
   git merge Development
   git push origin Production
   ```

### Auto-Deploy

Render automatically deploys when:
- Push to `Production` branch -> Production site rebuilds
- Push to `Development` branch -> Development site rebuilds

**Deployment time:** Typically 3-5 minutes

### Rollback Procedures

**Option 1: Revert commit**
```bash
git checkout Production
git revert HEAD
git push origin Production
```

**Option 2: Deploy previous version in Render**
- Dashboard > Service > Deploys
- Find previous successful deploy
- Click "Rollback to this deploy"

**Option 3: Manual rollback**
```bash
git checkout Production
git reset --hard <previous-commit-sha>
git push --force origin Production
```

---

## 6. Monitoring

### Health Check Endpoint

**URL:** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T00:00:00.000Z",
  "supabaseConfigured": true,
  "supabaseAdminConfigured": true,
  "githubConnected": true,
  "database": {
    "success": true,
    "customerCount": 150,
    "error": null
  },
  "env": {
    "hasSupabaseUrl": true,
    "hasSupabaseAnonKey": true,
    "hasSupabaseServiceKey": true
  }
}
```

**Status values:**
- `ok` - All systems operational
- `degraded` - Database connection issue

### UptimeRobot Configuration

1. **Create monitor:**
   - Monitor Type: HTTP(s)
   - Friendly Name: Computer Store KS
   - URL: https://computerstoreks.com/api/health
   - Monitoring Interval: 5 minutes

2. **Alert contacts:**
   - Add email alerts for downtime
   - Consider Slack/Discord webhook

3. **Status page (optional):**
   - Create public status page
   - Share with stakeholders

### What to Monitor

| Metric | Endpoint/Method | Alert Threshold |
|--------|-----------------|-----------------|
| Site availability | /api/health | Any failure |
| Response time | /api/health | > 5 seconds |
| SSL certificate | N/A | 14 days before expiry |
| Database connection | /api/health `database.success` | false |
| Build failures | Render dashboard | Any failure |

---

## 7. Troubleshooting

### Common Build Failures

**Issue: Node version mismatch**
```
Error: The engine "node" is incompatible with this module
```
**Fix:** Ensure `NODE_VERSION=20.11.0` in Render environment variables.

**Issue: Missing environment variables**
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```
**Fix:** Add missing variable in Render Dashboard > Environment.

**Issue: Build timeout**
```
Error: Build exceeded maximum time limit
```
**Fix:**
- Optimize build command
- Remove unused dependencies
- Consider caching node_modules

### Environment Variable Issues

**Issue: Variables not loading**
- Verify variable names match exactly (case-sensitive)
- Ensure no trailing whitespace
- Redeploy after adding new variables

**Issue: NEXT_PUBLIC_ variables not in client**
- Rebuild required after changing public variables
- Trigger manual deploy in Render

### Database Connection Issues

**Issue: Supabase connection refused**
```
Error: Connection refused to database
```
**Checks:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Check Supabase project is not paused
3. Verify IP is not blocked (Supabase Dashboard > Database > Connection Pooling)

**Issue: RLS policy violations**
```
Error: new row violates row-level security policy
```
**Fix:** Ensure using `supabaseAdmin` (service role) for admin operations.

### Authentication Issues

**Issue: Session not persisting**
- Verify `SESSION_SECRET` is 64 hex characters
- Check cookie settings in browser
- Verify domain matches cookie domain

**Issue: RepairShopr auth failing**
- Verify subdomain is correct
- Check API key permissions
- Test API key directly with RepairShopr

### Build Command Breakdown

The complex build command explained:

```bash
# 1. Install dependencies
npm install

# 2. Build Next.js application
npm run build

# 3. Copy static files to standalone output
cp -r .next/static .next/standalone/.next/static

# 4. Remove and recreate public folder in standalone
rm -rf .next/standalone/public
cp -R public .next/standalone/

# 5. Copy node_modules (for server-side deps)
cp -r node_modules .next/standalone/

# 6. Copy package.json (for runtime reference)
cp package.json .next/standalone/
```

---

## 8. Maintenance

### Database Backups

**Automatic backups (Supabase):**
- Free tier: 7-day retention
- Pro tier: 30-day retention with point-in-time recovery

**Manual backup:**
```bash
# Export via Supabase CLI
supabase db dump -f backup.sql

# Or use pg_dump
pg_dump postgresql://postgres:[password]@[host]:5432/postgres > backup.sql
```

**Restore:**
```bash
# Via Supabase Dashboard > Database > Backups
# Or via psql
psql postgresql://postgres:[password]@[host]:5432/postgres < backup.sql
```

### Log Management

**Render logs:**
- Dashboard > Service > Logs
- Real-time streaming
- 7-day retention on free tier

**Application logs:**
- Use `console.log` for debugging
- Consider adding structured logging (e.g., Pino)
- Forward to external service for production (optional)

### Updates and Patches

**Dependency updates:**
```bash
# Check for updates
bun outdated

# Update all dependencies
bun update

# Update specific package
bun update next
```

**Security patches:**
1. Review GitHub Dependabot alerts
2. Update vulnerable packages
3. Test thoroughly in Development
4. Deploy to Production

**Framework updates (Next.js):**
1. Read changelog for breaking changes
2. Update in Development branch
3. Run build and tests
4. Verify all routes work
5. Deploy to Production

### Scheduled Maintenance

| Task | Frequency | Description |
|------|-----------|-------------|
| Dependency updates | Monthly | Update packages, review security |
| Database vacuuming | Automatic | Supabase handles this |
| Log review | Weekly | Check for errors/anomalies |
| Backup verification | Monthly | Verify backups are working |
| SSL renewal | Automatic | Render handles this |
| Performance review | Quarterly | Check Core Web Vitals |

---

## Quick Reference

### Essential URLs

| Resource | URL |
|----------|-----|
| Production site | https://computerstoreks.com |
| Development site | https://csk-development.onrender.com |
| Health check | https://computerstoreks.com/api/health |
| Render dashboard | https://dashboard.render.com |
| Supabase dashboard | https://supabase.com/dashboard/project/gzcmwpcxnwlgknhjijic |
| GitHub repo | https://github.com/MatthewMcManness/Computer_Store_KS |

### Emergency Contacts

| Service | Support |
|---------|---------|
| Render | support@render.com |
| Supabase | support@supabase.io |
| Resend | support@resend.com |
| Cloudflare | https://support.cloudflare.com |

### Quick Commands

```bash
# Local development
bun install && bun run dev

# Build and test locally
bun run build && bun run start

# Deploy to production
git checkout Production && git merge Development && git push

# Check logs (Render CLI)
render logs --service CSK-Production

# Supabase CLI
supabase db diff --use-migra
supabase db push
```

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-12 | Initial comprehensive deployment guide |
