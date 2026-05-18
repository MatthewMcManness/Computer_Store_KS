# Visual Design Audit — Computer Store KS

**Date:** 2026-05-18
**Scope:** All public pages, with priority on the 375px mobile viewport
**Goals (priority order):** 1) Professional polish, 2) Depth, 3) Downward momentum toward the call button
**Method:** Static code review only — no browser. All findings cite `file:line`.

> This is an audit, not a change list. No code was modified. Recommendations in Section D are ordered by impact-to-effort. Implementation will follow in a separate pass.

---

## Phase 1 — Inventory

### Pages (20 public routes)
- `src/app/(public)/page.tsx` — Homepage (hero, stats, services overview, protection plans, reviews, CTA)
- `src/app/(public)/about/page.tsx` — Founder story, history, 5 reasons, CTA
- `src/app/(public)/computers/page.tsx` — Laptops / Business PCs / Gaming PCs alternating layout
- `src/app/(public)/contact/page.tsx` — Hero + form with mode-swapping sidebar
- `src/app/(public)/reviews/page.tsx` — Reviews display + leave-review CTA + contact CTA
- `src/app/(public)/services/page.tsx` — Services hub: featured 2 + grid of 13 service cards
- `src/app/(public)/shop/page.tsx` — Iframe-embedded TDMyshop catalog (no chevron sections)
- `src/app/(public)/silver-plan/page.tsx` — Protection plans (3 tiers)
- `src/app/(public)/why-linux/page.tsx` — Linux advocacy long-read
- `src/app/(public)/services/*/page.tsx` — 12 service detail pages: antivirus, custom-computers, data-services, debloat, desktops, diagnostics, laptops, os-installation, printers, recycling, upgrades, virus-removal

### Layout components
- `src/components/static/Header.tsx` — Fixed pill nav, `max-md:hidden` (hidden on mobile)
- `src/components/static/Footer.tsx` — Two-location footer, `pb-32 md:pb-8` to clear mobile call button
- `src/components/static/ChevronSection.tsx` — V-edge section wrapper (`topShape`/`bottomShape`)
- `src/components/static/ProtectionPlansSection.tsx` — Three plan cards (inline-styled)
- `src/components/ui/mobile-call-button.tsx` — Fixed-bottom `Call Now` button (mobile only)
- `src/components/ui/chat-widget.tsx` — Desktop-only floating chat (`hidden md:block`)
- `src/components/reviews/ReviewsWidget.tsx` — Reviews carousel
- `src/components/forms/contact-with-sidebar.tsx` — Form + Visit Us / Service Call Rates sidebar
- `src/components/ui/{button,card,badge,input,modal,select,skeleton,textarea}.tsx` — Generic primitives

### `tailwind.config.js` tokens
- **Colors:** `primary-{50–950}` (blue scale), `background`/`foreground`/`card`/`muted`/`border`/`ring` (CSS-var driven), `bg-light` `#f8f9fb`, `bg-dark` `#f0f2f5`, `silver` `#c0c0c0`
- **Radius:** Tailwind defaults + `brand-sm` 8px, `brand-md` 12px, `brand-lg` 16px, `brand-xl` 24px
- **Shadows (13):** `brand-{sm,md,lg,xl}`, `header`, `header-scrolled`, `card-hover`, `gallery-card`, `gallery-card-hover`, `filter-btn`, `filter-btn-hover`, `filter-btn-active`, `blue-glow`, `green-glow`, `purple-glow`, `silver-hover`
- **Transitions:** `fast` 150ms, `normal` 300ms, `slow` 500ms
- **Animations:** `fade-in`, `slide-up`, `slide-down`, `float`, `rotate-slow`, `bf-shimmer`, `silver-shine`, `gold-border`, `gold-badge-glow`
- **Font:** `font-sans` → Inter
- No `boxShadow.brand-xl` consumer found anywhere in `src/` (0 usages — dead token).

