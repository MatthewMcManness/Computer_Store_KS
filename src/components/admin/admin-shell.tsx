/**
 * ADMIN SHELL - The outer wrapper for all admin pages.
 * Renders the header and main content area.
 *
 * WHEN TO EDIT: When changing the overall admin page structure.
 */
'use client';

import { AdminHeader } from './admin-header';

/**
 * Props for the AdminShell component.
 */
interface AdminShellProps {
  children: React.ReactNode;
}

/**
 * Admin layout wrapper with header and content area.
 *
 * @param props.children - Admin page content
 *
 * @returns {JSX.Element} Full admin layout
 *
 * @functions_called AdminHeader
 * @called_by Admin layout (app/admin/layout.tsx)
 *
 * @version 2.0.0 - 2026-04-06T00:00:00Z - Simplified: removed sidebar, header-only layout
 */
export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminHeader />
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
