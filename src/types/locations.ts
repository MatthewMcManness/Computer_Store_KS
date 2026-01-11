/**
 * Location types and configuration for multi-location support.
 *
 * This module defines location types, configuration, and helper functions
 * for the multi-location data isolation system.
 *
 * Design:
 * - Each business location has a unique slug and display name
 * - Users belong to a location (via location_id in user_profiles)
 * - owner and lead_developer roles can access ALL locations
 * - Other roles only see data at their assigned location
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */

// ============================================================================
// Location Types
// ============================================================================

/**
 * Location slug - URL-friendly unique identifier for a location.
 * Used in URLs, cookies, and API queries.
 */
export type LocationSlug = 'topeka' | 'holton';

/**
 * Full location object from the database.
 */
export interface Location {
  id: string;                    // UUID
  slug: LocationSlug;            // URL-friendly identifier
  name: string;                  // Display name
  address: string | null;        // Full street address
  phone: string | null;          // Location phone number
  email: string | null;          // Location email
  timezone: string;              // IANA timezone (e.g., 'America/Chicago')
  is_active: boolean;            // Whether location is operational
  sort_order: number;            // For display ordering
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
}

/**
 * Minimal location info for dropdowns and selectors.
 */
export interface LocationOption {
  slug: LocationSlug;
  name: string;
  is_active: boolean;
}

// ============================================================================
// Location Configuration
// ============================================================================

/**
 * All known location slugs.
 * Add new locations here when expanding.
 */
export const ALL_LOCATION_SLUGS: LocationSlug[] = ['topeka', 'holton'];

/**
 * Default location slug (used for new users if not specified).
 */
export const DEFAULT_LOCATION: LocationSlug = 'topeka';

/**
 * Location display names and metadata.
 * This is used for client-side display before fetching from database.
 */
export const LOCATION_CONFIG: Record<LocationSlug, { name: string; description: string }> = {
  topeka: {
    name: 'Topeka',
    description: 'Main store at 2301 SW Chelsea Dr',
  },
  holton: {
    name: 'Holton',
    description: 'Coming soon',
  },
};

/**
 * Get display name for a location slug.
 *
 * @param slug - Location slug
 * @returns Display name or slug if not found
 *
 * @functions_called None
 * @called_by LocationSelector, EmployeesPage, various UI components
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export function getLocationName(slug: string | null | undefined): string {
  if (!slug) return 'Unknown';
  const config = LOCATION_CONFIG[slug as LocationSlug];
  return config?.name ?? slug;
}

/**
 * Check if a slug is a valid location.
 *
 * @param slug - Value to check
 * @returns true if valid location slug
 *
 * @functions_called None
 * @called_by validateLocation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export function isValidLocation(slug: string): slug is LocationSlug {
  return ALL_LOCATION_SLUGS.includes(slug as LocationSlug);
}

// ============================================================================
// Location Access Control
// ============================================================================

/**
 * Roles that can access ALL locations (superuser access).
 * These users see a location selector dropdown.
 */
export const GLOBAL_ACCESS_ROLES = ['owner', 'lead_developer', 'admin'] as const;

/**
 * Check if a user's roles grant access to all locations.
 *
 * @param roles - Array of user's roles
 * @returns true if user can access all locations
 *
 * @example
 * canAccessAllLocations(['owner']) // true
 * canAccessAllLocations(['technician']) // false
 * canAccessAllLocations(['manager', 'lead_developer']) // true
 *
 * @functions_called None
 * @called_by LocationContext, middleware, API routes
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export function canAccessAllLocations(roles: string[]): boolean {
  return roles.some(role => GLOBAL_ACCESS_ROLES.includes(role as any));
}

/**
 * Get the location filter for database queries based on user's roles and selected location.
 *
 * For users with global access:
 * - If selectedLocation is set, filter by that location
 * - If selectedLocation is null/undefined, return all locations (no filter)
 *
 * For users without global access:
 * - Always filter by their assigned location (userLocationId)
 *
 * @param userRoles - User's roles array
 * @param userLocationId - User's assigned location ID
 * @param selectedLocation - Currently selected location (for global access users)
 * @returns Location ID to filter by, or null for no filter (all locations)
 *
 * @functions_called canAccessAllLocations
 * @called_by API routes, data fetching functions
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export function getLocationFilter(
  userRoles: string[],
  userLocationId: string | null,
  selectedLocation?: string | null
): string | null {
  // Users with global access can choose which location to view
  if (canAccessAllLocations(userRoles)) {
    // If they selected a specific location, filter by it
    // If not, return null (no filter = all locations)
    return selectedLocation ?? null;
  }

  // Users without global access are always filtered to their location
  return userLocationId;
}

// ============================================================================
// Cookie/Session Constants
// ============================================================================

/**
 * Cookie name for storing selected location (for global access users).
 */
export const LOCATION_COOKIE_NAME = 'selected_location';

/**
 * Cookie max age in seconds (30 days).
 */
export const LOCATION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
