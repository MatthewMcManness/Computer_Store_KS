# TODO — Computer Store KS

> Working notes. Pick the next item, drop the relevant prompt into a fresh Claude Code session, review the agent's plan, and approve before edits.

## Active work

### 1. Homepage / About content refactor + desktop header redo
- Homepage final order: Hero → Stats → What We Do → Protection Plans (duplicated from silver-plan page) → Review widget → existing remainder.
- Move Quote section from homepage to About (just below About hero).
- Move "5 Reasons" section from homepage to About, replacing the existing "Why Choose Us" section.
- Desktop header: remove Games link, flatten Services from dropdown to a plain link, move Login button to footer as employee-only.
- Mobile header: untouched unless shared code forces it — stop and ask if so.
- Silver-plan page keeps its Protection Plans section (duplicate, not move).
- Prompt for this work: drafted in chat — re-derive or recreate via /meta-skills:prompt-master if needed.

### 2. Chevron section treatment site-wide
- Apply hero-style V-shape bottom edge to every full-width section across every page.
- Each non-hero section also gets a matching V-shape TOP edge so sections slot together like puzzle pieces with zero gap and zero overlap.
- Chevron depth driven by a single shared CSS variable in viewport-relative units (vw/%) — never fixed pixels.
- Content padding inside each section must clear the chevron at every breakpoint (320px → 2560px+).
- Header pill and footer untouched.
- Prompt for this work: drafted in chat.

### 3. Texture catalog HTML page
- Generate `docs/texture-catalog.html` — single self-contained file.
- 60 pure-CSS textures, organized as 12 categories × 5 textures each, all visually distinct, all tilable, all using CSS custom properties for colors so future recoloring is one-line.
- Each card has reference ID `texture-NN`, label, copy-CSS button.
- JSON manifest at bottom of page so future agents can look up `texture-NN` and apply it to a target section.
- Prompt for this work: drafted in chat.

### 4. Refine content across every section of the website
- Audit every section on every page for: factual correctness, professional tone, and alignment with my CTA / lead-generation goals.
- Identify weak/dated/off-brand copy and propose rewrites before changing anything.
- Each section should have a clear purpose and a path toward a primary CTA (call, contact form, in-store visit).

### 5. Verify texture choices look good and flow between sections
- After picking textures from the catalog (#3) and applying them, walk through every page top-to-bottom.
- Check that adjacent textures don't clash, that the eye flows downward, and that text remains highly legible over every texture.
- Adjust texture opacity / blend modes / color variables per section as needed.
- Depends on: #3 catalog built, textures applied across site.

### 6. Refine Computers and Services pages for higher quality
- In-store Computers gallery page: improve layout, copy, imagery treatment, filtering UX, and CTA presence on each card.
- Services pages (index + 12 subpages): improve copy quality, ensure each service page has a clear value prop, pricing where appropriate, and a strong CTA. Standardize layout across the 12 subpages.

## Notes
- Production branch deploys to live on push. Always test locally and get approval before pushing.
- Pre-push hook runs `npm run build`.
- Reference: `CLAUDE.md` for stack rules, `docs/architecture.md` for codebase structure.
