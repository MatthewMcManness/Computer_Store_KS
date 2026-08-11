/** @type {import('tailwindcss').Config} */
// Semantic brand tokens (2026-08 redesign) are the hex mirrors of the OKLCH
// custom properties defined in src/app/globals.css :root. Components use
// these token names only — never raw hex values.
//
// The legacy `primary` scale, `bg-light`/`bg-dark`, `silver`, brand radii,
// brand/header shadows, and duration-* entries are kept because the admin
// panel, slideshow, and archived design concepts still render with them.
const plugin = require('tailwindcss/plugin');

// Word-space compensation for the tightly tracked display steps. Negative
// letter-spacing is applied to the space character too, so at -0.035em a
// 72px headline's word gaps collapse to ~0.14em and adjacent words read as
// one. These values add the tracking back onto the space only, landing the
// effective gap near 0.24em at every step. Mirrored on the .site h1/h2
// element defaults in globals.css — change both together.
const DISPLAY_WORD_SPACING = {
  '.text-display-xl': '0.11em',
  '.text-display': '0.10em',
  '.text-headline': '0.09em',
  '.text-title': '0.08em',
  '.text-title-sm': '0.06em',
};

module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── 2026-08 redesign semantic tokens (hex mirrors of --brand etc.) ── */
        brand: {
          DEFAULT: '#0863fd', /* --brand: links, primary buttons, focus, committed bands */
          navy: '#0a1481',    /* --brand-navy: hero/CTA band + footer backgrounds */
          deep: '#0546c4',    /* --brand-deep: hover/active blue, small blue text on tint/wash */
        },
        tint: '#e7efff',      /* --tint: selected/hover rows, eyebrow chips */
        wash: '#f3f7ff',      /* --wash: faint blue wash for alternating sections */
        accent: {
          DEFAULT: '#f0b100', /* --accent: THE gold, graphic accent only, never text */
          ink: '#8a6a00',     /* --accent-ink: text-safe gold for small labels */
        },
        page: '#fbfcfe',      /* --bg: page background (white-primary, tinted) */
        surface: '#f3f5fa',   /* --surface: raised/alternate surface */
        ink: '#12162b',       /* --ink: headings */
        body: '#3a4059',      /* --body: body text */
        line: {
          DEFAULT: '#dbdfec', /* --line: hairline rules, borders */
          strong: '#c3c9dd',  /* --line-strong: photo frames, table heads */
          /* --line-control: the boundary of an interactive form control.
             Decorative hairlines may sit below 3:1, but an input's border
             is the only thing identifying it as an input, so WCAG 1.4.11
             applies. Measured 3.25:1 on `page`, 3.06:1 on `surface`,
             3.11:1 on `wash`. Use ONLY on inputs, textareas, selects, and
             segmented controls; `line` and `line-strong` stay decorative. */
          control: '#868ca3',
        },
        /* No `plaque` colours here on purpose. The plaque is painted
           entirely by .silver-plaque / .plaque-frame / .plaque-rule from
           the --plaque-* custom properties in globals.css, so a Tailwind
           mirror has no consumer. The mirror that used to sit here still
           held the pure neutrals #f0f0f0 and #c0c0c0, which the tokens
           had already replaced with brand-tinted values, so it disagreed
           with its own source. If a utility is ever genuinely wanted,
           point it at the var rather than re-hardcoding a hex. */
        /* `muted` = meta text / captions (brief token). The old light-gray
           bg-muted usage in ui/skeleton.tsx was repointed at `line`. */
        muted: {
          DEFAULT: '#626a86',
          foreground: '#626a86',
        },
        /* Form/submit error states. Cool crimson tinted toward the brand
           hue like every other neutral; 7.1:1 on `danger-surface`. */
        danger: {
          DEFAULT: '#9a2140',  /* --danger: error text and borders */
          surface: '#fbeef2',  /* --danger-surface: error panel background */
        },

        /* ── Legacy tokens (admin panel, slideshow, archived concepts) ── */
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        /* Tokens the admin-era ui primitives (input/textarea/button/select)
           reference. They previously resolved to nothing, so error text and
           the secondary/destructive button variants rendered unstyled. */
        input: 'rgb(var(--border) / <alpha-value>)',
        secondary: {
          DEFAULT: '#e8ebf3',  /* brand-tinted neutral, admin secondary buttons */
          foreground: '#12162b',
        },
        destructive: {
          DEFAULT: '#dc2626',  /* admin-only: form errors, danger buttons */
          foreground: '#fafafa',
        },
        'bg-light': '#f8f9fb',
        'bg-dark': '#f0f2f5',
        silver: '#c0c0c0',
      },
      fontFamily: {
        /* Archivo (variable) is loaded in src/app/layout.tsx via next/font/google
           and applied only inside the public shell (.site wrapper), so the
           admin panel keeps its current system font stack. */
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        /* 2026-08 type scale (ratio 1.25). Named steps so the Tailwind default
           text-xs..text-3xl sizes stay untouched for the admin panel.
           Public pages use these for headings, eyebrows, and the price stamp. */
        /* Rank the page by its h1 size: `display-xl` is the homepage only,
           `display` the four top-level pages, `headline` (the .site h1
           default) the service detail pages. h2 -> h3 keeps a 1.5 gap so a
           section heading never reads at the same rank as a row heading. */
        eyebrow: ['0.8rem', { lineHeight: '1.3', letterSpacing: '0.14em', fontWeight: '600' }],
        lede: ['1.25rem', { lineHeight: '1.55' }],
        'title-sm': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        title: ['clamp(1.75rem, 1.15rem + 2.4vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '800' }],
        headline: ['clamp(2rem, 1.4rem + 2.6vw, 2.75rem)', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '900' }],
        display: ['clamp(2.3rem, 1.5rem + 3.4vw, 3.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '900' }],
        /* The phone end of this ramp is set by the rag, not by taste.
           At 1.4rem + 5.2vw the homepage h1 measured 42.7px at 390px and
           "computer repair" wanted 344px inside a 335px measure, so the
           line broke as "Fast, honest / computer / repair in / Topeka",
           leaving one word alone and three of four lines short. At the
           values below it measures about 39.5px and sets as
           "Fast, honest / computer repair / in Topeka". The 4.5rem cap
           is unchanged; only the slope moved. */
        'display-xl': ['clamp(2.35rem, 1.35rem + 4.6vw, 4.5rem)', { lineHeight: '0.98', letterSpacing: '-0.035em', fontWeight: '900' }],
        stamp: ['3.815rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '800' }],
      },
      maxWidth: {
        measure: '68ch', /* body copy cap (65-75ch law) */
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'brand-sm': '8px',
        'brand-md': '12px',
        'brand-lg': '16px',
        'brand-xl': '24px',
      },
      boxShadow: {
        'brand-sm': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'brand-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'brand-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'brand-xl': '0 20px 40px rgba(0, 0, 0, 0.15)',
        'header': '0 4px 20px rgba(37, 99, 235, 0.15), 0 8px 40px rgba(37, 99, 235, 0.1)',
        'header-scrolled': '0 8px 30px rgba(37, 99, 235, 0.2), 0 12px 50px rgba(37, 99, 235, 0.15)',
        /* Redesign: quiet, navy-tinted elevation for the sticky header + raised elements */
        'shell': '0 1px 0 #dbdfec, 0 8px 24px -16px rgba(10, 20, 129, 0.25)',
        'raised': '0 1px 2px rgba(18, 22, 43, 0.06), 0 12px 32px -20px rgba(10, 20, 129, 0.35)',
      },
      transitionTimingFunction: {
        /* The only approved motion curve for the public site */
        brand: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      /* No `animation`/`keyframes` entries: `animate-fade-in`,
         `animate-slide-up` and `animate-slide-down` had zero consumers,
         and the `fadeIn`/`zoomIn` keyframes the admin-era markup uses are
         declared once, by hand, in the globals.css utilities layer. Two
         definitions of the same keyframe can only drift. */
    },
  },
  plugins: [
    /* Word-space compensation for the display steps (see the constant at
       the top of this file). Emitted as its own utility so it rides along
       with whichever type step a heading is given, and so the fontSize
       entries stay plain Tailwind triples. */
    plugin(({ addUtilities }) => {
      addUtilities(
        Object.fromEntries(
          Object.entries(DISPLAY_WORD_SPACING).map(([selector, value]) => [
            selector,
            { 'word-spacing': value },
          ])
        )
      );
    }),
  ],
};
