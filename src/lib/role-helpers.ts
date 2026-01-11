/**
 * Role-Based Access Control (RBAC) Helper Functions
 *
 * This module provides utilities for checking permissions, expanding roles
 * with inheritance, filtering sidebar sections, and validating route access.
 *
 * @see src/types/roles.ts for type definitions and configuration
 *
 * @functions_called None (utility module)
 * @called_by middleware.ts, admin-sidebar.tsx, auth.ts, API routes
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */

import {
  type BusinessRole,
  type AddOnRole,
  type EmployeeRole,
  type UserRole,
  type Permission,
  type SidebarSection,
  type SidebarItem,
  ROLE_HIERARCHY,
  BUSINESS_ROLE_LEVEL,
  ROLE_PERMISSIONS,
  SIDEBAR_CONFIG,
  ROUTE_PERMISSIONS,
  isBusinessRole,
  isAddOnRole,
  BUSINESS_ROLES,
} from '@/types/roles';

// ============================================================================
// Role Expansion & Inheritance
// ============================================================================

/**
 * Expands a set of roles to include all inherited roles from the business hierarchy.
 *
 * Business roles inherit from lower levels. For example:
 * - manager inherits from lead_technician, technician, receptionist
 * - technician inherits from receptionist
 *
 * Add-on roles (social_media, lead_developer) are not expanded as they don't
 * participate in the hierarchy.
 *
 * @param roles - Array of role identifiers to expand
 * @returns Array of roles including all inherited roles (deduplicated)
 *
 * @example
 * expandRoles(['manager']) // Returns ['manager', 'lead_technician', 'technician', 'receptionist']
 * expandRoles(['technician', 'social_media']) // Returns ['technician', 'receptionist', 'social_media']
 */
export function expandRoles(roles: string[]): string[] {
  const expandedRoles = new Set<string>(roles);

  for (const role of roles) {
    if (isBusinessRole(role)) {
      const inheritedRoles = ROLE_HIERARCHY[role as BusinessRole];
      for (const inherited of inheritedRoles) {
        expandedRoles.add(inherited);
      }
    }
  }

  return Array.from(expandedRoles);
}

/**
 * Gets the highest business role level from a set of roles.
 *
 * Levels: 1=receptionist, 2=technician, 3=lead_technician, 4=manager, 5=owner
 * Lead developer is treated as level 5 (equivalent to owner).
 *
 * @param roles - Array of role identifiers
 * @returns Numeric level (0 if no business roles found)
 *
 * @example
 * getHighestBusinessRoleLevel(['technician', 'social_media']) // Returns 2
 * getHighestBusinessRoleLevel(['lead_developer']) // Returns 5
 */
export function getHighestBusinessRoleLevel(roles: string[]): number {
  let maxLevel = 0;

  for (const role of roles) {
    if (role === 'lead_developer') {
      return 5; // Superuser has max level
    }
    if (isBusinessRole(role)) {
      const level = BUSINESS_ROLE_LEVEL[role as BusinessRole];
      if (level > maxLevel) {
        maxLevel = level;
      }
    }
  }

  return maxLevel;
}

/**
 * Gets the primary (highest) business role from a set of roles.
 *
 * @param roles - Array of role identifiers
 * @returns The highest business role, or null if none found
 *
 * @example
 * getPrimaryBusinessRole(['technician', 'social_media']) // Returns 'technician'
 * getPrimaryBusinessRole(['customer']) // Returns null
 */
export function getPrimaryBusinessRole(roles: string[]): BusinessRole | null {
  const level = getHighestBusinessRoleLevel(roles);
  if (level === 0) return null;

  // Find the role matching this level
  for (const role of BUSINESS_ROLES) {
    if (BUSINESS_ROLE_LEVEL[role] === level) {
      return role;
    }
  }

  return null;
}

// ============================================================================
// Permission Checking
// ============================================================================

