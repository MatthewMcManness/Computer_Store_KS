# Computer Store KS

> Professional website and employee portal for The Computer Store, a computer repair and sales business in Topeka, Kansas.

[![Live Site](https://img.shields.io/badge/Live-computerstoreks.com-blue)](https://computerstoreks.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

Computer Store KS is a full-featured website and employee management system designed for a local computer repair shop. The platform combines a public-facing website for customers with a comprehensive admin portal for managing repair tickets, customer relationships, inventory, and business operations.

### What This Project Does

- **Public Website**: Showcases services, refurbished computers, blog posts, and provides contact forms
- **Employee Portal**: Manages customer intake, ticket tracking, inventory, and business operations
- **CRM Integration**: Syncs with RepairShopr for customer and ticket management
- **RMM Integration**: Connects with NinjaOne for remote device monitoring
- **Customer Portal**: Allows customers to view their tickets, invoices, and devices

### Target Users

- **Customers**: Browse services, view available computers, read blog posts, submit contact forms
- **Employees**: Manage customer intake, track repair tickets, update inventory, handle business operations
- **Business Owners**: Monitor business metrics, review sales data, manage employee accounts

---

## Key Features

### Public Website

#### Service Pages
- **Homepage**: Hero section, services overview, testimonials, call-to-action
- **Services Hub**: Comprehensive listing of all services offered
- **Individual Service Pages**: Detailed pages for each service (Data Services, OS Installation, Custom Computers, Laptops, Desktops, Diagnostics, Virus Removal, Hardware Upgrades, Windows Debloat, Antivirus)
- **Gallery**: Browsable catalog of refurbished computers with filtering and search
- **Blog System**: Category and tag-based content management with markdown support
- **Contact Form**: Cloudflare Turnstile-protected form with email notifications via Resend
- **Reviews**: Google Business Reviews display widget
- **Why Linux**: Educational page about Linux advantages
- **Silver Plan**: Managed service subscription offering

#### User Experience
- Responsive design with mobile-first approach
- SEO-optimized with structured data (JSON-LD)
- Dynamic breadcrumbs for navigation
- Smooth animations with Framer Motion
- Accessible UI components

### Admin Portal (Employee Portal)

#### Reception Dashboard
- **Customer Intake Wizard**: Multi-step form for new customer onboarding
- **Call Customer Widget**: Auto-refreshing list of tickets needing customer contact
- **System Status**: Quick health checks and operational indicators
- **Quick Actions**: Fast access to common tasks

#### Customer Management
- **Customer Search**: Full-text search with RepairShopr integration
- **Customer Details**: View tickets, assets, invoices, payments, family members
- **Business Accounts**: Manage business customers separately
- **Family Management**: Link related customer accounts

#### Ticket Management
- **Ticket List**: Searchable and filterable by custom status
- **Ticket Details**: Comprehensive view with timeline, notes, and status controls
- **Custom Status System**: Enhanced workflow beyond RepairShopr statuses
  - Status definitions: new, diagnosing, repairing, data_transferring, installing, waiting_for_parts, building, call_customer, waiting_for_customer_reply, ready_for_pickup, completed
  - Customer-visible status mapping
  - Optional customer questions per status
- **Notes System**: Private and public notes with timeline view
- **Silver Plan Badge**: Visual indicator for managed service customers

#### Content Management
- **Gallery Manager**: Add, edit, and publish refurbished computer listings
  - Image upload to GitHub storage
  - Spec management (CPU, RAM, storage, GPU)
  - Sale pricing controls
  - Category filtering (desktop/laptop)
- **Blog Manager**: Create and edit blog posts
  - Markdown content editor
  - Featured image support
  - Category and tag management
  - Draft/publish workflow
  - Image uploads to Supabase storage

#### Employee Management
- **Employee Accounts**: User management with RepairShopr authentication
- **Role-Based Access**: Different permission levels for employees

### External Integrations

#### RepairShopr CRM
- **Authentication**: OAuth-style login with encrypted session cookies
- **Customer Sync**: Real-time customer data retrieval
- **Ticket Management**: Create, update, and track repair tickets
- **Asset Tracking**: Device inventory linked to customers
- **Invoice & Payment Data**: Financial transaction history
- **Family Accounts**: Multi-member household management
- **Webhook Support**: Real-time updates from RepairShopr events

#### NinjaOne RMM
- **Device Monitoring**: Remote device status and health checks
- **Customer Device Linking**: Associate monitored devices with customers by email
- **Device Details**: Hardware specs, software inventory, and agent status

#### Google Business Profile
- **Reviews Display**: Fetch and display customer reviews
- **Business Posts**: Sync promotional posts and updates
- **Business Info**: Location, hours, and contact information

#### Other Services
- **Resend Email**: Transactional emails for contact form and notifications
- **GitHub API**: Image storage for gallery system
- **Cloudflare Turnstile**: Bot protection for contact forms
- **Supabase**: PostgreSQL database for blog, customer portal, and ticket statuses

---

## Tech Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5.9** - Type-safe JavaScript

### Styling
- **Tailwind CSS 3** - Utility-first CSS framework
- **Custom CSS** (`static-styles.css`) - Legacy styles for public pages
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant styling
- **clsx** / **tailwind-merge** - Conditional class utilities

### Database & Storage
- **Supabase** - PostgreSQL database
  - Blog posts and categories
  - Ticket status overrides
  - Customer portal accounts
  - Authentication (planned)
- **GitHub API** - Image storage for gallery
- **Supabase Storage** - Image storage for blog posts

### Authentication & Security
- **RepairShopr API** - Primary authentication provider
- **AES-256-GCM** - Session encryption
- **bcrypt** - Password hashing (legacy mode)
- **Cloudflare Turnstile** - Bot protection
- **Zod** - Runtime type validation
- **@fingerprintjs/fingerprintjs** - Device fingerprinting

### External APIs
- **RepairShopr** - CRM integration for customers, tickets, assets
- **NinjaOne** - RMM integration for device monitoring
- **Google Business Profile** - Reviews and business information
- **Resend** - Email delivery service

### Development Tools
- **npm** - Package manager (Node 20.11.0)
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Sharp** - Image optimization

### Hosting & Infrastructure
- **Render** - Hosting platform
  - Production: `computerstoreks.com`
  - Development: `csk-development.onrender.com`
- **Node.js 20.11.0** - Runtime environment
- **Render Blueprint** (`render.yaml`) - Infrastructure as code

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.11.0 or higher (LTS recommended)
- **npm**: Version 10 or higher (comes with Node.js)
- **Git**: For version control

Optional for full functionality:
- **Supabase Account**: For database and blog features
- **RepairShopr Account**: For CRM integration
- **GitHub Account**: For gallery image storage
- **Resend Account**: For email functionality
- **Cloudflare Account**: For Turnstile bot protection
- **Google Cloud Console**: For Google Business integration
- **NinjaOne Account**: For RMM integration

### Installation

1. **Clone the repository**

   ```bash
   cd /home/matthew/Bast/Projects/Clients/Computer_Store_KS
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Verify installation**

   ```bash
   npm run type-check
   ```

### Environment Setup

1. **Copy the environment template**

   ```bash
   cp .env.example .env
   ```

2. **Configure required environment variables**

   Open `.env` and configure the following minimum variables:

   #### Required for Basic Functionality

   ```bash
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development

   # Authentication (Required for Admin Portal)
   AUTH_MODE=repairshopr
   SESSION_SECRET=<generate-with-openssl-rand-hex-32>
   REPAIRSHOPR_SUBDOMAIN=thecomputerstore

   # Supabase (Required for Blog & Customer Portal)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Email (Required for Contact Form)
   RESEND_API_KEY=re_your_api_key
   NOTIFICATION_EMAIL=contact@computerstoreks.com
   ```

   #### Optional Services

   ```bash
   # GitHub (Gallery Image Storage)
   GITHUB_TOKEN=ghp_your_token
   GITHUB_OWNER=MatthewMcManness
   GITHUB_REPO=Computer_Store_KS
   GITHUB_BRANCH=Development

   # Bot Protection
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
   TURNSTILE_SECRET_KEY=<your-secret-key>

   # NinjaOne RMM
   NINJAONE_API_URL=https://app.ninjarmm.com
   NINJAONE_CLIENT_ID=<your-client-id>
   NINJAONE_CLIENT_SECRET=<your-client-secret>

   # Google Business
   GOOGLE_BUSINESS_CLIENT_ID=<your-client-id>
   GOOGLE_BUSINESS_CLIENT_SECRET=<your-client-secret>
   GOOGLE_BUSINESS_REFRESH_TOKEN=<your-refresh-token>
   GOOGLE_BUSINESS_ACCOUNT_ID=<your-account-id>
   GOOGLE_BUSINESS_LOCATION_ID=<your-location-id>
   ```

3. **Generate secure secrets**

   ```bash
   # Generate SESSION_SECRET (64 hex characters)
   openssl rand -hex 32

   # Or using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Set up Supabase database**

   Run the database schema for blog and ticket status systems:
   - Navigate to your Supabase project SQL Editor
   - Execute the schema files (see Deployment section)

### Running Locally

1. **Start the development server**

   ```bash
   npm run dev
   ```

2. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Access the admin portal**

   Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)

   Login with your RepairShopr credentials (if `AUTH_MODE=repairshopr`)

4. **Common development commands**

   ```bash
   # Run TypeScript type checking
   npm run type-check

   # Run linter
   npm run lint

   # Build for production (test build)
   npm run build

   # Start production build locally
   npm run start

   # Clean build artifacts
   npm run clean
   ```

---

## Project Structure

```
Computer_Store_KS/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication pages (login, register)
│   │   ├── (public)/                 # Public customer-facing pages
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── about/                # About page
│   │   │   ├── blog/                 # Blog listing and posts
│   │   │   ├── contact/              # Contact form
│   │   │   ├── gallery/              # Computer gallery
│   │   │   ├── reviews/              # Customer reviews
│   │   │   ├── services/             # Services hub + 10 service detail pages
│   │   │   ├── silver-plan/          # Managed service offering
│   │   │   └── why-linux/            # Educational content
│   │   ├── admin/                    # Admin portal (protected)
│   │   │   ├── page.tsx              # Reception dashboard
│   │   │   ├── intake/               # Customer intake wizard
│   │   │   ├── customers/            # Customer management
│   │   │   ├── businesses/           # Business accounts
│   │   │   ├── tickets/              # Ticket management with status filters
│   │   │   ├── gallery/              # Gallery CRUD
│   │   │   ├── blog/                 # Blog CRUD
│   │   │   └── reception/            # Reception desk view
│   │   ├── portal/                   # Customer portal
│   │   ├── internal/                 # Internal tools (plan proposals, etc.)
│   │   ├── api/                      # API routes
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── contact/              # Contact form handler
│   │   │   ├── gallery/              # Gallery CRUD + image upload
│   │   │   ├── blog/                 # Blog CRUD + image upload
│   │   │   ├── repairshopr/          # RepairShopr integration
│   │   │   │   ├── customers/        # Customer API
│   │   │   │   ├── businesses/       # Business API
│   │   │   │   ├── tickets/          # Ticket API + status overrides
│   │   │   │   ├── assets/           # Asset API
│   │   │   │   └── families/         # Family account API
│   │   │   ├── ninjaone/             # NinjaOne RMM integration
│   │   │   ├── google-business/      # Google Business Profile API
│   │   │   └── webhooks/             # Webhook handlers
│   │   ├── layout.tsx                # Root layout
│   │   ├── error.tsx                 # Error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   └── global-error.tsx          # Global error handler
│   │
│   ├── components/
│   │   ├── admin/                    # Admin-specific components
│   │   │   ├── admin-header.tsx      # Admin navigation header
│   │   │   ├── admin-shell.tsx       # Admin layout wrapper
│   │   │   ├── intake/               # Customer intake wizard components
│   │   │   ├── computer-form.tsx     # Gallery computer form
│   │   │   ├── gallery-table.tsx     # Gallery management table
│   │   │   └── image-upload.tsx      # Image upload component
│   │   ├── gallery/                  # Gallery display components
│   │   │   ├── gallery-grid.tsx      # Computer grid
│   │   │   ├── flip-card.tsx         # Computer card with flip animation
│   │   │   ├── category-filter.tsx   # Desktop/laptop filter
│   │   │   └── gallery-skeleton.tsx  # Loading skeleton
│   │   ├── home/                     # Homepage components
│   │   │   ├── hero-section.tsx      # Hero banner
│   │   │   ├── services-preview.tsx  # Services overview
│   │   │   ├── testimonials.tsx      # Customer testimonials
│   │   │   ├── stats-section.tsx     # Business stats
│   │   │   └── cta-section.tsx       # Call-to-action section
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx            # Site header
│   │   │   ├── nav.tsx               # Navigation menu
│   │   │   ├── mobile-nav.tsx        # Mobile navigation
│   │   │   ├── footer.tsx            # Site footer
│   │   │   └── container.tsx         # Content container
│   │   ├── forms/                    # Form components
│   │   │   └── contact-form.tsx      # Contact form with validation
│   │   ├── reviews/                  # Review components
│   │   │   ├── ReviewsDisplay.tsx    # Google reviews grid
│   │   │   └── ReviewsWidget.tsx     # Reviews sidebar widget
│   │   ├── seo/                      # SEO components
│   │   │   ├── breadcrumbs.tsx       # Breadcrumb navigation
│   │   │   └── json-ld.tsx           # Structured data
│   │   ├── ui/                       # Generic UI components
│   │   │   ├── button.tsx            # Button variants
│   │   │   ├── card.tsx              # Card component
│   │   │   ├── badge.tsx             # Badge/label component
│   │   │   ├── input.tsx             # Text input
│   │   │   ├── textarea.tsx          # Textarea input
│   │   │   ├── select.tsx            # Select dropdown
│   │   │   ├── modal.tsx             # Modal dialog
│   │   │   ├── skeleton.tsx          # Loading skeleton
│   │   │   ├── chat-widget.tsx       # Chat/support widget
│   │   │   └── mobile-call-button.tsx # Floating call button
│   │   └── animations/               # Animation utilities
│   │       └── motion.tsx            # Framer Motion wrappers
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── auth.ts                   # RepairShopr authentication
│   │   ├── supabase.ts               # Supabase client + ticket status definitions
│   │   ├── github.ts                 # GitHub API for image storage
│   │   ├── email.ts                  # Resend email integration
│   │   ├── repairshopr.ts            # RepairShopr API client
│   │   ├── ninjaone.ts               # NinjaOne RMM client
│   │   ├── google-business.ts        # Google Business API client
│   │   └── utils.ts                  # Helper functions
│   │
│   └── data/                         # Static data files
│       └── gallery.json              # Gallery computer inventory (legacy)
│
├── public/                           # Static assets
│   ├── images/                       # Images
│   ├── icons/                        # Favicons and icons
│   └── robots.txt                    # SEO robots file
│
├── documentation/                    # Project documentation (this folder)
│   ├── README.md                     # This file
│   └── business_info.md              # Client and business information
│
├── .claude/                          # Claude Code PM system
│   ├── agents/                       # Custom agent definitions
│   ├── commands/                     # PM slash commands
│   ├── rules/                        # Development rules
│   ├── prds/                         # Product requirement documents
│   ├── epics/                        # Epic planning and tracking
│   └── PM_GUIDE.md                   # PM system documentation
│
├── scripts/                          # Utility scripts
│   └── migrate-users.ts              # RepairShopr user migration
│
├── _archive/                         # Archived/deprecated code
│   └── ...                           # Legacy static HTML site
│
├── api/                              # Legacy Express.js backend (unused)
│   └── ...                           # Preserved for reference
│
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── CLAUDE.md                         # Project-specific AI instructions
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # npm dependencies and scripts
├── package-lock.json                 # Dependency lock file
└── render.yaml                       # Render deployment blueprint
```

### Key Directories Explained

- **`(auth)/`** - Route group for authentication pages (login, register, password reset)
- **`(public)/`** - Route group for public customer-facing pages with consistent styling
- **`admin/`** - Protected admin portal for employees
- **`portal/`** - Customer self-service portal (view tickets, invoices, devices)
- **`internal/`** - Internal tools not visible to customers or general employees
- **`api/`** - Next.js API routes following RESTful conventions
- **`components/admin/`** - Admin-specific UI components
- **`lib/`** - Business logic, API clients, and utility functions
- **`data/`** - Static JSON data (being phased out in favor of database)
- **`_archive/`** - Deprecated code kept for reference (do NOT use)

---

## Documentation

Comprehensive documentation for different aspects of the project:

### Core Documentation
- **[README.md](README.md)** - This file (overview and getting started)
- **[business_info.md](business_info.md)** - Client information and project context

### Future Documentation (Planned)
- **ARCHITECTURE.md** - System architecture diagrams and design decisions
- **API_REFERENCE.md** - Complete API endpoint documentation
- **ADMIN_PORTAL_GUIDE.md** - Admin features and workflows
- **PUBLIC_WEBSITE_GUIDE.md** - Public site features and content management
- **DATABASE_SCHEMA.md** - Database structure and relationships
- **COMPONENT_LIBRARY.md** - React component documentation
- **HOOKS_AND_UTILITIES.md** - Custom hooks and utility function reference
- **SECURITY.md** - Security implementation and best practices
- **DEPLOYMENT_GUIDE.md** - Deployment instructions and troubleshooting
- **CODE_STATUS_REPORT.md** - Legacy/unused code analysis
- **API_INTEGRATIONS.md** - External API integration reference

### Development Documentation
- **[.claude/PM_GUIDE.md](../.claude/PM_GUIDE.md)** - Project management system guide
- **[.env.example](.env.example)** - Environment variables reference
- **[CLAUDE.md](../CLAUDE.md)** - AI agent instructions for this project

---

## API Endpoints

### Authentication

```
POST   /api/auth/login              # Login with RepairShopr credentials
POST   /api/auth/logout             # Logout and clear session
GET    /api/auth/check              # Verify session validity
```

### Blog

```
GET    /api/blog                    # List published posts (public)
GET    /api/blog?admin=true         # List all posts including drafts (admin)
POST   /api/blog                    # Create new post (admin)
GET    /api/blog/[id]               # Get post by ID or slug
PUT    /api/blog/[id]               # Update post (admin)
DELETE /api/blog/[id]               # Delete post (admin)
POST   /api/blog/upload             # Upload image (admin)
```

### Gallery

```
GET    /api/gallery                 # List all computers
POST   /api/gallery                 # Add computer (admin)
GET    /api/gallery/[id]            # Get single computer
PUT    /api/gallery/[id]            # Update computer (admin)
DELETE /api/gallery/[id]            # Delete computer (admin)
POST   /api/gallery/upload          # Upload image to GitHub (admin)
POST   /api/gallery/sale            # Update sale status (admin)
```

### RepairShopr Integration

#### Customers
```
GET    /api/repairshopr/customers                # Search customers (query: q)
GET    /api/repairshopr/customers/[id]           # Get customer details
GET    /api/repairshopr/customers/[id]/tickets   # Get customer's tickets
GET    /api/repairshopr/customers/[id]/assets    # Get customer's assets
GET    /api/repairshopr/customers/[id]/invoices  # Get customer's invoices
GET    /api/repairshopr/customers/[id]/payments  # Get customer's payments
GET    /api/repairshopr/customers/[id]/family    # Get family members
```

#### Businesses
```
GET    /api/repairshopr/businesses                # List all businesses
GET    /api/repairshopr/businesses/customers      # Get customers for business
```

#### Tickets
```
GET    /api/repairshopr/tickets                   # Search/list tickets (query: q, status)
POST   /api/repairshopr/tickets                   # Create ticket
GET    /api/repairshopr/tickets/[id]              # Get ticket details
PUT    /api/repairshopr/tickets/[id]              # Update ticket
GET    /api/repairshopr/tickets/[id]/public-notes # Get public notes timeline
POST   /api/repairshopr/tickets/[id]/comment      # Add comment/note
GET    /api/repairshopr/tickets/call-customer     # Get tickets needing customer call
POST   /api/repairshopr/tickets/sync-statuses     # Sync status overrides from RepairShopr
```

#### Ticket Status System
```
GET    /api/repairshopr/tickets/status-definitions # Get custom status definitions
GET    /api/repairshopr/tickets/status/[id]        # Get status override for ticket
POST   /api/repairshopr/tickets/status/[id]        # Set/update status override
POST   /api/repairshopr/tickets/status-batch       # Get status overrides for multiple tickets
```

#### Assets
```
GET    /api/repairshopr/assets                    # List all assets
GET    /api/repairshopr/assets/[id]               # Get asset details
```

#### Families
```
GET    /api/repairshopr/families                  # List all families
GET    /api/repairshopr/families/[id]             # Get family details
GET    /api/repairshopr/families/customers        # Get customers in family
```

### NinjaOne RMM

```
GET    /api/ninjaone/devices                      # List all devices
GET    /api/ninjaone/devices/[id]                 # Get device details
GET    /api/ninjaone/devices/customer/[email]     # Get devices for customer by email
```

### Google Business

```
GET    /api/google-business/info                  # Get business information
GET    /api/google-business/reviews               # Get customer reviews
GET    /api/google-business/posts                 # Get business posts
```

### Admin Operations

```
GET    /api/admin/search                          # Universal search (customers, tickets)
GET    /api/admin/employees                       # List employees
POST   /api/admin/employees                       # Create employee
GET    /api/admin/employees/[id]                  # Get employee details
PUT    /api/admin/employees/[id]                  # Update employee
DELETE /api/admin/employees/[id]                  # Delete employee
GET    /api/admin/silver-plan                     # Get Silver Plan customers
GET    /api/admin/asset-plans                     # Get asset plan assignments
POST   /api/admin/sync                            # Sync data from external sources
POST   /api/admin/set-location                    # Set user's location
```

### Customer Portal

```
POST   /api/customers/portal-account              # Create/link portal account
```

### Health Check

```
GET    /api/health                                # Health check endpoint
```

### Contact Form

```
POST   /api/contact                               # Submit contact form
```

### Webhooks

```
POST   /api/webhooks/repairshopr                  # RepairShopr webhook handler
```

---

## Deployment

### Render Configuration

This project uses Render Blueprints for automated deployment:

**Production Environment**
- **Branch**: `Production`
- **URL**: https://computerstoreks.com
- **Build**: `npm install && npm run build && <copy standalone>`
- **Start**: `cd .next/standalone && node server.js`

**Development Environment**
- **Branch**: `Development`
- **URL**: https://csk-development.onrender.com
- **Build**: Same as production
- **Start**: Same as production

### Deployment Steps

1. **Push to branch**

   ```bash
   # For development
   git checkout Development
   git add .
   git commit -m "Your changes"
   git push origin Development

   # For production
   git checkout Production
   git merge Development  # Merge tested changes
   git push origin Production
   ```

2. **Render auto-deploys** from the configured branch

3. **Configure environment variables** in Render dashboard:
   - Navigate to your service in Render
   - Go to Environment tab
   - Add all required variables from `.env.example`
   - Required variables are marked with `sync: false` in `render.yaml`

### Database Setup

1. **Create Supabase project** at https://supabase.com

2. **Run SQL migrations** in Supabase SQL Editor:

   ```sql
   -- Blog schema
   CREATE TABLE blog_categories (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL UNIQUE,
     slug TEXT NOT NULL UNIQUE,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE blog_posts (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     title TEXT NOT NULL,
     slug TEXT NOT NULL UNIQUE,
     content TEXT NOT NULL,
     excerpt TEXT,
     featured_image TEXT,
     category_id UUID REFERENCES blog_categories(id),
     published BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE blog_tags (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL UNIQUE,
     slug TEXT NOT NULL UNIQUE
   );

   CREATE TABLE blog_post_tags (
     post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
     tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
     PRIMARY KEY (post_id, tag_id)
   );

   -- Ticket status system
   CREATE TABLE ticket_status_definitions (
     status TEXT PRIMARY KEY,
     display_name TEXT NOT NULL,
     sort_order INTEGER NOT NULL,
     repairshopr_status TEXT NOT NULL,
     show_customer_question BOOLEAN DEFAULT FALSE,
     customer_visible_status TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE ticket_status_overrides (
     repairshopr_ticket_id INTEGER PRIMARY KEY,
     custom_status TEXT REFERENCES ticket_status_definitions(status),
     customer_question TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Insert default status definitions
   INSERT INTO ticket_status_definitions (status, display_name, sort_order, repairshopr_status, show_customer_question, customer_visible_status) VALUES
     ('new', 'New', 0, 'New', false, 'Received'),
     ('diagnosing', 'Diagnosing', 1, 'In Progress', false, 'Being Diagnosed'),
     ('repairing', 'Repairing', 2, 'In Progress', false, 'Being Repaired'),
     ('data_transferring', 'Data Transfer', 3, 'In Progress', false, 'Transferring Data'),
     ('installing', 'Installing', 4, 'In Progress', false, 'Installing Software'),
     ('waiting_for_parts', 'Waiting for Parts', 5, 'Waiting on Parts', false, 'Waiting for Parts'),
     ('building', 'Building', 6, 'In Progress', false, 'Being Built'),
     ('call_customer', 'Call Customer', 7, 'Waiting on Customer', true, 'Pending Your Response'),
     ('waiting_for_customer_reply', 'Waiting for Reply', 8, 'Waiting on Customer', false, 'Pending Your Response'),
     ('ready_for_pickup', 'Ready for Pickup', 9, 'Resolved', false, 'Ready for Pickup'),
     ('completed', 'Completed', 10, 'Resolved', false, 'Completed');
   ```

3. **Configure Supabase Storage** (for blog images):
   - Create a bucket named `blog-images`
   - Set appropriate access policies

### Post-Deployment Verification

1. **Check health endpoint**: https://computerstoreks.com/api/health
2. **Test public site**: Browse services, gallery, blog
3. **Test admin login**: Login with RepairShopr credentials
4. **Verify integrations**: Check RepairShopr, NinjaOne, Google Business data loads

### Troubleshooting

**Build fails**
- Check Node.js version matches (20.11.0)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run type-check`

**Environment variables not working**
- Ensure they're set in Render dashboard
- Check variable names match exactly
- Remember to restart service after changing env vars

**Database connection fails**
- Verify Supabase project URL and keys
- Check if SQL migrations were run
- Test connection from local environment first

---

## Contributing

### Development Workflow

1. **Always work in `Development` branch**

   ```bash
   git checkout Development
   ```

2. **Make changes and test locally**

   ```bash
   npm run dev
   npm run type-check
   npm run build  # Test production build
   ```

3. **Commit with clear messages**

   ```bash
   git add .
   git commit -m "feat: add customer search to intake wizard"
   ```

4. **Push to Development branch**

   ```bash
   git push origin Development
   ```

5. **Test on development site**
   - Wait for Render deployment
   - Visit https://csk-development.onrender.com
   - Verify changes work correctly

6. **Merge to Production when ready**

   ```bash
   git checkout Production
   git merge Development
   git push origin Production
   ```

### Code Standards

- **TypeScript**: Use strict mode, no `any` types
- **Components**: Functional components with TypeScript interfaces
- **Styling**: Tailwind CSS for admin, custom CSS for public pages
- **API Routes**: Use Zod for request validation
- **Error Handling**: Always use try/catch with proper error responses
- **Documentation**: All functions MUST have comprehensive JSDoc comments (see [CLAUDE.md](../CLAUDE.md) for requirements)

### Git Conventions

**Branch Strategy**
- `Production` - Live customer site
- `Development` - Testing and staging

**Commit Message Format**
```
<type>: <description>

[optional body]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

### Project Management

This project uses the **Bast + CCPM** system for spec-driven development.

```bash
# Create requirements document
/pm:prd-new <feature-name>

# Parse into implementation plan
/pm:prd-parse <feature-name>

# Break into tasks
/pm:epic-decompose <feature-name>

# Sync to GitHub
/pm:epic-sync <feature-name>

# Start parallel work
/pm:issue-start <issue-number>
```

See [.claude/PM_GUIDE.md](../.claude/PM_GUIDE.md) for complete documentation.

---

## License

Proprietary - All rights reserved by Resilient Web Solutions and The Computer Store.

---

## Contact

**Project Maintainer**: Matthew McManness (Resilient Web Solutions)
**Client**: The Computer Store, Topeka, Kansas
**Website**: https://computerstoreks.com

---

**Last Updated**: 2026-01-12
