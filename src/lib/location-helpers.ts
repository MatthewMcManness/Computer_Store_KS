/**
 * Location helper functions for multi-location support.
 *
 * Provides utilities for:
 * - Fetching locations from database
 * - Managing selected location state (cookies)
 * - Filtering data by location
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import {
  type Location,
  type LocationOption,
  type LocationSlug,
  LOCATION_COOKIE_NAME,
  LOCATION_COOKIE_MAX_AGE,
  DEFAULT_LOCATION,
  canAccessAllLocations,
  isValidLocation,
} from '@/types/locations';

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Fetch all locations from the database.
 *
 * @param activeOnly - If true, only return active locations
 * @returns Array of locations ordered by sort_order
 *
 * @sideEffects
 * - Reads from database
 *
 * @functions_called createServerClient
 * @called_by LocationSelector, admin pages
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function getLocations(activeOnly = false): Promise<Location[]> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  let query = supabase
    .from('locations')
    .select('*')
    .order('sort_order', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[location-helpers] Failed to fetch locations:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch location options for dropdowns (minimal data).
 *
 * @param activeOnly - If true, only return active locations
 * @returns Array of location options
 *
 * @functions_called getLocations
 * @called_by LocationSelector
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function getLocationOptions(activeOnly = false): Promise<LocationOption[]> {
  const locations = await getLocations(activeOnly);
  return locations.map((loc) => ({
    slug: loc.slug as LocationSlug,
    name: loc.name,
    is_active: loc.is_active,
  }));
}

/**
 * Fetch a single location by slug.
 *
 * @param slug - Location slug to fetch
 * @returns Location object or null if not found
 *
 * @functions_called createServerClient
 * @called_by Various pages that need location details
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function getLocationBySlug(slug: string): Promise<Location | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('[location-helpers] Failed to fetch location:', error);
    return null;
  }

  return data;
}

/**
 * Fetch a single location by ID.
 *
 * @param id - Location UUID to fetch
 * @returns Location object or null if not found
 *
 * @functions_called createServerClient
 * @called_by API routes, user profile pages
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function getLocationById(id: string): Promise<Location | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[location-helpers] Failed to fetch location by ID:', error);
    return null;
  }

  return data;
}

// ============================================================================
// Cookie/Session Management
// ============================================================================

/**
 * Get the currently selected location from cookies.
 * Only relevant for users with global access.
 *
 * @returns Selected location slug or null
 *
 * @sideEffects
 * - Reads cookies
 *
 * @functions_called cookies
 * @called_by getEffectiveLocation, API routes
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function getSelectedLocation(): Promise<string | null> {
  const cookieStore = await cookies();
  const selectedLocation = cookieStore.get(LOCATION_COOKIE_NAME)?.value;
  return selectedLocation && isValidLocation(selectedLocation) ? selectedLocation : null;
}

/**
 * Set the selected location in cookies.
 * Used by location selector dropdown.
 *
 * @param slug - Location slug to select, or null to clear
 *
 * @sideEffects
 * - Sets cookie
 *
 * @functions_called cookies
 * @called_by setLocationAction (server action)
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function setSelectedLocation(slug: string | null): Promise<void> {
  const cookieStore = await cookies();

  if (slug && isValidLocation(slug)) {
    cookieStore.set(LOCATION_COOKIE_NAME, slug, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: LOCATION_COOKIE_MAX_AGE,
      path: '/',
    });
  } else {
    // Clear the cookie
    cookieStore.delete(LOCATION_COOKIE_NAME);
  }
}

// ============================================================================
// Location Resolution
// ============================================================================

/**
 * Get the effective location for data queries.
 *
 * For users with global access (owner, lead_developer):
 * - Returns their selected location (from cookie) if set
 * - Returns null if no selection (meaning "all locations")
 *
 * For other users:
 * - Returns their assigned location ID
 *
 * @param userRoles - User's roles array
 * @param userLocationId - User's assigned location ID
 * @returns Location ID to filter by, or null for all locations
 *
 * @functions_called canAccessAllLocations, getSelectedLocation, getLocationBySlug
 * @called_by API routes, data fetching
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function getEffectiveLocationId(
  userRoles: string[],
  userLocationId: string | null
): Promise<string | null> {
  // Users with global access can view any location
  if (canAccessAllLocations(userRoles)) {
    const selectedSlug = await getSelectedLocation();

    // If they selected a specific location, get its ID
    if (selectedSlug) {
      const location = await getLocationBySlug(selectedSlug);
      return location?.id ?? null;
    }

    // No selection = all locations (return null)
    return null;
  }

  // Regular users are restricted to their assigned location
  return userLocationId;
}

/**
 * Get location context for the current user.
 * Used to provide location info to UI components.
 *
 * @param userRoles - User's roles array
 * @param userLocationId - User's assigned location ID
 * @param defaultLocationId - User's default location ID (for global access users)
 * @returns Location context object
 *
 * @functions_called canAccessAllLocations, getSelectedLocation, getLocations, getLocationById, setSelectedLocation
 * @called_by AdminLayout, LocationContext
 *
 * @version 1.1.0 - 2026-01-13T00:00:00Z - Added default location support
 */
export async function getLocationContext(
  userRoles: string[],
  userLocationId: string | null,
  defaultLocationId?: string | null
): Promise<{
  hasGlobalAccess: boolean;
  selectedLocation: string | null;
  userLocation: Location | null;
  defaultLocation: Location | null;
  availableLocations: LocationOption[];
}> {
  const hasGlobalAccess = canAccessAllLocations(userRoles);

  // Get selected location for global access users
  let selectedLocation = hasGlobalAccess ? await getSelectedLocation() : null;

  // Get user's default location (for global access users)
  const defaultLocation = defaultLocationId ? await getLocationById(defaultLocationId) : null;

  // If user has global access but no selected location, use their default
  if (hasGlobalAccess && !selectedLocation && defaultLocation) {
    // Auto-select the user's default location
    await setSelectedLocation(defaultLocation.slug);
    selectedLocation = defaultLocation.slug;
  }

  // Get user's assigned location
  const userLocation = userLocationId ? await getLocationById(userLocationId) : null;

  // Get available locations (for selector dropdown)
  // Global access users see all locations
  // Regular users see only active locations
  const availableLocations = hasGlobalAccess
    ? await getLocationOptions(false)  // All locations
    : await getLocationOptions(true);   // Active only

  return {
    hasGlobalAccess,
    selectedLocation,
    userLocation,
    defaultLocation,
    availableLocations,
  };
}

// ============================================================================
// Default Location
// ============================================================================

/**
 * Get the default location ID.
 * Used when creating new users or entities without a specified location.
 *
 * @returns Default location ID (Topeka)
 *
 * @functions_called getLocationBySlug
 * @called_by createUserProfile, employee creation
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export async function getDefaultLocationId(): Promise<string | null> {
  const location = await getLocationBySlug(DEFAULT_LOCATION);
  return location?.id ?? null;
}
