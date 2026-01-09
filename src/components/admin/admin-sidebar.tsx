'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import NextImage from 'next/image';
import {
  LayoutDashboard,
  Image,
  LogOut,
  Home,
  RefreshCw,
  FileText,
  PenSquare,
  ClipboardList,
  Users,
  Building2,
  Ticket,
  Moon,
  Sun,
  UserCog,
  X,
} from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Customer Intake',
    href: '/admin/intake',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Businesses',
    href: '/admin/businesses',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    label: 'Tickets',
    href: '/admin/tickets',
    icon: <Ticket className="h-5 w-5" />,
  },
  {
    label: 'Gallery',
    href: '/admin/gallery',
    icon: <Image className="h-5 w-5" />,
  },
  {
    label: 'Blog Posts',
    href: '/admin/blog',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'New Post',
    href: '/admin/blog/new',
    icon: <PenSquare className="h-5 w-5" />,
  },
  {
    label: 'Employees',
    href: '/admin/employees',
    icon: <UserCog className="h-5 w-5" />,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export function AdminSidebar({ isOpen, onClose, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const { isDark, toggle } = useDarkMode();

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
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900',
          'lg:translate-x-0 lg:z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <NextImage
                src="/assets/logo.png"
                alt="Computer Store KS logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg bg-gray-100 p-1 object-contain dark:bg-gray-800"
                priority
              />
              <div>
                <h1 className="text-sm font-bold text-gray-900 dark:text-white">Employee Portal</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Computer Store KS</p>
              </div>
            </div>
            {/* Close button - mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/admin' && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-3 space-y-1 dark:border-gray-700">
            <button
              onClick={toggle}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Home className="h-5 w-5" />
              View Site
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RefreshCw className="h-5 w-5" />
              Reload
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
