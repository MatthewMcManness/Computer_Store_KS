'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import NextImage from 'next/image';
import {
  LayoutDashboard,
  Image,
  LogOut,
  RefreshCw,
  PenTool,
  ClipboardList,
  Users,
  Building2,
  Ticket,
  UserCog,
  X,
  ChevronDown,
  ChevronRight,
  Wrench,
  Crown,
  Share2,
  Settings,
  Shield,
  UserPlus,
  Home,
  Receipt,
  CreditCard,
  Target,
  FileText,
  Images,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import type { SidebarMode } from './admin-shell';
import type { SidebarSection, SidebarItem, IconName } from '@/types/roles';
import type { LocationOption } from '@/types/locations';
import { getFilteredSidebar, getDefaultExpandedSections } from '@/lib/role-helpers';
import { canAccessAllLocations } from '@/types/locations';
import { LocationSelector, LocationBadge } from './location-selector';

// =============================================================================
// Icon Mapping
// =============================================================================

/**
 * Maps icon name strings from sidebar configuration to Lucide React components.
 *
 * @param iconName - The icon name from SIDEBAR_CONFIG
 * @param className - CSS classes to apply to the icon
 * @returns React node with the appropriate icon
 *
 * @functions_called None (renders Lucide icon components)
 * @called_by AdminSidebar component
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
function getIcon(iconName: IconName, className: string = 'h-5 w-5 flex-shrink-0'): React.ReactNode {
  const iconMap: Record<IconName, React.ReactNode> = {
    ClipboardList: <ClipboardList className={className} />,
    Wrench: <Wrench className={className} />,
    Crown: <Crown className={className} />,
    Share2: <Share2 className={className} />,
    Settings: <Settings className={className} />,
    Shield: <Shield className={className} />,
    LayoutDashboard: <LayoutDashboard className={className} />,
    UserPlus: <UserPlus className={className} />,
    Users: <Users className={className} />,
    Home: <Home className={className} />,
    Building2: <Building2 className={className} />,
    Ticket: <Ticket className={className} />,
    Receipt: <Receipt className={className} />,
    CreditCard: <CreditCard className={className} />,
    Target: <Target className={className} />,
    FileText: <FileText className={className} />,
    Images: <Images className={className} />,
    PenTool: <PenTool className={className} />,
    RefreshCw: <RefreshCw className={className} />,
    AlertTriangle: <AlertTriangle className={className} />,
    Cpu: <Cpu className={className} />,
  };

  return iconMap[iconName] || <LayoutDashboard className={className} />;
}

// =============================================================================
// LocalStorage Helpers
// =============================================================================

const EXPANDED_SECTIONS_KEY = 'admin-sidebar-expanded-sections';

/**
 * Loads expanded section IDs from localStorage.
 *
 * @returns Array of expanded section IDs, or null if not set
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
function loadExpandedSections(): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(EXPANDED_SECTIONS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Saves expanded section IDs to localStorage.
 *
 * @param sections - Array of expanded section IDs to save
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
function saveExpandedSections(sections: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXPANDED_SECTIONS_KEY, JSON.stringify(sections));
  } catch {
    // Ignore localStorage errors
  }
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the AdminSidebar component.
 */
interface AdminSidebarProps {
  mode: SidebarMode;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onLogout?: () => void;
}

// =============================================================================
// Sidebar Section Component
// =============================================================================

interface SidebarSectionProps {
  section: SidebarSection;
  isExpanded: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  pathname: string | null;
  onNavClick: () => void;
}

/**
 * Collapsible sidebar section with header and items.
 *
 * @param props - Component properties
 * @returns JSX element for a collapsible section
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 */
function SidebarSectionComponent({
  section,
  isExpanded,
  onToggle,
  isCollapsed,
  pathname,
  onNavClick,
}: SidebarSectionProps) {
  // Check if any item in this section is active
  const hasActiveItem = section.items.some(
    (item) => pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
  );

  return (
    <div className="mb-1">
      {/* Section Header */}
      <button
        onClick={onToggle}
        title={isCollapsed ? section.label : undefined}
        className={cn(
          'flex w-full items-center rounded-lg text-sm font-medium transition-colors',
          isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2',
          hasActiveItem
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        )}
      >
        <div className={cn('flex items-center', isCollapsed ? '' : 'gap-3')}>
          {getIcon(section.icon)}
          {!isCollapsed && <span>{section.label}</span>}
        </div>
        {!isCollapsed && (
          isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        )}
      </button>

      {/* Section Items */}
      {(isExpanded || isCollapsed) && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isCollapsed ? 'mt-1 space-y-1' : 'mt-1 ml-4 space-y-1',
            !isExpanded && !isCollapsed && 'h-0'
          )}
        >
          {section.items.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-lg text-sm transition-colors',
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                {item.icon && getIcon(item.icon, 'h-4 w-4 flex-shrink-0')}
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Sidebar Component
// =============================================================================

/**
 * Admin navigation sidebar with collapsible sections and role-based filtering.
 *
 * Renders a fixed sidebar with:
 * - Company logo and branding
 * - Collapsible navigation sections filtered by user permissions
 * - Active route highlighting
 * - Three display modes: expanded (full), collapsed (icons only), hidden
 * - Mobile overlay with full menu
 * - Logout button
 * - Persistent expanded sections state via localStorage
 *
 * @param props - Component properties
 * @param props.mode - Current sidebar display mode (expanded/collapsed/hidden)
 * @param props.mobileMenuOpen - Whether mobile menu overlay is visible
 * @param props.onCloseMobileMenu - Callback to close mobile menu
 * @param props.onLogout - Optional callback to handle logout (defaults to API call + redirect)
 *
 * @returns {JSX.Element} Sidebar navigation component
 *
 * @sideEffects
 * - Makes GET request to `/api/auth/check` to fetch user roles
 * - Makes POST request to `/api/auth/logout` on logout
 * - Redirects to login page after logout
 * - Closes mobile menu on navigation (mobile only)
 * - Reads/writes localStorage for expanded sections persistence
 *
 * @example
 * <AdminSidebar
 *   mode="expanded"
 *   mobileMenuOpen={false}
 *   onCloseMobileMenu={() => setMobileOpen(false)}
 * />
 *
 * @functions_called usePathname, getFilteredSidebar, getDefaultExpandedSections,
 *                    loadExpandedSections, saveExpandedSections, getIcon
 * @called_by AdminShell
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Refactored for collapsible sections and RBAC
 */
export function AdminSidebar({
  mode,
  mobileMenuOpen,
  onCloseMobileMenu,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const isCollapsed = mode === 'collapsed';
  const isHidden = mode === 'hidden';

  // User roles state
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Location state
  const [hasGlobalAccess, setHasGlobalAccess] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [availableLocations, setAvailableLocations] = useState<LocationOption[]>([]);
  const [userLocationName, setUserLocationName] = useState<string | null>(null);

  // Filtered sidebar sections based on user permissions
  const [filteredSections, setFilteredSections] = useState<SidebarSection[]>([]);

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Fetch user roles and location data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          const data = await response.json();
          // Support both roles array and legacy role field
          const roles = data.roles || (data.role ? [data.role] : ['customer']);
          setUserRoles(roles);

          // Check global access
          const globalAccess = canAccessAllLocations(roles);
          setHasGlobalAccess(globalAccess);

          // Set location data if provided
          if (data.locationContext) {
            setSelectedLocation(data.locationContext.selectedLocation || null);
            setAvailableLocations(data.locationContext.availableLocations || []);
            setUserLocationName(data.locationContext.userLocation?.name || null);
          }
        }
      } catch (error) {
        console.error('[SIDEBAR] Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Filter sidebar sections based on user roles
  useEffect(() => {
    if (userRoles.length > 0) {
      const sections = getFilteredSidebar(userRoles);
      setFilteredSections(sections);

      // Initialize expanded sections from localStorage or defaults
      const stored = loadExpandedSections();
      if (stored) {
        setExpandedSections(new Set(stored));
      } else {
        const defaults = getDefaultExpandedSections(userRoles);
        setExpandedSections(new Set(defaults));
      }
    }
  }, [userRoles]);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      saveExpandedSections(Array.from(next));
      return next;
    });
  }, []);

  /**
   * Handles user logout by calling API endpoint and redirecting.
   *
   * @sideEffects
   * - Calls POST /api/auth/logout
   * - Redirects to /login or calls onLogout callback
   *
   * @functions_called fetch
   * @called_by Logout button click handler
   *
   * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
   */
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onCloseMobileMenu();
    }
  };

  // Get sidebar width based on mode
  const getSidebarWidth = () => {
    if (isHidden) return 'w-0';
    if (isCollapsed) return 'w-[72px]';
    return 'w-64';
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-900',
          getSidebarWidth(),
          // Desktop visibility based on mode
          'lg:translate-x-0 lg:z-40',
          isHidden && 'lg:border-r-0',
          // Mobile behavior - always full width when open
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
          // Hide overflow when collapsed or hidden
          (isCollapsed || isHidden) && 'overflow-hidden'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div
            className={cn(
              'flex h-16 items-center border-b border-gray-200 dark:border-gray-700 transition-all duration-300',
              isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
            )}
          >
            <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
              <NextImage
                src="/assets/csk-icon.svg"
                alt="Computer Store KS logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg bg-gray-100 p-1 object-contain dark:bg-gray-800 flex-shrink-0"
                priority
              />
              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    Employee Portal
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Computer Store KS
                  </p>
                </div>
              )}
            </div>
            {/* Close button - mobile only */}
            {!isCollapsed && (
              <button
                onClick={onCloseMobileMenu}
                className="lg:hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Location Selector - Only visible when sidebar is expanded */}
          {!isCollapsed && !isLoading && (
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              {hasGlobalAccess ? (
                <LocationSelector
                  locations={availableLocations}
                  selectedLocation={selectedLocation}
                  hasGlobalAccess={hasGlobalAccess}
                  onLocationChange={setSelectedLocation}
                />
              ) : userLocationName ? (
                <LocationBadge locationName={userLocationName} />
              ) : null}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
            <div className={cn('space-y-1', isCollapsed ? 'px-2' : 'px-3')}>
              {/* Loading state */}
              {isLoading && !isCollapsed && (
                <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading menu...
                </div>
              )}

              {/* Collapsible Sections */}
              {!isLoading &&
                filteredSections.map((section) => (
                  <SidebarSectionComponent
                    key={section.id}
                    section={section}
                    isExpanded={expandedSections.has(section.id)}
                    onToggle={() => toggleSection(section.id)}
                    isCollapsed={isCollapsed}
                    pathname={pathname}
                    onNavClick={handleNavClick}
                  />
                ))}
            </div>
          </nav>

          {/* Footer - Logout */}
          <div
            className={cn(
              'border-t border-gray-200 dark:border-gray-700',
              isCollapsed ? 'p-2' : 'p-3'
            )}
          >
            <button
              onClick={handleLogout}
              title={isCollapsed ? 'Logout' : undefined}
              className={cn(
                'flex w-full items-center rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
