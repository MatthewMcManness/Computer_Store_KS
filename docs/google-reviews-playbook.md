# Google Reviews Integration — Reusable Playbook

> **Purpose:** A reusable, client-facing guide for setting up the Google Business Profile (GBP) reviews widget on a small-business Next.js site.
>
> **Status:** Skeleton. Sections are filled in *as we hit each step in real implementation*, not after the fact. If a section is empty, we have not done that step yet.
>
> **Reuse:** Section §11 ("Runbook: Setting this up for a new client") is the condensed end-state. Read §1–§10 first to understand why each step exists.

---

## §1 — Why this is harder than it looks

Google has **two different APIs** that surface review data, and they are not interchangeable.

| API | Auth | Reviews returned | When to use |
| --- | --- | --- | --- |
| **Places API (New) v1** | API key (anonymous) | **Up to 5**, no pagination, no filter beyond `MOST_RELEVANT \| NEWEST` | Quick-start "5 most recent reviews" widgets. Acceptable if the business has ≤ 5 reviews you care about. |
| **Google Business Profile API** | OAuth 2.0 (business owner/manager) | **All reviews**, paginated 50 per page, includes owner replies and ability to post replies | Real review widgets, rotation, filtering, automation. The only path to "all 5-star reviews." |

**Gotcha #1:** The **Google Business Profile API requires manual allowlisting by Google.** You apply at
`https://support.google.com/business/contact/api_default` and wait days to weeks. **Apply on day 1** of any project. Until allowlisted, your API calls to the reviews endpoint will return 403 even though OAuth works.

**Gotcha #2:** Reviews live at the **legacy v4 endpoint** (`https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews`). Google has not migrated reviews to a v1 endpoint as of 2026. The v4 endpoint is "legacy" but actively maintained for reviews — do not be put off by the deprecation warnings; there is no replacement.

**Gotcha #3:** Even with a manager-level OAuth token, you can only read reviews for locations on accounts the OAuth user manages. Verify the user's manager role in `business.google.com` before you do anything else.

---

## §2 — Google Cloud Console setup *(owner-run instructions, live)*

**Pre-req:** Sign into Google as `contact@computerstoreks.com`. Verify in https://business.google.com/ that this account is a **manager** on the Computer Store Kansas profile before continuing. If it shows the location and you can see/respond to reviews there, you are good.

Estimated time: 10–15 minutes.

### 2.1 Create the Cloud project

1. Open https://console.cloud.google.com/ in a browser signed in as `contact@computerstoreks.com`.
2. Top-left **project picker dropdown** (next to the "Google Cloud" logo) → **NEW PROJECT** (top right of the modal).
3. Project name: `computer-store-ks-reviews`. Leave Organization as is (likely "No organization"). Click **CREATE**.
4. Wait ~30 seconds. The project picker should switch to the new project automatically. If not, click the project picker again and select it.
5. Copy the **Project ID** (shown under the project name, e.g., `computer-store-ks-reviews`) and paste it in chat back to me.

### 2.2 Enable the two APIs

Open each URL below in turn (with the new project selected) and click the blue **ENABLE** button. Wait for the success banner before moving on.

1. https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com
2. https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com

You will NOT see a "Google Business Profile API" or "My Business v4 API" in the library — that's normal. The v4 reviews endpoint is gated by the allowlist application in §2.5, not by API enablement.

### 2.3 Configure OAuth consent screen

1. Go to https://console.cloud.google.com/apis/credentials/consent
2. User type: **External**. Click **CREATE**.
3. App information page:
   - App name: `Computer Store KS Reviews`
   - User support email: `contact@computerstoreks.com`
   - App logo: skip (optional)
   - Application home page: `https://computerstoreks.com`
   - Application privacy policy link: skip (not required for Testing mode)
   - Application terms of service link: skip
   - Authorized domains: click **+ ADD DOMAIN** → enter `computerstoreks.com`
   - Developer contact email: `contact@computerstoreks.com` (or your own preferred address)
   - **SAVE AND CONTINUE**.
4. Scopes page:
   - Click **ADD OR REMOVE SCOPES**.
   - In the filter box, type `business.manage`. If it doesn't appear in the list, click **Manually add scopes** at the bottom of the modal and paste: `https://www.googleapis.com/auth/business.manage`. Click **ADD TO TABLE**.
   - Click **UPDATE** at the bottom of the modal.
   - Back on the Scopes page, the scope should now show as a sensitive scope. Click **SAVE AND CONTINUE**.
5. Test users page:
   - Click **+ ADD USERS**.
   - Add: `contact@computerstoreks.com`
   - (Optional, but recommended) also add your own personal Google email so you can test the OAuth flow yourself.
   - **SAVE AND CONTINUE**.
6. Summary page: click **BACK TO DASHBOARD**. Status will be **Testing**. That is the correct end state for this project.

### 2.4 Create the OAuth 2.0 Client ID

