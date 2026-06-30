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
const BUCKET = 'slideshow-images';

await mkdir('db/export/uploads', { recursive: true });

for (const t of TABLES) {
  const r = await fetch(`${URL}/rest/v1/${t}?select=*`, { headers: H });
  if (!r.ok) throw new Error(`${t}: ${r.status} ${await r.text()}`);
  const rows = await r.json();
  await writeFile(`db/export/${t}.json`, JSON.stringify(rows, null, 2));
  console.log(`exported ${t}: ${rows.length} rows`);
}

// List then download every storage object so images survive the move.
const list = await fetch(`${URL}/storage/v1/object/list/${BUCKET}`, {
  method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
  body: JSON.stringify({ prefix: '', limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
});
if (!list.ok) throw new Error(`storage list: ${list.status} ${await list.text()}`);
const objects = await list.json();
for (const o of objects) {
  if (!o.name) continue;
  const dl = await fetch(`${URL}/storage/v1/object/public/${BUCKET}/${o.name}`, { headers: H });
  if (!dl.ok) { console.warn(`skip ${o.name}: ${dl.status}`); continue; }
  await pipeline(Readable.fromWeb(dl.body), createWriteStream(`db/export/uploads/${o.name}`));
  console.log(`downloaded ${o.name}`);
}
console.log('export complete');
