/**
 * DESIGN CONCEPT 05 - Circuitry
 *
 * Standalone redesign concept for Computer Store Kansas. A modern, "techie"
 * direction built around a circuit-trace motif that echoes the logo — a 3-D
 * perspective circuit floor in the hero, glowing vias, and blue/silver/gold
 * brand accents. Adapted from the Homepage Redesign mock (redesign.css +
 * colors_and_type.css) with real business info, reviews, and assets.
 * Available at /05.
 */
import type { Metadata } from 'next';
import Concept05 from './Concept05';

export const metadata: Metadata = {
  title: 'Concept 05 / Circuitry',
  description: 'Redesign concept: a modern circuit-trace direction for Computer Store Kansas.',
  robots: { index: false, follow: false },
};

export default function Concept05Page() {
  return <Concept05 />;
}
