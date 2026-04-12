import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Businesses at 2008 SW Gage Blvd | Topeka, KS',
  description:
    'Computer Store KS, Topeka Phone Repair, and Resilient Web Solutions — all at 2008 SW Gage Blvd, Topeka, KS.',
  robots: { index: false, follow: false },
};

/**
 * Minimal layout wrapper for the in-store display slideshow.
 *
 * Intentionally excludes Header, Footer, analytics, and all other
 * public layout wrappers so the page renders as a clean kiosk display.
 * Because /slideshow is outside the (public) route group, Next.js will
 * not inject the site's static-styles.css or any nav components —
 * this layout just passes children through unchanged.
 *
 * @param children - The slideshow page content
 * @returns {JSX.Element} Pass-through fragment wrapper
 *
 * @functions_called none
 * @called_by Next.js routing for /slideshow/*
 *
 * @version 1.0.0 - 2026-04-12T00:00:00Z - Initial implementation
 */
export default function SlideshowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No <html>/<body> here — the root app/layout.tsx owns those.
  // We simply pass children through to keep the page free of site chrome.
  return <>{children}</>;
}
