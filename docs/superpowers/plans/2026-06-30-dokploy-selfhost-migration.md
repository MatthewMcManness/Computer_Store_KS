# Computer Store KS: Dokploy Self-Host Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move computerstoreks.com off Render onto the local Dokploy server, and remove the Supabase (auth, Postgres, storage) and Resend dependencies in the same migration, replacing them with self-hosted Postgres, a local image volume, Cloudflare Access for admin auth, and the existing n8n contact-relay for email.

**Architecture:** The Next.js standalone app keeps all of its features. Supabase Postgres is replaced by a self-hosted Postgres (Dokploy-managed service) accessed through a thin `pg` data layer that preserves every existing lib function signature, so route and page call sites do not change. Supabase Storage is replaced by a local disk volume served by a streaming route. Supabase Auth is deleted from the app entirely; Cloudflare Access gates `/admin/*` and the admin `/api/*` routes at the edge (same pattern as the hub dashboard). Resend is replaced by a POST to the existing n8n contact-relay webhook. Everything is built and proven on a preview host behind Access before any DNS flips; the public domain only cuts over at the very end, with a static Cloudflare Pages holding page plus a failover Worker as the outage fallback.

**Tech Stack:** Next.js 14 (App Router, standalone), `pg` (node-postgres), self-hosted Postgres 16, Cloudflare Tunnel (named, systemd --user), Cloudflare Access, Cloudflare Pages and Worker (failover), Dokploy REST API, n8n contact-relay.

---

## Reference material the executor MUST read first

- `/home/matthew/RWS/runbooks/site-failover-playbook.md`: the proven Dokploy-primary plus Pages-backup plus Worker pattern. Sections 0 (credentials), 1 (per-site discovery), and the Worker/DNS steps are reused with `SITE=computer-store-ks`, `DOMAIN=computerstoreks.com`.
- Memory `reference_dokploy_staging_named_tunnel.md`: how to create the Dokploy app via API and stand up a named tunnel without root. The `X-Forwarded-Proto: https` header and the `route dns` CNAME gotcha are load-bearing.
- Memory `reference_dokploy_traefik_router.md`: hand-writing the Traefik router file if a SQL-inserted domain row 404s.
- Memory `reference_cloudflare_access_tunnel_api.md`: which token manages Access apps, the team-domain-from-redirect trick, creating an app plus policy, verifying enforcement without a browser.
- Memory `reference_contact_form_relay.md`: the n8n contact-relay webhook URL, payload shape, and per-client label convention. The email phase depends on this.
- Memory `feedback_domains_to_cloudflare.md`: zone-add and NS-swap-first, registrar transfer in parallel, client retains ownership.

### Credentials (all already on disk)

| What | Where | Use |
|---|---|---|
| `DOKPLOY_API_TOKEN` | `/home/matthew/RWS/projects/.env.local` | Dokploy REST API `http://localhost:3000/api` (always send `X-Forwarded-Proto: https`) |
| `CLOUDFLARE_API_TOKEN` | `/home/matthew/RWS/.env.local` | account-scoped: Pages/Workers/KV/Routes Edit, Zone Read, DNS Edit (all zones). Account id `742adba7b242b60930d34f8cafe0c230` |
| Access-management token | see `reference_cloudflare_access_tunnel_api.md` | create and manage Access applications and policies |
| Current Supabase | `clients/computer-store-ks/website/.env` (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) | REST export of table data and storage download (service role, no DB password needed) |
| Dokploy GitHub provider id | `Gj529tKLbssWXLa4DLLiu` | covers m318m972 repos (not needed if building from a public git URL) |

### Pre-flight gate (BLOCKER: resolve before Phase 5 deploy)

