# Authentication System

This document describes the authentication system for Computer Store KS, which supports two modes:
- **RepairShopr Mode** (recommended): Single Sign-On with RepairShopr accounts
- **Legacy Mode**: Simple password-based authentication

## Overview

The authentication system is designed for the admin gallery management interface. It uses server-side sessions with encrypted storage and role-based access control.

## Quick Start

### Using RepairShopr Authentication (Recommended)

1. Set environment variables:
   ```env
   AUTH_MODE=repairshopr
   REPAIRSHOPR_SUBDOMAIN=thecomputerstore
   SESSION_SECRET=<32-character-random-string>
   ```

2. Generate a session secret:
   ```bash
   openssl rand -hex 16 | head -c 32
   ```

3. Users log in with their RepairShopr email and password

### Using Legacy Authentication

1. Set environment variables:
   ```env
   AUTH_MODE=legacy
   ADMIN_PASSWORD=your-secure-password
   ```

2. Users log in with the admin password (no email required)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_MODE` | No | `repairshopr` (default) or `legacy` |
| `REPAIRSHOPR_SUBDOMAIN` | For repairshopr mode | Your RepairShopr subdomain |
| `SESSION_SECRET` | For repairshopr mode | 32-character encryption key |
| `ADMIN_PASSWORD` | For legacy mode | Admin password |
| `LEGACY_ADMIN_PASSWORD` | No | Fallback password for dual-mode |

## Role-Based Access Control

RepairShopr mode assigns roles based on the user's RepairShopr permissions:

| RepairShopr Status | Assigned Role | Access |
|-------------------|---------------|--------|
| Admin user | `admin` | Full access to all admin routes |
| Write permissions | `employee` | Gallery management, dashboard |
| Read-only | `limited` | Dashboard only |

### Route Permissions

| Route | Admin | Employee | Limited |
|-------|-------|----------|---------|
| `/admin` | ✓ | ✓ | ✓ |
| `/admin/gallery` | ✓ | ✓ | ✗ |
| `/admin/gallery/new` | ✓ | ✓ | ✗ |
| `/admin/settings` | ✓ | ✗ | ✗ |

## Session Management

### Storage

Sessions are stored server-side in the `.sessions/` directory:
- Encrypted using AES-256-GCM
- 8-hour expiry
- Automatic cleanup of expired sessions

### Cookies

Two cookies are used:
- `admin_session`: Session ID (httpOnly, secure)
- `user_role`: User role for Edge middleware (httpOnly, secure)

## Migration Guide

### From Legacy to RepairShopr

1. **Add new environment variables:**
   ```env
   AUTH_MODE=repairshopr
   REPAIRSHOPR_SUBDOMAIN=your-subdomain
   SESSION_SECRET=<generate-32-chars>
   ```

2. **Keep legacy password as fallback:**
   ```env
   LEGACY_ADMIN_PASSWORD=your-current-password
   ```

3. **Communicate to users:**
   - They now log in with RepairShopr email + password
   - Roles are assigned based on RepairShopr permissions

4. **Test the migration:**
   - Verify RepairShopr login works
   - Confirm role assignments are correct
   - Test unauthorized access is blocked

### Rolling Back

To roll back to legacy mode:
```env
AUTH_MODE=legacy
```

The system will use the legacy password from `LEGACY_ADMIN_PASSWORD` or `ADMIN_PASSWORD`.

## API Endpoints

### POST /api/auth/login

Authenticate a user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

**Error Responses:**
- `401`: Invalid credentials (`code: INVALID_CREDENTIALS`)
- `429`: Rate limited (`code: RATE_LIMITED`)
- `503`: RepairShopr unavailable (`code: SERVICE_UNAVAILABLE`)

### GET /api/auth/check

Check authentication status.

**Authenticated Response:**
```json
{
  "authenticated": true,
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

**Unauthenticated Response:**
```json
{
  "authenticated": false
}
```

### POST /api/auth/logout

End the current session.

**Response:**
```json
{
  "success": true
}
```

## Security Considerations

### Session Security

- Sessions are encrypted at rest using AES-256-GCM
- API tokens are never sent to the browser
- Session IDs are cryptographically random UUIDs
- Sessions expire after 8 hours

### Rate Limiting

Login attempts are rate limited:
- 5 attempts per 15 minutes per IP address
- Returns `429 Too Many Requests` when exceeded

### Cookies

All authentication cookies use:
- `httpOnly`: Prevents JavaScript access
- `secure`: HTTPS only in production
- `sameSite: lax`: Protects against CSRF

## Troubleshooting

### "SESSION_SECRET must be exactly 32 characters"

Generate a proper secret:
```bash
openssl rand -hex 16 | head -c 32
```

### "REPAIRSHOPR_SUBDOMAIN is required"

Set your RepairShopr subdomain (the part before `.repairshopr.com`):
```env
REPAIRSHOPR_SUBDOMAIN=thecomputerstore
```

### "Invalid email or password"

- Verify the email matches a RepairShopr account
- Check the password is correct for that account
- Ensure the user exists in your RepairShopr instance

### "Authentication service unavailable"

RepairShopr API may be down. Options:
1. Wait and retry
2. Switch to legacy mode temporarily:
   ```env
   AUTH_MODE=legacy
   ```

### Role not assigned correctly

Roles are mapped from RepairShopr permissions:
- Check user's admin status in RepairShopr
- Review user's write/create permissions
- Admin users always get `admin` role

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Edge Middleware                            │
│  • Reads role cookie                                          │
│  • Enforces route permissions                                 │
│  • Redirects unauthorized access                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes                                 │
│  /api/auth/login   - Authenticate user                        │
│  /api/auth/check   - Check auth status                        │
│  /api/auth/logout  - End session                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Auth Library (auth.ts)                     │
│  • Dual-mode authentication                                   │
│  • Session management                                         │
│  • Role mapping                                               │
└─────────────────────────────────────────────────────────────┘
                    │                       │
                    ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│   RepairShopr Client     │  │     Session Store            │
│   • /sign_in endpoint    │  │     • AES-256-GCM encryption │
│   • /me endpoint         │  │     • File-based storage     │
│   • Rate limit awareness │  │     • Auto-cleanup           │
└──────────────────────────┘  └──────────────────────────────┘
             │
             ▼
┌──────────────────────────┐
│   RepairShopr API        │
│   (External Service)     │
└──────────────────────────┘
```
