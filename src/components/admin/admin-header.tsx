/**
 * ADMIN PAGE HEADER - The title bar at the top of each admin page showing
 * the page name and optional action buttons.
 *
 * WHEN TO EDIT: When changing the admin page header layout.
 */
'use client';

import {
  Menu,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  PanelLeftOpen,
} from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import type { SidebarMode } from './admin-shell';

/**
 * Props for the AdminHeader component.
 */
interface AdminHeaderProps {
  onMenuToggle: () => void;
  onSidebarToggle: () => void;
  sidebarMode: SidebarMode;
  isMobileMenuOpen: boolean;
}

/**
 * Admin dashboard header with navigation toggles and dark mode.
 *
 * Renders a sticky header containing:
 * - Mobile menu toggle button
 * - Desktop sidebar collapse/expand toggle
 * - Dark mode toggle button
 *
 * @param props - Component properties
 * @param props.onMenuToggle - Callback to toggle mobile menu visibility
 * @param props.onSidebarToggle - Callback to cycle through sidebar modes (expanded/collapsed/hidden)
 * @param props.sidebarMode - Current sidebar display mode
 * @param props.isMobileMenuOpen - Whether mobile menu is currently open
 *
 * @returns {JSX.Element} Sticky header component
 *
 * @example
 * <AdminHeader
 *   onMenuToggle={() => setMobileOpen(!mobileOpen)}
 *   onSidebarToggle={cycleSidebarMode}
 *   sidebarMode="expanded"
 *   isMobileMenuOpen={false}
 * />
 *
 * @functions_called useDarkMode
 * @called_by AdminShell
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 2.0.0 - 2026-03-16T00:00:00Z - Removed search bar (search API archived)
 */
export function AdminHeader({ onMenuToggle, onSidebarToggle, sidebarMode, isMobileMenuOpen }: AdminHeaderProps) {
  const { isDark, toggle } = useDarkMode();

  // Get sidebar toggle icon and label based on current mode
  const getSidebarToggleInfo = () => {
    switch (sidebarMode) {
      case 'expanded':
        return { icon: <PanelLeftClose className="h-5 w-5" />, label: 'Collapse sidebar' };
      case 'collapsed':
        return { icon: <PanelLeft className="h-5 w-5" />, label: 'Hide sidebar' };
      case 'hidden':
        return { icon: <PanelLeftOpen className="h-5 w-5" />, label: 'Show sidebar' };
    }
  };

  const sidebarToggleInfo = getSidebarToggleInfo();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-full items-center justify-between">
        {/* Left section - menu toggles */}
        <div className="flex items-center gap-2 px-2 sm:px-4 lg:px-4 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onSidebarToggle}
            className="hidden lg:flex rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label={sidebarToggleInfo.label}
            title={sidebarToggleInfo.label}
          >
            {sidebarToggleInfo.icon}
          </button>
        </div>

        {/* Right section - dark mode toggle */}
        <div className="flex items-center flex-shrink-0">
          {/* Dark mode toggle - square filling header height, locked to right edge */}
          <button
            onClick={toggle}
            className="flex h-16 w-16 items-center justify-center border-l border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 transition-all hover:from-gray-100 hover:to-gray-200 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-6 w-6 text-amber-500" /> : <Moon className="h-6 w-6 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
