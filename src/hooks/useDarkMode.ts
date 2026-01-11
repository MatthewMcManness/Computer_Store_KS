'use client';

import { useState, useEffect } from 'react';

/**
 * localStorage key for persisting dark mode preference.
 * Scoped to admin dashboard to avoid conflicts with public site theme.
 */
const STORAGE_KEY = 'admin-dark-mode';

/**
 * Custom hook for managing dark mode theme state in admin dashboard.
 *
 * Provides dark mode toggle functionality with automatic persistence to localStorage
 * and system preference detection. Manages Tailwind CSS dark mode class on the document
 * element for admin pages.
 *
 * On initial load, checks localStorage for saved preference. If none exists, falls back
 * to system preference (prefers-color-scheme media query). Prevents flash of unstyled
 * content by tracking loaded state.
 *
 * @returns Object containing:
 *   - isDark: Boolean indicating if dark mode is currently active
 *   - toggle: Function to toggle between light and dark mode
 *   - isLoaded: Boolean indicating if preference has been loaded (prevents flashing)
 *
 * @sideEffects
 * - Reads from and writes to localStorage (key: 'admin-dark-mode')
 * - Adds/removes 'dark' class on document.documentElement
 * - Queries system preference via window.matchMedia
 * - Effects run on component mount and when isDark changes
 *
 * @example
 * ```tsx
 * const AdminDashboard = () => {
 *   const { isDark, toggle, isLoaded } = useDarkMode();
 *
 *   // Prevent flash of unstyled content
 *   if (!isLoaded) return <Spinner />;
 *
 *   return (
 *     <div className="min-h-screen bg-white dark:bg-gray-900">
 *       <button onClick={toggle}>
 *         {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
 *       </button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @functions_called useState, useEffect (React), localStorage.getItem/setItem,
 *                    window.matchMedia, document.documentElement.classList
 * @called_by AdminLayout, admin dashboard pages
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load preference from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsDark(stored === 'true');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Save preference and apply class
    localStorage.setItem(STORAGE_KEY, String(isDark));

    // Apply to document element for admin pages
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark, isLoaded]);

  /**
   * Toggle function to switch between light and dark mode.
   * Updates state which triggers useEffect to persist and apply changes.
   */
  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle, isLoaded };
}
