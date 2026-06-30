# API Reference

## Auth model

Cloudflare Access gates `/admin` and every non-public `/api/*` route at the edge. `middleware.ts` re-verifies the `Cf-Access-Jwt-Assertion` JWT (`src/lib/access-jwt.ts`) and checks the email against the allow-list (`contact@computerstoreks.com`, `owner@resilientwebsolutions.com`). A failed check on an API route returns `401`. When `CF_ACCESS_TEAM_DOMAIN` is unset (local dev and builds), the Access check falls open.

The public API routes (no auth) are defined in `middleware.ts`: `/api/health`, `/api/contact`, `/api/google-business/reviews`, `/api/google-business/oauth/callback`, and `GET /api/slideshow`. Every other `/api/*` route is protected.

## Public Endpoints (no auth required)

```
GET    /api/health                          # Health check, returns { status, timestamp }
POST   /api/contact                         # Submit contact form (rate-limited, spam-checked)
GET    /api/slideshow                       # List ACTIVE slides only (in-store TVs, unattended)
GET    /api/google-business/reviews         # Cached Google Business reviews
GET    /api/google-business/oauth/callback  # Google OAuth redirect target (sets up the refresh token)
```

## Admin Endpoints (Cloudflare Access required)

Middleware blocks unauthorized requests with `401`. The Access JWT email must be on the allow-list.

### In-Store Computers
```
GET    /api/in-store                  # List computers (admin)
POST   /api/in-store                  # Create new computer
GET    /api/in-store/[id]             # Get single computer (including inactive)
PUT    /api/in-store/[id]             # Update computer fields
DELETE /api/in-store/[id]             # Archive computer (soft-delete, sets is_active=false)
PATCH  /api/in-store/[id]/stock       # Adjust stock quantity by delta (e.g., +1 or -1)
POST   /api/in-store/[id]/restore     # Restore archived computer to active
GET    /api/in-store/archived         # List all archived computers
DELETE /api/in-store/archived         # Permanently delete an archived computer
GET    /api/in-store/sale             # Get currently active sale (or null)
POST   /api/in-store/sale             # Set which sale is active (deactivates all others)
```

### Slideshow
```
POST   /api/slideshow                 # Create a slide
GET    /api/slideshow/all             # List all slides (including inactive)
PUT    /api/slideshow/[id]            # Update a slide
DELETE /api/slideshow/[id]            # Archive a slide
POST   /api/slideshow/[id]/restore    # Restore an archived slide
GET    /api/slideshow/archived        # List archived slides
DELETE /api/slideshow/archived        # Permanently delete an archived slide
POST   /api/slideshow/reorder         # Reorder slides
POST   /api/slideshow/upload          # Upload a slide image (returns { imageUrl })
```

(`GET /api/slideshow` is public and returns active-only slides; see above.)

### Google Business
```
GET    /api/google-business/oauth/start   # Begin the Google Business Profile OAuth flow
POST   /api/google-business/refresh       # Refresh the cached reviews / access token
```

## Image Upload Format

The only image upload endpoint is `POST /api/slideshow/upload`. It accepts:

- **Method:** POST with `multipart/form-data`
- **Field:** `file` (File) required
- **Max size:** 10 MB
- **Accepted formats:** PNG, JPEG, WebP, GIF
- **Response:** `{ imageUrl: "/uploads/<filename>" }`

The raw image buffer is written to the local uploads volume (`UPLOADS_DIR`, default `/data/uploads`) under a timestamp + UUID filename, then served by `src/app/uploads/[...path]/route.ts`. There is no Sharp/WebP conversion step in the app runtime.

## Error Responses

Most endpoints return errors as:
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

HTTP status codes:
- `400` Validation error or bad request
- `401` Not authorized (Access JWT missing or email not allowed)
- `429` Rate limited (contact form only, includes `Retry-After` header)
- `500` Server error
- `503` Database not configured (health check)
