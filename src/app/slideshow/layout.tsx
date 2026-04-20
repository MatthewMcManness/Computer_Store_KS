/**
 * SLIDESHOW LAYOUT - Minimal wrapper for the full-screen slideshow display.
 * No header, footer, or navigation — just a black full-screen canvas.
 * Designed to run on a TV or monitor in the store.
 *
 * WHEN TO EDIT: When changing the base styling of the slideshow display.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Slideshow',
  robots: { index: false, follow: false },
};

export default function SlideshowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
