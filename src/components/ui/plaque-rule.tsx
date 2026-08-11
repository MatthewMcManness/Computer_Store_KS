/**
 * SECTION DIVIDER - Signature moment 2: the circuit trace that marks a
 * section transition. A horizontal run that steps once at a right angle,
 * PCB fashion, and terminates in a solid brand node.
 *
 * Two variants, and they are not interchangeable:
 *   'circuit' (default) - the section separator. At most ONE per page.
 *   'edge'              - the machined plaque hairline that seats the
 *                         navy footer under the light closing band.
 *                         Footer.tsx only.
 *
 * WEIGHT: the first pass drew this at 1px and 20% opacity and it
 * disappeared, so the trace was replaced site-wide by the plaque
 * hairline and the brand lost its transition motif entirely. The run is
 * now 2px at 40% brand with a 6px full-brand node, which registers at
 * normal viewing distance without competing with the headings around it.
 *
 * THE NODE TERMINATES THE TRACE. The first geometry ran the path to
 * x=100 and put the node at cx=108, leaving a 4.5px gap: the node
 * floated free and read as a stray blue speck rather than the end of a
 * trace. The path now runs INTO the node's centre, and the viewBox ends
 * half a pixel past the node so the terminal seats against the
 * container edge instead of trailing empty space.
 *
 * TWO TERMINAL SIZES, not one scaled drawing. Scaling a single SVG down
 * for phones thins the 2px stroke and shrinks the node away from the
 * flat bar it continues. Below `sm` a shorter terminal draws instead, at
 * identical stroke weight and node radius, so the jog stops eating a
 * third of a 390px line.
 *
 * PLACEMENT: this rule goes on ONE continuous ground. A hairline set 14px
 * from a hard band-color edge reads as a mis-registered second border,
 * not a transition, so the rule is never placed at a tone seam. Where
 * the section background already changes, the band change IS the
 * transition and no rule is drawn (that is why /about, /contact,
 * /reviews, /why-linux and /silver-plan carry none). Where the rule
 * closes a band whose ground differs from the page default, pass `tone`
 * so the strip paints that same ground under itself.
 *
 * The run is a flex row (flexible bar + fixed-size terminal SVG) rather
 * than one stretched SVG: a stretched viewBox would squash the jog and
 * thin the stroke differently at every container width.
 *
 * WHEN TO EDIT: When changing the section-separator treatment site-wide.
 */

import { cn } from '@/lib/cn';

type RuleVariant = 'circuit' | 'edge';
type RuleTone = 'none' | 'page' | 'surface' | 'wash';

interface PlaqueRuleProps {
  /** 'circuit' (default) is the section divider; 'edge' is the footer's machined hairline */
  variant?: RuleVariant;
  /** 'contained' keeps the rule inside the page container; 'full' spans the viewport */
  width?: 'contained' | 'full';
  /** Ground painted under the strip. Match the band the rule closes so the trace never sits at a color seam. */
  tone?: RuleTone;
  className?: string;
}

const TONES: Record<RuleTone, string> = {
  none: '',
  page: 'bg-page',
  surface: 'bg-surface',
  wash: 'bg-wash',
};

/** The terminal geometry: one right-angle jog up, a short run, and the node. */
function Terminal({ compact }: { compact: boolean }) {
  /* The 10px rise is deliberate: at half that the jog read as a
     rendering artifact rather than a trace stepping a layer. */
  const w = compact ? 64 : 108;
  const nodeX = w - 4;
  const jogX = compact ? 22 : 44;
  return (
    <svg
      width={w}
      height="28"
      viewBox={`0 0 ${w} 28`}
      fill="none"
      className={cn('shrink-0 text-brand', compact ? 'sm:hidden' : 'hidden sm:block')}
      aria-hidden="true"
    >
      {/* The run ends ON the node centre, so the node is the terminus of
          the trace and not a mark sitting near it. */}
      <path
        d={`M0 14 H${jogX} V4 H${nodeX}`}
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <circle cx={nodeX} cy="4" r="3.5" fill="currentColor" />
    </svg>
  );
}

/** Renders the circuit-trace section divider, or the footer's machined edge. */
export function PlaqueRule({
  variant = 'circuit',
  width = 'contained',
  tone = 'none',
  className,
}: PlaqueRuleProps) {
  const contained = width === 'contained';

  if (variant === 'edge') {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'plaque-rule',
          contained ? 'mx-auto w-full max-w-6xl' : 'w-full',
          className
        )}
      />
    );
  }

  return (
    <div aria-hidden="true" className={cn(TONES[tone], className)}>
      <div
        className={cn(
          'flex items-center',
          contained ? 'mx-auto w-full max-w-6xl px-5 sm:px-8' : 'w-full'
        )}
      >
        {/* The long run. The band is 28px tall, so this sits on the y=14
            centreline the terminal's incoming run starts from. */}
        <span className="h-[2px] min-w-0 flex-1 bg-brand/40" />
        <Terminal compact />
        <Terminal compact={false} />
      </div>
    </div>
  );
}