### `globals.css` custom utilities & components
- `--chevron-depth: clamp(2rem, 4.5vw, 4.5rem)` — single source of truth for V geometry
- **Component classes:** `silver-plaque`, `silver-plaque-img`, `hero-overlay`, `cs-top-v`, `cs-bottom-v`, `cs-clearance-top`, `out-of-stock-ribbon`, `badge-black-friday`, `bf-ribbon-corner`, `card-enhanced`, `nav-silver-shimmer`, `card-gradient-border`, `service-card-bar`, `service-card-silver`, `gallery-image-shadow`, `savings-badge`, `price-gradient-text`, `category-*-gradient`, `type-*-gradient`, `filter-btn-active-gradient`, `dropdown-{featured,linux,silver,free}`, `cta-overlay`, `footer-silver-label`, `btn-silver`, `feature-list-check`
- **Utilities:** `bg-grid-pattern`, `bg-radial-blue`, `diamond-accent`, `plaque-text`, `gold-text`, `silver-plus-card`, `gold-glow-badge`, `btn-outer-glow`, `animate-silver-shine`, `texture-circuit`, `texture-geometric`, `texture-dots`, `texture-terrazzo-blue`
- Body font: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif` — **not Inter** despite `font-sans` token. The Inter variable is defined but the body fallback stack never reaches it.
- `h1` clamp(2.5, 5vw, 4rem); `h2` clamp(2, 4vw, 3rem); `h3` clamp(1.5, 3vw, 2rem); `h4` clamp(1.25, 2.5vw, 1.5rem) — global headings have a built-in scale, but many pages override with `text-[clamp(...)]` arbitrary values, defeating the system.

### Recent design vocabulary (last 7 commits)
- `48f5dfc` — chevron drop-shadow via `filter` on bottom-V (chevron-silhouette shadow)
- `ac04932` — mobile footer pb-32 clears Call button; chevron-band shadow
- `722ce0b` — 85-texture catalog `docs/texture-catalog.html` (not yet integrated beyond 4 textures)
- `075f274` — chevron spacing balance + reviews texture
- `bcad06c` — chevron section system introduced

---

## Phase 2 — Audit findings

## Section A — Professional polish gaps

### A1. Heading hierarchy is broken site-wide (the `<h2>` hero anti-pattern)
Almost every public page uses `<h2>` as the visible hero title, with no preceding `<h1>`. Only `silver-plan/page.tsx:32` and `shop/page.tsx:13` use `<h1>`. The hidden `<h1>` in `Header.tsx:44` wraps the logo with `text-[0px]` — it's there for SEO but it's a single global H1 ("Computer Store Kansas" logo alt) shared across every page.
- Examples: `page.tsx:89`, `about/page.tsx:30`, `services/page.tsx:109`, `contact/page.tsx:22`, `reviews/page.tsx:31`, every `services/*/page.tsx`
- **Why it matters:** Bad for accessibility and SEO. Also signals "template" — each page's hero should be the page's H1.
- **Fix direction:** Promote the hero heading on each page to `<h1>` and reserve `<h2>` for section heads. Keep one H1 per page.

### A2. Two parallel typography scales fight each other
`globals.css:53–66` defines a clamp-based scale on bare `h1`–`h4`. Pages then frequently re-override with `text-[clamp(2rem,4vw,3rem)]` (hero `<h2>`s on `page.tsx:89`, `about/page.tsx:30`, `reviews/page.tsx:31`) and `text-[2rem]` (CTA `<h2>`s on `page.tsx:174`, `about/page.tsx:121`, `services/page.tsx:163`, etc.). Card titles use `text-[1.4rem]` on the homepage but `text-[1.3rem]` on About's numbered cards (`about/page.tsx:78`), `text-[1.25rem]` on the Services grid (`services/page.tsx:151`), bare `<h3>` (which inherits clamp 1.5–2rem) on `services/custom-computers/page.tsx:43`, and `text-[1.125rem]` on contact sidebar headings (`contact-with-sidebar.tsx:41`).
- **Why it matters:** Card titles range from ~1.125rem to 2rem within a single user session. The eye never trains on a stable level.
- **Fix direction:** Pick a 5-step scale (e.g. hero 2.5/3.5rem, section 2/2.5rem, card-title 1.25rem, body 1rem, small 0.875rem) and codify it as Tailwind utilities (`text-hero`, `text-section`, `text-card-title`). Replace `text-[…]` overrides with the new tokens.

### A3. Body font isn't actually Inter
`tailwind.config.js:43` maps `font-sans` → `var(--font-inter)`, but `globals.css:40` sets `body { font-family: -apple-system, BlinkMacSystem, … }` directly. The body never uses `font-sans`, so Inter never loads as the default. The CSS-var fallback in the Tailwind config also has no actual `--font-inter` definition reachable from a `next/font` setup in this repo.
- **Why it matters:** The site renders in San Francisco on Apple devices and Segoe UI on Windows — those don't match. Polish suffers from per-device drift.
- **Fix direction:** Either remove the dead Inter reference and standardize on the system stack as the intended design, or import Inter via `next/font/google` in `layout.tsx` and replace the body font-family with `font-sans`.

### A4. Inline CSS variables reference undefined tokens (16 occurrences)
The string `var(--primary-blue) … var(--primary-blue-dark)` appears in 11 service-page CTAs, and `var(--background-light)` appears in 5 "Turnaround Time" sections. Neither variable is defined in `globals.css`. Examples: `services/laptops/page.tsx:109`, `services/upgrades/page.tsx:162`, `services/diagnostics/page.tsx:152`.
- **Why it matters:** Inline `style.background` shorthand with an invalid CSS value silently fails, leaving the section transparent — but the Tailwind `bg-gradient-to-br from-primary-600 to-primary-800` className on the same element then takes over. So the design renders OK by accident. This is a fragile leftover from the static-CSS migration that wastes characters and will silently break if anyone removes the duplicate Tailwind classes.
- **Fix direction:** Strip every `style={{ background: 'linear-gradient(…var(--primary-blue)…)' }}` since the Tailwind classes already provide the same gradient. For the `var(--background-light)` cases, replace with `bg-bg-light`.

### A5. Card style is duplicated 93 times instead of being a component
The exact string `bg-white rounded-brand-lg p-8 shadow-brand-sm … border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100` appears 93 times in `src/app/(public)/*` pages. Every service page rebuilds it inline.
- **Why it matters:** A typo or design change to "the card" means 93 edits. Already drifting — the homepage variant adds `card-enhanced card-gradient-border` (`page.tsx:133`) and `duration-300` instead of `duration-normal`, which is the same value but different vocabulary.
- **Fix direction:** Extract `<FeatureCard>` and `<NumberedRow>` into `src/components/ui/` (or `src/components/static/`). Every detail page can then read as a list of components, not a mass of duplicated classes.

### A6. CTA button styling has 4+ unmerged variants
1. `btn-silver` (`globals.css:498`) — the "Schedule a Service Call" hero button on homepage `page.tsx:92` and contact sidebar
2. Long ad-hoc string `inline-block px-8 py-4 rounded-brand-md … bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg` — every CTA section "white pill on blue gradient"
3. `inline-block px-8 py-[0.8rem] rounded-brand-md … bg-white text-primary-600 …` — the same pattern but `py-[0.8rem]` instead of `py-4` (services pages, `services/page.tsx:165`)
4. `inline-block bg-primary-600 text-white font-semibold py-3 px-8 rounded-brand-md hover:bg-primary-800 hover:-translate-y-0.5 …` — the "Get a Quote" button on `computers/page.tsx:73,124` and the "Contact Us" button on `reviews/page.tsx:66`
5. Plus the reusable `<Button>` primitive at `src/components/ui/button.tsx` — used only by the contact form, not by any page CTA
- **Why it matters:** A customer sees 5 distinct CTA shapes across the site. Inconsistency reads as amateur. The vertical padding diverges between `py-4` (`1rem`) and `py-[0.8rem]` — same intent, different numbers.
- **Fix direction:** Two canonical CTA variants only: `cta-primary` (blue button on light background — "Get a Quote") and `cta-inverse` (white button on blue CTA section — "Talk to an Expert"). Bake both into the `Button` primitive or as `globals.css` component classes, then sweep the codebase.

### A7. Shadow scale has 13 tokens, code uses 3
`tailwind.config.js:54–71` defines 13 box-shadow tokens. Usage census:
- `shadow-brand-sm` — 112 occurrences
- `shadow-brand-lg` (mostly via `hover:shadow-brand-lg`) — 129 occurrences
- `shadow-brand-md` — 22 occurrences
- Everything else combined — under 20
- `shadow-brand-xl` — **0 occurrences**

`shadow-header`, `shadow-blue-glow`, `shadow-green-glow`, `shadow-purple-glow`, `card-hover`, `gallery-card*`, `filter-btn*`, `silver-hover` together account for only one consumer (`Header.tsx`). They're all carry-overs from the legacy CSS.
- **Why it matters:** Bloat in the design system makes it impossible to apply a clean elevation language. 3-max is the right number for a single-business site.
- **Fix direction:** Keep three shadows: `elev-1` (resting card), `elev-2` (hovered card / floating CTA), `elev-3` (sticky elements like the call button + header). Delete the rest, sweep usages.

### A8. Spacing & rhythm: every section is `py-20`
101 occurrences of `py-20`, 0 of `py-16` or `py-24`. Hero sections use `pt-32 pb-48` (19 hits) regardless of content depth. Service detail pages stack 7–9 identical-height sections back-to-back. Long pages (why-linux 230 lines, virus-removal 210 lines, antivirus 198 lines, upgrades 198 lines) read as wallpaper because no rhythm differentiates a setup from a payoff.
- **Why it matters:** Same vertical mass everywhere = no emphasis. The eye should be able to feel which sections are stops vs. transitions.
- **Fix direction:** Introduce three section paddings — `section-sm py-12` (transition / single-paragraph callout), `section py-20` (default content), `section-lg py-28` (hero / final CTA). Map them onto existing sections so the "Turnaround Time" boxes at `services/diagnostics/page.tsx:152` and `services/virus-removal/page.tsx:193` collapse to `section-sm` and the page gets a breathing pattern.

### A9. Inline `style={{}}` overrides leak into the JSX
- `services/custom-computers/page.tsx:35` `style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}` — repeated verbatim on `services/virus-removal/page.tsx:35`, `services/upgrades/page.tsx:35`, `services/diagnostics/page.tsx:35`, etc. (8 service pages do this)
- `ProtectionPlansSection.tsx` is **entirely** inline styles (lines 11–305), in violation of CLAUDE.md's "All styling is Tailwind — no CSS modules, no separate stylesheets"
- **Why it matters:** Inline styles can't be themed, can't respond to media queries, and leak through the rest of the system as a wart everyone copies from.
- **Fix direction:** Promote the lead-paragraph string to a component class (`@apply text-lg max-w-[800px] mx-auto mb-8` as `.section-lede` in globals.css). Rewrite `ProtectionPlansSection` using Tailwind + the existing `service-card-silver` and `gold-glow-badge` classes.

### A10. Footer phone link uses raw `tel:` digits + spaces
`Footer.tsx:34` `href="tel:${loc.phone}"` — `loc.phone` is a formatted string like "(785) 783-9988". Mobile dialers usually handle this but standards prefer digits-only. By contrast, `mobile-call-button.tsx:21` correctly strips non-digits: `tel:${loc.phone.replace(/\D/g, '')}`.
- **Why it matters:** Inconsistent and a real-world dialer compatibility risk.
- **Fix direction:** Strip `\D` in the footer link too.

### A11. Mobile header is hidden but the desktop header is the only nav
`Header.tsx:38` is `max-md:hidden`. On mobile, the only navigation surface is the silver-plaque morph badge at `page.tsx:52` — which only exists on the homepage. There is no hamburger or nav on `/about`, `/services`, `/contact`, etc. when viewed on mobile.
- **Why it matters:** Mobile users can land on `/services/laptops` from Google and have no visible way back to Home, About, Services, or Contact short of the Call Now button.
- **Fix direction:** Either render a mobile-visible header (a compact silver-plaque + hamburger pinned top) on all non-homepage pages, or move the morph badge into the public layout so it persists.

---

## Section B — Depth gaps

The chevron section system (commit `bcad06c`) and texture pack (commit `722ce0b`) form a real depth vocabulary. The audit's job is to extend it rather than replace it.

### B1. The hero is the only true depth moment — and it dies above the fold on 375px
`page.tsx:73` `pt-52 pb-48 text-center` on the hero. At 375×667 (iPhone SE viewport):
- `pt-52` = 208px top padding, but the fixed mobile silver-plaque (`page.tsx:53`, height ~70–110px including 2px gap) overlays the top → effective hero content area starts ~310px from the top.
- The silver-plaque + small subtitle + Schedule button at `page.tsx:92` sit within roughly 350–620px → the visible call-to-action arrives at the very bottom of the fold. The bottom chevron tail (`--chevron-depth` clamped at 2rem mobile) extends below the fold without ever being visible during the first impression.
- The pulsing "Now we do house calls!" line at `page.tsx:91` is hidden behind the plaque-morph on mobile (`max-md:hidden` on the desktop subtitle, but not on the house-calls pulse). The depth illusion of the silver plaque carving into the photo background is the only real Z-axis moment.
- **Fix direction:** Add a downward visual leading line beneath the hero CTA — a chevron icon, or a "scroll for more" arrow — so the customer feels the page continues. Pair the silver plaque with a subtle shadow that points down-and-right, reinforcing the path.

### B2. All four textures (`texture-circuit`, `texture-geometric`, `texture-dots`, `texture-terrazzo-blue`) sit at 0.5–0.8 opacity behind white cards
The textures' `z-index: 0` + the card's `z-index` of context means the texture only shows in the section's padding gutter. At 375px the gutter is `w-[90%]` of 375 = ~337px content, leaving ~19px on each side. The texture is invisible to the user there.
- **Why it matters:** A texture you can't see adds bytes, not depth.
- **Fix direction:** Either (a) increase texture opacity in service-page sections that have wider negative space (the lead-paragraph sections) to 0.6–0.8, (b) let the textures peek through card backgrounds via lower card opacity (e.g. `bg-white/95`), or (c) reserve textures for full-bleed dark sections like the Computers page Gaming PCs section (`computers/page.tsx:134`).

### B3. Cards "lift" but never "float" — no card breaks its section frame
Every card sits politely inside its `w-[90%] max-w-[1200px]` grid. None overlap, none clip the chevron edge, none break out. Result: depth is uniform within each section but every section is its own flat plane.
- **Why it matters:** A magazine layout earns depth by letting one element pierce a boundary — a hero card that sits half-on / half-off the dark section into the light section, etc.
- **Fix direction:** On the homepage, let the protection-plans cards extend into the bottom chevron of the section above (negative `margin-top`). On `computers/page.tsx`, let the laptop image extend past the section bottom. The chevron geometry tolerates this since `overflow-visible` is already used on the hero.

### B4. The chevron drop-shadow only runs along the bottom V, not the top V
`globals.css:155` applies `filter: drop-shadow(0 6px 10px rgba(0,0,0,0.35))` to `.cs-bottom-v`. The top V on the next section has no corresponding shadow — it relies on being shadowed by the section above it. That works between two adjacent chevron sections, but the *first* chevron section after a flat-edged section (rare today but possible) won't get a top shadow, and the visual depth across sections is asymmetric: the trailing V has weight, the leading V is just a notch.
- **Why it matters:** The downward-pointing chevron carries the eye well — but the notch above it can read as flat when the user scrolls *upward* (e.g. when re-checking pricing).
- **Fix direction:** Add a subtle inset highlight on the top V (`box-shadow: inset 0 4px 6px -4px rgba(255,255,255,0.5)` via a pseudo-element) so the top V reads as "the edge bites into the section above it". This is purely additive — the existing bottom-V drop-shadow stays.

### B5. Section transitions on the Computers page break the chevron rhythm
`computers/page.tsx:134` — the Gaming PCs section uses `topShape="v"` but has no `bottomShape`. The Footer butts up against the gaming section's flat bottom edge with no chevron transition.
- **Why it matters:** Three chevron transitions and then a hard rectangular cut into the footer reads as a missing section.
- **Fix direction:** Either add `bottomShape="v"` to the gaming section so the footer's top edge is met by a V (and add a matching white top to the footer top-edge via the chevron geometry), or accept that the footer becomes the "rest stop" and add a subtle gradient ramp from dark gray → footer gray so the transition feels intentional.

### B6. ProtectionPlansSection cards have flat shadows that don't follow the chevron language
`ProtectionPlansSection.tsx:51–305` uses inline `boxShadow: '0 4px 20px rgba(0,0,0,0.1)'` (Silver), `'0 4px 20px rgba(255,215,0,0.3)'` (Silver+), `'0 4px 20px rgba(156,163,175,0.35)'` (Platinum). These are rectangular soft-drops with no overlap, no border highlight, no inner glow. The cards sit on the chevron section but feel like a separate slide deck.
- **Why it matters:** This is the highest-converting section on the homepage and the strongest visual moment on `/silver-plan`. Depth here pays dividends.
- **Fix direction:** Layer the cards: at 375px, stack them with a slight vertical overlap (negative `margin-top` on cards 2–3) and a heavier shadow gradient that intensifies on the gold-glowing Silver Plus. Tie the badge glow into a card-edge highlight so the card itself reads as elevated, not just its corner ribbon.

### B7. Service hub grid (`services/page.tsx:143`) reads as a flat icon list at 375px
13 service cards stack in a single column on mobile. Each card has the same shadow, same emoji-only icon, same gray border. The "Featured" badge on the Custom PCs card is invisible on mobile (no badge — only a slightly different background gradient).
- **Why it matters:** This page is the navigation hub. If everything looks identical, customers can't tell what's a flagship vs. a side service.
- **Fix direction:** Give the featured card a visible "FEATURED" pill, a thicker primary-colored top bar, and elevation `elev-3`. Demote the rest to `elev-1`. Add the textured background as a peek through the card border (e.g. `bg-white/96` to let the section's texture-circuit pattern peek under the card edge).

---

## Section C — Downward momentum gaps

Trace at 375×667 (iPhone SE viewport, account for the 96px mobile silver-plaque floating at top).

### C1. Homepage: the call button is the *only* downward pull, and it's bottom-pinned
At 375px the homepage scroll is approximately:
1. 0–620px: Hero — silver plaque + Schedule a Service Call (btn-silver, gray)
2. 620–1240px: Stats — three big numbers
3. 1240–1900px: What We Do — three identical white cards
4. 1900–2900px: Protection Plans — three cards with prices and 30+ checkmark bullets each
5. 2900–3600px: Reviews carousel
6. 3600–4200px: "Ready to Get Started?" CTA section

The fixed `MobileCallButton` (`mobile-call-button.tsx:14`) sits at the bottom of every viewport. So while the *page-level* CTA flow culminates at row 6, the *real* CTA (call now) is always one tap away — it's already at the bottom of the screen, which is correct.

**The gap:** The hero CTA at `page.tsx:92` is `btn-silver` (gray gradient). It's the first action a user sees, and it's quieter than the fixed-bottom blue Call Now. The eye reads silver-button → blue-button-glowing and goes to the louder one, which is good. But the silver button looks demoted, like a secondary action — and on a 375px viewport the user may not even register it because their thumb is already pulled to the bottom 80px where Call Now lives.
- **Fix direction:** Either drop the in-hero CTA on mobile entirely (since Call Now covers it) and replace with a downward chevron + "see how we help" hint, or make the in-hero CTA's *target* match the Call Now intent (so it's not competing — it's a fallback for users who scroll past).

### C2. The Call Now button is shouldered at full width with no contrast escalation as user scrolls
`mobile-call-button.tsx:14` is `fixed left-4 right-4 bottom: max(1rem, env(safe-area-inset-bottom))`. Same color, same size, same glow throughout the scroll. There's no "you've made it to the bottom" payoff — the button looked the same on the hero as on the final CTA.
- **Why it matters:** The CTA section at the bottom of every page does its own "Talk to an Expert" white-on-blue button, but the *mobile* user's primary path is the fixed Call Now. Those should reinforce each other at the bottom — the CTA section is wasted real estate if the fixed button already covers it.
- **Fix direction:** On the bottom CTA section (`page.tsx:171`, `about/page.tsx:118`, etc.), hide the fixed Call Now (or fade it) on mobile when the CTA section enters the viewport, and let the CTA section become the prominent call action. Tailwind has no scroll-aware utilities — but `position: sticky` with `bottom: 0` on the CTA section, combined with the fixed button's `mix-blend` or simply hiding it when its bounding box overlaps the CTA, would work.

### C3. Service detail pages end every section with a stop, not a step
Pattern repeated 12× across service pages: every section is heading + paragraph + 3-or-6 card grid, then chevron, then next section. There's no "Next: pricing →" cue or section-end CTA. The user reads, hits a chevron, reads more, hits a chevron — *for 5 to 9 sections* before finally getting to a "Schedule a Diagnosis" link. By section 4 the scroll feels like it has no destination.
- Example: `services/virus-removal/page.tsx` — 7 chevron sections, the only in-flow CTA is in section 5 (`virus-removal/page.tsx:149`) and the final section 8 (`virus-removal/page.tsx:205`). Sections 1–4 and 6–7 are dead-ends.
- **Fix direction:** Add a "Next:" hand-off line at the bottom of every other section. Visually a small arrow + linked label ("Next: How we work →"). On mobile this becomes the user's "thread" through the page. Or — easier — add a `cta-pill` at the end of every section that says "Or just call now" with a `tel:` link, so any section is a viable bail-out to action.

### C4. Hero chevrons point down (good) but section interiors have no leading lines
The chevron edges naturally point down between sections. Inside each section, however, content is centered with no leading lines. Numbered rows on `about/page.tsx:74–110` line up horizontally; card grids fill `grid-cols-[repeat(auto-fit,minmax(280px,1fr))]` symmetrically. No diagonals, no descending zig-zags.
- **Why it matters:** The chevron does the macro work, but the eye loses the path inside sections. The diamond-accent rotations at `about/page.tsx:41` and `reviews/page.tsx:61` are positioned bottom-left and feel decorative-only.
- **Fix direction:** On the homepage stats section (`page.tsx:103`), break the symmetric grid and stagger the three numbers diagonally (top-left → middle → bottom-right). Same on the About page's 5 numbered reasons — instead of two-column symmetric, use a descending vertical zig-zag so the eye reads top-to-bottom-right naturally.

### C5. The end-of-page CTA section is identical across 14 pages
`page.tsx:171`, `about/page.tsx:118`, `services/page.tsx:170`, `services/custom-computers/page.tsx:184`, every service page — same gradient, same `text-[2rem]` heading, same white-pill button. The final 100ms of every page reads identically.
- **Why it matters:** When every page ends the same, customers stop reading the ending. The contrast escalation that should peak here is flat.
- **Fix direction:** Make the bottom CTA more dynamic per page: use the page's specific service icon as a giant decorative element, vary the heading line, and on mobile vary the secondary action (call vs. directions vs. write-a-review). Even a small change like "Ready to remove your virus?" with a virus icon vs. "Ready to upgrade?" with a chip icon gives the end of each page a distinct identity.

### C6. The contact page hero kills the form's pull
`contact/page.tsx:16` — the hero is `pt-32 pb-48` (very tall) plus a chevron. The form (`contact-with-sidebar.tsx`) doesn't appear until ~620px on mobile. Worse: the form is wrapped in a `Card` component (`contact-form.tsx:302`) which on mobile-sized viewports renders as a bordered white box inside the section — a card-in-a-section, doubling the visual weight without adding hierarchy.
- **Why it matters:** Users who tap "Schedule a Service Call" expect to see a form immediately. They see a hero photo + a card.
- **Fix direction:** Shrink the contact hero to `pt-20 pb-12` (it's a utility page, not a marketing page), and either remove the `Card` wrapper or drop its border so the form reads as the section's primary content, not a tile.

### C7. The mode switcher on the contact form is the only "next step" hint, and it's three white pills
`contact-form.tsx:319–337` — three buttons (`We come to you`, `You come to us`, `General question`) styled as outlined white pills. They're the most important UI on the contact page (they switch what form fields appear) but they're the visually quietest. Customers scroll past them looking for "the form".
- **Fix direction:** Restyle the active mode button with a stronger fill, and the inactive ones with the section's background-color (so they read as "click to expand"). Or split the contact form into three explicit cards stacked vertically — each is a CTA to one mode — and reveal the form only after selection.

### C8. Footer-then-Call-Now is a dead zone on mobile
The mobile call button is fixed `bottom: 1rem`. The footer ends at ~3950px. The visible viewport at the bottom of the page shows: footer text → call button overlapping the footer. On every page. With `pb-32` on the footer (`Footer.tsx:18`), the footer text ends ~128px before the call button — that gap is empty space.
- **Fix direction:** Move the Call Now button up only when the footer enters view (Intersection Observer + CSS class swap), or use the footer's bottom area to repeat one strong CTA above the floating button, so the user feels a payoff at the end of scroll.

---

## Section D — Prioritized recommendations

Each numbered item lists Goal / Where / Change / Why / Mobile note. Ordered by **impact-to-effort ratio** — small surgical wins first.

### 1. Strip the dead `var(--primary-blue)` / `var(--background-light)` inline styles
- **Goal:** Polish
- **Where:** 16 occurrences across `services/*/page.tsx` (see Section A4 for the full list)
- **Change:** Delete `style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}` from every CTA chevron and replace `style={{ background: 'var(--background-light)' }}` with `className=" … bg-bg-light"`.
- **Why:** Dead code that obscures intent; current rendering is incidental.
- **Mobile note:** No visual change — pure cleanup. Reduces CSS bytes shipped to mobile.

### 2. Promote every page hero `<h2>` to `<h1>`, and reserve `<h2>` for section heads
- **Goal:** Polish
- **Where:** `page.tsx:89`, `about/page.tsx:30`, `services/page.tsx:109`, `contact/page.tsx:22`, `reviews/page.tsx:31`, every `services/*/page.tsx` hero
- **Change:** `<h2>` → `<h1>` for the visible hero heading on each page.
- **Why:** One H1 per page is the SEO/accessibility standard and makes hero headings actually feel like page titles.
- **Mobile note:** Helps screen reader users and Google Lighthouse score; no visual change unless the page wasn't styling `<h1>` separately (in which case use the existing `text-[clamp(2rem,4vw,3rem)]` utility).

### 3. Add a sticky/persistent mobile nav header to all non-homepage pages
- **Goal:** Polish + Momentum
- **Where:** `src/app/(public)/layout.tsx`, `src/components/static/Header.tsx`
- **Change:** Move the silver-plaque morph badge (currently in `page.tsx:52`) into the public layout, with simpler "Home / Services / Call" anchors that show only on mobile. The current desktop pill nav (`Header.tsx:38` `max-md:hidden`) stays.
- **Why:** Right now a customer who lands on `/services/laptops` from Google has no way back home except the URL bar.
- **Mobile note:** Critical — this is the primary failure mode for landing-page traffic. Make sure the new mobile bar doesn't compete with the Call Now button (top of screen, not bottom).

### 4. Consolidate CTA button styling into 2 variants
- **Goal:** Polish + Momentum
- **Where:** `src/components/ui/button.tsx`, all CTA sections (~30 occurrences)
- **Change:** Define `cta-primary` (blue on light) and `cta-inverse` (white on blue) as globals.css component classes. Replace the 4+ ad-hoc class strings.
- **Why:** Consistent CTA shape across the journey trains the eye to recognize "this is the action" and stop hunting.
- **Mobile note:** At 375px, button width and prominence matter more than on desktop. A standard 48px-tall pill becomes thumb-friendly and recognizable.

### 5. Trim the shadow scale from 13 tokens to 3
- **Goal:** Polish
- **Where:** `tailwind.config.js:54–71`
- **Change:** Keep `elev-1` (`shadow-brand-sm`), `elev-2` (`shadow-brand-lg`), `elev-3` (a new heavier shadow for fixed elements). Delete the other 10 tokens. Sweep usages.
- **Why:** 13 elevations is a furniture catalog. 3 is a system.
- **Mobile note:** Smaller CSS shipped to mobile.

### 6. Make hero heights asymmetric — utility pages get shorter heroes
- **Goal:** Momentum
- **Where:** `contact/page.tsx:18` and `reviews/page.tsx:27`
- **Change:** Reduce `pt-32 pb-48` to `pt-24 pb-24` on `/contact` and `/reviews`. Keep the tall hero on the homepage and service detail pages where storytelling matters.
- **Why:** A utility page hero should hand off to the action fast. Right now `/contact` puts ~620px of marketing photo between the user's tap and the form.
- **Mobile note:** Saves ~200px of scroll on a 667px tall viewport — the form becomes visible above the fold.

### 7. Add downward leading-line cues at the bottom of every section
- **Goal:** Momentum
- **Where:** All `ChevronSection` consumers
- **Change:** Where a chevron section has more sections below it (i.e. not the final CTA), add a small subtle "↓ Next: <topic>" link or icon at the bottom-center of the section content. Tailwind-only: a chevron SVG + a text link.
- **Why:** The chevron edge gives macro depth but doesn't actually invite the user to continue. A textual cue does.
- **Mobile note:** On 375px, the user is already scrolling — but a small cue lets them peek at *what's next* before scrolling, which keeps momentum and reduces bounce.

### 8. Reduce the visual mass of repeated mid-page CTA sections
- **Goal:** Polish + Momentum
- **Where:** `services/*/page.tsx` — each service page has 1–2 mid-page CTAs (e.g. `virus-removal/page.tsx:145`, `custom-computers/page.tsx:152`) styled identically to the final CTA
- **Change:** Mid-page CTAs become smaller (`py-12` instead of `py-20`), use a lighter blue gradient (`from-primary-500 to-primary-700`) and a smaller heading (`text-2xl` not `text-[2rem]`). Reserve the heavy blue CTA for the page bottom.
- **Why:** Two equally-heavy CTAs on a page dilute each other. The final one should be the loudest.
- **Mobile note:** Less scroll fatigue, faster path to the bottom-of-page payoff.

### 9. Extract `<FeatureCard>` and `<NumberedRow>` components
- **Goal:** Polish
- **Where:** New file `src/components/static/FeatureCard.tsx` (and `NumberedRow.tsx`); replace 93 inline card duplications and ~30 numbered-row duplications
- **Change:** Two reusable components that take props for icon, title, description, optional badge, optional href. Pages become much shorter and changes propagate.
- **Why:** Compounding maintainability win and prevents future drift.
- **Mobile note:** No visual change, but allows future targeted improvements (e.g. mobile-only card collapse) to land in one place instead of 93.

### 10. Stagger the homepage stats grid on mobile
- **Goal:** Depth + Momentum
- **Where:** `page.tsx:103–116`
- **Change:** On 375px, render the three stats not in a 3-row stack but with the first stat aligned left, second centered, third right — so the eye descends diagonally.
- **Why:** Pure CSS depth: a diagonal zigzag adds momentum without changing content. The numbers are already floating with `animate-float`; the stagger makes them feel choreographed.
- **Mobile note:** Specifically mobile-only — on desktop the existing `grid-cols-[repeat(auto-fit,…)]` already works. Use `max-md:` variants.

### 11. Add a "FEATURED" pill + thicker primary-colored top bar to the Custom PCs service card
- **Goal:** Depth (hierarchy)
- **Where:** `services/page.tsx:148`
- **Change:** Where `featured` is true, render a small pill ("FEATURED") absolutely positioned, increase top border to 4px, use `elev-3`.
- **Why:** The services hub treats the flagship card identically to the others. On mobile that's the difference between $1500 revenue and $0.
- **Mobile note:** The featured cue must be visible without horizontal scroll — a top-edge pill rather than corner ribbon works.

### 12. Tighten the `ProtectionPlansSection` shadow/elevation language to match the chevron system
- **Goal:** Depth
- **Where:** `src/components/static/ProtectionPlansSection.tsx:51–305`
- **Change:** Rewrite the section in Tailwind classes only (no inline `style={{}}`). Use the new `elev-1/2/3` shadow tokens. Add a subtle negative-margin overlap on mobile so cards stack with a slight reveal rather than rigid gap-2rem rows.
- **Why:** The section currently violates "Tailwind only" and its visual depth doesn't match the rest of the site. It's the most important sales section on the homepage.
- **Mobile note:** Stack overlap is a depth technique that survives at 375px — it's not a desktop-only effect.

### 13. Stop fighting the body font: pick one source of truth
- **Goal:** Polish
- **Where:** `tailwind.config.js:43`, `globals.css:40`, `src/app/layout.tsx` (or wherever `--font-inter` would be defined)
- **Change:** Either (a) load Inter via `next/font/google` in the root layout and replace the body `font-family` with `var(--font-inter), system-ui, sans-serif`, or (b) remove the Inter reference from the Tailwind config and embrace the system stack.
- **Why:** Currently Apple devices render in San Francisco, Windows in Segoe UI, Linux in DejaVu — no two customers see the same site. Pick one.
- **Mobile note:** System stack is mobile-friendliest (zero fetch), but Inter on mobile is also fine if loaded properly via `next/font` with `display: 'swap'`.

### 14. Hide the floating Call Now button when the footer/bottom-CTA section enters the viewport
- **Goal:** Momentum
- **Where:** `src/components/ui/mobile-call-button.tsx`
- **Change:** Add an `IntersectionObserver` watching the page's last `ChevronSection` and the footer. When either intersects, fade the floating button to `opacity-0` with `pointer-events-none`. Re-show on scroll up.
- **Why:** Right now the bottom CTA's white pill button competes with the fixed Call Now. They should not both be on screen simultaneously.
- **Mobile note:** Specifically mobile-only — desktop has no fixed button.

### 15. Add a chevron-pointing-down hint to the homepage hero on mobile
- **Goal:** Momentum + Depth
- **Where:** `page.tsx:75` (inside the hero `<ChevronSection>`)
- **Change:** Below the `Schedule a Service Call` button, add a small downward chevron SVG (or `lucide-react`'s `ChevronDown`) animated with a subtle `animate-bounce` infinite. Mobile-only (`md:hidden`).
- **Why:** Tells the user "scroll" without literally saying it. Reinforces the chevron motif as the site's downward visual language.
- **Mobile note:** Only renders on mobile, where the silver plaque alone doesn't communicate "more below".

---

## Section E — Suggested design tokens

Strictly surgical — extending the existing `tailwind.config.js`, not replacing it. Cap at 6.

### E1. Add an elevation scale, remove the legacy shadows
```js
// tailwind.config.js → theme.extend.boxShadow
'elev-1': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',         // resting card
'elev-2': '0 10px 20px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06)', // hovered card / floating CTA
'elev-3': '0 20px 30px -8px rgba(37,99,235,0.25), 0 10px 16px -4px rgba(37,99,235,0.15)', // fixed call button, primary CTA
```
Delete the 10 unused legacy shadow tokens (`shadow-blue-glow`, `shadow-green-glow`, `shadow-purple-glow`, `shadow-card-hover`, `shadow-gallery-card*`, `shadow-filter-btn*`, `shadow-silver-hover`, `shadow-brand-xl`).

### E2. Add a section-padding scale
```js
// tailwind.config.js → theme.extend.spacing (or as a plugin / component class)
'section-sm': '3rem',   // py-12 — transition / single-paragraph callouts
'section':    '5rem',   // py-20 — default
'section-lg': '7rem',   // py-28 — hero / final CTA
```
Adopt `<section className="py-section">` to replace bare `py-20` (and let `py-section-sm` / `py-section-lg` express variation).

### E3. Add a "momentum" downward gradient utility
```css
/* globals.css → @layer utilities */
.gradient-momentum {
  background: linear-gradient(180deg, rgba(37,99,235,0) 0%, rgba(37,99,235,0.04) 60%, rgba(37,99,235,0.12) 100%);
}
```
Use on section interiors to subtly intensify color saturation toward the bottom edge. Reinforces "the action is further down" without overt visual noise.

### E4. Add a `cta-primary` and `cta-inverse` component class
```css
/* globals.css → @layer components */
.cta-primary {
  @apply inline-flex items-center justify-center px-8 py-4 rounded-brand-md font-semibold text-base
         bg-primary-600 text-white shadow-elev-1
         transition-all duration-normal cursor-pointer
         hover:bg-primary-800 hover:-translate-y-0.5 hover:shadow-elev-2;
}

