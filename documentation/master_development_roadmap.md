# Computer Store KS Platform - Master Development Roadmap

**Target Launch:** Q1 2026 (Holton Location)
**Developer:** Matthew
**Allocation:** 20-30 hours/week
**Last Updated:** January 22, 2026
**Current Status:** ~35% complete

---

## Phase 1: Foundation ✅ COMPLETE (100%)

**Purpose:** Authentication and infrastructure layer

### Completed Items:
- ✅ Supabase Auth migration (6 users migrated)
- ✅ User profiles with role-based access (admin, technician, receptionist, customer)
- ✅ Login, register, password reset pages
- ✅ RepairShopr API wrapper service
- ✅ NinjaOne API wrapper with OAuth2
- ✅ Complete database schema with RLS policies
- ✅ Route protection middleware
- ✅ Password reset flow via Resend SMTP
- ✅ Multi-location support (Topeka/Holton)

### Database Tables Created:
- user_profiles, customer_accounts, customer_protection_plans
- ticket_status_overrides, ticket_status_definitions, ticket_public_notes
- blog_posts, blog_categories, blog_tags
- gallery_computers, gallery_sales, device_mappings
- locations

### On Hold:
- Payment integration awaiting provider decision (US Bank vs. Stripe)

---

## Phase 2: Cytracom Phone Integration 🔄 IN PROGRESS (60%)

**Purpose:** Phone system integration for click-to-call and voicemail management

**Priority:** High | **Est. Hours:** 40-60

### Completed (✓):
- ✅ Cytracom API library (`src/lib/cytracom.ts`) with OAuth authentication
- ✅ Call history integration via Insights API (`/api/cytracom/call-history`)
- ✅ Missed calls widget on Reception Dashboard (`missed-calls-widget.tsx`)
- ✅ Click-to-call dialog for employees (`click-to-call-dialog.tsx`)
- ✅ Call initiation API (`/api/cytracom/call`)
- ✅ Extensions listing API (`/api/cytracom/extensions`)
- ✅ Voicemails API endpoint (`/api/cytracom/voicemails`)
- ✅ Call logs API endpoint (`/api/cytracom/call-logs`)
- ✅ Location-based filtering (Topeka only - Cytracom phones)
- ✅ Customer call history lookup by phone number
- ✅ Phone number formatting and display helpers
- ✅ In-memory caching (2-minute TTL)

### Not Started (○):
- ○ Voicemail transcription display
- ○ Website callback widget for customer acquisition
- ○ Real-time call event streaming (WebSocket)
- ○ Call recording playback

