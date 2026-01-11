/**
 * Role-Based Access Control (RBAC) Type Definitions and Configuration
 *
 * This module defines the complete role system for the Computer Store KS portal,
 * including business hierarchy roles, add-on roles, permissions, and sidebar configuration.
 *
 * Role Structure:
 * - Business hierarchy: receptionist → technician → lead_technician → manager → owner
 * - Add-on roles: social_media (blog access), lead_developer (superuser)
 * - Customer role: Separate portal access
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */

// ============================================================================
// Role Type Definitions
// ============================================================================

/**
 * Business hierarchy roles with linear inheritance.
 * Each level inherits all permissions from levels below.
 */
export type BusinessRole =
  | 'receptionist'
  | 'technician'
  | 'lead_technician'
  | 'manager'
  | 'owner';

/**
 * Add-on roles that can be combined with any business role.
 * - social_media: Grants blog access (for roles below Manager)
 * - lead_developer: IT superuser with full system access
 */
export type AddOnRole = 'social_media' | 'lead_developer';

/**
 * All employee roles (business + add-on).
 */
export type EmployeeRole = BusinessRole | AddOnRole;

/**
 * Customer role for the customer portal.
 */
export type CustomerRole = 'customer';

/**
 * Union of all possible roles in the system.
 */
export type UserRole = EmployeeRole | CustomerRole;

/**
 * Permission identifiers for route and feature access.
 */
export type Permission =
  // General
  | 'view_admin_dashboard'
  // Reception Section
  | 'view_reception_dashboard'
  | 'manage_intake'
  | 'view_customers'
  | 'manage_customers'
  | 'view_families'
  | 'manage_families'
  | 'view_businesses'
  | 'manage_businesses'
  | 'view_tickets'
  | 'manage_tickets'
  | 'view_invoices'
  | 'manage_invoices'
  | 'use_pos'
  | 'view_leads'
  | 'manage_leads'
  | 'use_quotes'
  // Technician Section
  | 'view_tech_dashboard'
  | 'manage_ticket_work'
  | 'view_gallery'
  | 'manage_gallery'
  // Lead Tech Section
  | 'view_lead_tech_dashboard'
  | 'assign_tickets'
  // Social Media Section
  | 'view_blog'
  | 'manage_blog'
  // Management Section
  | 'view_employees'
  | 'manage_employees'
  // Admin Section
  | 'view_data_sync'
  | 'manage_data_sync';

// ============================================================================
// Role Hierarchy Configuration
// ============================================================================

/**
 * Defines the inheritance chain for business roles.
 * Each role inherits all permissions from the roles listed.
 *
 * @example
 * manager inherits from lead_technician, which inherits from technician, etc.
 */
export const ROLE_HIERARCHY: Record<BusinessRole, BusinessRole[]> = {
  receptionist: [],
  technician: ['receptionist'],
  lead_technician: ['technician', 'receptionist'],
  manager: ['lead_technician', 'technician', 'receptionist'],
  owner: ['manager', 'lead_technician', 'technician', 'receptionist'],
};

/**
 * Business role level for comparison (higher = more permissions).
 */
export const BUSINESS_ROLE_LEVEL: Record<BusinessRole, number> = {
  receptionist: 1,
  technician: 2,
  lead_technician: 3,
  manager: 4,
  owner: 5,
};

// ============================================================================
// Permission Configuration
// ============================================================================

/**
 * Base permissions for each role.
 * Business roles inherit from lower levels via ROLE_HIERARCHY.
 * Add-on roles grant additional specific permissions.
 *
 * Note: Manager and above automatically get blog permissions through their base permissions,
 * so they don't need the social_media add-on.
 */
