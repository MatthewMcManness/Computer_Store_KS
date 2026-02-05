import Image from 'next/image';
import Link from 'next/link';

// Force dynamic rendering for auth routes
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign In',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Go to homepage">
            <Image
              src="/assets/csk-logo.svg"
              alt="Computer Store KS"
              width={504}
              height={227}
              priority
              style={{ height: '60px', width: 'auto' }}
            />
          </Link>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-2xl">
          {children}
        </div>

        {/* Back to site link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-white/80 hover:text-white hover:underline transition-colors"
          >
            Back to Website
          </Link>
        </div>

        {/* RWS Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/60">
          <span>Created and Maintained by</span>
          <a
            href="https://resilientwebsolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
          >
            <Image
              src="/assets/rws-logo.svg"
              alt="Resilient Web Solutions"
              width={16}
              height={16}
            />
            <span className="font-medium">Resilient Web Solutions</span>
          </a>
        </div>
      </div>
    </div>
  );
}
