# API Reference

Computer Store KS provides REST API endpoints for gallery management, authentication, and contact forms.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://yourdomain.com/api`

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

## Contact Form

### Submit Contact Form

```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "message": "I have a question about your services."
}
```

**Response (Success)**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Response (Error)**
```json
{
  "success": false,
  "error": "Failed to send message"
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
| 500 | Server Error - Internal error |

## Rate Limiting

No rate limiting is currently implemented. For production, consider adding rate limiting via Nginx or middleware.

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
  message: string;
}
```
