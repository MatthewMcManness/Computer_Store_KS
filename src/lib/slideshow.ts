/**
 * SLIDESHOW DATA LAYER - All database operations for the in-store slideshow.
 * Handles listing, creating, reordering, archiving, restoring, and deleting slides.
 *
 * WHEN TO EDIT: When changing how slides are stored, queried, or ordered.
 */
import { query, isDbConfigured } from './db';
import type {
  SlideshowSlide,
  SlideshowSlideDB,
  CreateSlideInput,
  UpdateSlideInput,
} from '@/types/slideshow';

/** Map a raw DB row to the frontend SlideshowSlide shape. */
function mapSlide(row: SlideshowSlideDB): SlideshowSlide {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    content: row.content,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Get all active (non-archived) slides ordered for public display. */
export async function getActiveSlides(): Promise<SlideshowSlide[]> {
  if (!isDbConfigured()) return [];

  try {
    const rows = await query<SlideshowSlideDB>(
      `select * from slideshow_slides
       where is_active = true and archived_at is null
       order by sort_order, created_at`,
    );
    return rows.map(mapSlide);
  } catch (error) {
    console.error('Error fetching slideshow slides:', error);
    return [];
  }
}

/** Get all non-archived slides regardless of active flag (admin). */
export async function getAllSlides(): Promise<SlideshowSlide[]> {
  if (!isDbConfigured()) return [];

  try {
    const rows = await query<SlideshowSlideDB>(
      `select * from slideshow_slides
       where archived_at is null
       order by sort_order, created_at`,
    );
    return rows.map(mapSlide);
  } catch (error) {
    console.error('Error fetching all slides:', error);
    return [];
  }
}

/** Get all archived (soft-deleted) slides (admin). */
export async function getArchivedSlides(): Promise<SlideshowSlide[]> {
  if (!isDbConfigured()) return [];

  try {
    const rows = await query<SlideshowSlideDB>(
      `select * from slideshow_slides
       where archived_at is not null
       order by archived_at desc`,
    );
    return rows.map(mapSlide);
  } catch (error) {
    console.error('Error fetching archived slides:', error);
    return [];
  }
}

/** Get a single slide by ID (admin). */
export async function getSlideById(id: string): Promise<SlideshowSlide | null> {
  if (!isDbConfigured()) return null;

  try {
    const rows = await query<SlideshowSlideDB>(
      `select * from slideshow_slides where id = $1 limit 1`,
      [id],
    );
    return rows[0] ? mapSlide(rows[0]) : null;
  } catch (error) {
    console.error('Error fetching slide by ID:', error);
    return null;
  }
}

/** Create a new slide. Appends to the end of the slideshow order. */
export async function createSlide(input: CreateSlideInput): Promise<SlideshowSlide | null> {
  if (!isDbConfigured()) return null;

  try {
    // Find the current highest sort_order so the new slide goes at the end
    const existing = await query<{ sort_order: number }>(
      `select sort_order from slideshow_slides
       where archived_at is null
       order by sort_order desc limit 1`,
    );

    const nextOrder = existing.length > 0 ? (existing[0]?.sort_order ?? 0) + 1 : 0;

    const rows = await query<SlideshowSlideDB>(
      `insert into slideshow_slides (title, type, content, image_url, sort_order, is_active)
       values ($1, $2, $3, $4, $5, true)
       returning *`,
      [
        input.title,
        input.type,
        input.content || null,
        input.image_url || null,
        input.sort_order ?? nextOrder,
      ],
    );

    return rows[0] ? mapSlide(rows[0]) : null;
  } catch (error) {
    console.error('Error creating slide:', error);
    return null;
  }
}

/** Update a slide's title, content, or image URL. */
export async function updateSlide(id: string, input: UpdateSlideInput): Promise<SlideshowSlide | null> {
  if (!isDbConfigured()) return null;

  try {
    const sets: string[] = [];
    const params: unknown[] = [];
    const add = (col: string, value: unknown) => {
      params.push(value);
      sets.push(`${col} = $${params.length}`);
    };

    if (input.title !== undefined) add('title', input.title);
    if (input.content !== undefined) add('content', input.content);
    if (input.image_url !== undefined) add('image_url', input.image_url);
    if (input.sort_order !== undefined) add('sort_order', input.sort_order);
    if (input.is_active !== undefined) add('is_active', input.is_active);
    sets.push('updated_at = now()');

    params.push(id);
    const rows = await query<SlideshowSlideDB>(
      `update slideshow_slides set ${sets.join(', ')} where id = $${params.length} returning *`,
      params,
    );

    return rows[0] ? mapSlide(rows[0]) : null;
  } catch (error) {
    console.error('Error updating slide:', error);
    return null;
  }
}

/** Soft-delete a slide by setting archived_at timestamp. */
export async function archiveSlide(id: string): Promise<boolean> {
  if (!isDbConfigured()) return false;

  try {
    await query(
      `update slideshow_slides
       set is_active = false, archived_at = now(), updated_at = now()
       where id = $1`,
      [id],
    );
    return true;
  } catch (error) {
    console.error('Error archiving slide:', error);
    return false;
  }
}

/** Restore an archived slide back to the active slideshow. */
export async function restoreSlide(id: string): Promise<SlideshowSlide | null> {
  if (!isDbConfigured()) return null;

  try {
    const rows = await query<SlideshowSlideDB>(
      `update slideshow_slides
       set is_active = true, archived_at = null, updated_at = now()
       where id = $1
       returning *`,
      [id],
    );
    return rows[0] ? mapSlide(rows[0]) : null;
  } catch (error) {
    console.error('Error restoring slide:', error);
    return null;
  }
}

/** Permanently delete a slide from the database. Cannot be undone. */
export async function hardDeleteSlide(id: string): Promise<boolean> {
  if (!isDbConfigured()) return false;

  try {
    await query(`delete from slideshow_slides where id = $1`, [id]);
    return true;
  } catch (error) {
    console.error('Error permanently deleting slide:', error);
    return false;
  }
}

/**
 * Reorder slides by updating sort_order for each slide.
 * Accepts an array of slide IDs in the desired display order.
 */
export async function reorderSlides(orderedIds: string[]): Promise<boolean> {
  if (!isDbConfigured()) return false;

  try {
    for (let index = 0; index < orderedIds.length; index++) {
      await query(
        `update slideshow_slides set sort_order = $1, updated_at = now() where id = $2`,
        [index, orderedIds[index]],
      );
    }
    return true;
  } catch (error) {
    console.error('Error reordering slides', error);
    return false;
  }
}
