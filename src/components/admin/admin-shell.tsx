/**
 * ADMIN SHELL - The outer wrapper that combines the sidebar and main
 * content area for all admin pages.
 *
 * WHEN TO EDIT: When changing the overall admin page structure.
 */
'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';

/**
 * Sidebar display mode options for responsive admin layout.
 */
export type SidebarMode = 'expanded' | 'collapsed' | 'hidden';

/**
 * LocalStorage key for persisting user's sidebar preference.
 */
const SIDEBAR_STORAGE_KEY = 'admin-sidebar-mode';

/**
 * Props for the AdminShell component.
 */
interface AdminShellProps {
  children: React.ReactNode;
}

/**
 * Main admin dashboard layout wrapper with persistent sidebar and header.
 *
 * Provides the admin interface structure with:
 * - Collapsible/hideable sidebar with navigation
 * - Sticky header with search and controls
 * - Persistent sidebar state in localStorage
 * - Responsive behavior for mobile and desktop
 * - Keyboard shortcuts (Escape to close mobile menu)
 *
 * @param props - Component properties
 * @param props.children - Admin page content to render in main area
 *
 * @returns {JSX.Element} Full admin layout with sidebar, header, and content
 *
 * @sideEffects
 * - Reads/writes sidebar mode to localStorage
 * - Adds/removes keyboard event listeners for Escape key
 * - Adds/removes window resize listeners for responsive behavior
 *
 * @example
 * <AdminShell>
 *   <DashboardContent />
 * </AdminShell>
 *
 * @functions_called AdminSidebar, AdminHeader
 * @called_by Admin page layouts (app/admin/*)
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function AdminShell({ children }: AdminShellProps) {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('expanded');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY) as SidebarMode | null;
    if (saved && ['expanded', 'collapsed', 'hidden'].includes(saved)) {
      setSidebarMode(saved);
    }
    setIsLoaded(true);
  }, []);

  // Save preference when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarMode);
    }
  }, [sidebarMode, isLoaded]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Cycles through sidebar display modes: expanded → collapsed → hidden → expanded.
   *
   * @sideEffects Updates sidebar mode state
   *
   * @functions_called None
   * @called_by AdminHeader (via onSidebarToggle prop)
   *
   * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
   */
  const cycleSidebarMode = () => {
    setSidebarMode((current) => {
      switch (current) {
        case 'expanded':
          return 'collapsed';
        case 'collapsed':
          return 'hidden';
        case 'hidden':
          return 'expanded';
      }
    });
  };

  /**
   * Returns Tailwind margin class for main content area based on sidebar mode.
   *
   * @returns Tailwind class string for left margin on large screens
   *
   * @functions_called None
   * @called_by AdminShell render
   *
   * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
   */
  const getMainMargin = () => {
    switch (sidebarMode) {
      case 'expanded':
        return 'lg:ml-64';
      case 'collapsed':
        return 'lg:ml-[72px]';
      case 'hidden':
        return 'lg:ml-0';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <AdminSidebar
        mode={sidebarMode}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />

      {/* Main content area */}
      <div className={`${getMainMargin()} flex flex-col min-h-screen transition-[margin] duration-300`}>
        {/* Header with search */}
        <AdminHeader
          onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          onSidebarToggle={cycleSidebarMode}
          sidebarMode={sidebarMode}
          isMobileMenuOpen={mobileMenuOpen}
        />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
