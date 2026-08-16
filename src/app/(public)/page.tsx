/**
 * HOMEPAGE (server shell) - exists only so the homepage can export metadata.
 *
 * The page body is a client component (useState/useEffect/refs), and a client
 * component cannot export `metadata`. That is why the homepage shipped with no
 * canonical URL at all. Rather than put a canonical on the shared (public)
 * layout, which Next inherits into EVERY child page that does not override it
 * and would make each one declare itself a duplicate of the homepage, the
 * client body moved to HomeClient.tsx and this shell carries the metadata.
 *
 * WHEN TO EDIT: page content lives in HomeClient.tsx, not here.
 */
import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <HomeClient />;
}
