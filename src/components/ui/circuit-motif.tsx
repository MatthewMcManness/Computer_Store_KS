/**
 * CIRCUIT MOTIF - The composed graphic that stands in for a photograph
 * in the hero of a page that has none. A deliberate PCB fragment:
 * orthogonal runs entering from the right edge, stepping across the
 * hero's right column, each run ending in a ringed node. Derived from
 * the circuit-accent-blue.svg language (orthogonal runs, ringed pads),
 * redrawn as legible arrangements instead of scattered hairlines.
 *
 * SIX ARRANGEMENTS, chosen by a stable hash of the page's slug. Twelve
 * of the thirteen photo-less pages used to draw the identical 'fork', so
 * browsing three service pages in a row showed one graphic three times
 * and the hero read as a template with the picture missing. A caller
 * passes `seed` (the slug) and always gets the same arrangement for the
 * same page, a different one for its siblings. `variant` still forces a
 * specific arrangement where a page wants one.
 *
 * NO CONTAINER, ONLY TRACES. An earlier pass drew the runs over a faint
 * tinted rounded rectangle for weight. Positioned against the viewport
 * the rectangle showed two rounded corners on its left and a flat cut on
 * its right, with five traces stopping mid-stroke at that cut: it read
 * as a box that overflowed, not as a deliberate bleed, and it was the
 * primary visual of two page heroes. The ground is gone. Every trace now
 * terminates on a node or runs off the right edge of the viewport, which
 * is the only sanctioned way for a run to leave the frame.
 *
 * SMALL AND DENSE, NOT LARGE AND FAINT. The motif used to span 34rem,
 * the whole right half of the hero, drawn in 3px strokes at 55 percent:
 * at 1440 that read as a large empty region with a few pale scratches in
 * the far quarter, and it read the same way on all thirteen pages that
 * use it. The same six arrangements are now drawn into 21rem, which is
 * about a third of the hero rather than a half, with heavier strokes at
 * higher opacity. Same geometry, roughly two thirds the width, so the
 * runs sit at a tighter pitch and the thing reads as one deliberate
 * board fragment at the page edge instead of residue across a void.
 * Making it bigger and fainter is the change to never make.
 *
 * DESKTOP ONLY. Cropped to a phone the same drawing became a fragment
 * clipped on two sides in the bottom-right corner, with no relationship
 * to the headline or the CTA row beside it. Below `lg` the hero is
 * text, which is what a phone wants from a hero anyway.
 *
 * WHEN TO EDIT: When changing the photo-less hero treatment site-wide.
 */

type MotifVariant = 'fork' | 'ladder' | 'spur' | 'bus' | 'comb' | 'step';

interface CircuitMotifProps {
  /** Force one arrangement. Leave unset and pass `seed` instead. */
  variant?: MotifVariant;
  /** Stable key (use the page slug); hashed to pick the arrangement */
  seed?: string;
  className?: string;
}

interface MotifDrawing {
  /** Orthogonal trace runs (SVG path data). Every run ends on a node or at x=460, the viewport edge. */
  traces: string[];
  /** Ringed terminal nodes [cx, cy] */
  nodes: [number, number][];
  /** Connector pads [x, y]; kept inboard so none touches the right edge */
  pads: [number, number][];
}