export const ROLE_PERMISSIONS: Record<EmployeeRole, Permission[]> = {
  // Business hierarchy (each level adds new permissions)
  receptionist: [
    'view_admin_dashboard',
    'view_reception_dashboard',
    'manage_intake',
    'view_customers',
    'manage_customers',
    'view_families',
    'manage_families',
    'view_businesses',
    'manage_businesses',
    'view_tickets',
    'manage_tickets',
    'view_invoices',
    'manage_invoices',
    'use_pos',
    'view_leads',
    'manage_leads',
    'use_quotes',
  ],
  technician: [
    'view_tech_dashboard',
    'manage_ticket_work',
    'view_gallery',
    'manage_gallery',
  ],
  lead_technician: [
    'view_lead_tech_dashboard',
    'assign_tickets',
  ],
  manager: [
    'view_employees',
    'manage_employees',
    'view_blog',
    'manage_blog', // Manager+ automatically gets blog access
  ],
  owner: [], // Inherits all from manager

  // Add-on roles (grant specific additional permissions)
  social_media: [
    'view_blog',
    'manage_blog',
  ],
  lead_developer: [
    // Lead developer gets ALL permissions (superuser)
    'view_admin_dashboard',
    'view_reception_dashboard',
    'manage_intake',
    'view_customers',
    'manage_customers',
    'view_families',
    'manage_families',
    'view_businesses',
    'manage_businesses',
    'view_tickets',
    'manage_tickets',
    'view_invoices',
    'manage_invoices',
    'use_pos',
    'view_leads',
    'manage_leads',
    'use_quotes',
    'view_tech_dashboard',
    'manage_ticket_work',
    'view_gallery',
    'manage_gallery',
    'view_lead_tech_dashboard',
    'assign_tickets',
    'view_blog',
    'manage_blog',
    'view_employees',
    'manage_employees',
    'view_data_sync',
    'manage_data_sync',
  ],
};

// ============================================================================
// Sidebar Configuration
// ============================================================================

/**
 * Icon names from Lucide React.
 */
export type IconName =
  | 'ClipboardList'
  | 'Wrench'
  | 'Crown'
  | 'Share2'
  | 'Settings'
  | 'Shield'
  | 'LayoutDashboard'
  | 'UserPlus'
  | 'Users'
  | 'Home'
  | 'Building2'
  | 'Ticket'
  | 'Receipt'
  | 'CreditCard'
  | 'Target'
  | 'FileText'
  | 'Images'
  | 'PenTool'
  | 'RefreshCw';

/**
 * Individual sidebar menu item.
 */
export interface SidebarItem {
  label: string;
  href: string;
  permissions: Permission[];
  icon?: IconName;
}

/**
 * Collapsible sidebar section containing menu items.
 */
export interface SidebarSection {
  id: string;
  label: string;
  icon: IconName;
  items: SidebarItem[];
}

/**
 * Complete sidebar configuration with sections and their items.
 * Sections are filtered based on user permissions.
 */
export const SIDEBAR_CONFIG: SidebarSection[] = [
  {
    id: 'reception',
    label: 'Reception',
    icon: 'ClipboardList',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/reception',
        permissions: ['view_reception_dashboard'],
        icon: 'LayoutDashboard',
      },
      {
        label: 'Customer Intake',
        href: '/admin/intake',
        permissions: ['manage_intake'],
        icon: 'UserPlus',
      },
      {
        label: 'Customers',
        href: '/admin/customers',
        permissions: ['view_customers'],
        icon: 'Users',
      },
      {
        label: 'Families',
        href: '/admin/families',
        permissions: ['view_families'],
        icon: 'Home',
      },
      {
        label: 'Businesses',
        href: '/admin/businesses',
        permissions: ['view_businesses'],
        icon: 'Building2',
      },
      {
        label: 'Tickets',
        href: '/admin/tickets',
        permissions: ['view_tickets'],
        icon: 'Ticket',
      },
      {
        label: 'Invoices',
        href: '/admin/invoices',
        permissions: ['view_invoices'],
        icon: 'Receipt',
      },
      {
        label: 'POS',
        href: '/admin/pos',
        permissions: ['use_pos'],
        icon: 'CreditCard',
      },
      {
        label: 'Leads',
        href: '/admin/leads',
        permissions: ['view_leads'],
        icon: 'Target',
      },
      {
        label: 'Quotes',
        href: '/admin/quotes',
        permissions: ['use_quotes'],
        icon: 'FileText',
      },
    ],
  },
  {
    id: 'technician',
    label: 'Technician',
    icon: 'Wrench',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/tech',
        permissions: ['view_tech_dashboard'],
        icon: 'LayoutDashboard',
      },
      {
        label: 'Ticket Work',
        href: '/admin/tickets/work',
        permissions: ['manage_ticket_work'],
        icon: 'Ticket',
      },
      {
        label: 'Gallery',
        href: '/admin/gallery',
        permissions: ['view_gallery'],
        icon: 'Images',
      },
    ],
  },
  {
    id: 'lead-tech',
    label: 'Lead Tech',
    icon: 'Crown',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/lead-tech',
        permissions: ['view_lead_tech_dashboard'],
        icon: 'LayoutDashboard',
      },
    ],
  },
  {
    id: 'social-media',
    label: 'Social Media',
    icon: 'Share2',
    items: [
      {
        label: 'Blog Posts',
        href: '/admin/blog',
        permissions: ['view_blog'],
        icon: 'PenTool',
      },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    icon: 'Settings',
    items: [
      {
        label: 'Employees',
        href: '/admin/employees',
        permissions: ['view_employees'],
        icon: 'Users',
      },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: 'Shield',
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        permissions: ['view_admin_dashboard'],
        icon: 'LayoutDashboard',
      },
      {
        label: 'Data Sync',
        href: '/admin/sync',
        permissions: ['view_data_sync'],
        icon: 'RefreshCw',
      },
    ],
  },
];

