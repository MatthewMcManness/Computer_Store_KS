/**
 * SLIDESHOW DATA LAYER - All database operations for the in-store slideshow.
 * Handles listing, creating, reordering, archiving, restoring, and deleting slides.
 *
 * WHEN TO EDIT: When changing how slides are stored, queried, or ordered.
 */
import { supabase, supabaseAdmin } from './supabase';
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
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('slideshow_slides')
    .select('*')
    .eq('is_active', true)
    .is('archived_at', null)
    .order('sort_order')
    .order('created_at');

  if (error) {
    console.error('Error fetching slideshow slides:', error);
    return [];
  }

  return (data || []).map(mapSlide);
}

/** Get all non-archived slides regardless of active flag (admin). */
export async function getAllSlides(): Promise<SlideshowSlide[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('slideshow_slides')
    .select('*')
    .is('archived_at', null)
    .order('sort_order')
    .order('created_at');

  if (error) {
    console.error('Error fetching all slides:', error);
    return [];
  }

  return (data || []).map(mapSlide);
}

/** Get all archived (soft-deleted) slides (admin). */
export async function getArchivedSlides(): Promise<SlideshowSlide[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('slideshow_slides')
    .select('*')
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });

  if (error) {
    console.error('Error fetching archived slides:', error);
    return [];
  }

  return (data || []).map(mapSlide);
}

/** Get a single slide by ID (admin). */
export async function getSlideById(id: string): Promise<SlideshowSlide | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('slideshow_slides')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching slide by ID:', error);
    return null;
  }

  return mapSlide(data);
}

/** Create a new slide. Appends to the end of the slideshow order. */
export async function createSlide(input: CreateSlideInput): Promise<SlideshowSlide | null> {
  if (!supabaseAdmin) return null;

  // Find the current highest sort_order so the new slide goes at the end
  const { data: existing } = await supabaseAdmin
    .from('slideshow_slides')
    .select('sort_order')
    .is('archived_at', null)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? (existing[0]?.sort_order ?? 0) + 1 : 0;

  const { data, error } = await supabaseAdmin
    .from('slideshow_slides')
    .insert({
      title: input.title,
      type: input.type,
      content: input.content || null,
      image_url: input.image_url || null,
      sort_order: input.sort_order ?? nextOrder,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating slide:', error);
    return null;
  }

  return mapSlide(data);
}

/** Update a slide's title, content, or image URL. */
export async function updateSlide(id: string, input: UpdateSlideInput): Promise<SlideshowSlide | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('slideshow_slides')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating slide:', error);
    return null;
  }

  return mapSlide(data);
}

/** Soft-delete a slide by setting archived_at timestamp. */
export async function archiveSlide(id: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('slideshow_slides')
    .update({
      is_active: false,
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error archiving slide:', error);
    return false;
  }

  return true;
}

/** Restore an archived slide back to the active slideshow. */
export async function restoreSlide(id: string): Promise<SlideshowSlide | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('slideshow_slides')
    .update({
      is_active: true,
      archived_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error restoring slide:', error);
    return null;
  }

  return mapSlide(data);
}

/** Permanently delete a slide from the database. Cannot be undone. */
export async function hardDeleteSlide(id: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('slideshow_slides')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error permanently deleting slide:', error);
    return false;
  }

  return true;
}

/**
 * Reorder slides by updating sort_order for each slide.
 * Accepts an array of slide IDs in the desired display order.
 */
export async function reorderSlides(orderedIds: string[]): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const updates = orderedIds.map((id, index) =>
    supabaseAdmin!
      .from('slideshow_slides')
      .update({ sort_order: index, updated_at: new Date().toISOString() })
      .eq('id', id)
  );

  const results = await Promise.all(updates);
  const hasError = results.some(({ error }) => error !== null);

  if (hasError) {
    console.error('Error reordering slides');
    return false;
  }

  return true;
}
