# Computer Store KS - System Architecture

This document provides comprehensive architecture documentation for the Computer Store KS website, including system diagrams, data flows, and integration patterns.

**Version:** 1.0.0
**Last Updated:** 2026-01-12
**Status:** Production

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Application Layers](#2-application-layers)
3. [Authentication Flow](#3-authentication-flow)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Integration Architecture](#5-integration-architecture)
6. [Deployment Architecture](#6-deployment-architecture)

---

## 1. System Architecture Overview

### 1.1 High-Level System Diagram

```mermaid
flowchart TB
    subgraph Users["Users"]
        Customer["Customer"]
        Employee["Employee/Admin"]
    end

    subgraph Frontend["Frontend (Next.js 14)"]
        PublicPages["Public Pages<br/>(public)/"]
        AdminPages["Admin Dashboard<br/>/admin"]
        PortalPages["Customer Portal<br/>/portal"]
    end

    subgraph APILayer["API Layer (Next.js Routes)"]
        AuthAPI["Auth API<br/>/api/auth"]
        BlogAPI["Blog API<br/>/api/blog"]
        GalleryAPI["Gallery API<br/>/api/gallery"]
        ContactAPI["Contact API<br/>/api/contact"]
        RepairShoprAPI["RepairShopr API<br/>/api/repairshopr"]
    end

    subgraph Libraries["Core Libraries"]
        AuthLib["auth.ts<br/>Session Management"]
        SupabaseLib["supabase.ts<br/>Database Client"]
        RepairShoprLib["repairshopr.ts<br/>CRM Client"]
        EmailLib["email.ts<br/>Resend Client"]
        GitHubLib["github.ts<br/>Image Storage"]
        SpamLib["spam-detection.ts<br/>Bot Protection"]
    end

    subgraph ExternalServices["External Services"]
        Supabase["Supabase<br/>(PostgreSQL)"]
        RepairShopr["RepairShopr<br/>(CRM)"]
        GitHub["GitHub API<br/>(Images)"]
        Resend["Resend<br/>(Email)"]
        Turnstile["Cloudflare<br/>Turnstile"]
        GoogleBusiness["Google Business<br/>Profile API"]
        NinjaOne["NinjaOne<br/>(RMM)"]
    end

    Customer --> PublicPages
    Customer --> PortalPages
    Employee --> AdminPages

    PublicPages --> ContactAPI
    PublicPages --> BlogAPI
    PublicPages --> GalleryAPI

    AdminPages --> AuthAPI
    AdminPages --> BlogAPI
    AdminPages --> GalleryAPI
    AdminPages --> RepairShoprAPI

    PortalPages --> AuthAPI
    PortalPages --> RepairShoprAPI

    AuthAPI --> AuthLib
    BlogAPI --> SupabaseLib
    GalleryAPI --> SupabaseLib
    GalleryAPI --> GitHubLib
    ContactAPI --> EmailLib
    ContactAPI --> SpamLib
    RepairShoprAPI --> RepairShoprLib

    AuthLib --> Supabase
    AuthLib --> RepairShopr
    SupabaseLib --> Supabase
    RepairShoprLib --> RepairShopr
    GitHubLib --> GitHub
    EmailLib --> Resend
    SpamLib --> Turnstile
```

### 1.2 Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Public Pages** | Customer-facing website, blog, gallery, contact form |
| **Admin Dashboard** | Employee portal for CRM, tickets, blog/gallery management |
| **Customer Portal** | Ticket status, account management for customers |
| **API Layer** | RESTful endpoints for all data operations |
| **Core Libraries** | Reusable clients for external services |
| **Supabase** | Primary database, auth, and real-time features |
| **RepairShopr** | CRM system for customers, tickets, invoices |
| **GitHub** | Image storage for gallery and blog |
| **Resend** | Transactional email delivery |

---

## 2. Application Layers

### 2.1 Three-Tier Architecture

```mermaid
flowchart TB
    subgraph PresentationLayer["Presentation Layer"]
        direction TB

        subgraph PublicRoutes["Public Routes (public)/"]
            HomePage["/ - Homepage"]
            AboutPage["/about"]
            ContactPage["/contact"]
            GalleryPage["/gallery"]
            BlogPage["/blog/*"]
            ServicesPage["/services/*"]
            ReviewsPage["/reviews"]
            SilverPlanPage["/silver-plan"]
            WhyLinuxPage["/why-linux"]
        end

        subgraph AdminRoutes["Admin Routes /admin"]
            AdminDashboard["/admin - Dashboard"]
            AdminTickets["/admin/tickets"]
            AdminCustomers["/admin/customers"]
            AdminBlog["/admin/blog"]
            AdminGallery["/admin/gallery"]
            AdminEmployees["/admin/employees"]
            AdminIntake["/admin/intake"]
        end

        subgraph APIRoutes["API Routes /api"]
            AuthRoutes["/api/auth/*"]
            BlogRoutes["/api/blog/*"]
            GalleryRoutes["/api/gallery/*"]
            ContactRoutes["/api/contact"]
            RepairShoprRoutes["/api/repairshopr/*"]
            HealthRoutes["/api/health"]
        end
    end

    subgraph BusinessLayer["Business Logic Layer"]
        direction TB

        subgraph AuthModule["Authentication Module"]
            AuthTS["auth.ts<br/>Session management"]
            SessionCookie["session-cookie.ts<br/>AES-256-GCM encryption"]
            RoleHelpers["role-helpers.ts<br/>RBAC permissions"]
        end

        subgraph DataModule["Data Module"]
            SupabaseTS["supabase.ts<br/>DB operations"]
            RepairShoprTS["repairshopr.ts<br/>CRM operations"]
        end

        subgraph IntegrationModule["Integration Module"]
            EmailTS["email.ts<br/>Resend client"]
            GitHubTS["github.ts<br/>Image upload"]
            GoogleBusinessTS["google-business.ts<br/>Reviews/posts"]
            NinjaOneTS["ninjaone.ts<br/>RMM client"]
        end

        subgraph ProtectionModule["Protection Module"]
            SpamDetection["spam-detection.ts<br/>Multi-layer spam"]
            SpamPatterns["spam-patterns.ts<br/>Pattern matching"]
            DisposableEmail["disposable-email.ts<br/>Email validation"]
        end
    end

    subgraph DataLayer["Data Access Layer"]
        direction TB

        Supabase["Supabase PostgreSQL<br/>- blog_posts<br/>- blog_categories<br/>- blog_tags<br/>- gallery_computers<br/>- gallery_sales<br/>- user_profiles<br/>- ticket_status_overrides<br/>- customer_silver_plans<br/>- asset_protection_plans"]

        RepairShopr["RepairShopr API<br/>- Customers<br/>- Tickets<br/>- Assets<br/>- Invoices<br/>- Payments"]

        GitHub["GitHub API<br/>- Image storage<br/>- CDN delivery"]

        ResendService["Resend API<br/>- Contact notifications<br/>- Confirmations"]
    end

    PresentationLayer --> BusinessLayer
    BusinessLayer --> DataLayer
```

### 2.2 Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public route group
│   │   ├── page.tsx              # Homepage
│   │   ├── about/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx          # Blog listing
│   │   │   └── [slug]/page.tsx   # Blog post
│   │   ├── contact/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx          # Services hub
│   │   │   ├── diagnostics/
│   │   │   ├── virus-removal/
│   │   │   └── [...]             # 10 service pages
│   │   ├── silver-plan/page.tsx
│   │   └── why-linux/page.tsx
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx              # Reception dashboard
│   │   ├── blog/
│   │   ├── customers/
│   │   ├── gallery/
│   │   ├── intake/
│   │   ├── tickets/
│   │   │   ├── page.tsx          # Ticket list
│   │   │   └── [id]/page.tsx     # Ticket detail
│   │   └── employees/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── gallery/
│   │   ├── health/
│   │   └── repairshopr/
│   ├── layout.tsx                # Root layout
│   └── middleware.ts             # Auth/security middleware
├── components/
│   ├── admin/                    # Admin UI components
│   ├── gallery/                  # Gallery components
│   └── static/                   # Header, Footer, etc.
├── lib/                          # Core libraries
│   ├── auth.ts                   # Session management
│   ├── supabase.ts               # Database client
│   ├── repairshopr.ts            # CRM client
│   ├── email.ts                  # Email client
│   ├── github.ts                 # Image storage
│   ├── google-business.ts        # GBP integration
│   ├── ninjaone.ts               # RMM integration
│   ├── spam-detection.ts         # Bot protection
│   └── role-helpers.ts           # RBAC utilities
├── types/                        # TypeScript types
└── styles/                       # CSS/Tailwind
```

---

## 3. Authentication Flow

### 3.1 Authentication Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant F as Frontend
    participant M as Middleware
    participant A as /api/auth/login
    participant S as Supabase Auth
    participant P as user_profiles
    participant C as Cookie Store

    U->>F: Navigate to /login
    F->>U: Display login form

    U->>F: Submit credentials
    F->>A: POST /api/auth/login

    A->>S: signInWithPassword(email, password)

    alt Invalid credentials
        S-->>A: Error: Invalid credentials
        A-->>F: 401 Unauthorized
        F-->>U: Show error message
    else Valid credentials
        S-->>A: User object + session
        A->>P: SELECT * FROM user_profiles WHERE id = user.id
        P-->>A: Profile with roles

        Note over A: Create session data
        A->>A: createSessionData(user, roles)
        A->>A: encryptSession(AES-256-GCM)

        A->>C: Set admin_session cookie (httpOnly)
        A->>C: Set user_role cookie (httpOnly)

        A-->>F: 200 OK + user data
        F-->>U: Redirect to dashboard
    end

    U->>F: Navigate to /admin/*
    F->>M: Request with cookies

    M->>M: Extract session cookie
    M->>M: decryptSession(AES-256-GCM)

    alt Session invalid/expired
        M-->>F: 302 Redirect to /login
    else Session valid
        M->>M: canAccessRoute(roles, path)
        alt Unauthorized for route
            M-->>F: 302 Redirect with error
        else Authorized
            M-->>F: Continue to route
            F-->>U: Display admin page
        end
    end
```

### 3.2 Session Cookie Encryption

The system uses **AES-256-GCM** encryption for session cookies:

```mermaid
flowchart LR
    subgraph Encryption["Session Creation"]
        SessionData["Session Data<br/>userId, email, role, roles"]
        JSON["JSON.stringify()"]
        Key["SESSION_SECRET<br/>(32 bytes)"]
        IV["Random IV<br/>(12 bytes)"]
        AES["AES-256-GCM<br/>Encrypt"]
        Combined["IV + AuthTag + Ciphertext"]
        Base64["Base64 Encode"]
        Cookie["admin_session Cookie"]
    end

    SessionData --> JSON --> AES
    Key --> AES
    IV --> AES
    AES --> Combined --> Base64 --> Cookie
```

**Session Data Structure:**

```typescript
interface SessionData {
  userId: number;           // RepairShopr user/customer ID
  supabaseUserId: string;   // Supabase auth.users UUID
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'limited';
  roles: string[];          // Multi-role array
  userType: 'employee' | 'customer';
  location_id: string | null;
  apiToken?: string;        // Deprecated: RepairShopr token
  expiresAt: number;        // Unix timestamp
}
```

### 3.3 Role-Based Access Control

```mermaid
flowchart TB
    subgraph Roles["Role Hierarchy"]
        Owner["owner<br/>Full access"]
        LeadDev["lead_developer<br/>Full access"]
        Manager["manager<br/>Business operations"]
        LeadTech["lead_technician<br/>Technical lead"]
        Technician["technician<br/>Repair work"]
        Receptionist["receptionist<br/>Front desk"]
        SocialMedia["social_media<br/>Blog/marketing"]
        Customer["customer<br/>Portal only"]
    end

    subgraph Routes["Route Permissions"]
        AdminSettings["/admin/settings<br/>owner, lead_developer"]
        AdminUsers["/admin/users<br/>owner, manager"]
        AdminBlog["/admin/blog<br/>owner, manager, social_media"]
        AdminTickets["/admin/tickets<br/>All employees"]
        AdminGallery["/admin/gallery<br/>All employees"]
        Portal["/portal<br/>customer, all employees"]
    end

    Owner --> AdminSettings
    LeadDev --> AdminSettings
    Owner --> AdminUsers
    Manager --> AdminUsers
    Owner --> AdminBlog
    Manager --> AdminBlog
    SocialMedia --> AdminBlog
    Owner & LeadDev & Manager & LeadTech & Technician & Receptionist --> AdminTickets
    Owner & LeadDev & Manager & LeadTech & Technician & Receptionist --> AdminGallery
    Customer --> Portal
```

---

## 4. Data Flow Diagrams

### 4.1 Blog System Data Flow

```mermaid
flowchart TB
    subgraph Admin["Admin (Employee)"]
        CreatePost["Create/Edit Post"]
        UploadImage["Upload Image"]
    end

    subgraph BlogAPI["Blog API Routes"]
        PostBlog["POST /api/blog"]
        GetBlog["GET /api/blog"]
        PutBlog["PUT /api/blog/[id]"]
        UploadAPI["POST /api/blog/upload"]
    end

    subgraph Supabase["Supabase"]
        BlogPosts["blog_posts"]
        BlogCategories["blog_categories"]
        BlogTags["blog_tags"]
        PostTags["blog_post_tags"]
        Storage["Supabase Storage<br/>(images)"]
    end

    subgraph GitHub["GitHub"]
        GHImages["Image Repository"]
    end

    subgraph Public["Public Website"]
        BlogList["/blog"]
        BlogPost["/blog/[slug]"]
    end

    CreatePost --> PostBlog
    CreatePost --> PutBlog
    UploadImage --> UploadAPI

    PostBlog --> BlogPosts
    PutBlog --> BlogPosts
    UploadAPI --> Storage
    UploadAPI --> GHImages

    PostBlog -.-> BlogCategories
    PostBlog -.-> PostTags
    PostTags -.-> BlogTags

    GetBlog --> BlogPosts
    GetBlog -.-> BlogCategories
    GetBlog -.-> PostTags

    BlogList --> GetBlog
    BlogPost --> GetBlog
```

**Blog Tables Schema:**

| Table | Purpose |
|-------|---------|
| `blog_posts` | Main posts with title, slug, content, status |
| `blog_categories` | Categories for posts |
| `blog_tags` | Tags for posts |
| `blog_post_tags` | Many-to-many junction table |

### 4.2 Gallery System Data Flow

```mermaid
flowchart TB
    subgraph Admin["Admin"]
        AddComputer["Add Computer"]
        EditComputer["Edit Computer"]
        UploadImage["Upload Image"]
        SetSale["Set Active Sale"]
    end

    subgraph GalleryAPI["Gallery API"]
        PostGallery["POST /api/gallery"]
        PutGallery["PUT /api/gallery/[id]"]
        UploadGalleryAPI["POST /api/gallery/upload"]
        SaleAPI["POST /api/gallery/sale"]
    end

    subgraph Supabase["Supabase"]
        Computers["gallery_computers"]
        Sales["gallery_sales"]
    end

    subgraph GitHub["GitHub"]
        ImageRepo["Computer Images<br/>public/images/gallery"]
    end

    subgraph Public["Public Website"]
        GalleryPage["/gallery"]
    end

    AddComputer --> PostGallery
    EditComputer --> PutGallery
    UploadImage --> UploadGalleryAPI
    SetSale --> SaleAPI

    PostGallery --> Computers
    PutGallery --> Computers
    UploadGalleryAPI --> ImageRepo
    SaleAPI --> Sales

    GalleryPage --> Computers
    GalleryPage --> Sales

    Note over GalleryPage: "Sale pricing applied<br/>at query time"
```

**Gallery Tables Schema:**

| Table | Fields |
|-------|--------|
| `gallery_computers` | id, name, type, category, price, image_url, specs[], is_active |
| `gallery_sales` | id, sale_type, name, discount_percent, applies_to[], is_active |

### 4.3 Ticket Management Data Flow

```mermaid
flowchart TB
    subgraph Employee["Employee Portal"]
        ViewTickets["View Tickets"]
        UpdateStatus["Update Custom Status"]
        AddNote["Add Note"]
    end

    subgraph TicketAPI["Ticket API Routes"]
        SearchTickets["GET /api/repairshopr/tickets"]
        GetTicket["GET /api/repairshopr/tickets/[id]"]
        UpdateTicket["PUT /api/repairshopr/tickets/[id]"]
        StatusAPI["POST /api/repairshopr/tickets/status/[id]"]
        NotesAPI["POST /api/repairshopr/tickets/[id]/notes"]
    end

    subgraph RepairShopr["RepairShopr CRM"]
        RSTickets["Tickets"]
        RSCustomers["Customers"]
        RSAssets["Assets"]
    end

    subgraph Supabase["Supabase"]
        StatusOverrides["ticket_status_overrides"]
        StatusDefs["ticket_status_definitions"]
        PublicNotes["ticket_public_notes"]
    end

    ViewTickets --> SearchTickets
    ViewTickets --> GetTicket
    UpdateStatus --> StatusAPI
    AddNote --> NotesAPI

    SearchTickets --> RSTickets
    GetTicket --> RSTickets
    GetTicket --> RSCustomers
    UpdateTicket --> RSTickets

    StatusAPI --> StatusOverrides
    StatusAPI -.-> StatusDefs

    NotesAPI --> RSTickets
    NotesAPI --> PublicNotes

    Note over StatusOverrides: "Custom status layer<br/>on top of RS status"
```

**Custom Status System:**

The system maintains custom ticket statuses on top of RepairShopr:

| Custom Status | Display Name | RS Status | Customer Visible |
|--------------|--------------|-----------|-----------------|
| new | New | New | Received |
| diagnosing | Diagnosing | In Progress | Being Diagnosed |
| repairing | Repairing | In Progress | Being Repaired |
| waiting_for_parts | Waiting for Parts | Waiting for Parts | Waiting for Parts |
| call_customer | Call Customer | Customer Reply | We Have a Question |
| ready_for_pickup | Ready for Pickup | Done Shelf | Ready for Pickup |
| completed | Completed | Resolved | Completed |

### 4.4 Contact Form Submission Flow

```mermaid
flowchart TB
    subgraph Client["Client Browser"]
        Form["Contact Form"]
        Turnstile["Cloudflare Turnstile"]
        Honeypots["Hidden Honeypot Fields"]
        Timing["Page Load Timestamp"]
        Fingerprint["Browser Fingerprint"]
    end

    subgraph ContactAPI["POST /api/contact"]
        RateLimit["Rate Limiting<br/>10 req/min per IP"]
        Validation["Zod Validation"]
        SpamCheck["Multi-Layer Spam Detection"]
        SendEmail["Send Emails"]
    end

    subgraph SpamDetection["Spam Detection Layers"]
        Content["Content Analysis<br/>Entropy, word validity"]
        Patterns["Pattern Detection<br/>Keywords, links, caps"]
        TimingCheck["Timing Validation<br/>Min 3s page time"]
        HoneypotCheck["Honeypot Check<br/>Hidden fields"]
        DisposableCheck["Disposable Email<br/>Detection"]
        TurnstileVerify["Turnstile Verification"]
        GibberishCheck["Gibberish Detection"]
        NameValidation["Name Validation"]
    end

    subgraph Actions["Spam Score Actions"]
        Allow["0-49: Allow<br/>Send emails"]
        Log["50-79: Log<br/>Send + monitor"]
        Block["80-119: Block<br/>Show error"]
        Silent["120+: Silent Success<br/>Fake success"]
    end

    subgraph EmailService["Resend"]
        Notification["Notification Email<br/>To: store"]
        Confirmation["Confirmation Email<br/>To: customer"]
    end

    Form --> RateLimit
    Turnstile --> RateLimit
    Honeypots --> RateLimit
    Timing --> RateLimit
    Fingerprint --> RateLimit

    RateLimit --> Validation
    Validation --> SpamCheck

    SpamCheck --> Content
    SpamCheck --> Patterns
    SpamCheck --> TimingCheck
    SpamCheck --> HoneypotCheck
    SpamCheck --> DisposableCheck
    SpamCheck --> TurnstileVerify
    SpamCheck --> GibberishCheck
    SpamCheck --> NameValidation

    Content & Patterns & TimingCheck & HoneypotCheck & DisposableCheck & TurnstileVerify & GibberishCheck & NameValidation --> Actions

    Allow --> SendEmail
    Log --> SendEmail
    Block --> |Error Response| Client
    Silent --> |Fake Success| Client

    SendEmail --> Notification
    SendEmail --> Confirmation
```

### 4.5 Customer/Family Management Data Flow

```mermaid
flowchart TB
    subgraph Employee["Employee Portal"]
        SearchCustomer["Search Customer"]
        ViewCustomer["View Customer Details"]
        CreateCustomer["Create Customer"]
        ManageAssets["Manage Assets"]
        SetProtection["Set Protection Plan"]
    end

    subgraph CustomerAPI["Customer API Routes"]
        SearchAPI["GET /api/repairshopr/customers?q="]
        GetAPI["GET /api/repairshopr/customers/[id]"]
        CreateAPI["POST /api/repairshopr/customers"]
        AssetsAPI["GET/POST /api/repairshopr/customers/[id]/assets"]
        ProtectionAPI["POST /api/repairshopr/customers/[id]/protection"]
    end

    subgraph RepairShopr["RepairShopr"]
        RSCustomers["Customers"]
        RSAssets["Customer Assets"]
    end

    subgraph Supabase["Supabase"]
        CustomerPlans["customer_silver_plans"]
        AssetPlans["asset_protection_plans"]
        RSSync["rs_customers<br/>(synced data)"]
    end

    SearchCustomer --> SearchAPI
    ViewCustomer --> GetAPI
    CreateCustomer --> CreateAPI
    ManageAssets --> AssetsAPI
    SetProtection --> ProtectionAPI

    SearchAPI --> RSCustomers
    GetAPI --> RSCustomers
    GetAPI --> RSAssets
    CreateAPI --> RSCustomers
    AssetsAPI --> RSAssets

    GetAPI --> CustomerPlans
    GetAPI --> AssetPlans
    ProtectionAPI --> CustomerPlans
    ProtectionAPI --> AssetPlans

    RSCustomers --> RSSync

    Note over AssetPlans: "Per-asset protection<br/>eset, silver, silver-plus"
```

**Protection Plan Tiers:**

| Tier | Description |
|------|-------------|
| `eset` | Basic ESET antivirus only |
| `silver` | Silver protection plan |
| `silver-plus` | Silver+ premium plan |

---

## 5. Integration Architecture

### 5.1 RepairShopr CRM Integration

```mermaid
flowchart LR
    subgraph App["Computer Store KS"]
        RepairShoprLib["repairshopr.ts"]
        SharedKey["REPAIRSHOPR_API_KEY<br/>(Shared)"]
    end

    subgraph RepairShoprAPI["RepairShopr API"]
        direction TB
        Auth["POST /sign_in"]
        Me["GET /me"]
        Customers["GET/POST /customers"]
        Tickets["GET/POST /tickets"]
        Assets["GET/POST /customer_assets"]
        Invoices["GET /invoices"]
        Payments["GET /payments"]
    end

    subgraph RateLimiting["Rate Limiting"]
        Limit["180 requests/minute"]
        Tracking["Request counter<br/>+ window tracking"]
    end

    RepairShoprLib --> SharedKey
    SharedKey --> Auth
    SharedKey --> Me
    SharedKey --> Customers
    SharedKey --> Tickets
    SharedKey --> Assets
    SharedKey --> Invoices
    SharedKey --> Payments

    RepairShoprLib --> Tracking
    Tracking --> Limit
```

**RepairShopr Client Features:**

- **Rate Limiting:** 180 requests per minute with automatic tracking
- **Error Handling:** Custom `RepairShoprAPIError` with status codes
- **Shared API Key:** Single key for all operations (audit via Supabase)
- **Type Safety:** Full TypeScript interfaces for all entities

### 5.2 NinjaOne RMM Integration

```mermaid
flowchart LR
    subgraph App["Computer Store KS"]
        NinjaOneLib["ninjaone.ts"]
        OAuth["OAuth2 Client<br/>Credentials Flow"]
    end

    subgraph NinjaOneAPI["NinjaOne API"]
        TokenEndpoint["POST /ws/oauth/token"]
        Organizations["GET /organizations"]
        Devices["GET /devices"]
        Activities["GET /activities"]
    end

    subgraph Cache["Token Cache"]
        AccessToken["Access Token<br/>+ Expiry"]
    end

    NinjaOneLib --> OAuth
    OAuth --> TokenEndpoint
    TokenEndpoint --> AccessToken

    NinjaOneLib --> Organizations
    NinjaOneLib --> Devices
    NinjaOneLib --> Activities

    AccessToken -.-> Organizations
    AccessToken -.-> Devices
    AccessToken -.-> Activities
```

### 5.3 Supabase Database Integration

```mermaid
flowchart TB
    subgraph Clients["Supabase Clients"]
        AnonClient["supabase<br/>(anon key)<br/>Public reads"]
        AdminClient["supabaseAdmin<br/>(service role)<br/>Bypass RLS"]
        FreshClient["createFreshAdminClient()<br/>Auth operations"]
    end

    subgraph Tables["Database Tables"]
        direction TB

        subgraph BlogTables["Blog System"]
            BlogPosts["blog_posts"]
            BlogCategories["blog_categories"]
            BlogTags["blog_tags"]
            BlogPostTags["blog_post_tags"]
        end

        subgraph GalleryTables["Gallery System"]
            Computers["gallery_computers"]
            Sales["gallery_sales"]
        end

        subgraph TicketTables["Ticket System"]
            StatusDefs["ticket_status_definitions"]
            StatusOverrides["ticket_status_overrides"]
            PublicNotes["ticket_public_notes"]
        end

        subgraph CustomerTables["Customer System"]
            UserProfiles["user_profiles"]
            CustomerPlans["customer_silver_plans"]
            AssetPlans["asset_protection_plans"]
            RSCustomers["rs_customers"]
            RSAssets["rs_assets"]
        end
    end

    subgraph RLS["Row-Level Security"]
        PublicRead["Public: SELECT only"]
        AuthRequired["Authenticated required"]
        RoleCheck["Role-based policies"]
    end

    AnonClient --> BlogPosts
    AnonClient --> Computers
    AnonClient --> PublicRead

    AdminClient --> BlogTables
    AdminClient --> GalleryTables
    AdminClient --> TicketTables
    AdminClient --> CustomerTables

    FreshClient --> UserProfiles
```

### 5.4 GitHub Image Storage Integration

```mermaid
flowchart LR
    subgraph App["Computer Store KS"]
        GitHubLib["github.ts"]
        UploadFn["uploadImage()"]
        DeleteFn["deleteImage()"]
    end

    subgraph GitHubAPI["GitHub API"]
        Contents["PUT /repos/:owner/:repo/contents/:path"]
        Delete["DELETE /repos/:owner/:repo/contents/:path"]
    end

    subgraph Repository["GitHub Repository"]
        GalleryImages["public/images/gallery/"]
        BlogImages["public/images/blog/"]
    end

    subgraph CDN["Delivery"]
        RawURL["raw.githubusercontent.com"]
        jsDelivr["cdn.jsdelivr.net"]
    end

    GitHubLib --> UploadFn
    GitHubLib --> DeleteFn

    UploadFn --> Contents
    DeleteFn --> Delete

    Contents --> GalleryImages
    Contents --> BlogImages

    GalleryImages --> RawURL
    BlogImages --> RawURL
    RawURL --> jsDelivr
```

### 5.5 Email Service Integration (Resend)

```mermaid
flowchart LR
    subgraph App["Computer Store KS"]
        EmailLib["email.ts"]
        ContactNotify["sendContactNotification()"]
        ContactConfirm["sendContactConfirmation()"]
    end

    subgraph Resend["Resend API"]
        SendEndpoint["POST /emails"]
    end

    subgraph Templates["Email Templates"]
        NotifyTemplate["Store Notification<br/>HTML template"]
        ConfirmTemplate["Customer Confirmation<br/>HTML template"]
    end

    subgraph Recipients["Recipients"]
        Store["contact@computerstoreks.com"]
        Customer["Customer Email"]
    end

    EmailLib --> ContactNotify
    EmailLib --> ContactConfirm

    ContactNotify --> NotifyTemplate
    ContactConfirm --> ConfirmTemplate

    NotifyTemplate --> SendEndpoint
    ConfirmTemplate --> SendEndpoint

    SendEndpoint --> Store
    SendEndpoint --> Customer
```

### 5.6 Google Business Profile Integration

```mermaid
flowchart LR
    subgraph App["Computer Store KS"]
        GBPLib["google-business.ts"]
        FetchReviews["fetchReviews()"]
        FetchPosts["fetchPosts()"]
        FetchInfo["fetchBusinessInfo()"]
    end

    subgraph OAuth["OAuth2"]
        RefreshToken["Refresh Token"]
        AccessToken["Access Token"]
        TokenRefresh["Token Refresh Flow"]
    end

    subgraph APIs["Google APIs"]
        ReviewsAPI["mybusiness.googleapis.com<br/>/reviews"]
        PostsAPI["mybusiness.googleapis.com<br/>/localPosts"]
        InfoAPI["mybusinessbusinessinformation.googleapis.com"]
    end

    subgraph Cache["Memory Cache"]
        CachedData["15-minute TTL<br/>Reviews, Posts, Info"]
    end

    GBPLib --> RefreshToken
    RefreshToken --> TokenRefresh
    TokenRefresh --> AccessToken

    GBPLib --> FetchReviews --> ReviewsAPI
    GBPLib --> FetchPosts --> PostsAPI
    GBPLib --> FetchInfo --> InfoAPI

    ReviewsAPI --> CachedData
    PostsAPI --> CachedData
    InfoAPI --> CachedData
```

### 5.7 Cloudflare Turnstile Integration

```mermaid
sequenceDiagram
    participant Browser
    participant Turnstile as Cloudflare Turnstile
    participant API as /api/contact
    participant Verify as Turnstile Verify API

    Browser->>Turnstile: Load Turnstile widget
    Turnstile->>Browser: Display challenge

    Browser->>Turnstile: User interaction
    Turnstile->>Browser: Return token

    Browser->>API: POST with turnstile token

    API->>Verify: POST siteverify with token + secret

    alt Verification Success
        Verify-->>API: { success: true }
        API-->>Browser: Continue processing
    else Verification Failed
        Verify-->>API: { success: false }
        API-->>Browser: 400 Block (score +200)
    end
```

---

## 6. Deployment Architecture

### 6.1 Render Deployment Diagram

```mermaid
flowchart TB
    subgraph GitHub["GitHub Repository"]
        ProdBranch["Production Branch"]
        DevBranch["Development Branch"]
    end

    subgraph Render["Render Platform"]
        subgraph ProdService["CSK-Production"]
            ProdBuild["npm install && npm run build"]
            ProdStart["node .next/standalone/server.js"]
            ProdEnv["Environment Variables<br/>Production secrets"]
        end

        subgraph DevService["CSK-Development"]
            DevBuild["npm install && npm run build"]
            DevStart["node .next/standalone/server.js"]
            DevEnv["Environment Variables<br/>Dev secrets"]
        end
    end

    subgraph Domains["Domains"]
        ProdDomain["computerstoreks.com"]
        DevDomain["csk-development.onrender.com"]
    end

    subgraph External["External Services"]
        Supabase["Supabase<br/>(shared)"]
        RepairShopr["RepairShopr<br/>(shared)"]
        Resend["Resend<br/>(shared)"]
    end

    ProdBranch -->|Auto Deploy| ProdService
    DevBranch -->|Auto Deploy| DevService

    ProdService --> ProdDomain
    DevService --> DevDomain

    ProdService --> External
    DevService --> External
```

### 6.2 Branch Strategy

```mermaid
gitgraph
    commit id: "Initial"
    branch Development
    checkout Development
    commit id: "Feature A"
    commit id: "Feature B"
    commit id: "Bug Fix"
    checkout main
    merge Development id: "Release v1.0" tag: "Production"
    checkout Development
    commit id: "Feature C"
    commit id: "Feature D"
    checkout main
    merge Development id: "Release v1.1" tag: "Production"
```

**Branch Rules:**

| Branch | Purpose | Deployment |
|--------|---------|------------|
| `Production` | Live site | computerstoreks.com |
| `Development` | Testing/staging | csk-development.onrender.com |

**Workflow:**

1. All work done in `Development` branch
2. Test thoroughly on dev deployment
3. Merge to `Production` for live release
4. Render auto-deploys from both branches

### 6.3 CI/CD Flow

```mermaid
flowchart LR
    subgraph Developer["Developer"]
        Code["Code Changes"]
        Push["git push"]
    end

    subgraph GitHub["GitHub"]
        PR["Pull Request"]
        Merge["Merge to Branch"]
        Webhook["Webhook to Render"]
    end

    subgraph Render["Render Build"]
        Install["npm install"]
        Build["npm run build"]
        Standalone["Copy to standalone"]
        Deploy["Deploy Container"]
        Health["Health Check"]
    end

    subgraph Monitoring["Monitoring"]
        UptimeRobot["UptimeRobot<br/>5-min checks"]
        Logs["Render Logs"]
    end

    Code --> Push --> PR --> Merge --> Webhook
    Webhook --> Install --> Build --> Standalone --> Deploy --> Health
    Deploy --> UptimeRobot
    Deploy --> Logs
```

### 6.4 Environment Configuration

```mermaid
flowchart TB
    subgraph Required["Required Variables"]
        Supabase["NEXT_PUBLIC_SUPABASE_URL<br/>NEXT_PUBLIC_SUPABASE_ANON_KEY<br/>SUPABASE_SERVICE_ROLE_KEY"]
        Auth["SESSION_SECRET<br/>REPAIRSHOPR_SUBDOMAIN<br/>REPAIRSHOPR_API_KEY"]
        Email["RESEND_API_KEY<br/>NOTIFICATION_EMAIL"]
    end

    subgraph Optional["Optional Variables"]
        GitHub["GITHUB_TOKEN<br/>GITHUB_OWNER<br/>GITHUB_REPO"]
        Turnstile["TURNSTILE_SITE_KEY<br/>TURNSTILE_SECRET_KEY"]
        Google["GOOGLE_BUSINESS_*"]
        NinjaOne["NINJAONE_*"]
    end

    subgraph Runtime["Runtime Config"]
        NodeEnv["NODE_ENV=production"]
        Port["PORT=3000"]
        Hostname["HOSTNAME=0.0.0.0"]
        NodeVersion["NODE_VERSION=20.11.0"]
    end
```

---

## Summary

This architecture documentation covers:

1. **System Overview** - High-level component diagram showing all integrations
2. **Application Layers** - Three-tier architecture with presentation, business logic, and data access
3. **Authentication** - Dual-mode auth (Supabase + RepairShopr legacy) with AES-256-GCM session encryption
4. **Data Flows** - Detailed flows for blog, gallery, tickets, contacts, and customer management
5. **Integrations** - RepairShopr CRM, NinjaOne RMM, Supabase, GitHub, Resend, Google Business, Turnstile
6. **Deployment** - Render dual-environment setup with Production/Development branches

For additional details, see:
- `CLAUDE.md` - Project overview and development guide
- `docs/database/` - Database schema documentation
- `.env.example` - Environment variable reference
