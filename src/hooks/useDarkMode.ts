'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'admin-dark-mode';

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

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle, isLoaded };
}
