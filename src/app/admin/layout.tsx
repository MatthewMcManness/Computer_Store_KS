/**
 * ADMIN LAYOUT - Wraps all /admin pages with the sidebar navigation
 * and checks that the user is logged in. If not authenticated,
 * redirects to /login.
 *
 * WHEN TO EDIT: When changing the admin sidebar, navigation structure,
 * or admin-specific CSS.
 */

import { isAuthenticated } from '@/lib/supabase-auth';
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
  // Check if user is authenticated
  const authenticated = await isAuthenticated();

  return (
    <div className="admin-layout">
      {authenticated ? (
        <AdminShell>
          {children}
        </AdminShell>
      ) : (
        // For unauthenticated users (login page), render without shell
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      )}
    </div>
  );
}
