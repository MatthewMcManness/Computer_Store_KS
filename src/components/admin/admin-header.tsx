/**
 * ADMIN HEADER - Top navigation bar for all admin pages.
 * Shows the CS logo on the left, dark mode toggle and logout on the right.
 *
 * WHEN TO EDIT: When changing the admin header layout or actions.
 */
'use client';

import Image from 'next/image';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

/**
 * Sticky admin header with logo, dark mode toggle, and logout button.
 *
 * @returns {JSX.Element} Sticky header component
 *
 * @sideEffects
 * - Calls POST /api/auth/logout and redirects to /login on logout
 *
 * @functions_called useDarkMode
 * @called_by AdminShell
 *
 * @version 4.0.0 - 2026-04-06T00:00:00Z - Simplified: logo + dark mode + logout only
 */
export function AdminHeader() {
  const { isDark, toggle } = useDarkMode();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Image
          src="/assets/csk-icon.svg"
          alt="Computer Store KS"
          width={32}
          height={32}
          className="h-8 w-8 rounded-lg bg-gray-100 p-1 object-contain dark:bg-gray-800"
          priority
        />

        {/* Actions */}
        <div className="flex items-center">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="flex h-16 w-16 items-center justify-center border-l border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 transition-all hover:from-gray-100 hover:to-gray-200 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-6 w-6 text-amber-500" /> : <Moon className="h-6 w-6 text-indigo-600" />}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex h-16 w-16 items-center justify-center border-l border-gray-200 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