Matthew must confirm the values in `clients/computer-store-ks/website/.env` are the current Render production values, not stale dev values, for at least: `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_BUSINESS_CLIENT_SECRET`, `GITHUB_TOKEN`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`. The data export (Phase 0) is the proof for the Supabase key: if the REST export returns rows, the service-role key is live. Flag the others explicitly to Matthew.

---

## File Structure

**New files:**
- `db/schema.sql`: full DDL for the 5 tables.
- `db/seed-from-supabase.mjs`: one-shot exporter. Pulls all rows from Supabase REST and downloads storage objects, writes `db/export/*.json` and `db/export/uploads/*`.
- `db/import.mjs`: loads `db/export/*.json` into the target Postgres via `pg`, rewriting `image_url` to the new `/uploads/...` path.
- `src/lib/db.ts`: `pg` Pool plus typed `query()` helper. Single source of DB connectivity.
- `src/app/uploads/[...path]/route.ts`: streams image files from the uploads volume with content-type and cache headers.
- `src/lib/access-jwt.ts`: verifies the `Cf-Access-Jwt-Assertion` header against the Access certs (defense-in-depth).
- `Dockerfile`: multi-stage standalone Next.js build.
- `.dockerignore`
- `failover-worker/`: Worker plus wrangler.toml (copied from the RWS pattern, retargeted).
- `holding-page/`: static "temporarily offline" page (its own tiny git-connected repo for Pages).

**Modified files (data layer, signatures preserved):**
- `src/lib/slideshow.ts`, `src/lib/gallery.ts`, `src/lib/google-business/oauth.ts`, `src/lib/google-business/cache.ts`: swap Supabase query-builder calls for `db.query()`.
- `src/app/api/slideshow/upload/route.ts`: write to volume instead of Supabase Storage.
- `src/app/api/health/route.ts`, `src/app/api/in-store/route.ts`, `src/app/api/in-store/sale/route.ts`, and any other route with a direct `supabase`/`supabaseAdmin` reference: convert to `db.query()`.
- `src/lib/email.ts`: POST to n8n relay instead of Resend.
- `src/middleware.ts`: remove Supabase auth; keep security headers; add Access-JWT check for protected paths.
- `src/lib/constants.ts`: keep `AUTHORIZED_EMAIL` (now used by the Access-JWT check).
- `next.config.mjs`: drop Supabase image hosts; keep standalone.

**Deleted files (auth now at the edge):**
- `src/lib/supabase.ts`, `src/lib/supabase-auth.ts`
- `src/app/(auth)/login/page.tsx`, `src/app/auth/callback/route.ts`
- `src/app/api/auth/check/route.ts`, `src/app/api/auth/logout/route.ts`

---

## Phase 0 - Branch, local Postgres, schema, data export (zero live impact)

### Task 0.1: Create the migration branch

- [ ] **Step 1: Branch off Production**

```bash
cd /home/matthew/RWS/clients/computer-store-ks/website
git fetch origin
git checkout Production && git pull
git checkout -b migrate-dokploy-selfhost
```

- [ ] **Step 2: Commit**

```bash
git commit --allow-empty -m "chore: start dokploy self-host migration branch"
```

### Task 0.2: Write the schema

**Files:** Create `db/schema.sql`

- [ ] **Step 1: Write the DDL** (reconstructed from `src/types/*.ts` and the lib query usage)

```sql
-- db/schema.sql: self-hosted Postgres schema for Computer Store KS.
-- Mirrors the Supabase tables this app used. Apply to an empty database.
create extension if not exists "pgcrypto";

create table slideshow_slides (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        text not null check (type in ('html','image')),
  content     text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table gallery_computers (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  type           text not null check (type in ('desktop','laptop')),
  category       text not null check (category in ('refurbished','custom','new')),
  price          numeric(10,2) not null,
  image_url      text,
  thumbnail_url  text,
  location_id    uuid,
  specs          jsonb not null default '[]'::jsonb,
  is_active      boolean not null default true,
  sort_order     integer not null default 0,
  stock_quantity integer not null default 1,
  archived_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table gallery_sales (
  id              uuid primary key default gen_random_uuid(),
  sale_type       text not null,
  name            text not null,
  discount_percent integer not null default 0,
  applies_to      jsonb not null default '[]'::jsonb,
  is_active       boolean not null default false,
  created_at      timestamptz not null default now()
);

create table oauth_tokens (
  id            uuid not null default gen_random_uuid(),
  provider      text primary key,
  refresh_token text not null,
  scope         text not null,
  account_email text,
  updated_at    timestamptz not null default now()
);

create table reviews_cache (
  id          integer primary key,
  reviews_raw jsonb not null default '[]'::jsonb,
  stats       jsonb not null default '{}'::jsonb,
  fetched_at  timestamptz not null default now()
);
```

- [ ] **Step 2: Commit**

```bash
git add db/schema.sql && git commit -m "feat(db): add self-hosted Postgres schema"
```

### Task 0.3: Stand up a local dev Postgres and apply the schema

- [ ] **Step 1: Run a throwaway local Postgres**

```bash
docker run -d --name csks-pg-dev -e POSTGRES_PASSWORD=devpw -e POSTGRES_DB=csks -p 5544:5432 postgres:16
sleep 4
```

- [ ] **Step 2: Apply schema and verify all 5 tables exist**

```bash
PGPASSWORD=devpw psql -h 127.0.0.1 -p 5544 -U postgres -d csks -f db/schema.sql
PGPASSWORD=devpw psql -h 127.0.0.1 -p 5544 -U postgres -d csks -tAc "\dt"
```
Expected: lists `slideshow_slides, gallery_computers, gallery_sales, oauth_tokens, reviews_cache`.

### Task 0.4: Export current data and images from Supabase (REST, service-role)

**Files:** Create `db/seed-from-supabase.mjs`

- [ ] **Step 1: Write the exporter**

```javascript
// db/seed-from-supabase.mjs: pull all table rows and storage objects from Supabase via REST.
// Usage: node db/seed-from-supabase.mjs  (reads .env)
import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('Missing Supabase env');
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const TABLES = ['slideshow_slides','gallery_computers','gallery_sales','oauth_tokens','reviews_cache'];
const BUCKETS = ['slideshow-images','gallery-images'];

await mkdir('db/export/uploads', { recursive: true });

for (const t of TABLES) {
  const r = await fetch(`${URL}/rest/v1/${t}?select=*`, { headers: H });
  if (!r.ok) throw new Error(`${t}: ${r.status} ${await r.text()}`);
  const rows = await r.json();
  await writeFile(`db/export/${t}.json`, JSON.stringify(rows, null, 2));
  console.log(`exported ${t}: ${rows.length} rows`);
}

// List then download every storage object from each bucket so images survive the move.
for (const BUCKET of BUCKETS) {
  const list = await fetch(`${URL}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: '', limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!list.ok) throw new Error(`storage list ${BUCKET}: ${list.status} ${await list.text()}`);
  const objects = await list.json();
  let n = 0;
  for (const o of objects) {
    if (!o.name) continue;
    const dl = await fetch(`${URL}/storage/v1/object/public/${BUCKET}/${o.name}`, { headers: H });
    if (!dl.ok) { console.warn(`skip ${BUCKET}/${o.name}: ${dl.status}`); continue; }
    await pipeline(Readable.fromWeb(dl.body), createWriteStream(`db/export/uploads/${o.name}`));
    n++;
    console.log(`downloaded ${BUCKET}/${o.name}`);
  }
  console.log(`bucket ${BUCKET}: ${n} objects`);
}
console.log('export complete');
```

- [ ] **Step 2: Add dotenv (dev dep) and run the export**

```bash
npm install --save-dev dotenv
node db/seed-from-supabase.mjs
ls db/export && ls db/export/uploads | head
```
Expected: 5 `*.json` files; `uploads/` contains the slideshow images. Record the row counts. They are the migration's source-of-truth totals for the post-import verify.

- [ ] **Step 3: Gitignore the export (contains a live refresh token in oauth_tokens.json)**

```bash
printf 'db/export/\n' >> .gitignore
git add .gitignore db/seed-from-supabase.mjs package.json package-lock.json
git commit -m "feat(db): add Supabase REST exporter (data and storage)"
```

### Task 0.5: Write and run the importer into local Postgres

**Files:** Create `db/import.mjs`

- [ ] **Step 1: Write the importer** (rewrites image_url to the new `/uploads/<name>` path)

```javascript
// db/import.mjs: load db/export/*.json into Postgres at DATABASE_URL.
// Rewrites Supabase Storage image URLs (slideshow + gallery) to /uploads/<filename>;
// leaves repo-relative and other non-Supabase paths unchanged.
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const DSN = process.env.DATABASE_URL;
if (!DSN) throw new Error('Set DATABASE_URL');
const c = new pg.Client({ connectionString: DSN });
await c.connect();

const load = async (t) => JSON.parse(await readFile(`db/export/${t}.json`, 'utf8'));
const lastPathSeg = (u) => (u ? u.split('/').pop().split('?')[0] : null);
// Rewrite only Supabase Storage URLs to the local /uploads path. Leave repo-relative
// paths (e.g. /assets/gallery/computer-7.jpg) and any non-Supabase URL untouched.
const isSupabaseStorage = (u) =>
  typeof u === 'string' && (u.includes('/storage/v1/object/') || u.includes('.supabase.co/storage'));
const rewriteImg = (u) => (!u ? null : isSupabaseStorage(u) ? `/uploads/${lastPathSeg(u)}` : u);

for (const r of await load('gallery_computers')) {
  await c.query(
    `insert into gallery_computers (id,name,type,category,price,image_url,thumbnail_url,location_id,specs,is_active,sort_order,stock_quantity,archived_at,created_at,updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) on conflict (id) do nothing`,
    [r.id,r.name,r.type,r.category,r.price,rewriteImg(r.image_url),rewriteImg(r.thumbnail_url),r.location_id,JSON.stringify(r.specs ?? []),r.is_active,r.sort_order,r.stock_quantity ?? 1,r.archived_at,r.created_at,r.updated_at]);
}
for (const r of await load('gallery_sales')) {
  await c.query(
    `insert into gallery_sales (id,sale_type,name,discount_percent,applies_to,is_active,created_at)
     values ($1,$2,$3,$4,$5,$6,$7) on conflict (id) do nothing`,
    [r.id,r.sale_type,r.name,r.discount_percent,JSON.stringify(r.applies_to ?? []),r.is_active,r.created_at]);
}
for (const r of await load('slideshow_slides')) {
  const img = rewriteImg(r.image_url);
  await c.query(
    `insert into slideshow_slides (id,title,type,content,image_url,sort_order,is_active,archived_at,created_at,updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict (id) do nothing`,
    [r.id,r.title,r.type,r.content,img,r.sort_order,r.is_active,r.archived_at,r.created_at,r.updated_at]);
}
for (const r of await load('oauth_tokens')) {
  await c.query(
    `insert into oauth_tokens (provider,refresh_token,scope,account_email,updated_at)
     values ($1,$2,$3,$4,$5) on conflict (provider) do update set
       refresh_token=excluded.refresh_token, scope=excluded.scope, account_email=excluded.account_email, updated_at=excluded.updated_at`,
    [r.provider,r.refresh_token,r.scope,r.account_email,r.updated_at]);
}
for (const r of await load('reviews_cache')) {
  await c.query(
    `insert into reviews_cache (id,reviews_raw,stats,fetched_at) values ($1,$2,$3,$4)
     on conflict (id) do update set reviews_raw=excluded.reviews_raw, stats=excluded.stats, fetched_at=excluded.fetched_at`,
    [r.id,JSON.stringify(r.reviews_raw ?? []),JSON.stringify(r.stats ?? {}),r.fetched_at]);
}
await c.end();
console.log('import complete');
```

- [ ] **Step 2: Install pg, run the import against local dev Postgres**

```bash
npm install pg
DATABASE_URL="postgres://postgres:devpw@127.0.0.1:5544/csks" node db/import.mjs
```

- [ ] **Step 3: Verify row counts match the export**

```bash
for t in slideshow_slides gallery_computers gallery_sales oauth_tokens reviews_cache; do
  echo -n "$t: "; PGPASSWORD=devpw psql -h 127.0.0.1 -p 5544 -U postgres -d csks -tAc "select count(*) from $t";
done
```
Expected: each count equals the export count from Task 0.4 Step 2.

- [ ] **Step 4: Commit**

```bash
git add db/import.mjs package.json package-lock.json
git commit -m "feat(db): add importer (json to Postgres, image_url rewrite)"
```

---

## Phase 1 - Data-access rewrite to `pg` (signatures preserved)

**Principle:** every exported function in the four data libs keeps its exact name, parameters, and return type. Only the bodies change (Supabase query-builder to `db.query()`). Route and page call sites then compile unchanged. After this phase, `grep -rn "supabase" src` returns nothing.

### Task 1.1: Create the db module

**Files:** Create `src/lib/db.ts`

- [ ] **Step 1: Write it**

```typescript
// src/lib/db.ts: single Postgres connection pool for the app.
import { Pool, type QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var __csksPool: Pool | undefined;
}

function getPool(): Pool | null {
  if (!connectionString) return null;
  if (!global.__csksPool) {
    global.__csksPool = new Pool({ connectionString, max: 5 });
  }
  return global.__csksPool;
}

/** Run a parameterized query. Throws if DATABASE_URL is unset. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL not configured');
  const res = await pool.query<T>(text, params);
  return res.rows;
}

/** True if the database is configured (replaces isSupabase*Configured). */
export function isDbConfigured(): boolean {
  return !!connectionString;
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit src/lib/db.ts` (expected: no errors specific to this file; project-wide errors from still-present supabase imports are fine until Task 1.6).

### Task 1.2: Rewrite `src/lib/slideshow.ts`

**Conversion patterns** (apply to all 11 query sites in the file):

| Supabase call | `pg` replacement |
|---|---|
| `supabase.from('t').select('*').eq('is_active',true).is('archived_at',null).order('sort_order').order('created_at')` | `query("select * from t where is_active = true and archived_at is null order by sort_order, created_at")` |
| `.not('archived_at','is',null).order('archived_at',{ascending:false})` | `query("select * from t where archived_at is not null order by archived_at desc")` |
| `.insert(obj).select().single()` | `query("insert into t (cols) values ($1..) returning *", [vals])` then `rows[0]` |
| `.update(obj).eq('id',id).select().single()` | `query("update t set col=$1, updated_at=now() where id=$2 returning *", [...])` then `rows[0]` |
| `.delete().eq('id',id)` | `query("delete from t where id=$1",[id])` |
| `if (!supabase) return [];` guards | `if (!isDbConfigured()) return [];` |

- [ ] **Step 1: Read the current file and rewrite each function body** preserving signatures. Worked example for `getActiveSlides` (keep `mapSlide` unchanged):

```typescript
import { query, isDbConfigured } from './db';
import type { SlideshowSlide, SlideshowSlideDB, CreateSlideInput, UpdateSlideInput } from '@/types/slideshow';

export async function getActiveSlides(): Promise<SlideshowSlide[]> {
  if (!isDbConfigured()) return [];
  const rows = await query<SlideshowSlideDB>(
    `select * from slideshow_slides where is_active = true and archived_at is null
     order by sort_order, created_at`);
  return rows.map(mapSlide);
}
```

For `createSlide`, build the column and placeholder list from `CreateSlideInput` (title, type, content, image_url, sort_order) and `returning *`. For `reorderSlides`, run the updates inside a single `query` per slide (loop); wrap in `BEGIN`/`COMMIT` via the pool if the original was atomic.

- [ ] **Step 2: Verify**: `grep -n supabase src/lib/slideshow.ts` returns nothing.
- [ ] **Step 3: Commit** `git add src/lib/slideshow.ts src/lib/db.ts && git commit -m "refactor(slideshow): pg data layer"`.

### Task 1.3: Rewrite `src/lib/gallery.ts`

- [ ] **Step 1:** Apply the same conversion patterns. Watch the JSONB columns: `specs` and `applies_to` round-trip as JS arrays from `pg` automatically (jsonb to object), so no `JSON.parse` needed on read; on write pass `JSON.stringify(specs)` into a `$n::jsonb` placeholder. `price` is `numeric` and returns as a **string** from `pg`. The `GalleryComputer.price` type is already `string` so that matches; the DB-row `GalleryComputerDB.price` is `number`, so cast with `Number(row.price)` where the existing mapper expects a number.
- [ ] **Step 2:** `grep -n supabase src/lib/gallery.ts` returns nothing.
- [ ] **Step 3: Commit.**

### Task 1.4: Rewrite `src/lib/google-business/oauth.ts` and `cache.ts`

- [ ] **Step 1: `oauth.ts`**: replace `storeRefreshToken` and `getStoredRefreshToken`:

```typescript
import { query } from '@/lib/db';
import { OAUTH_PROVIDER } from './config';

export async function storeRefreshToken(refreshToken: string, scope: string, accountEmail: string | null): Promise<void> {
  await query(
    `insert into oauth_tokens (provider, refresh_token, scope, account_email, updated_at)
     values ($1,$2,$3,$4, now())
     on conflict (provider) do update set
       refresh_token = excluded.refresh_token, scope = excluded.scope,
       account_email = excluded.account_email, updated_at = now()`,
    [OAUTH_PROVIDER, refreshToken, scope, accountEmail]);
}

export async function getStoredRefreshToken(): Promise<StoredOAuthGrant | null> {
  const rows = await query<StoredOAuthGrant>(
    `select refresh_token, scope, account_email from oauth_tokens where provider = $1 limit 1`,
    [OAUTH_PROVIDER]);
  return rows[0] ?? null;
}
```

- [ ] **Step 2: `cache.ts`**: replace `readCacheRow` and `writeCacheRow`:

```typescript
import { query } from '@/lib/db';
async function readCacheRow(): Promise<ReviewsCacheRow | null> {
  const rows = await query<ReviewsCacheRow>(
    `select id, reviews_raw, stats, fetched_at from reviews_cache where id = 1 limit 1`);
  return rows[0] ?? null;
}
async function writeCacheRow(reviews: DisplayReview[], stats: ReviewsStats): Promise<string> {
  const fetchedAt = new Date().toISOString();
  await query(
    `insert into reviews_cache (id, reviews_raw, stats, fetched_at) values (1, $1::jsonb, $2::jsonb, $3)
     on conflict (id) do update set reviews_raw = excluded.reviews_raw, stats = excluded.stats, fetched_at = excluded.fetched_at`,
    [JSON.stringify(reviews), JSON.stringify(stats), fetchedAt]);
  return fetchedAt;
}
```
Note: `reviews_raw` and `stats` come back as parsed objects from `pg`, so the existing `row.reviews_raw.length` and `row.stats` usage works unchanged.

- [ ] **Step 3:** `grep -rn supabase src/lib/google-business` returns nothing. **Commit.**

### Task 1.5: Convert direct-call routes and delete the Supabase libs

- [ ] **Step 1: Enumerate remaining references**

```bash
grep -rln "supabase\|isSupabaseConfigured\|isSupabaseAdminConfigured\|@/lib/supabase" src/app src/middleware.ts
```

- [ ] **Step 2:** For each route still referencing supabase directly (`api/health`, `api/in-store`, `api/in-store/sale`, and any others the grep finds), replace:
  - `import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase'` with `import { query, isDbConfigured } from '@/lib/db'`
  - `isSupabaseConfigured()`/`isSupabaseAdminConfigured()` with `isDbConfigured()`
  - `supabaseAdmin.from('gallery_computers').select(...)` with `query(...)`. For `api/health`, the connectivity probe becomes:

```typescript
import { query, isDbConfigured } from '@/lib/db';
// ...
if (isDbConfigured()) {
  try { await query('select 1 from gallery_computers limit 1'); }
  catch (e) { /* keep existing degraded-but-200 behavior */ }
}
```
  - Remove `isAuthenticated()` import and calls from these routes (auth moves to the edge in Phase 4). Leave the handler logic otherwise intact.

- [ ] **Step 3: Delete the Supabase auth/client libs and now-dead auth routes**

```bash
git rm src/lib/supabase.ts src/lib/supabase-auth.ts \
       src/app/api/auth/check/route.ts src/app/api/auth/logout/route.ts \
       "src/app/(auth)/login/page.tsx" src/app/auth/callback/route.ts
```
(If the `(auth)` group or `login` is referenced by a link in the header or nav, remove that link too: grep `href="/login"`.)

- [ ] **Step 4: Remove Supabase deps**

```bash
npm uninstall @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 5: Verify no supabase references remain**

```bash
grep -rn "supabase" src && echo "STILL PRESENT, fix" || echo "clean"
```
Expected: `clean`.

### Task 1.6: Full type-check and build against local Postgres

- [ ] **Step 1: Point the app at local Postgres and build**

```bash
DATABASE_URL="postgres://postgres:devpw@127.0.0.1:5544/csks" NODE_ENV=production npm run check
```
Expected: lint, type-check, and `next build` all pass. (Recall memory `reference_next_build_node_env.md`: force `NODE_ENV=production` so the prerender step does not choke.)

- [ ] **Step 2: Commit** `git commit -am "refactor: remove Supabase, route data through pg"`.

---

## Phase 2 - Storage to local volume

### Task 2.1: Add the uploads-serving route

**Files:** Create `src/app/uploads/[...path]/route.ts`

- [ ] **Step 1: Write it** (streams from `UPLOADS_DIR`, default `/data/uploads`)

```typescript
// Serves uploaded slideshow images from the persistent volume.
import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/data/uploads';
const TYPES: Record<string, string> = { '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif' };

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const rel = normalize(params.path.join('/')).replace(/^(\.\.(\/|\\|$))+/, '');
  if (rel.includes('..')) return new NextResponse('Bad path', { status: 400 });
  const full = join(UPLOADS_DIR, rel);
  try {
    await stat(full);
    const buf = await readFile(full);
    return new NextResponse(buf, {
      headers: { 'Content-Type': TYPES[extname(full).toLowerCase()] || 'application/octet-stream',
                 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch { return new NextResponse('Not found', { status: 404 }); }
}
```

### Task 2.2: Rewrite the upload route to write to the volume

**Files:** Modify `src/app/api/slideshow/upload/route.ts`

- [ ] **Step 1:** Replace the Supabase Storage block. Keep the auth-removal (drop `isAuthenticated`), keep type and size validation. New write and URL:

```typescript
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/data/uploads';
// ...after validation, with `extension` and `file` in scope:
const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
await mkdir(UPLOADS_DIR, { recursive: true });
const buffer = Buffer.from(await file.arrayBuffer());
await writeFile(join(UPLOADS_DIR, fileName), buffer);
return NextResponse.json({ success: true, imageUrl: `/uploads/${fileName}` });
```
Remove the `isSupabaseAdminConfigured`/`supabaseAdmin` import and the 503 guard.

### Task 2.3: Update next.config image hosts

**Files:** Modify `next.config.mjs`

- [ ] **Step 1:** Remove the two `*.supabase.*` `remotePatterns` entries (images are now same-origin `/uploads/...`, which next/image serves without a remotePattern). Keep `images.unsplash.com` and `raw.githubusercontent.com` if still referenced (grep). Also remove `*.supabase.*` from the CSP `img-src` and `connect-src` in `src/middleware.ts`.

### Task 2.4: Verify locally with the exported images

- [ ] **Step 1: Point UPLOADS_DIR at the export dir, rebuild, smoke-test a slide image**

```bash
DATABASE_URL="postgres://postgres:devpw@127.0.0.1:5544/csks" UPLOADS_DIR="$PWD/db/export/uploads" NODE_ENV=production npm run build
DATABASE_URL="postgres://postgres:devpw@127.0.0.1:5544/csks" UPLOADS_DIR="$PWD/db/export/uploads" PORT=3001 node .next/standalone/server.js &
sleep 3
F=$(ls db/export/uploads | head -1)
curl -sI "http://localhost:3001/uploads/$F" | grep -i "content-type\|200\|404"
kill %1
```
Expected: `200` plus an `image/*` content-type.

- [ ] **Step 2: Commit** `git commit -am "feat(storage): serve uploads from local volume, drop Supabase Storage"`.

---

## Phase 3 - Email to n8n contact-relay

### Task 3.1: Repoint `src/lib/email.ts` at the relay

**Files:** Modify `src/lib/email.ts`. **Prereq:** read `reference_contact_form_relay.md` for the live webhook URL, payload shape, and the per-client label (`computer-store-ks`).

- [ ] **Step 1:** Replace the `sendEmail` Resend helper with a relay POST. Keep `sendContactNotification` and `sendContactConfirmation` signatures and their HTML bodies (they are already on-brand). Route both through the relay, which sends from `no-reply@resilientwebsolutions.com` with a `Computer Store Kansas` display name and `reply-to` set per message:

```typescript
const RELAY_URL = process.env.CONTACT_RELAY_WEBHOOK_URL!;
async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (!RELAY_URL) { console.warn('CONTACT_RELAY_WEBHOOK_URL not set'); return { success:false, error:'relay not configured' }; }
  try {
    const r = await fetch(RELAY_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: 'computer-store-ks',
        fromName: 'Computer Store Kansas',
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject, html: options.html, text: options.text,
        replyTo: options.replyTo,
      }),
    });
    if (!r.ok) return { success:false, error: await r.text() };
    return { success:true };
  } catch (e) { return { success:false, error:String(e) }; }
}
```

- [ ] **Step 2: Extend the n8n relay workflow** (via the `n8n` MCP) so it accepts this payload: send the email through Gmail (from `no-reply@`, display name from `fromName`, `reply-to` from `replyTo`) and archive a labeled copy under a `computer-store-ks` Gmail label. The notification (`to: contact@computerstoreks.com`) and the customer confirmation (`to: <submitter>`) are two separate POSTs from the app, so the workflow just sends whatever single message it receives. Verify the workflow is published.

- [ ] **Step 3: Remove `RESEND_API_KEY`** from `.env.example` and the env reconciliation list (Phase 5). `grep -rn "resend\|RESEND" src` returns nothing.

- [ ] **Step 4: Test the relay end-to-end** with a curl that mimics the app payload; confirm a test message lands in `contact@computerstoreks.com` and a labeled copy is archived. **Commit.**

---

## Phase 4 - Auth removal plus Cloudflare Access (app code)

The edge Access applications are created during cutover (Phase 8); this phase makes the app trust the edge.

### Task 4.1: Gut middleware auth, keep headers, add Access-JWT defense-in-depth

**Files:** Modify `src/middleware.ts`; create `src/lib/access-jwt.ts`.

- [ ] **Step 1: Write the Access-JWT verifier**

```typescript
// src/lib/access-jwt.ts: verify Cloudflare Access JWT on protected requests (defense-in-depth).
import { jwtVerify, createRemoteJWKSet } from 'jose';

const TEAM_DOMAIN = process.env.CF_ACCESS_TEAM_DOMAIN; // e.g. resilientwebsolutions.cloudflareaccess.com
const AUD = process.env.CF_ACCESS_AUD;                 // the Access application AUD tag
const JWKS = TEAM_DOMAIN ? createRemoteJWKSet(new URL(`https://${TEAM_DOMAIN}/cdn-cgi/access/certs`)) : null;

/** Returns the verified email, or null if the Access JWT is missing or invalid. */
export async function verifyAccessJwt(token: string | null): Promise<string | null> {
  if (!token || !JWKS || !AUD || !TEAM_DOMAIN) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://${TEAM_DOMAIN}`, audience: AUD });
    return (payload.email as string) ?? null;
  } catch { return null; }
}
```

- [ ] **Step 2: Rewrite the middleware auth block.** Keep `addSecurityHeaders`, `isPublicRoute`, and the `PUBLIC_*` sets (these define which paths Access bypasses). Replace the Supabase session logic: for non-public paths, require a valid Access JWT whose email is `AUTHORIZED_EMAIL` or an RWS admin. If `CF_ACCESS_*` env is unset (local dev), fall open so local builds still work.

```typescript
import { verifyAccessJwt } from '@/lib/access-jwt';
import { AUTHORIZED_EMAIL } from '@/lib/constants';
const ADMIN_EMAILS = new Set([AUTHORIZED_EMAIL, 'owner@resilientwebsolutions.com']);
// ... inside middleware, after security headers and public bypass:
if (!process.env.CF_ACCESS_TEAM_DOMAIN) return response;        // local/dev: edge not present
const email = await verifyAccessJwt(request.headers.get('Cf-Access-Jwt-Assertion'));
if (!email || !ADMIN_EMAILS.has(email)) {
  if (pathname.startsWith('/api/')) return new NextResponse(JSON.stringify({ error:'Unauthorized' }), { status:401, headers:{'Content-Type':'application/json'} });
  return NextResponse.redirect(new URL('/', SITE_URL || request.url));   // no /login anymore: Access handles login
}
return response;
```
Remove `/login` from `PUBLIC_ROUTES` and delete the `if (pathname === '/login')` branch. Remove `'/auth/callback'` from `PUBLIC_PREFIXES` (route deleted). Strip `*.supabase.*` from the CSP.

- [ ] **Step 3: Add `jose`** `npm install jose`.

- [ ] **Step 4: Verify build** `DATABASE_URL=... NODE_ENV=production npm run check` (Access env unset, middleware falls open, build/lint/type-check pass). **Commit** `git commit -am "feat(auth): replace Supabase auth with Cloudflare Access (edge) plus JWT defense-in-depth"`.

---

## Phase 5 - Dockerfile, env reconciliation, full local container

### Task 5.1: Write the Dockerfile

**Files:** Create `Dockerfile`, `.dockerignore`

- [ ] **Step 1: Dockerfile** (multi-stage, Next standalone, Node 22 to match `render.yaml`)

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV UPLOADS_DIR=/data/uploads
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs \
 && mkdir -p /data/uploads && chown -R nextjs:nodejs /data
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: .dockerignore**

```
node_modules
.next
.git
db/export
.env
.env.local
```

- [ ] **Step 3: Build the image and run it against local Postgres**

```bash
docker build -t csks-app:test .
docker run --rm -p 3002:3000 \
  -e DATABASE_URL="postgres://postgres:devpw@host.docker.internal:5544/csks" \
  -e UPLOADS_DIR=/data/uploads -v "$PWD/db/export/uploads:/data/uploads" \
  --add-host=host.docker.internal:host-gateway csks-app:test &
sleep 5
curl -sf http://localhost:3002/api/health && echo OK
curl -sI http://localhost:3002/ | head -1
docker stop $(docker ps -q --filter ancestor=csks-app:test)
```
Expected: health 200, homepage 200.

- [ ] **Step 4: Commit** `git add Dockerfile .dockerignore && git commit -m "feat: add standalone Dockerfile for Dokploy"`.

### Task 5.2: Reconcile the env var set

- [ ] **Step 1:** Produce the final Dokploy env list. **Keep:** `DATABASE_URL` (new, points at the Dokploy Postgres service), `UPLOADS_DIR=/data/uploads`, `NEXT_PUBLIC_SITE_URL=https://computerstoreks.com`, `NOTIFICATION_EMAIL=contact@computerstoreks.com`, `CONTACT_RELAY_WEBHOOK_URL` (new), `GITHUB_OWNER/REPO/BRANCH/TOKEN` (GitHub-CMS, unchanged), `GOOGLE_BUSINESS_*` (4 vars), `REPAIRSHOPR_SUBDOMAIN`/`REPAIRSHOPR_API_KEY` (only if still referenced, grep; else drop), `NEXT_PUBLIC_TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY`, `CF_ACCESS_TEAM_DOMAIN`/`CF_ACCESS_AUD` (new, filled in Phase 8), `NODE_ENV=production`, `PORT=3000`, `HOSTNAME=0.0.0.0`. **Drop (dead or removed):** all `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `AUTH_MODE`, `ADMIN_PASSWORD`, `SESSION_SECRET`.
- [ ] **Step 2:** Update `.env.example` to this set. **Commit.**

---

## Phase 6 - Dokploy infra plus preview deploy (no public DNS yet)

### Task 6.1: Provision the Postgres service in Dokploy

- [ ] **Step 1:** Create a Dokploy Postgres service (via the Dokploy API or panel) named `csks-postgres`, database `csks`. Capture its in-network DSN. Apply `db/schema.sql` and run `db/import.mjs` against it (`DATABASE_URL=<dokploy dsn> node db/import.mjs`). Verify row counts match Task 0.4.

### Task 6.2: Create the Dokploy app

- [ ] **Step 1:** Follow `reference_dokploy_staging_named_tunnel.md` Part A. `project.create`, grab `environmentId`. `application.create` (appName `csks-prod`). Source: build from the public repo. **Decision recorded:** build from public git `MatthewMcManness/Computer_Store_KS` branch `migrate-dokploy-selfhost` for the preview, switching to `Production` after the branch is merged at cutover. Set `buildType=dockerfile` by direct SQL `UPDATE application SET "buildType"='dockerfile', dockerfile='Dockerfile' WHERE "applicationId"=...` (the API rejects it). Set env from Task 5.2. Mount a persistent volume at `/data/uploads`, then copy `db/export/uploads/*` into it.
- [ ] **Step 2:** Deploy (`application.deploy`); poll `applicationStatus` to `done`. Verify locally: `curl -H "Host: <preview-host>" http://localhost:80/api/health`.

### Task 6.3: Named preview tunnel plus Access (preview)

- [ ] **Step 1:** Create named tunnel `csks-prod` (systemd --user, linger) per Part B, pointing `service: http://localhost:80`. Add a preview hostname (e.g. `csks-preview.resilientwebsolutions.com`) as a Dokploy domain, tunnel ingress, and DNS CNAME to `<tunnelId>.cfargotunnel.com`.
- [ ] **Step 2:** Put a Cloudflare Access app over the preview host (Allow: `owner@resilientwebsolutions.com`, `contact@computerstoreks.com`) per `reference_cloudflare_access_tunnel_api.md`. Fill `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` (preview app AUD) into the Dokploy env and redeploy.
- [ ] **Step 3: Full click-through on the preview host** (Matthew checkpoint): public pages, gallery and slideshow render with migrated images, contact form delivers via relay, `/admin` prompts Access login then loads, inventory and slideshow CRUD work, slideshow image upload works and the new image serves from `/uploads/...`, Google reviews render (and `/admin` refresh re-pulls). This is the go/no-go gate before touching the public domain.

---

## Phase 7 - Cloudflare zones for both domains (Matthew NS swap)

Two domains move to Cloudflare: `computerstoreks.com` (the live site) and `thecomputerstore.com` (redirects to the main site). Both are registered at Squarespace under the store account; only the nameservers change, the store keeps ownership.

**Highest-risk step: email and DNS records.** Replicate every existing record on BOTH domains before either swap. **DNSSEC must be OFF at Squarespace on a domain before its nameserver swap**, or that domain fails to resolve (hard outage). Cloudflare's setup screen flags it; if flagged, Matthew disables DNSSEC in Squarespace for that domain first.

### Task 7.1: Enumerate current DNS exhaustively (both domains)

- [ ] **Step 1:** For EACH domain, dump every record type from its authoritative nameservers:

```bash
for DOMAIN in computerstoreks.com thecomputerstore.com; do
  echo "############ $DOMAIN ############"
  NS=$(dig +short NS $DOMAIN | head -1)
  for t in A AAAA CNAME MX TXT SRV NS CAA; do echo "== $t =="; dig +nocmd +noall +answer $t $DOMAIN @"$NS"; done
  dig +nocmd +noall +answer TXT _dmarc.$DOMAIN @"$NS"
  dig +nocmd +noall +answer CNAME www.$DOMAIN @"$NS"
  for s in google default selector1 selector2 resend; do echo "$s._domainkey:"; dig +short TXT ${s}._domainkey.$DOMAIN @"$NS"; done
done
```
Record everything per domain, especially MX, SPF (`v=spf1`), DKIM (`*._domainkey`), DMARC (`_dmarc`), and any verification TXT. `thecomputerstore.com` may carry its own mail or verification records: capture them too.

### Task 7.2: Create both zones and pre-load records

- [ ] **Step 1:** Add BOTH `computerstoreks.com` and `thecomputerstore.com` to the RWS Cloudflare account (`POST /zones` each). Capture each zone's two assigned nameservers.
- [ ] **Step 2:** In each zone, recreate every record from Task 7.1 (MX, all TXT/SPF/DKIM/DMARC, CAA, subdomains), **proxy OFF (grey cloud) for MX and mail-related hosts**. For `computerstoreks.com`, do NOT yet create apex/www hosting records that point away from Render: copy them as-is so the live site keeps serving until cutover. (Resend DKIM can be dropped since Resend is being removed, but only after confirming no other mail flow depends on it; when in doubt copy and prune post-cutover.)
- [ ] **Step 3:** Verify each new zone serves its email records before the swap: `dig MX <domain> @<new-cf-nameserver>` matches today.

### Task 7.3: Redirect thecomputerstore.com to the main site

- [ ] **Step 1:** In the `thecomputerstore.com` zone, create a proxied DNS record for apex and `www` (placeholder `A @ 192.0.2.1` proxied, and `CNAME www` to `@` proxied) so a Redirect Rule has a hostname to attach to. No origin is needed.
- [ ] **Step 2:** Add a Cloudflare Redirect Rule (Rules, then Redirect Rules) on the zone: when hostname is `thecomputerstore.com` or `www.thecomputerstore.com`, 301 to `https://computerstoreks.com` plus the original path and query (preserve `http.request.uri.path` and the query string). Verify after the swap: `curl -sI https://thecomputerstore.com/some/path` returns a 301 to the matching path on `computerstoreks.com`.

### Task 7.4: Matthew swaps nameservers (both domains)

- [ ] **Step 1:** For each domain, check DNSSEC in Squarespace; if enabled, Matthew disables it first. Hand Matthew the two Cloudflare nameservers per domain. He updates them at Squarespace (store account, `contact@computerstoreks.com`). **Checkpoint:** wait until `dig NS <domain>` returns the Cloudflare nameservers and Cloudflare marks each zone Active. Email keeps flowing because records were pre-loaded; `computerstoreks.com` still serves from Render (apex/www unchanged) until Phase 8.

---

## Phase 8 - Cutover plus failover

### Task 8.1: Merge the branch and switch the Dokploy app to Production

- [ ] **Step 1:** Open a PR `migrate-dokploy-selfhost` to `Production`; on Matthew's approval, merge. Repoint the Dokploy app source branch to `Production`, redeploy, re-verify health on the preview host.

### Task 8.2: Production Access apps on the real domain

- [ ] **Step 1:** Create the production Access applications on `computerstoreks.com`:
  - **Bypass app (public):** exact paths `/api/contact`, `/api/health`, `/api/google-business/reviews`, `/api/google-business/oauth/callback`, policy **Bypass: Everyone** (most-specific path wins over the protect app).
  - **Protect app:** paths `/admin` and `/api`, policy **Allow:** `contact@computerstoreks.com`, `owner@resilientwebsolutions.com`.
- [ ] **Step 2:** Set the production `CF_ACCESS_AUD` (protect app AUD) and `CF_ACCESS_TEAM_DOMAIN` in the Dokploy env; redeploy. Verify with the header-injection check from `reference_cloudflare_access_tunnel_api.md` that `/admin` is gated and `/api/contact` is open.

### Task 8.3: Static holding page plus failover Worker

- [ ] **Step 1:** Build `holding-page/` (CSKS brand: "temporarily offline", phone (785) 267-3223, 2008 SW Gage Blvd, hours, Maps link, `_headers` noindex). Push to a small git-connected repo; create a Cloudflare Pages project to `csks-holding.pages.dev`. (Per `feedback_backups_always_git_connected.md`, git-connected so it never goes stale.)
- [ ] **Step 2:** Copy `failover-worker/` from the RWS pattern in the playbook, retargeted: primary `https://primary.computerstoreks.com` (a Worker-free Dokploy domain plus tunnel ingress plus DNS CNAME), backup `https://csks-holding.pages.dev`, routes `computerstoreks.com/*` plus `www`, new KV namespace, `x-csks-served-by` header. Deploy with `npx wrangler@latest deploy`.

### Task 8.4: Flip DNS to Dokploy

- [ ] **Step 1:** In the Cloudflare zone, point apex `computerstoreks.com` and `www` at the tunnel: proxied CNAME to `<csks-prod tunnelId>.cfargotunnel.com`. Add `primary.computerstoreks.com` to the same tunnel (Worker origin path). The Worker routes intercept apex/www.
- [ ] **Step 2: Verify cutover**

```bash
dig +short computerstoreks.com            # cloudflare proxied
curl -sI https://computerstoreks.com/ | grep -i "x-csks-served-by\|server"   # expect served-by: primary, no x-render-origin
curl -sf https://computerstoreks.com/api/health && echo OK
```
- [ ] **Step 3: Test failover and recovery**

```bash
systemctl --user stop csks-prod-tunnel
curl -sI https://computerstoreks.com/ | grep -i x-csks-served-by   # expect: backup (holding page)
systemctl --user start csks-prod-tunnel
sleep 8
curl -sI https://computerstoreks.com/ | grep -i x-csks-served-by   # expect: primary
```

### Task 8.5: Google OAuth note

- [ ] **Step 1:** The Google Business OAuth redirect URI is `https://computerstoreks.com/api/google-business/oauth/callback`, unchanged by the host move, and it is in the Access **bypass** list so Google's redirect reaches it. Confirm a `/admin` "refresh reviews" works post-cutover (the refresh token migrated in Phase 0). If Google rejects, re-run the connect flow from `/admin` once.

---

## Phase 9 - Decommission plus record-keeping

- [ ] **Step 1: Uptime Kuma** monitor on `https://computerstoreks.com/api/health` (interval under 5 min) with alerting.
- [ ] **Step 2: Leave Render running 3 to 5 days** as a manual safety net. After stability is confirmed, Matthew deletes the Render service from the `contact@computerstoreks.com` account.
- [ ] **Step 3: After the same window, decommission Supabase** (pause or delete the project) and remove the Resend domain and key. Confirm nothing else (other clients) shares them first.
- [ ] **Step 4: Tear down dev scaffolding** `docker rm -f csks-pg-dev`.
- [ ] **Step 5: `/update-client`**: record the hosting move (Render to Dokploy) and that the site is now fully self-hosted; note Supabase and Resend removed.
- [ ] **Step 6: Update memory**: a `project_csks_dokploy_migration.md` entry (cutover date, tunnel id, Access app AUDs, Postgres service name, holding-page and Worker names) linking `[[reference_site_failover_playbook]]`, `[[reference_dokploy_staging_named_tunnel]]`, `[[reference_cloudflare_access_tunnel_api]]`, `[[reference_contact_form_relay]]`, plus the MEMORY.md pointer line.

---

## Self-Review

**Spec coverage:** migrate to Dokploy (Phases 5 to 8) done; remove Supabase Postgres (Phase 1) done, Auth (Phase 4 plus 8.2) done, Storage (Phase 2) done; remove Resend (Phase 3) done; failover (Phase 8.3 to 8.4) done; email-safe DNS move (Phase 7) done; data migration including images and refresh token (Phase 0) done.

**Open risks flagged in-plan:** (1) `.env` vs Render env parity, pre-flight gate. (2) Email DNS records, Task 7.1/7.2. (3) Cloudflare Access path-precedence for the mixed public/admin `/api` surface, Task 8.2 bypass-vs-protect apps. (4) `numeric` price returns as string from `pg`, Task 1.3. (5) jsonb auto-parse on read, Tasks 1.3/1.4.

**Type consistency:** `query()` and `isDbConfigured()` used identically across Tasks 1.1 to 1.5; `mapSlide`/`mapComputer` mappers preserved so the `*DB` row types still feed the frontend types unchanged.