/**
 * Gets all effective permissions for a set of roles.
 *
 * This expands business roles with their inheritance chain and aggregates
 * all permissions from all roles (including add-ons).
 *
 * @param roles - Array of role identifiers
 * @returns Array of permission identifiers (deduplicated)
 *
 * @example
 * getEffectivePermissions(['technician'])
 * // Returns permissions from technician + receptionist (inherited)
 *
 * getEffectivePermissions(['receptionist', 'social_media'])
 * // Returns permissions from receptionist + social_media (add-on)
 */
export function getEffectivePermissions(roles: string[]): Permission[] {
  const permissions = new Set<Permission>();

  // Expand roles with inheritance
  const expandedRoles = expandRoles(roles);

  // Collect permissions from all roles
  for (const role of expandedRoles) {
    const rolePerms = ROLE_PERMISSIONS[role as EmployeeRole];
    if (rolePerms) {
      for (const perm of rolePerms) {
        permissions.add(perm);
      }
    }
  }

  return Array.from(permissions);
}

/**
 * Checks if a user with the given roles has a specific permission.
 *
 * @param roles - Array of role identifiers
 * @param permission - The permission to check
 * @returns True if the user has the permission
 *
 * @example
 * hasPermission(['technician'], 'view_tech_dashboard') // Returns true
 * hasPermission(['receptionist'], 'view_tech_dashboard') // Returns false
 */
export function hasPermission(roles: string[], permission: Permission): boolean {
  const effectivePermissions = getEffectivePermissions(roles);
  return effectivePermissions.includes(permission);
}

/**
 * Checks if a user with the given roles has any of the specified permissions.
 *
 * @param roles - Array of role identifiers
 * @param permissions - Array of permissions to check
 * @returns True if the user has at least one of the permissions
 *
 * @example
 * hasAnyPermission(['receptionist'], ['view_tech_dashboard', 'view_reception_dashboard'])
 * // Returns true (has view_reception_dashboard)
 */
export function hasAnyPermission(roles: string[], permissions: Permission[]): boolean {
  const effectivePermissions = getEffectivePermissions(roles);
  return permissions.some((perm) => effectivePermissions.includes(perm));
}

/**
 * Checks if a user with the given roles has all of the specified permissions.
 *
 * @param roles - Array of role identifiers
 * @param permissions - Array of permissions to check
 * @returns True if the user has all of the permissions
 *
 * @example
 * hasAllPermissions(['manager'], ['view_employees', 'manage_employees'])
 * // Returns true
 */
export function hasAllPermissions(roles: string[], permissions: Permission[]): boolean {
  const effectivePermissions = getEffectivePermissions(roles);
  return permissions.every((perm) => effectivePermissions.includes(perm));
}

// ============================================================================
// Role Checking Utilities
// ============================================================================

/**
 * Checks if user has any of the specified roles (not expanded, exact match).
 *
 * @param userRoles - Array of user's role identifiers
 * @param targetRoles - Array of roles to check for
 * @returns True if user has at least one of the target roles
 *
 * @example
 * hasAnyRole(['technician', 'social_media'], ['manager', 'owner']) // Returns false
 * hasAnyRole(['manager'], ['manager', 'owner']) // Returns true
 */
export function hasAnyRole(userRoles: string[], targetRoles: string[]): boolean {
  return targetRoles.some((role) => userRoles.includes(role));
}

/**
 * Checks if user is a customer (customer role only).
 *
 * @param roles - Array of user's role identifiers
 * @returns True if user is a customer
 */
export function isCustomer(roles: string[]): boolean {
  return roles.includes('customer') && roles.length === 1;
}

/**
 * Checks if user is an employee (has any employee role).
 *
 * @param roles - Array of user's role identifiers
 * @returns True if user is an employee
 */
export function isEmployee(roles: string[]): boolean {
  const employeeRoles = [...BUSINESS_ROLES, 'social_media', 'lead_developer'];
  return roles.some((role) => employeeRoles.includes(role));
}

/**
 * Checks if user is a manager or above (manager, owner, or lead_developer).
 *
 * @param roles - Array of user's role identifiers
 * @returns True if user is management level
 */
export function isManagement(roles: string[]): boolean {
  return hasAnyRole(roles, ['manager', 'owner', 'lead_developer']);
}

