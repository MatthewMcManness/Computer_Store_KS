'use client';

/**
 * Location Selector Component
 *
 * Dropdown for selecting which business location to view data for.
 * Only visible to users with global access (owner, lead_developer).
 *
 * When "All Locations" is selected, the user sees data from all locations.
 * When a specific location is selected, data is filtered to that location.
 *
 * The selection is stored in a cookie and persists across sessions.
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { type LocationOption } from '@/types/locations';

interface LocationSelectorProps {
  /** Available locations to select from */
  locations: LocationOption[];
  /** Currently selected location slug (null = all locations) */
  selectedLocation: string | null;
  /** Whether the user has access to all locations */
  hasGlobalAccess: boolean;
}

/**
 * Location selector dropdown component.
 *
 * @param props - Component props
 * @returns Location selector or null if user doesn't have global access
 *
 * @functions_called setLocationAction (server action)
 * @called_by AdminSidebar, AdminLayout
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export function LocationSelector({
  locations,
  selectedLocation,
  hasGlobalAccess,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Only show for users with global access
  if (!hasGlobalAccess) {
    return null;
  }

  const selectedName = selectedLocation
    ? locations.find((l) => l.slug === selectedLocation)?.name || selectedLocation
    : 'All Locations';

  const handleSelect = async (slug: string | null) => {
    setIsOpen(false);

    startTransition(async () => {
      // Call server action to set the location cookie
      const response = await fetch('/api/admin/set-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: slug }),
      });

      if (response.ok) {
        // Refresh the page to reload data with new location filter
        router.refresh();
      }
    });
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="max-w-[150px] truncate">{selectedName}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute left-0 z-20 mt-2 w-56 origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {/* All Locations Option */}
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">All Locations</span>
                </div>
                {selectedLocation === null && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>

              <div className="border-t border-gray-100 my-1" />

              {/* Individual Locations */}
              {locations.map((location) => (
                <button
                  key={location.slug}
                  type="button"
                  onClick={() => handleSelect(location.slug)}
                  disabled={!location.is_active}
                  className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                    location.is_active
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin
                      className={`h-4 w-4 ${
                        location.is_active ? 'text-gray-400' : 'text-gray-300'
                      }`}
                    />
                    <span>{location.name}</span>
                    {!location.is_active && (
                      <span className="text-xs text-gray-400">(Coming Soon)</span>
                    )}
                  </div>
                  {selectedLocation === location.slug && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Location badge showing current location for regular users.
 * Shows their assigned location (not selectable).
 *
 * @param props - Component props
 * @returns Location badge
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
export function LocationBadge({
  locationName,
}: {
  locationName: string | null;
}) {
  if (!locationName) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
      <MapPin className="h-3 w-3" />
      <span>{locationName}</span>
    </div>
  );
}
