/**
 * UPLOADS ROUTE - Streams image files from the persistent local volume.
 * Replaces Supabase Storage. Reads from UPLOADS_DIR env (default /data/uploads).
 *
 * SECURITY: Rejects any path containing '..' to prevent traversal outside UPLOADS_DIR.
 * Cached immutably for one year; filenames include a timestamp+UUID so content-addressed.
 *
 * WHEN TO EDIT: If the UPLOADS_DIR default changes, or new image extensions are added.
 *
 * @version 1.0.0 - 2026-06-30T00:00:00Z - Initial implementation (Phase 2, Task 2.1)
 */
import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/data/uploads';
const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const rel = normalize(params.path.join('/')).replace(/^(\.\.(\/|\\|$))+/, '');
  if (rel.includes('..')) return new NextResponse('Bad path', { status: 400 });
  const full = join(UPLOADS_DIR, rel);
  try {
    await stat(full);
    const buf = await readFile(full);
    return new NextResponse(buf, {
      headers: {
        'Content-Type': TYPES[extname(full).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
