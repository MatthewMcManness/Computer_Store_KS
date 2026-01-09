---
name: flyer-generator-integrator
status: backlog
created: 2025-11-27T14:22:48Z
updated: 2025-11-27T14:26:57Z
progress: 0%
prd: .claude/prds/flyer-generator-integrator.md
github: https://github.com/MatthewMcManness/Computer_Store_KS/issues/9
---

# Epic: flyer-generator-integrator

## Overview

Add a "Make Flyer" button to the gallery manager that generates print-ready HTML flyers by populating existing templates with computer data. The implementation is entirely client-side, using the existing `Sales Cards/` HTML templates as the visual reference. Black Friday enabled computers get a themed variant with red/gold styling.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Generation location | Client-side only | No server round-trip needed; instant generation |
| Template approach | Inline HTML string generation | Simpler than loading external templates; CSS inlined for print reliability |
| Output method | Blob URL + window.open() | Works across browsers; allows immediate print dialog |
| Black Friday detection | Check `blackFriday.enabled` flag | Already exists in GalleryComputer type |

## Technical Approach

### Single Utility Function
Create `src/lib/flyer-generator.ts` with one exported function:
```typescript
generateFlyer(computer: GalleryComputer): void
```

This function:
1. Determines template type (desktop vs laptop) from `computer.type`
2. Extracts specs using flexible label matching (e.g., "Memory" or "RAM")
3. Checks `blackFriday.enabled` for pricing/warranty/styling
4. Generates complete HTML string with inlined CSS
5. Opens blob URL in new tab

### Button Integration
Add printer icon button to `gallery-table.tsx` actions column, calling `generateFlyer(computer)` on click.

### CSS Strategy
- Inline all CSS from `sales-flyer.css` into generated HTML
- Add Black Friday CSS variant (red/gold theme) conditionally
- Include print-specific rules (`@page`, `-webkit-print-color-adjust`)

## Task Breakdown Preview

- [ ] **Task 1**: Create `flyer-generator.ts` with standard flyer generation (desktop + laptop templates)
- [ ] **Task 2**: Add Black Friday styling variant to flyer generator
- [ ] **Task 3**: Add "Make Flyer" button to gallery-table.tsx
- [ ] **Task 4**: Test and validate flyer output matches existing templates

## Dependencies

### Internal
- `GalleryComputer` type (already exists)
- `gallery-table.tsx` component (already exists)
- Existing flyer HTML/CSS in `Sales Cards/` (reference only)

### External
- lucide-react `Printer` icon (already in project)

## Success Criteria (Technical)

| Criteria | Validation |
|----------|------------|
| Visual match | Generated flyer identical to manually-edited `Sales Cards/*.html` |
| Data accuracy | All specs, price, warranty pulled correctly from computer object |
| Black Friday | Red/gold theme applied when `blackFriday.enabled === true` |
| Print quality | Colors render correctly in browser print preview |
| Performance | Generation < 100ms (no network calls) |

## Estimated Effort

- **Total tasks**: 4
- **Complexity**: Low-Medium
- **Risk**: Low (all client-side, no API changes)

## Tasks Created

- [ ] #10 - Create flyer generator utility with standard templates (parallel: true)
- [ ] #11 - Add Black Friday styling variant to flyer generator (parallel: false, depends on #10)
- [ ] #12 - Add Make Flyer button to gallery table (parallel: false, depends on #10)
- [ ] #13 - Test and validate flyer output (parallel: false, depends on #10, #11, #12)

**Total tasks**: 4
**Parallel tasks**: 1 (Task #10 can start immediately)
**Sequential tasks**: 3 (Tasks #11, #12 depend on #10; Task #13 depends on all)
**Estimated total effort**: 7-10 hours