1. Go to https://console.cloud.google.com/apis/credentials
2. Click **+ CREATE CREDENTIALS** (top of page) → **OAuth client ID**.
3. Application type: **Web application**.
4. Name: `Computer Store KS Reviews — web client`.
5. Authorized JavaScript origins → **+ ADD URI**:
   - `http://localhost:3000`
   - `https://computerstoreks.com`
6. Authorized redirect URIs → **+ ADD URI**:
   - `http://localhost:3000/api/google-business/oauth/callback`
   - `https://computerstoreks.com/api/google-business/oauth/callback`
7. Click **CREATE**.
8. A modal appears with the **Client ID** and **Client secret**. Copy both to your password manager **immediately** — Google still lets you re-view the secret, but treat it as a one-shot. Then send both to me in chat (you can also rotate immediately after, see Appendix C).

### 2.5 File the Business Profile API allowlist request

This is the long-pole step. Apply now even if you're not ready to do the code part.

1. Go to https://support.google.com/business/contact/api_default
2. Fill out the form. Suggested answers for Computer Store KS:

   | Field | Answer |
   | --- | --- |
   | Your full name | (your name) |
   | Your email address | `contact@computerstoreks.com` |
   | Your company / business name | `Computer Store Kansas` |
   | Company website | `https://computerstoreks.com` |
   | Number of business locations being managed | `1` |
   | Use case category | *Display business information on own website* (or closest match) |
   | Detailed use case | *Display the business's own verified Google reviews on its public website (https://computerstoreks.com) to build customer trust. Read-only access only. Single business location. Manager: contact@computerstoreks.com.* |
   | GCP project ID | the project ID you copied in §2.1 |
   | APIs required | `Google Business Profile API` |
   | Will the app be publicly distributed? | **No** |
   | Will end users sign in with their own Google accounts? | **No** — only the business's own manager account |

3. Submit the form. Screenshot the confirmation page.
4. Save the screenshot reference here: *(paste filename or paste confirmation text after submission)*

**Expected response time:** 1–4 weeks based on community reports. Google emails the contact address with approval, denial, or a follow-up question.

**While you wait:** all the code can still be built. We just can't verify against real live reviews until the approval email lands.

---

## §3 — Supabase migration *(owner-run, paste into Supabase SQL editor)*

**When to run:** any time. Independent of the Google Cloud Console steps. Will take ~30 seconds.

1. Open Supabase dashboard → your project → **SQL Editor** in the left nav.
2. Click **+ New query**.
3. Paste the entire block below.
4. Click **RUN** (or `Ctrl+Enter`).
5. Confirm the success message ("Success. No rows returned.").
6. In chat, tell me "Supabase migration applied."

```sql
-- ─── Computer Store KS — Google Reviews integration migration ─────
-- Creates two RLS-locked tables for OAuth state and the reviews cache.
-- Safe to re-run: uses IF NOT EXISTS / does nothing on second run.

-- Refresh token + scope for the Google Business Profile OAuth grant.
-- Single row per provider. Only the service_role key can touch this.
create table if not exists public.oauth_tokens (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null,
  refresh_token text not null,
  scope         text not null,
  account_email text,
  updated_at    timestamptz not null default now(),
  unique (provider)
);

alter table public.oauth_tokens enable row level security;
-- Intentionally no policies. RLS-on with no policies = service_role-only access.

comment on table  public.oauth_tokens         is 'OAuth refresh tokens for third-party integrations. service_role access only.';
comment on column public.oauth_tokens.provider is 'Lowercase provider key, e.g., ''google''.';

-- Cached Google reviews + aggregate stats. Single-row table (id=1).
-- The lazy-refresh handler reads this on every reviews request and
-- triggers a Google fetch when fetched_at is older than 24h.
create table if not exists public.reviews_cache (
  id          integer primary key default 1,
  reviews_raw jsonb       not null,
  stats       jsonb       not null,
  fetched_at  timestamptz not null,
  check (id = 1)
);

alter table public.reviews_cache enable row level security;
-- No policies. service_role only.

comment on table public.reviews_cache is 'Single-row cache of normalized Google reviews. service_role access only.';

-- Seed an empty row so the lazy-refresh handler can always SELECT
-- and treat it as "stale, refresh now" on the first request.
insert into public.reviews_cache (id, reviews_raw, stats, fetched_at)
values (1, '[]'::jsonb, '{"averageRating":0,"totalCount":0}'::jsonb, 'epoch'::timestamptz)
on conflict (id) do nothing;
```

**Verification query** (run after the migration succeeds — should return 2 rows):

```sql
select tablename from pg_tables where schemaname = 'public' and tablename in ('oauth_tokens', 'reviews_cache');
```

If anything goes wrong, paste the error in chat and I'll diagnose. The migration is idempotent — running it twice is harmless.

---

## §4 — OAuth flow walkthrough

*To be filled when implemented.*

Will cover:
- Building the auth URL with `prompt=consent&access_type=offline` (required to get a refresh token)
- Handling `?error=access_denied` on callback
- Exchanging code for tokens
- Storing refresh token
- Minting a fresh access token per request (1-hour TTL)

---

## §5 — Reviews fetch — endpoint, payload, pagination

*To be filled when implemented.*