const DRAWINGS: Record<MotifVariant, MotifDrawing> = {
  fork: {
    traces: ['M460 132 H336', 'M336 132 V60 H216', 'M336 132 V212 H252 V252', 'M460 60 H400', 'M460 212 H408'],
    nodes: [
      [216, 60],
      [252, 252],
      [400, 60],
      [408, 212],
    ],
    pads: [[396, 126]],
  },
  ladder: {
    traces: ['M460 56 H256 V244 H460', 'M460 100 H332', 'M460 144 H300', 'M460 188 H332', 'M256 118 H188', 'M256 196 H212'],
    nodes: [
      [332, 100],
      [300, 144],
      [332, 188],
      [188, 118],
      [212, 196],
    ],
    pads: [
      [404, 50],
      [404, 238],
    ],
  },
  spur: {
    /* The long run turns up at x=240 and finishes on that spur's node.
       It used to stop dead at x=196, mid-stroke, over nothing. */
    traces: ['M460 236 H240 V182', 'M300 236 V150', 'M372 236 V116', 'M460 92 H396'],
    nodes: [
      [300, 150],
      [372, 116],
      [240, 182],
      [396, 92],
    ],
    pads: [[416, 230]],
  },
  bus: {
    traces: ['M460 84 H232', 'M460 216 H288', 'M356 84 V216', 'M232 84 V44', 'M288 216 V262'],
    nodes: [
      [232, 44],
      [288, 262],
      [356, 150],
    ],
    pads: [[404, 78]],
  },
  comb: {
    /* The spine carries a node at each end. Drawn open it stopped
       mid-stroke top and bottom, which is the one thing a run may not
       do once the container behind it is gone. */
    traces: ['M416 44 V256', 'M416 76 H300', 'M416 128 H244', 'M416 180 H288', 'M416 232 H332'],
    nodes: [
      [416, 44],
      [416, 256],
      [300, 76],
      [244, 128],
      [288, 180],
      [332, 232],
    ],
    pads: [[386, 122]],
  },
  step: {
    traces: ['M460 68 H388 V124 H316 V180 H244 V236 H180', 'M460 180 H352', 'M316 124 H252'],
    nodes: [
      [180, 236],
      [352, 180],
      [252, 124],
    ],
    pads: [[420, 62]],
  },
};

const VARIANTS: MotifVariant[] = ['fork', 'ladder', 'spur', 'bus', 'comb', 'step'];

/**
 * FNV-1a over the seed plus a standard 32-bit avalanche, so a slug
 * always maps to the same arrangement and near-identical slugs do not
 * land on the same one. Raw FNV without the avalanche put two `fork`
 * pages back to back in the services order; with it, the thirteen
 * current service slugs cover all six arrangements and no two
 * neighbours in the index draw the same graphic. Changing the mixer
 * reshuffles every page, so leave it alone unless that is the intent.
 */
function pickVariant(seed: string): MotifVariant {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  hash = Math.imul(hash ^ (hash >>> 15), 0x45d9f3b) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 15), 0x45d9f3b) >>> 0;
  hash = (hash ^ (hash >>> 15)) >>> 0;
  return VARIANTS[hash % VARIANTS.length] as MotifVariant;
}

/** Renders the composed circuit-trace hero graphic for photo-less pages. */
export function CircuitMotif({ variant, seed, className }: CircuitMotifProps) {
  const key = variant ?? (seed ? pickVariant(seed) : 'fork');
  const drawing = DRAWINGS[key];

  return (
    <div
      aria-hidden="true"
      className={
        'pointer-events-none absolute inset-y-0 right-0 hidden w-[21rem] max-w-[30%] items-center lg:flex ' +
        (className ?? '')
      }
    >
      {/* The drawing is laid out so its right edge lands exactly on the
          viewport edge: runs that reach x=460 leave the frame there, and
          nothing else is cropped. `meet` keeps that true at every width. */}
      <svg
        viewBox="0 0 460 300"
        className="h-auto w-full text-brand"
        fill="none"
        preserveAspectRatio="xMaxYMid meet"
      >
        <g stroke="currentColor" strokeWidth="4" strokeOpacity="0.72" strokeLinejoin="round">
          {drawing.traces.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g stroke="currentColor" strokeWidth="4" strokeOpacity="0.72">
          {drawing.pads.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={18} height={12} rx={2} />
          ))}
        </g>
        <g>
          {drawing.nodes.map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r={7} stroke="currentColor" strokeWidth="4" />
              <circle cx={cx} cy={cy} r={3} fill="currentColor" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
