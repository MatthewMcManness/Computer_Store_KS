# ESET Integration Plan

## Overview

This document outlines the plan to integrate ESET antivirus management with the Computer Store KS website to automatically track and display ESET protection status on customer assets.

## Current Manual System

Currently, ESET status is tracked manually in the `asset_protection_plans` table:
- `eset_status`: 'protected' | 'expired' | 'unprotected' | null
- `eset_expiry`: Expiration date timestamp

## ESET API Options

### Option 1: ESET MSP Administrator 2 API (Recommended for MSPs)

**Swagger UI**: https://mspapi.eset.com/swagger/index.html
**Documentation**: https://help.eset.com/ema/2/api/en-US/

**Available Endpoints**:
- Authentication (`/api/Token/Get`)
- Device Management - list devices, check status
- License Management - check expiry, usage, activations
- Asset Management - inventory tracking
- Incident Management - security events

**Authentication**:
1. POST to `/api/Token/Get` with username/password
2. Receive bearer token
3. Use token in Authorization header for subsequent requests

### Option 2: ESET Connect API (Newer Gateway)

**Documentation**: https://help.eset.com/eset_connect/en-US/swagger_api.html

**Categories**:
- Device Management
- Asset Management
- Automation
- Incident Management
- License Management

## Information Needed From Client

Before implementing, we need:

1. **Which ESET product is used?**
   - [ ] ESET MSP Administrator 2
   - [ ] ESET PROTECT Cloud
   - [ ] ESET PROTECT On-Prem
   - [ ] Individual licenses (no central management)

2. **API Credentials**:
   - Username/Email for API access
   - Password or API key
   - Account ID (if applicable)

3. **Customer Organization**:
   - How are customers named in ESET? (matches RepairShopr names?)
   - Are devices organized by customer/company?
   - What identifier links ESET devices to RepairShopr assets?

4. **What data to sync?**
   - [ ] Protection status (active/inactive)
   - [ ] License expiry dates
   - [ ] Last scan date
   - [ ] Threat detection history
   - [ ] Product version installed

## Proposed Integration Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  ESET API       │────▶│  Our API Route   │────▶│  Supabase DB    │
│  (MSP Admin 2)  │     │  /api/eset/sync  │     │  asset_plans    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │  Admin UI        │
                        │  Assets Tab      │
                        └──────────────────┘
```

## Implementation Steps (Once Credentials Available)

### Phase 1: API Connection
1. Create `/api/eset/auth` - authenticate and store token
2. Create `/api/eset/devices` - list all managed devices
3. Create `/api/eset/licenses` - get license information
4. Store ESET API credentials securely in environment variables

### Phase 2: Data Mapping
1. Create mapping between ESET device names and RepairShopr assets
2. Store ESET device ID in asset_protection_plans table
3. Build matching logic (by device name, serial number, or manual linking)

### Phase 3: Sync Implementation
1. Create `/api/eset/sync` - sync ESET status to our database
2. Add scheduled sync (daily cron job or on-demand)
3. Update asset_protection_plans with:
   - eset_status based on ESET protection state
   - eset_expiry from license expiration date

### Phase 4: UI Updates
1. Show "Sync with ESET" button in admin
2. Display last sync time
3. Show ESET-specific details (version, last scan, etc.)
4. Alert for devices not found in ESET

## Environment Variables Needed

```bash
# ESET MSP Administrator 2 API
ESET_API_URL=https://mspapi.eset.com
ESET_API_USERNAME=your_username
ESET_API_PASSWORD=your_password

# Or for ESET Connect
ESET_CONNECT_URL=https://connect.eset.com
ESET_CONNECT_CLIENT_ID=your_client_id
ESET_CONNECT_CLIENT_SECRET=your_client_secret
```

## Database Changes Needed

```sql
-- Add ESET device ID to asset_protection_plans
ALTER TABLE asset_protection_plans
ADD COLUMN eset_device_id TEXT,
ADD COLUMN eset_last_sync TIMESTAMPTZ,
ADD COLUMN eset_product_version TEXT,
ADD COLUMN eset_last_scan TIMESTAMPTZ;

-- Index for ESET device lookup
CREATE INDEX idx_asset_plans_eset_device ON asset_protection_plans(eset_device_id);
```

## Resources

- [ESET MSP Administrator 2 API Guide](https://help.eset.com/ema/2/api/en-US/)
- [ESET MSP Admin Swagger UI](https://mspapi.eset.com/swagger/index.html)
- [ESET Connect Documentation](https://help.eset.com/eset_connect/en-US/swagger_api.html)
- [ESET Developers Portal](https://help.eset.com/developers/)
- [Working in Swagger UI](https://help.eset.com/ema/2/api/en-US/swagger2.html)

## Status

- [ ] Client provides ESET product type
- [ ] Client provides API credentials
- [ ] Client confirms customer naming convention
- [ ] Phase 1: API Connection
- [ ] Phase 2: Data Mapping
- [ ] Phase 3: Sync Implementation
- [ ] Phase 4: UI Updates