Expected payload sample:
```json
{
  "reviews": [
    {
      "name": "accounts/.../locations/.../reviews/...",
      "reviewer": { "profilePhotoUrl": "...", "displayName": "Jane Smith" },
      "starRating": "FIVE",
      "comment": "...",
      "createTime": "2025-09-01T12:00:00Z",
      "updateTime": "2025-09-01T12:00:00Z",
      "reviewReply": { "comment": "...", "updateTime": "..." }
    }
  ],
  "averageRating": 4.9,
  "totalReviewCount": 87,
  "nextPageToken": "..."
}
```

---

## §6 — Caching and refresh

*To be filled when implemented.*

Single-row Supabase table `reviews_cache`. Refresh strategies:
1. Render cron daily — preferred for free-tier-friendly predictable load.
2. Lazy "refresh if cache > 24h" inside the GET handler — fallback if cron is not available.

---

## §7 — Filtering and rotation

*To be filled when implemented.*

The algorithm in pseudocode:

```
def select_reviews(all_reviews, count, day_seed):
    five_stars = [r for r in all_reviews if r.starRating == "FIVE"]
    substantive = [r for r in five_stars if len(r.comment or "") >= 30]
    scored = [(score(r), r) for r in substantive]
    sorted_by_score = sort_desc(scored)
    top_pool = sorted_by_score[:count * 3]            # take 3x the count
    rotated = seeded_shuffle(top_pool, seed=day_seed) # day-stable rotation
    deduped = dedupe_first_names(rotated)
    return deduped[:count]
```

---

## §8 — Frontend rendering

*To be filled when implemented.*

Will cover: Server Components, hydration boundaries for pagination, accessibility (aria-labels on star ratings, keyboard navigation), and how the SSR HTML helps SEO.

---

## §9 — Errors encountered and exact resolutions

> Every real error we hit gets a row here. Date, exact message, root cause, fix.

| Date | Where | Error | Cause | Resolution |
| --- | --- | --- | --- | --- |
| *(empty — will fill as we hit them)* | | | | |

---

## §10 — Architecture diagram

*To be added when implementation is complete.*

```
[ Render daily cron ] ──POST /api/google-business/refresh──▶ [ Next.js server route ]
                                                                       │
                                                                       ▼
                                              ┌──────────────────────────────────────┐
                                              │ 1. Read refresh_token from Supabase  │
                                              │ 2. Mint access_token via Google      │
                                              │ 3. Paginate reviews from GBP v4      │
                                              │ 4. Normalize → DisplayReview[]       │
                                              │ 5. Write reviews_cache (single row)  │
                                              └──────────────────────────────────────┘

[ Visitor → homepage / reviews page ]
            │
            ▼
   ┌──────────────────────────────┐
   │ Server Component             │
   │ reads reviews_cache directly │
   │ applies day-seeded selection │
   │ renders HTML                 │
   └──────────────────────────────┘
```

---

## §11 — Runbook: Setting this up for a new client

*Filled in at the very end, once we have run the playbook ourselves and know it works.*

This section will be the **5-minute condensed instruction set** to reuse on the next client site. It will reference the detailed sections above for anyone who hits trouble.

Headings will include:
1. Prerequisites you need from the client before you start.
2. Apply for GBP API allowlist on day 1.
3. Cloud Console setup (numbered clicks).
4. Schema migration files to run on the client's Supabase.
5. Env vars to add to the deployment.
6. One-time OAuth connect.
7. Set up daily refresh.
8. Verify with the test checklist.
9. Final QA before going live.

---

## Appendix A — Useful URLs

- Google Cloud Console: https://console.cloud.google.com/
- OAuth consent screen: https://console.cloud.google.com/apis/credentials/consent
- Credentials: https://console.cloud.google.com/apis/credentials
- Business Profile Manager: https://business.google.com/
- API allowlist request form: https://support.google.com/business/contact/api_default
- GBP API reviews docs: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list
- OAuth 2.0 for Web Server Apps: https://developers.google.com/identity/protocols/oauth2/web-server

## Appendix B — Glossary

- **GBP** — Google Business Profile (the new name for Google My Business).
- **Manager vs Owner** — both can read reviews via the API; only owners can transfer ownership.
- **Allowlist** — Google's manual review of your project before the GBP API will return data. Different from API enablement.
- **`prompt=consent` + `access_type=offline`** — the magic OAuth params that guarantee Google sends back a refresh token. Skip them and you get an access token only, which expires in 1 hour with no way to renew.

## Appendix C — Rotating the OAuth Client Secret

If the Client Secret leaks (or you just want a fresh one after copying it into chat):

1. Go to https://console.cloud.google.com/apis/credentials
2. Click the OAuth 2.0 Client ID row.
3. Right-side panel → **+ ADD SECRET** (you can have multiple secrets active during rotation).
4. Update the deployed env var `GOOGLE_OAUTH_CLIENT_SECRET` to the new value.
5. Once the new secret is verified working, click the trash icon next to the old secret.

This avoids any downtime: both old and new secrets work during the overlap window.
