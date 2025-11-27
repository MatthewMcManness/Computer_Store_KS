import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin';

export const metadata = {
  title: 'Admin Panel',
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

  // If not authenticated and not on login page, redirect to login
  // Note: This check happens at the layout level, individual pages can override

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
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
      </body>
    </html>
  );
}
