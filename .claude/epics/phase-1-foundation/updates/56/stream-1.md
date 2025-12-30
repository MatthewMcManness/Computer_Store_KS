---
issue: 56
stream: NinjaOne API Wrapper
agent: typescript-pro
started: 2025-12-26T22:42:04Z
status: completed
completed: 2025-12-26T23:15:00Z
---

# Stream 1: NinjaOne API Wrapper

## Scope
Create a typed API wrapper for NinjaOne RMM integration. Support fetching devices by customer, device details, and mapping to RepairShopr assets. Implement caching to respect rate limits.

## Files Created/Modified

### New Files
- `src/lib/ninjaone.ts` - Full-featured NinjaOne API client with:
  - TypeScript interfaces for all NinjaOne data types
  - OAuth2 authentication with token refresh
  - In-memory caching with TTL (5 min lists, 1 min details)
  - Rate limiting with exponential backoff retry
  - Graceful degradation when API unavailable
  - Device mapping to RepairShopr assets via Supabase

- `src/app/api/ninjaone/devices/route.ts` - List all devices endpoint
  - Supports filtering by status, deviceClass, search term, organizationId
  - Employee authentication required

- `src/app/api/ninjaone/devices/[id]/route.ts` - Get device details endpoint
  - Returns device with RepairShopr mapping info if available
  - Employee authentication required

- `src/app/api/ninjaone/devices/customer/[email]/route.ts` - Get devices by customer
  - Searches NinjaOne organizations by email/name
  - Employee authentication required

### Modified Files
- `.env.example` - Added NinjaOne environment variables:
  - `NINJAONE_API_URL`
  - `NINJAONE_CLIENT_ID`
  - `NINJAONE_CLIENT_SECRET`

## Implementation Details

### TypeScript Types
```typescript
interface NinjaOneDevice {
  id: number;
  name: string;
  os: string;
  status: 'online' | 'offline' | 'unknown';
  lastSeen: Date;
  hardware: NinjaOneHardware;
  osDetails?: NinjaOneOS;
  networkAdapters?: NinjaOneNetworkAdapter[];
  deviceClass?: 'WINDOWS_WORKSTATION' | 'WINDOWS_SERVER' | 'MAC' | 'LINUX' | ...;
  organizationId?: number;
  // ... more fields
}
```

### Caching Strategy
- Device lists: 5-minute TTL
- Individual device details: 1-minute TTL
- Organizations: 10-minute TTL
- Stale cache returned on API errors for graceful degradation

### Error Handling
- Rate limit (429): Exponential backoff with max 3 retries
- Network errors: Mark API unavailable, return stale cache if available
- Auth errors: Clear token and retry once
- Custom `NinjaOneAPIError` class for typed error handling

### Device Mapping (Supabase)
Functions for linking NinjaOne devices to RepairShopr assets:
- `mapDeviceToAsset(ninjaoneDeviceId, repairshoprAssetId, options)`
- `getDeviceMappingByAssetId(repairshoprAssetId)`
- `getDeviceMappingByNinjaId(ninjaoneDeviceId)`
- `getDeviceMappingsByOwner(ownerUserId)`
- `updateDeviceMappingSyncStatus(mappingId, status, error)`
- `deleteDeviceMapping(mappingId)`

## API Reference

### GET /api/ninjaone/devices
List all devices with optional filtering.

Query params:
- `status`: 'online' | 'offline'
- `deviceClass`: Device class filter
- `search`: Name search
- `organizationId`: Filter by org

### GET /api/ninjaone/devices/[id]
Get device details by NinjaOne ID.

### GET /api/ninjaone/devices/customer/[email]
Get devices by customer email or name search.

## Acceptance Criteria Status
- [x] `src/lib/ninjaone.ts` created with typed API client
- [x] Can authenticate with NinjaOne API (OAuth2 client credentials)
- [x] Can fetch devices by customer email or name
- [x] Can get device details (OS, hardware, status)
- [x] Responses cached with 5-minute TTL
- [x] Device mappings stored in `device_mappings` table
- [x] Graceful degradation if NinjaOne is unavailable

## Testing
To test the implementation:

1. Set environment variables in `.env`:
```bash
NINJAONE_API_URL=https://app.ninjarmm.com
NINJAONE_CLIENT_ID=your_client_id
NINJAONE_CLIENT_SECRET=your_client_secret
```

2. Test endpoints with employee authentication:
```bash
# List all devices
curl -H "Cookie: session=..." http://localhost:3000/api/ninjaone/devices

# Get device by ID
curl -H "Cookie: session=..." http://localhost:3000/api/ninjaone/devices/12345

# Get customer devices
curl -H "Cookie: session=..." http://localhost:3000/api/ninjaone/devices/customer/john@example.com
```
