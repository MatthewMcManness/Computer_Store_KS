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
  onLogout?: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
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

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-700">
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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
  );
}