/**
 * Checks if user is a lead developer (superuser).
 *
 * @param roles - Array of user's role identifiers
 * @returns True if user is lead developer
 */
export function isLeadDeveloper(roles: string[]): boolean {
  return roles.includes('lead_developer');
}

/**
 * Checks if user has blog access (social_media role OR manager+).
 *
 * @param roles - Array of user's role identifiers
 * @returns True if user can access blog management
 */
export function hasBlogAccess(roles: string[]): boolean {
  return hasAnyRole(roles, ['social_media', 'manager', 'owner', 'lead_developer']);
}

/**
 * Checks if user can manage employees (manager, owner, or lead_developer).
 *
 * @param roles - Array of user's role identifiers
 * @returns True if user can manage employees
 */
export function canManageEmployees(roles: string[]): boolean {
  return hasAnyRole(roles, ['manager', 'owner', 'lead_developer']);
}

// ============================================================================
// Route Access Control
// ============================================================================

/**
 * Checks if a user can access a specific route based on their roles.
 *
 * @param roles - Array of user's role identifiers
 * @param pathname - The route pathname to check
 * @returns True if the user can access the route
 *
 * @example
 * canAccessRoute(['technician'], '/admin/tech') // Returns true
 * canAccessRoute(['receptionist'], '/admin/tech') // Returns false
 * canAccessRoute(['lead_developer'], '/admin/sync') // Returns true
 */
