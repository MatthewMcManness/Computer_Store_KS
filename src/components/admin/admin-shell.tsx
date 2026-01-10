'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';

export type SidebarMode = 'expanded' | 'collapsed' | 'hidden';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-mode';

interface AdminShellProps {
  children: React.ReactNode;
}

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

  // Cycle through sidebar modes
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

  // Get the margin class based on sidebar mode
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
