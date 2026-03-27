# API Reference

## Public Endpoints (no auth required)

```
GET    /api/health                    # Health check — returns { status, timestamp }
GET    /api/in-store                  # List active computers with sale pricing applied
GET    /api/in-store/sale             # Get currently active sale (or null)
GET    /api/photo-gallery             # List active photos
POST   /api/contact                   # Submit contact form (rate-limited, spam-checked)
```

## Admin Endpoints (requires Google OAuth session)

Middleware blocks unauthenticated requests with 401. Session must belong to `contact@computerstoreks.com`.

### In-Store Computers
```
POST   /api/in-store                  # Create new computer
GET    /api/in-store/[id]             # Get single computer (including inactive)
PUT    /api/in-store/[id]             # Update computer fields
DELETE /api/in-store/[id]             # Archive computer (soft-delete, sets is_active=false)
PATCH  /api/in-store/[id]/stock       # Adjust stock quantity by delta (e.g., +1 or -1)
POST   /api/in-store/[id]/restore     # Restore archived computer to active
GET    /api/in-store/archived         # List all archived computers
DELETE /api/in-store/archived         # Permanently delete an archived computer
POST   /api/in-store/sale             # Set which sale is active (deactivates all others)
POST   /api/in-store/upload           # Upload computer image (returns full + thumbnail URLs)
```

### Photo Gallery
```
GET    /api/photo-gallery/[id]        # Get single photo
POST   /api/photo-gallery             # Create new photo record
PUT    /api/photo-gallery/[id]        # Update photo fields
DELETE /api/photo-gallery/[id]        # Delete photo
POST   /api/photo-gallery/upload      # Upload photo image (returns full + thumbnail URLs)
```

### Auth
```
GET    /api/auth/check                # Returns current user info or { authenticated: false }
POST   /api/auth/logout               # Signs out and clears session cookie
```

The OAuth callback is at `/auth/callback` (not under `/api/`).

## Image Upload Format

Both upload endpoints (`/api/in-store/upload` and `/api/photo-gallery/upload`) accept:

- **Method:** POST with `multipart/form-data`
- **Field:** `image` (File) — required
- **Field:** `type` (string) — optional, used in filename (e.g., "desktop", "laptop")
- **Max size:** 100 MB
- **Accepted formats:** JPEG, PNG, WebP, GIF, HEIC, TIFF, and camera RAW (Canon CR2/CR3, Nikon NEF, Sony ARW, Fuji RAF, DNG, etc.)
- **Response:** `{ success: true, imageUrl: "...", thumbnailUrl: "..." }`

Images are converted to WebP: full-size at 2048px max / 92% quality, thumbnail at 400px max / 85% quality.

## Error Responses

All endpoints return errors as:
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

HTTP status codes:
- `400` — Validation error or bad request
- `401` — Not authenticated
- `429` — Rate limited (contact form only, includes `Retry-After` header)
- `500` — Server error
- `503` — Database not configured (health check)