export function canAccessRoute(roles: string[], pathname: string): boolean {
  // Lead developer can access everything
  if (isLeadDeveloper(roles)) {
    return true;
  }

  // Check for exact match first
  const requiredPermissions = ROUTE_PERMISSIONS[pathname];
  if (requiredPermissions) {
    return hasAnyPermission(roles, requiredPermissions);
  }

  // Check for dynamic route patterns (e.g., /admin/blog/[id])
  for (const [route, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    // Simple pattern matching for routes like /admin/blog/new
    if (pathname.startsWith(route) && route !== '/admin') {
      return hasAnyPermission(roles, permissions);
    }
  }

  // Default: Allow access to /admin base route for all employees
  if (pathname === '/admin' || pathname === '/admin/') {
    return isEmployee(roles);
  }

  // Unknown route - deny by default for security
  return false;
}

/**
 * Gets the appropriate redirect path for an unauthorized user.
 *
 * @param roles - Array of user's role identifiers
 * @returns The path to redirect to
 */
export function getUnauthorizedRedirect(roles: string[]): string {
  if (isCustomer(roles)) {
    return '/portal'; // Customer portal
  }
  if (isEmployee(roles)) {
    return '/admin'; // Employee dashboard
  }
  return '/login'; // Not logged in
}

// ============================================================================
// Sidebar Filtering
// ============================================================================

/**
 * Filters sidebar items based on user permissions.
 *
 * @param items - Array of sidebar items to filter
 * @param roles - Array of user's role identifiers
 * @returns Filtered array of sidebar items the user can access
 */
function filterSidebarItems(items: SidebarItem[], roles: string[]): SidebarItem[] {
  return items.filter((item) => hasAnyPermission(roles, item.permissions));
}

/**
 * Gets the filtered sidebar configuration based on user roles.
 *
 * Returns only sections and items the user has permission to see.
 * Empty sections (after filtering items) are excluded.
 *
 * @param roles - Array of user's role identifiers
 * @returns Filtered sidebar configuration
 *
 * @example
 * getFilteredSidebar(['receptionist'])
 * // Returns only the Reception section
 *
 * getFilteredSidebar(['technician'])
 * // Returns Reception and Technician sections
 */
export function getFilteredSidebar(roles: string[]): SidebarSection[] {
  // Lead developer sees everything
  if (isLeadDeveloper(roles)) {
    return SIDEBAR_CONFIG;
  }

  return SIDEBAR_CONFIG
    .map((section) => ({
      ...section,
      items: filterSidebarItems(section.items, roles),
    }))
    .filter((section) => section.items.length > 0);
}

/**
 * Gets sidebar section IDs that should be expanded by default for a user.
 *
 * By default, expands sections based on the user's primary role.
 *
 * @param roles - Array of user's role identifiers
 * @returns Array of section IDs to expand
 */
export function getDefaultExpandedSections(roles: string[]): string[] {
  const level = getHighestBusinessRoleLevel(roles);

  // Expand based on role level
  const sections: string[] = [];

  if (level >= 1) sections.push('reception');
  if (level >= 2) sections.push('technician');
  if (level >= 3) sections.push('lead-tech');
  if (level >= 4) sections.push('management');
  if (hasBlogAccess(roles)) sections.push('social-media');
  if (isLeadDeveloper(roles)) sections.push('admin');

  return sections;
}

// ============================================================================
// Role Validation
// ============================================================================

/**
 * Validates that a roles array is valid.
 *
 * Rules:
 * - Must have at least one role
 * - Customer role cannot be combined with employee roles
 * - All role strings must be valid role identifiers
 *
 * @param roles - Array of roles to validate
 * @returns Object with valid boolean and optional error message
 *
 * @example
 * validateRoles(['technician', 'social_media']) // { valid: true }
 * validateRoles(['customer', 'technician']) // { valid: false, error: '...' }
 */
export function validateRoles(roles: string[]): { valid: boolean; error?: string } {
  if (!roles || roles.length === 0) {
    return { valid: false, error: 'At least one role is required' };
  }

  const validRoles = [
    ...BUSINESS_ROLES,
    'social_media',
    'lead_developer',
    'customer',
  ];

  // Check all roles are valid
  for (const role of roles) {
    if (!validRoles.includes(role)) {
      return { valid: false, error: `Invalid role: ${role}` };
    }
  }

  // Check customer not mixed with employee roles
  const hasCustomer = roles.includes('customer');
  const hasEmployeeRole = roles.some(
    (r) => BUSINESS_ROLES.includes(r as BusinessRole) || r === 'social_media' || r === 'lead_developer'
  );

  if (hasCustomer && hasEmployeeRole) {
    return {
      valid: false,
      error: 'Customer role cannot be combined with employee roles',
    };
  }

  // Customer must be alone (except for potential future customer add-ons)
  if (hasCustomer && roles.length > 1) {
    return {
      valid: false,
      error: 'Customer role must be the only role',
    };
  }

  return { valid: true };
}

/**
 * Normalizes roles array by removing duplicates and sorting.
 *
 * @param roles - Array of roles to normalize
 * @returns Normalized array of roles
 */
export function normalizeRoles(roles: string[]): string[] {
  return [...new Set(roles)].sort();
}

// ============================================================================
// Legacy Compatibility
// ============================================================================

/**
 * Converts new roles array to legacy single role for backward compatibility.
 *
 * Maps to old role system:
 * - owner/lead_developer/manager → 'admin'
 * - lead_technician/technician → 'technician'
 * - receptionist → 'receptionist'
 * - customer → 'customer'
 *
 * @param roles - Array of role identifiers
 * @returns Legacy single role string
 *
 * @deprecated Use roles array directly instead
 */
export function toLegacyRole(roles: string[]): string {
  if (hasAnyRole(roles, ['owner', 'lead_developer', 'manager'])) {
    return 'admin';
  }
  if (hasAnyRole(roles, ['lead_technician', 'technician'])) {
    return 'technician';
  }
  if (roles.includes('receptionist')) {
    return 'receptionist';
  }
  if (roles.includes('customer')) {
    return 'customer';
  }
  return 'anonymous';
}

/**
 * Converts legacy single role to new roles array.
 *
 * @param legacyRole - Old single role string
 * @returns Array of new role identifiers
 *
 * @deprecated Use roles array directly instead
 */
export function fromLegacyRole(legacyRole: string): string[] {
  switch (legacyRole) {
    case 'admin':
      return ['owner', 'lead_developer'];
    case 'technician':
      return ['technician'];
    case 'receptionist':
      return ['receptionist'];
    case 'customer':
      return ['customer'];
    default:
      return ['customer'];
  }
}
