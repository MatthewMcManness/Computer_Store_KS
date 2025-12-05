# API Reference

Computer Store KS provides REST API endpoints for contact forms, gallery management, and authentication.

## Base URLs

| Environment | URL |
|-------------|-----|
| Production (Render) | `https://computer-store-ks.onrender.com/api` |
| Local Development | `http://localhost:3000/api` |
| Docker (Express API) | `http://localhost:3001/api` |

## Contact Form

The contact form is the primary public-facing API endpoint, used by both the static HTML site and the Next.js app.

### Submit Contact Form

```http
POST /api/contact
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-123-4567",
  "subject": "General",
  "message": "I have a question about your computer repair services."
}
```

**Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Customer name (max 100 chars) |
| `email` | string | Yes | Valid email address (max 254 chars) |
| `phone` | string | No | Phone number (max 20 chars) |
| `subject` | enum | Yes | One of: `General`, `Repair`, `Custom Build`, `Silver Plan`, `Other` |
| `message` | string | Yes | Message content (10-5000 chars) |
| `website` | string | No | Honeypot field - must be empty |

**Response (Success)**
```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you within 24 hours."
}
```

**Response (Validation Error)**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    { "field": "subject", "message": "Please select a valid subject" },
    { "field": "message", "message": "Message must be at least 10 characters" }
  ]
}
```

**Response (Rate Limited)**
```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```
HTTP Status: 429, Header: `Retry-After: <seconds>`

**Rate Limiting**
- 3 requests per minute per IP address
- Returns 429 status when exceeded

## Authentication

Admin endpoints require authentication via session cookies.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "password": "your-admin-password"
}
```

**Response (Success)**
```json
{
  "success": true,
  "message": "Authentication successful"
}
```

**Response (Error)**
```json
{
  "success": false,
  "error": "Invalid password"
}
```

### Check Auth Status

```http
GET /api/auth/check
```

**Response**
```json
{
  "authenticated": true
}
```

### Logout

```http
POST /api/auth/logout
```

**Response**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Gallery Endpoints

### Get All Computers

```http
GET /api/gallery
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dell OptiPlex 7080",
      "type": "Desktop",
      "category": "Business",
      "price": 299.99,
      "description": "Intel i5, 16GB RAM, 256GB SSD",
      "specs": {
        "processor": "Intel Core i5-10500",
        "ram": "16GB DDR4",
        "storage": "256GB SSD",
        "graphics": "Intel UHD 630"
      },
      "images": ["image1.jpg", "image2.jpg"],
      "featured": true,
      "available": true
    }
  ],
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### Get Single Computer

```http
GET /api/gallery/:id
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dell OptiPlex 7080",
    ...
  }
}
```

### Add Computer (Authenticated)

```http
POST /api/gallery
Content-Type: application/json

{
  "name": "HP ProDesk 600",
  "type": "Desktop",
  "category": "Business",
  "price": 249.99,
  "description": "Great business workstation",
  "specs": {
    "processor": "Intel Core i5-8500",
    "ram": "8GB DDR4",
    "storage": "256GB SSD"
  },
  "images": [],
  "featured": false,
  "available": true
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "HP ProDesk 600",
    ...
  },
  "message": "Computer added successfully"
}
```

### Update Computer (Authenticated)

```http
PUT /api/gallery/:id
Content-Type: application/json

{
  "price": 219.99,
  "available": false
}
```

**Response**
```json
{
  "success": true,
  "data": { ... },
  "message": "Computer updated successfully"
}
```

### Delete Computer (Authenticated)

```http
DELETE /api/gallery/:id
```

**Response**
```json
{
  "success": true,
  "message": "Computer deleted successfully"
}
```

### Upload Image (Authenticated)

```http
POST /api/gallery/upload
Content-Type: multipart/form-data

file: <image file>
computerId: 1
```

**Response**
```json
{
  "success": true,
  "url": "https://raw.githubusercontent.com/.../image.jpg",
  "message": "Image uploaded successfully"
}
```

### Publish Gallery (Authenticated)

Syncs local gallery data to GitHub.

```http
POST /api/gallery/publish
```

**Response**
```json
{
  "success": true,
  "message": "Gallery published to GitHub"
}
```

## Blog Endpoints

### Get Blog Posts (Public)

```http
GET /api/blog
GET /api/blog?category=tech&tag=tips&search=keyword
```

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category slug |
| `tag` | string | Filter by tag slug |
| `search` | string | Search in title/content |
| `admin` | boolean | Include drafts (requires auth) |
| `metadata` | boolean | Include categories/tags lists |

**Response**
```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "Post Title",
      "slug": "post-title",
      "excerpt": "Brief summary...",
      "content": "Full markdown content...",
      "status": "published",
      "featured_image_url": "https://...",
      "author_name": "Admin",
      "published_at": "2025-12-05T00:00:00.000Z",
      "category": { "id": "uuid", "name": "Tech", "slug": "tech" },
      "tags": [{ "id": "uuid", "name": "Tips", "slug": "tips" }]
    }
  ],
  "categories": [...],
  "tags": [...]
}
```

### Get Single Blog Post

```http
GET /api/blog/[slug]
```

**Response**
```json
{
  "id": "uuid",
  "title": "Post Title",
  "slug": "post-title",
  "content": "Full markdown content...",
  ...
}
```

### Create Blog Post (Authenticated)

```http
POST /api/blog
Content-Type: application/json

{
  "title": "New Post",
  "slug": "new-post",
  "excerpt": "Summary",
  "content": "Markdown content...",
  "category_id": "uuid",
  "tag_ids": ["uuid1", "uuid2"],
  "featured_image_url": "https://...",
  "status": "draft"
}
```

### Update Blog Post (Authenticated)

```http
PUT /api/blog/[id]
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "published"
}
```

### Delete Blog Post (Authenticated)

```http
DELETE /api/blog/[id]
```

### Upload Blog Image (Authenticated)

```http
POST /api/blog/upload
Content-Type: multipart/form-data

image: <file>
```

**Response**
```json
{
  "success": true,
  "url": "https://gzcmwpcxnwlgknhjijic.supabase.co/storage/v1/object/public/blog-images/..."
}
```

## Health Check

```http
GET /api/health
```

**Response**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error - Internal error |

## Data Types

### GalleryComputer

```typescript
interface GalleryComputer {
  id: number;
  name: string;
  type: 'Desktop' | 'Laptop' | 'All-in-One';
  category: 'Gaming' | 'Business' | 'Home' | 'Workstation';
  price: number;
  description: string;
  specs: {
    processor?: string;
    ram?: string;
    storage?: string;
    graphics?: string;
    display?: string;
    os?: string;
  };
  images: string[];
  featured: boolean;
  available: boolean;
  warranty?: string;
  condition?: string;
}
```

### ContactForm

```typescript
interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: 'General' | 'Repair' | 'Custom Build' | 'Silver Plan' | 'Other';
  message: string;
  website?: string;  // Honeypot - should always be empty
}
```

## CORS Configuration

The API allows requests from:
- `https://computerstoreks.com`
- `https://www.computerstoreks.com`
- `https://thecomputerstoreks.com`
- `https://www.thecomputerstoreks.com`
- `http://localhost:3000` (development)

## Integration Examples

### Static HTML Site (JavaScript)

```javascript
// From config.js
const API_URL = 'https://computer-store-ks.onrender.com';

async function submitContactForm(formData) {
  const response = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      subject: formData.subject || 'General',
      message: formData.message
    })
  });
  return response.json();
}
```

### cURL Example

```bash
curl -X POST https://computer-store-ks.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "General",
    "message": "This is a test message for the contact form."
  }'
```
