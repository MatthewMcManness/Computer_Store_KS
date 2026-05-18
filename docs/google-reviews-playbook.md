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

## §2 — Google Cloud Console setup *(to be filled when we do this for real)*

Pre-reqs: a Google account that is a manager or owner of the target Google Business Profile.

### 2.1 Create the Cloud project
*To be filled in real time during implementation. Expected steps:*

1. Go to `https://console.cloud.google.com/`.
2. Project picker → **NEW PROJECT** → name it `<client-slug>-reviews`.
3. Note the project ID for later.

### 2.2 Enable APIs
*To be filled in real time. Expected URLs:*

- `https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com` → Enable
- `https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com` → Enable

### 2.3 Configure OAuth consent screen
*To be filled in real time. Expected fields:*

- User type: **External** (unless the manager is on a Google Workspace org that owns the GBP — rare)
- App name, support email, developer email: client's business info
- Scopes: add `https://www.googleapis.com/auth/business.manage`
- Test users: add the manager email(s)
- Publish status: **Testing** is fine; we don't need to verify the app since only one employee logs in

### 2.4 Create OAuth Client ID
*To be filled in real time. Expected fields:*

- Type: **Web application**
- Redirect URIs:
  - `http://localhost:3000/api/google-business/oauth/callback`
  - `https://<production-domain>/api/google-business/oauth/callback`
- Save the **Client ID** and **Client Secret** into your password manager.

### 2.5 File the Business Profile API allowlist request
*To be filled in real time. Expected form: https://support.google.com/business/contact/api_default*

Required answers (drafted, refine per client):
- "What business goal does this app help you achieve?" → Display verified Google reviews on the business's own website to build trust with prospective customers.
- "What APIs do you need?" → Google Business Profile API — reviews read access.
- "Will this app be public?" → No. Single-business private deployment.

**After submission:** screenshot the confirmation, save it in this playbook under §10.

---

## §3 — Token storage strategy

*To be filled when implemented.*

Short version: refresh token lives in a Supabase table `oauth_tokens` (RLS on, no policies, `service_role` only). Env vars hold the Client ID + Secret + redirect URI only.

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
