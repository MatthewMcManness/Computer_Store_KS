# Google Reviews Integration — Progress Tracker

> **Purpose:** Living handoff document for the Google Reviews widget integration.
> **Rule:** Updated at the end of every work session and before any context-risky operation.
> **If you are picking this up cold:** read this file top to bottom, then read `docs/google-reviews-playbook.md`. The "Next action when resumed" section at the bottom tells you exactly where to start.

---

## Current Phase

**Phase 2 — Implementation plan drafted, awaiting owner approval.**

No code has been changed since the original Places API stub. Both `docs/google-reviews-progress.md` and `docs/google-reviews-playbook.md` exist as the durable handoff.

---

## Settled Decisions (from owner, 2026-05-18)

| Decision | Choice | Notes |
| --- | --- | --- |
| Which API to use | **Google Business Profile API** | NOT Places API. We need all reviews, not just 5. |
| GBP access level | `contact@computerstoreks.com` is a **manager** on the shop's Google Business Profile | OAuth flow will work — no need to ask the actual owner for credential handoff. |
| Hardcoded fallback reviews (`Kristina Jones`, etc.) | **Remove only after** live integration is confirmed working | Currently shown to all site visitors. Misrepresentation risk acknowledged; removal scheduled for after Phase 3 verification. |
| API surface | **Fully migrate to GBP API** | Drop Places API entirely. Existing `src/lib/google-business.ts` will be refactored / split. |

---

## Audit Findings (Phase 0, 2026-05-18)

### What exists and works
- `src/types/google-business.ts` — clean types built for Places API (New) v1. `DisplayReview` is reusable across APIs; `PlacesReview`/`PlacesPlaceDetails` will be deleted in the migration.
- `src/lib/google-business.ts` — Places API v1 client with in-memory 15-min cache. Functional but capped at 5 reviews per request. **Will be refactored/replaced.**
- `src/app/api/google-business/reviews/route.ts` — thin handler over the lib. **Stays**, will read from Supabase cache instead of in-memory.
- `src/components/reviews/ReviewsWidget.tsx` — homepage carousel, client component, hardcoded fallback reviews. **Will convert to Server Component.**
- `src/components/reviews/ReviewsDisplay.tsx` — `/reviews` page grid, client component, hardcoded fallback reviews. **Will convert to Server Component.**
- `src/app/(public)/page.tsx:164` renders `<ReviewsWidget />`.
- `src/app/(public)/reviews/page.tsx` renders `<ReviewsDisplay />`.
- `.env.example` declares `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` (both empty).

### What is missing
- No real credentials; no `.env` / `.env.local` file in the repo.
- No 5-star filter at the API/lib level (frontend filters `>= 4`).
- No rotation logic — we'd show the same 5 reviews forever.
- No durable cache (in-memory cache dies on every Render cold start).
- No Supabase tables for OAuth tokens or cache.
- No OAuth flow code at all.
- No documentation of any of this.

### What is broken / risky
- Client-side fetch in both reviews components → real reviews never make it into SSR HTML; SEO-invisible.
- In-memory cache on Render's free tier is effectively non-functional.
- Hardcoded fake reviewer names are being served to live users.

---

## Implementation Plan (Phase 2 — awaiting approval)

### Critical path blocker (must start first)

**Google Business Profile API allowlist application.** Google requires manual approval before any project can call `mybusiness.googleapis.com/v4/.../reviews`. Approval is rumored to take 1–4 weeks. **We file this on day 1; everything else proceeds in parallel.**

- Application: https://support.google.com/business/contact/api_default
- Required answers prepared in playbook §1.

### Step-by-step plan

#### Step 1 — Google Cloud Console setup *(needs owner action)*
1. Open / create a Cloud project named `computer-store-ks` (or reuse if exists).
2. Enable APIs:
   - My Business Account Management API
   - My Business Business Information API
   - (Note: legacy v4 reviews endpoint does NOT show up in the enable list; it gates on the allowlist application above.)
3. Configure OAuth consent screen — **External**, scope: `business.manage`, test users: `contact@computerstoreks.com`.
4. Create OAuth 2.0 Client ID — **Web application**.
   - Authorized redirect URIs:
     - `http://localhost:3000/api/google-business/oauth/callback`
     - `https://computerstoreks.com/api/google-business/oauth/callback`
5. File the allowlist request (see playbook §1).

→ I provide click-by-click instructions in playbook §2. Owner runs them.

#### Step 2 — Supabase schema *(needs owner approval before I touch RLS)*

Two new tables:

```
oauth_tokens
  id              uuid PK default gen_random_uuid()
  provider        text NOT NULL              -- 'google'
  refresh_token   text NOT NULL              -- encrypted at rest by Supabase
  scope           text NOT NULL
  account_email   text                       -- 'contact@computerstoreks.com', for audit
  updated_at      timestamptz NOT NULL default now()
  UNIQUE(provider)                            -- single row per provider

reviews_cache
  id              int PK default 1            -- single-row pattern
  reviews_raw     jsonb NOT NULL              -- all reviews from Google, unfiltered
  stats           jsonb NOT NULL              -- { averageRating, totalCount }
  fetched_at      timestamptz NOT NULL
  CHECK (id = 1)
```

Both tables: RLS enabled, **no policies** (only `service_role` can touch them via server code).

