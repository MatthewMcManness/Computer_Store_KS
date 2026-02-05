'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Wrench, Clock } from 'lucide-react';

export default function CustomerPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (!data.authenticated) {
          router.push('/login');
          return;
        }

        // If employee, redirect to admin
        if (data.user?.userType === 'employee') {
          router.push('/admin');
          return;
        }

        setUser(data.user);
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-white text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/csk-logo.svg"
              alt="Computer Store KS"
              width={504}
              height={227}
              style={{ height: '45px', width: 'auto' }}
              className="brightness-0 invert"
            />
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-white/80">
                Welcome, {user.name || user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl bg-white p-12 shadow-2xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
            <Wrench className="h-12 w-12 text-blue-600" />
          </div>

          {/* Title */}
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Customer Dashboard
          </h2>

          {/* Coming Soon Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-800">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Coming Soon!</span>
          </div>

          {/* Description */}
          <p className="mx-auto mb-8 max-w-lg text-gray-600">
            We're working hard to bring you a full-featured customer portal where you can
            track your repair tickets, view service history, and communicate with our team.
          </p>

          {/* Features Preview */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 text-2xl">🎫</div>
              <h3 className="font-semibold text-gray-900">Track Repairs</h3>
              <p className="text-sm text-gray-500">View status of your tickets</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 text-2xl">📋</div>
              <h3 className="font-semibold text-gray-900">Service History</h3>
              <p className="text-sm text-gray-500">See past repairs & invoices</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 text-2xl">💬</div>
              <h3 className="font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-500">Communicate with our team</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <p className="mb-3 text-sm font-medium text-blue-900">
              Need help with your repair?
            </p>
            <p className="text-blue-700 mb-2">
              Call us at <a href="tel:7852673223" className="font-semibold hover:underline">(785) 267-3223</a>
            </p>
            <p className="text-blue-700">
              Visit us at <span className="font-semibold">2008 SW Gage Blvd, Topeka, KS 66604</span>
            </p>
          </div>

          {/* Back to Website */}
          <div className="mt-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Back to Website
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-white/60 text-sm">
        <p>&copy; {new Date().getFullYear()} Computer Store Kansas. All rights reserved.</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span>Created and Maintained by</span>
          <a
            href="https://resilientwebsolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
          >
            <Image
              src="/assets/rws-logo.svg"
              alt="Resilient Web Solutions"
              width={16}
              height={16}
              className="brightness-0 invert opacity-80"
            />
            <span className="font-medium">Resilient Web Solutions</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
