import { isAuthenticated } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin';
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

  // If not authenticated and not on login page, render without sidebar
  // Note: This check happens at the layout level, individual pages can override

  return (
    <div className="admin-layout min-h-screen bg-gray-50 dark:bg-gray-950">
      {authenticated ? (
        <div className="flex">
          <AdminSidebar />
          <main className="ml-64 flex-1 p-8">
            {children}
          </main>
        </div>
      ) : (
        // For unauthenticated users (login page), render without sidebar
        <main className="min-h-screen">
          {children}
        </main>
      )}
    </div>
  );
}
