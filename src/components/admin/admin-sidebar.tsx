'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import NextImage from 'next/image';
import {
  LayoutDashboard,
  Image,
  LogOut,
  RefreshCw,
  FileText,
  PenSquare,
  ClipboardList,
  Users,
  Building2,
  Ticket,
  UserCog,
  X,
} from 'lucide-react';
import type { SidebarMode } from './admin-shell';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Customer Intake',
    href: '/admin/intake',
    icon: <ClipboardList className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: <Users className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Businesses',
    href: '/admin/businesses',
    icon: <Building2 className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Tickets',
    href: '/admin/tickets',
    icon: <Ticket className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Gallery',
    href: '/admin/gallery',
    icon: <Image className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Blog Posts',
    href: '/admin/blog',
    icon: <FileText className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'New Post',
    href: '/admin/blog/new',
    icon: <PenSquare className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Employees',
    href: '/admin/employees',
    icon: <UserCog className="h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Data Sync',
    href: '/admin/sync',
    icon: <RefreshCw className="h-5 w-5 flex-shrink-0" />,
  },
];

interface AdminSidebarProps {
  mode: SidebarMode;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onLogout?: () => void;
}

export function AdminSidebar({ mode, mobileMenuOpen, onCloseMobileMenu, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const isCollapsed = mode === 'collapsed';
  const isHidden = mode === 'hidden';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/admin/login';
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
                src="/assets/logo.png"
                alt="Computer Store KS logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg bg-gray-100 p-1 object-contain dark:bg-gray-800 flex-shrink-0"
                priority
              />
              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">Employee Portal</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Computer Store KS</p>
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

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
            <div className={cn('space-y-1', isCollapsed ? 'px-2' : 'px-3')}>
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center rounded-lg text-sm font-medium transition-colors',
                      isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                  >
                    {item.icon}
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer - Logout */}
          <div className={cn('border-t border-gray-200 dark:border-gray-700', isCollapsed ? 'p-2' : 'p-3')}>
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