#### Step 3 — Refactor `src/lib/google-business.ts` into a folder
```
src/lib/google-business/
├── index.ts         barrel re-export
├── oauth.ts         build auth URL, exchange code, refresh access token
├── reviews.ts       paginated fetch from GBP v4, normalize to DisplayReview
├── cache.ts         Supabase-backed cache read/write (single-row)
├── selection.ts     filter to 5-star, score, rotate, dedupe author names
└── types-internal.ts GBP API response shapes (private to this folder)
```

Old `src/lib/google-business.ts` → deleted. Old Places types in `src/types/google-business.ts` → removed; keep `DisplayReview` + `ReviewsCache`.

#### Step 4 — New API routes
- `GET  /api/google-business/oauth/start` (admin-only) — returns auth URL
- `GET  /api/google-business/oauth/callback` — exchanges `?code`, writes refresh_token to Supabase
- `POST /api/google-business/refresh` (admin-only or bearer-token-protected for cron) — re-fetches from Google, updates cache
- `GET  /api/google-business/reviews` *(existing)* — refactored to read from Supabase cache only; never hits Google directly

#### Step 5 — Selection algorithm (`selection.ts`)
1. Filter `starRating === "FIVE"`.
2. Drop empty `comment` or `comment.length < 30`.
3. Score each review:
   - **Recency**: exponential decay over 730 days (2 years).
   - **Length**: bell curve peaking at 80–300 chars.
   - **Owner reply present**: +10% bonus.
4. Deduplicate by reviewer first-name within a single rendered set.
5. **Rotation**: deterministic shuffle seeded by `Math.floor(Date.now() / (24 * 60 * 60 * 1000))` (day-of-epoch) so the set varies day-to-day but is stable within a day.
6. Output: top N where N = caller's request (6 for widget, 24 for /reviews page).

#### Step 6 — Convert components to Server Components
- `ReviewsWidget.tsx` — split into `ReviewsWidget.server.tsx` (data fetch) + `ReviewsWidgetCarousel.tsx` (`'use client'` for the prev/next pagination only).
- `ReviewsDisplay.tsx` — Server Component; pagination inside `/reviews` page can be query-param-driven (`?page=2`) so no client interactivity is needed at all.

#### Step 7 — Cache refresh strategy
- **Render cron job** (`render.yaml`): once daily at 03:00 America/Chicago → `POST /api/google-business/refresh` with bearer token from env var. Render free tier supports cron jobs separate from the web service.
- If owner prefers no cron: fall back to "refresh on cache age > 24h" lazy refresh inside the GET handler (cheaper but inconsistent for first visitor each day).

#### Step 8 — Testing checklist (Phase 3 exit gate)
- [ ] OAuth flow completes end-to-end with manager account.
- [ ] `/api/google-business/reviews` returns > 5 reviews (proves allowlist worked).
- [ ] 5-star filter rejects any 4-star review from the data.
- [ ] Rotation changes display set across days (use debug `?day=N` for fast iteration).
- [ ] Cache TTL respected: two requests within 1 hour → only one Google call (asserted via log).
- [ ] Revoking OAuth → page renders empty state, no crash.
- [ ] Hardcoded fallback reviews removed in a final commit, verified on staging-equivalent local build.

#### Step 9 — Deployment
- `npm run build` passes locally.
- Add Render env vars: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_REFRESH_BEARER_TOKEN`.
- Run OAuth connect flow on production once to seed refresh token.
- Verify `/api/health` and `/api/google-business/reviews` on live.

---

## Open Questions / Blockers

| # | Item | Owner | Status |
| --- | --- | --- | --- |
| 1 | Approve the implementation plan above | Matthew | **OPEN** |
| 2 | Run Google Cloud Console steps + file allowlist request | Matthew | not started — gated by #1 |
| 3 | Approve creation of two new Supabase tables | Matthew | not started — gated by #1 |
| 4 | Provide bearer token value for cron refresh route (or accept generated UUID) | Matthew | not started |

---

## Completed Milestones

| Date | Milestone |
| --- | --- |
| 2026-05-18 | Phase 0 audit complete. Confirmed: GBP API path, manager-level access, full migration. |
| 2026-05-18 | Phase 1 progress + playbook docs created. |
| 2026-05-18 | Phase 2 implementation plan drafted. |

---

## Decision Log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-05-18 | Use Google Business Profile API, drop Places API entirely | Owner wants all reviews + rotation. Places caps at 5 reviews and offers no real selection control. |
| 2026-05-18 | Store refresh token in Supabase, not env var | Env vars are not writable at runtime; if Google ever rotates the refresh token we'd be stuck. Supabase RLS-locked table is safer and rotatable. |
| 2026-05-18 | Cache in Supabase, not in-memory | Render free tier cold-starts kill in-memory state. Supabase row gives durable, single-roundtrip cache. |
| 2026-05-18 | Server Components for both reviews UIs | Reviews end up in SSR HTML → SEO benefit + faster paint. Pagination can be query-param-based, removing the need for client state. |
| 2026-05-18 | Deterministic day-seeded rotation | Cheap, no DB write needed each request, reviewers see variety without staleness. |

---

## Next Action When Resumed

> If this session ends right now, the next session should do this:

1. Read this file end-to-end.
2. Read `docs/google-reviews-playbook.md` for any gotchas already captured.
3. Check whether Matthew has answered Open Question #1 (plan approval) in the latest conversation.
4. **If approved:** start Phase 3 Step 1 by providing Matthew the click-by-click Google Cloud Console + allowlist application instructions (drawn from playbook §1 + §2).
5. **If not approved:** answer Matthew's feedback on the plan, revise the plan in this doc, re-present.
6. Do NOT touch code until plan approval lands.
