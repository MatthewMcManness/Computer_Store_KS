// db/import.mjs: load db/export/*.json into Postgres at DATABASE_URL.
// Rewrites Supabase Storage image URLs to /uploads/<filename>; leaves repo-relative
// and other non-Supabase paths unchanged.
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
  await c.query(
    `insert into slideshow_slides (id,title,type,content,image_url,sort_order,is_active,archived_at,created_at,updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict (id) do nothing`,
    [r.id,r.title,r.type,r.content,rewriteImg(r.image_url),r.sort_order,r.is_active,r.archived_at,r.created_at,r.updated_at]);
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