.cta-inverse {
  @apply inline-flex items-center justify-center px-8 py-4 rounded-brand-md font-semibold text-base
         bg-white text-primary-600 shadow-elev-2
         transition-all duration-normal cursor-pointer
         hover:-translate-y-0.5 hover:shadow-elev-3;
}
```
Sweep the ~30 inline CTA strings to use these.

### E5. Add a Section heading typography utility
```css
/* globals.css → @layer components */
.h-hero {  @apply text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-tight tracking-tight; }
.h-section { @apply text-[clamp(1.875rem,3.5vw,2.5rem)] font-bold leading-tight; }
.h-card { @apply text-xl font-semibold leading-snug; }
```
Eliminates the 5+ different card-title sizes (1.125, 1.25, 1.3, 1.4, default-clamped).

### E6. Add `--call-glow` and `--silver-shine` to the CSS variable layer
Currently `mobile-call-button.tsx` uses `btn-outer-glow` keyframes (`globals.css:650`) with hardcoded rgba values. Promote those values to root vars so a future palette tweak doesn't require touching the animation:
```css
:root {
  --call-glow-color: 96 165 250;    /* rgb of primary-400 — used by btn-outer-glow */
  --silver-shine-stops: #f0f0f0, #c8c8c8, #e8e8e8;
}
```

---

## Bookkeeping (non-recommendations, just things I noticed)

- `TODO.md` is gitignored (commit `722ce0b`) but appears in the working tree — fine, just noting.
- The texture catalog (`docs/texture-catalog.html`) has 85 textures cataloged but `globals.css` only uses 4. There's room for momentum-aware texture choices (e.g. a downward-streak texture on the homepage hero) without inventing anything new.
- The `chat-widget` (`src/components/ui/chat-widget.tsx`) is `hidden md:block` — desktop-only. So on mobile the chat is replaced by Call Now. Just confirming this is intentional and not a momentum gap.
- `ProtectionPlansSection.tsx` is fully inline styles in apparent violation of CLAUDE.md (line: "All styling is Tailwind — no CSS modules, no separate stylesheets"). The audit treats this as a polish issue (A9, D12).

— End of audit —
