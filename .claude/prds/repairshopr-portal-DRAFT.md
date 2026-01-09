---
name: RepairShopr Portal
description: Employee and customer portal with RepairShopr integration, custom authentication, and streamlined workflows
status: draft-needs-refinement
created: 2025-12-09T22:30:00Z
updated: 2025-12-09T22:30:00Z
notes: |
  This is a DRAFT that needs refinement before implementation.
  Key areas to discuss:
  - Supabase vs custom auth decision
  - Email provider for password resets
  - House call availability management
  - Receipt printer integration
  - SMS notification scope/cost
dependencies:
  - authentication-repairshopr-integration
---

# PRD: RepairShopr Integration Portal (DRAFT)

> **Status: Needs Refinement** - This document captures initial requirements but needs further discussion before implementation.

## Executive Summary

Build a comprehensive web portal that integrates with RepairShopr to provide:
1. **Employee Portal**: Streamlined UI for creating customers, tickets, and recording payments
2. **Customer Portal**: Self-service access to repair status, invoices, and appointment booking
3. **Custom Authentication**: Password-based customer accounts (since RepairShopr customers don't have passwords)
4. **QR Code Onboarding**: In-store account setup flow for new customers

**Why rebuild RepairShopr's UI?**
- Workflow optimization specific to Computer Store KS procedures
- Tighter integration with the website (house calls booking, chat widget submissions)
- Custom features not available in RepairShopr (passworded customer accounts, QR onboarding)
- Faster, simplified interface focused on common tasks

## Problem Statement

### Current State
- Employees use RepairShopr's generic UI which requires many clicks for common tasks
- Customers have no online access to their repair status (must call)
- RepairShopr "customers" are just contact records without authentication
- In-store payments (US Bank card reader) must be manually entered into RepairShopr
- No integration between website contact form/chat and RepairShopr tickets
- House calls require phone coordination instead of online booking

### Target State
- Employees complete common tasks in 2-3 clicks vs 5-7 in RepairShopr
- Customers log in with password to view status, invoices, book appointments
- New customers scan QR code at checkout to create their account
- In-store payments recorded with one click after card swipe
- Website inquiries automatically create RepairShopr tickets
- House calls bookable online with address and availability selection

## Payment Integration Context

**Current Setup:**
- **US Bank card reader**: Standalone terminal for in-store payments (no API)
- **Worldpay**: Already integrated with RepairShopr for online/recurring payments
- **Goal**: One-click payment recording after US Bank card swipe

**Solution**: Semi-automated flow where employee clicks "Record Payment" after card swipe approves. This records the payment in RepairShopr via API.

## User Stories

### Employee Portal

**US-E1: Quick Customer Lookup**
> As an employee, I want to quickly find a customer by name, phone, or email so I can access their account in seconds.

Acceptance Criteria:
- [ ] Search bar with typeahead suggestions
- [ ] Results show name, phone, email, and last service date
- [ ] Click to open customer detail view
- [ ] "Create New" button if no match found

**US-E2: Create New Customer**
> As an employee, I want to create a new RepairShopr customer from our website so the customer doesn't need to fill out paperwork.

Acceptance Criteria:
- [ ] Form: Name, Email, Phone, Address (optional)
- [ ] Validates required fields before submission
- [ ] Creates customer in RepairShopr via API
- [ ] Shows success with new customer ID
- [ ] Option to immediately create ticket for this customer

**US-E3: Create Ticket**
> As an employee, I want to create a repair ticket quickly with device info and problem description.

Acceptance Criteria:
- [ ] Customer pre-selected (or searchable)
- [ ] Device type dropdown (Desktop, Laptop, Phone, Tablet, Other)
- [ ] Problem type dropdown (mapped to RepairShopr problem types)
- [ ] Description text field
- [ ] Internal notes field (private, customer won't see)
- [ ] Status defaults to "New" / configurable
- [ ] Creates ticket in RepairShopr via API
- [ ] Prints intake receipt (optional)

**US-E4: Record In-Store Payment**
> As an employee, I want to record a payment after the customer swipes their card on the US Bank reader.

Acceptance Criteria:
- [ ] Shows customer's open invoices
- [ ] Pre-fills invoice amount (editable for partial payments)
- [ ] Payment method dropdown: Cash, Credit Card, Check, Other
- [ ] Reference number field (last 4 digits or receipt #)
- [ ] One-click "Record Payment" button
- [ ] Creates payment in RepairShopr via API
- [ ] Updates invoice status automatically
- [ ] Option to print/email receipt

**US-E5: Add Ticket Comment**
> As an employee, I want to add notes to a ticket that can be public (customer sees) or private (internal only).

Acceptance Criteria:
- [ ] Comment text field
- [ ] Toggle: Public / Private (maps to `hidden: true/false`)
- [ ] Option to also send email/SMS notification (for public comments)
- [ ] Shows who added comment and when

**US-E6: Generate Account Setup QR Code**
> As an employee, I want to generate a QR code that the customer can scan to set up their account.

Acceptance Criteria:
- [ ] One-click generation for any customer
- [ ] QR code links to `/setup-account?token=<unique-token>`
- [ ] Token expires in 24 hours
- [ ] Token is single-use
- [ ] Can print QR code on receipt

### Customer Portal

**US-C1: Account Setup (via QR Code)**
> As a customer, I want to scan a QR code at the store to create my account password.

Acceptance Criteria:
- [ ] Landing page validates token
- [ ] Shows customer name (from RepairShopr) for confirmation
- [ ] Password creation form (meets NIST guidelines)
- [ ] Password must be 8-64 characters
- [ ] Check against common password blocklist
- [ ] Creates password hash in our database (linked to RepairShopr customer ID)
- [ ] Success message with link to login

**US-C2: Customer Login**
> As a customer, I want to log in with my email and password to view my account.

Acceptance Criteria:
- [ ] Email + password login form
- [ ] Looks up customer by email in our auth database
- [ ] Verifies password hash (bcrypt or Argon2)
- [ ] Creates secure session
- [ ] Redirects to customer dashboard
- [ ] "Forgot password" link (sends reset email)

**US-C3: View Repair Status**
> As a customer, I want to see the current status of my repairs without calling.

Acceptance Criteria:
- [ ] Dashboard shows all active tickets
- [ ] Each ticket shows: device, problem, status, last update
- [ ] Status clearly displayed (Received, Diagnosing, Waiting for Parts, Repairing, Ready)
- [ ] Estimated completion date when available
- [ ] Click to view ticket details and public comments

**US-C4: View Invoice History**
> As a customer, I want to see my past invoices and payment history.

Acceptance Criteria:
- [ ] List of all invoices (paid and unpaid)
- [ ] Each shows: date, amount, status (Paid/Unpaid/Partial)
- [ ] Click to view line items
- [ ] Download PDF option

**US-C5: Book House Call**
> As a customer, I want to book a house call appointment online.

Acceptance Criteria:
- [ ] Address selection (use saved address or enter new)
- [ ] Service type selection
- [ ] Description of issue
- [ ] Date/time slot picker (shows available slots)
- [ ] Confirmation with appointment details
- [ ] Creates appointment in RepairShopr
- [ ] Email confirmation sent

**US-C6: Contact/Message**
> As a customer, I want to send a message about an existing ticket or general inquiry.

Acceptance Criteria:
- [ ] Select existing ticket or "General Inquiry"
- [ ] Message text field
- [ ] Adds public comment to ticket (or creates new ticket for inquiries)
- [ ] Confirmation that message was sent

### Integration Features

**US-I1: Contact Form → Ticket**
> When someone submits the contact form, it should create a RepairShopr ticket if they're a customer.

Acceptance Criteria:
- [ ] Check if email exists in RepairShopr
- [ ] If customer exists: create ticket linked to them
- [ ] If not: create customer first, then ticket
- [ ] Include form subject and message in ticket
- [ ] Tag ticket as "Website Inquiry"

**US-I2: Chat Widget → Ticket**
> When someone uses the chat widget, create a RepairShopr ticket.

Acceptance Criteria:
- [ ] Same logic as contact form
- [ ] Include full chat transcript in ticket notes
- [ ] Tag as "Chat Inquiry"

## Technical Architecture (High-Level)

### Authentication System

**Employees**: Use RepairShopr credentials (see authentication-repairshopr-integration PRD)

**Customers**: Custom password auth since RepairShopr customers don't have passwords
- Option A: Supabase Auth (managed, simpler)
- Option B: Custom database table (more control)

### Password Requirements (NIST SP 800-63B-4)
- Minimum 8 characters (15+ recommended)
- Maximum 64 characters
- No forced composition rules
- Check against breached password blocklist
- Hash with Argon2id or bcrypt

### RepairShopr API Constraints
- **Rate limit**: 180 requests/minute
- **No webhooks**: Must poll or user-triggered refresh
- **Payment recording only**: Cannot process cards

### Key API Endpoints Needed

**RepairShopr (via proxy):**
- `POST /customers` - Create customer
- `GET /customers` - Search customers
- `POST /tickets` - Create ticket
- `POST /tickets/:id/comment` - Add comment
- `POST /payments` - Record payment
- `GET /invoices` - List invoices
- `POST /appointments` - Book appointment

## Implementation Phases

### Phase 1: Employee Portal Foundation
1. Authentication (depends on auth PRD)
2. Customer search & creation
3. Ticket creation
4. Basic payment recording
5. QR code generation

### Phase 2: Customer Portal
1. Customer authentication system
2. Account setup flow (QR)
3. Dashboard with ticket status
4. Invoice viewing
5. Password reset flow

### Phase 3: Enhanced Features
1. Contact form → ticket integration
2. Chat widget → ticket integration
3. House call booking
4. Customer messaging
5. Ticket comments (public/private)

### Phase 4: Optimization
1. Caching layer
2. Rate limit management
3. Performance optimization

## Open Questions (Need Discussion)

1. **Supabase vs Custom Auth**: Should we use Supabase Auth for simplicity or build custom for full control?

2. **Email Provider**: What email service for password resets? (SendGrid, AWS SES, etc.)

3. **House Call Availability**: How should available time slots be managed? (Google Calendar, RepairShopr appointments, custom?)

4. **SMS Notifications**: Should we add SMS for status updates? (Twilio cost consideration)

5. **Receipt Printing**: What receipt printer is in use? Can we integrate?

## References

- [RepairShopr API Docs](https://api-docs.repairshopr.com/)
- [NIST SP 800-63B-4 Password Guidelines](https://pages.nist.gov/800-63-4/sp800-63b.html)
- [Authentication PRD](./authentication-repairshopr-integration.md)