// ============================================================================
// Route Permission Mapping
// ============================================================================

/**
 * Maps route patterns to required permissions.
 * Used by middleware for route protection.
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  // Admin Dashboard
  '/admin': ['view_admin_dashboard'],
  // Reception Section
  '/admin/reception': ['view_reception_dashboard'],
  '/admin/intake': ['manage_intake'],
  '/admin/customers': ['view_customers'],
  '/admin/families': ['view_families'],
  '/admin/businesses': ['view_businesses'],
  '/admin/tickets': ['view_tickets'],
  '/admin/invoices': ['view_invoices'],
  '/admin/pos': ['use_pos'],
  '/admin/leads': ['view_leads'],
  '/admin/quotes': ['use_quotes'],
  // Technician Section
  '/admin/tech': ['view_tech_dashboard'],
  '/admin/tickets/work': ['manage_ticket_work'],
  '/admin/gallery': ['view_gallery'],
  // Lead Tech Section
  '/admin/lead-tech': ['view_lead_tech_dashboard'],
  // Social Media Section
  '/admin/blog': ['view_blog'],
  '/admin/blog/new': ['manage_blog'],
  // Management Section
  '/admin/employees': ['view_employees'],
  // Admin Section
  '/admin/sync': ['view_data_sync'],
};

// ============================================================================
// Role Display Configuration
// ============================================================================

/**
 * Human-readable labels for roles.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  // Business hierarchy
  receptionist: 'Receptionist',
  technician: 'Technician',
  lead_technician: 'Lead Technician',
  manager: 'Manager',
  owner: 'Owner',
  // Add-on roles
  social_media: 'Social Media',
  lead_developer: 'Lead Developer',
  // Customer
  customer: 'Customer',
};

/**
 * Role descriptions for UI display.
 */
export const ROLE_DESCRIPTIONS: Record<EmployeeRole, string> = {
  receptionist: 'Front desk operations: intake, customers, tickets, POS',
  technician: 'Repair work: tech dashboard, ticket work, gallery',
  lead_technician: 'Team lead: ticket assignment, technician oversight',
  manager: 'Business operations: employees, blog, full access',
  owner: 'Full business access with all management capabilities',
  social_media: 'Content management: blog posts (add-on role)',
  lead_developer: 'IT superuser: full system access including data sync',
};

/**
 * Identifies which roles are add-on roles (vs business hierarchy roles).
 */
export const ADD_ON_ROLES: AddOnRole[] = ['social_media', 'lead_developer'];

/**
 * Identifies which roles are business hierarchy roles.
 */
export const BUSINESS_ROLES: BusinessRole[] = [
  'receptionist',
  'technician',
  'lead_technician',
  'manager',
  'owner',
];

/**
 * All valid employee roles (business + add-on).
 */
export const ALL_EMPLOYEE_ROLES: EmployeeRole[] = [
  ...BUSINESS_ROLES,
  ...ADD_ON_ROLES,
];

/**
 * Check if a role is an add-on role.
 *
 * @param role - The role to check
 * @returns True if the role is an add-on role
 */
export function isAddOnRole(role: string): role is AddOnRole {
  return ADD_ON_ROLES.includes(role as AddOnRole);
}

/**
 * Check if a role is a business hierarchy role.
 *
 * @param role - The role to check
 * @returns True if the role is a business hierarchy role
 */
export function isBusinessRole(role: string): role is BusinessRole {
  return BUSINESS_ROLES.includes(role as BusinessRole);
}