### Notes:
- Cytracom API has undocumented size limit (max 100 records per request)
- API tokens secured server-side only via Next.js API routes
- Currently Topeka-exclusive (Holton doesn't use Cytracom)

---

## Phase 3: RepairShopr Employee Portal 🔄 IN PROGRESS (55%)

**Purpose:** Replace RepairShopr interface with streamlined workflow

**Priority:** Critical | **Est. Hours:** 80-100

### Completed (✓):
- ✅ Customer search & management (name, phone, email)
- ✅ Customer detail view with relevant information
- ✅ Ticket creation via 5-step intake wizard
- ✅ Ticket detail view with status management
- ✅ Custom ticket status system (separate from RepairShopr)
- ✅ Customer-visible notes system
- ✅ Invoice viewing (read-only)
- ✅ Business management search
- ✅ Blog CMS with categories, tags, featured images
- ✅ Gallery management for computer inventory
- ✅ Google Business integration
- ✅ Contact form with bot protection
- ✅ RepairShopr data sync to Supabase (customers, tickets, assets, invoices, payments)
- ✅ Reception Dashboard with Call Customer widget
- ✅ Employee management with role assignments
- ✅ Location-based data filtering

### Not Started (○):
- ○ Ticket template system
- ○ Kanban dashboard
- ○ Invoice creation workflow
- ○ Quote/estimate system
- ○ POS and cash drawer functionality
- ○ Leads management
- ○ Time tracking

---

## Phase 4: ESET Antivirus Integration ⏸️ NOT STARTED (0%)

**Purpose:** Unified antivirus monitoring and threat management

**Priority:** High | **Est. Hours:** 30-40

### Planned Features:
1. ESET API service wrapper with OAuth2
2. Device protection status display
3. Threat detection dashboard (active & resolved)
4. Scan history and alert configuration
5. Remote scan triggers (quick, full, definition updates)
6. License management and expiration tracking

### API Requirements:
ESET Connect API provides device management, detection management, task automation, and reporting capabilities

---

## Phase 5: NinjaOne RMM Integration ⏸️ NOT STARTED (0%)

**Purpose:** Unified device management without context-switching

**Priority:** Critical | **Est. Hours:** 50-60

### Planned Features:
1. Device-to-customer mapping via Supabase
2. Customer 360 view (customer + tickets + devices)
3. Device detail view with hardware health indicators
4. Remote access launch (Splashtop/TeamViewer integration)
5. Quick actions (restart, driver updates, antivirus scans)
6. Hardware monitoring with alert thresholds
7. MSP dashboard for B2B managed clients

### Notes:
- NinjaOne API wrapper already built in Phase 1
- Need technician workflow session to finalize UI requirements

---

## Phase 6: Customer Portal ⏸️ IN PROGRESS (10%)

**Purpose:** 24/7 self-service for customers

**Priority:** High | **Est. Hours:** 60-80

### Completed (✓):
- ✅ Placeholder page exists
- ✅ Backend authentication ready (Supabase Auth)

### Not Started (○):
- ○ Registration and account linking
- ○ Repair status tracking
- ○ Asset/device management
- ○ Invoice and payment center
- ○ Protection plan signup (Bronze/Silver/Gold tiers)
- ○ Ticket communication/chat
- ○ Appointment scheduling
- ○ Basic online store

---

## Phase 7: PC Builder ⏸️ NOT STARTED (0%)

**Purpose:** Custom PC configurator (iBuyPower-style)

**Priority:** Medium | **Est. Hours:** 100-120

### Planned Features:
1. Parts database with compatibility metadata
2. Supplier price integration (Ingram Micro, TD SYNNEX, Newegg)
3. Compatibility engine (socket, RAM type, PSU wattage, cooling)
4. Customer-facing configurator with pre-built tiers
5. Technician view with cost/margin visibility
6. Quote and invoice integration

### Pre-Built Tiers:
- Budget Gaming ($600-$800)
- Mid-Range Gaming ($1,000-$1,300)
- High-End Gaming ($1,800-$2,500)
- Workstation ($1,500-$3,000)
- Office/Home ($400-$600)

---

## Phase 8: Social Media Automation ⏸️ NOT STARTED (0%)

**Purpose:** AI-powered content generation and scheduling

**Priority:** Medium | **Est. Hours:** 80-100

### Planned Features:
1. Content calendar with drag-drop scheduling
2. Claude API integration for AI content generation
3. Blog integration with auto-generated social posts
4. Inventory/promotion auto-posting
5. Platform connectors (Facebook, Instagram, LinkedIn, Google Business, X/Twitter)
6. Video content guide generation
7. Analytics dashboard across all platforms

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Database | Supabase (Auth, Database, Realtime) |
| Styling | Tailwind CSS |
| APIs | RepairShopr, NinjaOne, ESET Connect, Cytracom |
| Payments | Stripe (planned) |
| Email | Resend SMTP |
| AI | Claude API (Phase 8) |
| Hosting | Render |

---

## Payment Processing (Stripe - Planned)

| Type | Fee |
|------|-----|
| In-Person | 2.7% + $0.05 |
| Online | 2.9% + $0.30 |
| ACH | 0.8% max $5 |
| Subscriptions | 2.9% + $0.30 + 0.5% |
| BNPL | 4-6% (Affirm, Klarna, Afterpay) |

---

## Implementation Timeline

| Milestone | Target | Key Deliverables | Status |
|-----------|--------|------------------|--------|
| M1 | Week 3 | Auth, APIs, database ready | ✅ Complete |
| M2 | Week 6 | Cytracom integration, ticket templates | 🔄 In Progress |
| M3 | Week 10 | Full RepairShopr MVP | 🔄 In Progress |
| M4 | Week 14 | NinjaOne integration | ⏸️ Pending |
| **🎯 HOLTON LAUNCH** | **Week 15** | **Employee portal operational** | ⏸️ Pending |
| M5 | Week 20 | Customer portal MVP | ⏸️ Pending |
| M6 | Week 26 | PC builder MVP | ⏸️ Pending |
| M7 | Week 28 | Social automation MVP | ⏸️ Pending |

---

## Progress Summary

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 1 | Foundation | ✅ Complete | 100% |
| 2 | Cytracom Phone Integration | 🔄 In Progress | 60% |
| 3 | RepairShopr Employee Portal | 🔄 In Progress | 55% |
| 4 | ESET Antivirus Integration | ⏸️ Not Started | 0% |
| 5 | NinjaOne RMM Integration | ⏸️ Not Started | 0% |
| 6 | Customer Portal | 🔄 In Progress | 10% |
| 7 | PC Builder | ⏸️ Not Started | 0% |
| 8 | Social Media Automation | ⏸️ Not Started | 0% |

**Overall Progress: ~35%**

---

## Immediate Next Steps

### Phase 2 (Cytracom) - Finish Up:
1. ○ Add voicemail transcription display to missed calls widget
2. ○ Website callback widget for customer leads

### Phase 3 (RepairShopr) - Continue:
1. ○ Kanban dashboard for ticket workflow
2. ○ Invoice creation workflow
3. ○ Quote/estimate system
4. ○ Basic POS functionality

### Phase 5 (NinjaOne) - Start Soon:
1. ○ Device-to-customer mapping
2. ○ Customer 360 view with devices
3. ○ Remote access quick launch

---

*Last updated: January 22, 2026*
