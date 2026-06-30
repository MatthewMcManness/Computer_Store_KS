/**
 * ADMIN LAYOUT - Wraps all /admin pages with the sidebar navigation.
 * Access to /admin is gated at the edge by Cloudflare Access, so the
 * layout no longer performs an in-app auth check.
 *
 * WHEN TO EDIT: When changing the admin sidebar, navigation structure,
 * or admin-specific CSS.
 */

import { AdminShell } from '@/components/admin';
import './admin.css';

// Force dynamic rendering for admin routes (no prerendering)
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Employee Portal',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <AdminShell>
        {children}
      </AdminShell>
    </div>
  );
}
