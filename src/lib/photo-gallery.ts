/**
 * Photo Gallery Data Access Module
 *
 * Encapsulates all Supabase queries for the photo_gallery table.
 * Handles the field name mapping between API-facing names (title, description,
 * imageUrl, etc.) and database column names (caption, alt_text, image_url, etc.)
 * so that API routes remain thin request/response handlers.
 *
 * @version 1.0.0 - 2026-03-20T17:52:44Z - Initial implementation: extracted from route files
 */

import { supabaseAdmin } from './supabase';
import type {
  PhotoGalleryItem,
  CreatePhotoInput,
  UpdatePhotoInput,
} from '@/types/photo-gallery';

// =============================================================================
// Result Types
// =============================================================================

/**
 * Represents a successful data access result.
 */
interface SuccessResult<T> {
  data: T;
  error: null;
}

/**
 * Represents a failed data access result.
 *
 * @param code - 'not_configured' if supabaseAdmin is null,
 *               'not_found' if the record does not exist,
 *               'query_error' for any Supabase query failure
 */
interface ErrorResult {
  data: null;
  error: {
    code: 'not_configured' | 'not_found' | 'query_error';
    message: string;
  };
}

export type DataResult<T> = SuccessResult<T> | ErrorResult;

// =============================================================================
// Query Functions
// =============================================================================

/**
 * Fetch photo gallery items with optional filters.
 *
 * Results are ordered by sort_order ascending, then created_at descending.
 *
 * @param options - Optional filter configuration
 * @param options.activeOnly - When true, only return photos where is_active = true (default: true)
 * @param options.category - Filter by category value; 'all' or undefined means no category filter
 *
 * @returns DataResult containing an array of PhotoGalleryItem on success
 *
 * @functions_called supabaseAdmin.from
 * @called_by GET /api/photo-gallery
 *
 * @version 1.0.0 - 2026-03-20T17:52:44Z - Initial implementation
 */
export async function getPhotos(
  options?: { activeOnly?: boolean; category?: string }
): Promise<DataResult<PhotoGalleryItem[]>> {
  if (!supabaseAdmin) {
    return { data: null, error: { code: 'not_configured', message: 'Database not configured' } };
  }

  const { activeOnly = true, category } = options ?? {};

  let query = supabaseAdmin
    .from('photo_gallery')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching photos:', error);
    return { data: null, error: { code: 'query_error', message: 'Failed to fetch photos' } };
  }

  return { data: data as PhotoGalleryItem[], error: null };
}

/**
 * Fetch a single photo by its ID.
 *
 * @param id - UUID of the photo to retrieve
 *
 * @returns DataResult containing a single PhotoGalleryItem, or a not_found error
 *
 * @functions_called supabaseAdmin.from
 * @called_by GET /api/photo-gallery/[id]
 *
 * @version 1.0.0 - 2026-03-20T17:52:44Z - Initial implementation
 */
export async function getPhotoById(
  id: string
): Promise<DataResult<PhotoGalleryItem>> {
  if (!supabaseAdmin) {
    return { data: null, error: { code: 'not_configured', message: 'Database not configured' } };
  }

  const { data, error } = await supabaseAdmin
    .from('photo_gallery')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { data: null, error: { code: 'not_found', message: 'Photo not found' } };
  }

  return { data: data as PhotoGalleryItem, error: null };
}

/**
 * Create a new photo gallery item.
 *
 * Maps API field names to database column names:
 * - title -> caption
 * - description -> alt_text
 * - imageUrl -> image_url
 * - thumbnailUrl -> thumbnail_url
 * - category -> category (defaults to 'general')
 * - sortOrder -> sort_order (defaults to 0)
 *
 * The new photo is created with is_active = true.
 *
 * @param input - CreatePhotoInput with API-facing field names
 *
 * @returns DataResult containing the created PhotoGalleryItem
 *
 * @sideEffects
 * - Inserts a row into the photo_gallery table
 *
 * @functions_called supabaseAdmin.from
 * @called_by POST /api/photo-gallery
 *
 * @version 1.0.0 - 2026-03-20T17:52:44Z - Initial implementation
 */
export async function createPhoto(
  input: CreatePhotoInput
): Promise<DataResult<PhotoGalleryItem>> {
  if (!supabaseAdmin) {
    return { data: null, error: { code: 'not_configured', message: 'Database not configured' } };
  }

  const { data, error } = await supabaseAdmin
    .from('photo_gallery')
    .insert({
      caption: input.title,
      alt_text: input.description || null,
      image_url: input.imageUrl,
      thumbnail_url: input.thumbnailUrl || null,
      category: input.category || 'general',
      sort_order: input.sortOrder || 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating photo:', error);
    return { data: null, error: { code: 'query_error', message: 'Failed to create photo' } };
  }

  return { data: data as PhotoGalleryItem, error: null };
}

/**
 * Update an existing photo gallery item.
 *
 * Only fields present in the input are updated. Maps API field names
 * to database column names:
 * - title -> caption
 * - description -> alt_text
 * - imageUrl -> image_url
 * - thumbnailUrl -> thumbnail_url
 * - category -> category
 * - sortOrder -> sort_order
 * - isActive -> is_active
 *
 * @param id - UUID of the photo to update
 * @param input - UpdatePhotoInput with only the fields to change
 *
 * @returns DataResult containing the updated PhotoGalleryItem,
 *          or not_found if the photo does not exist
 *
 * @sideEffects
 * - Updates a row in the photo_gallery table
 *
 * @functions_called supabaseAdmin.from
 * @called_by PUT /api/photo-gallery/[id]
 *
 * @version 1.0.0 - 2026-03-20T17:52:44Z - Initial implementation
 */
export async function updatePhoto(
  id: string,
  input: UpdatePhotoInput
): Promise<DataResult<PhotoGalleryItem>> {
  if (!supabaseAdmin) {
    return { data: null, error: { code: 'not_configured', message: 'Database not configured' } };
  }

  // Build update object mapping API fields to DB columns
  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.caption = input.title;
  if (input.description !== undefined) updateData.alt_text = input.description;
  if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;
  if (input.thumbnailUrl !== undefined) updateData.thumbnail_url = input.thumbnailUrl;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.sortOrder !== undefined) updateData.sort_order = input.sortOrder;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  const { data, error } = await supabaseAdmin
    .from('photo_gallery')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating photo:', error);
    return { data: null, error: { code: 'query_error', message: 'Failed to update photo' } };
  }

  if (!data) {
    return { data: null, error: { code: 'not_found', message: 'Photo not found' } };
  }

  return { data: data as PhotoGalleryItem, error: null };
}

/**
 * Delete a photo gallery item.
 *
 * First retrieves the photo's image URLs (for potential storage cleanup),
 * then deletes the row from the database.
 *
 * @param id - UUID of the photo to delete
 *
 * @returns DataResult containing the deleted photo's image URLs for cleanup,
 *          or a query_error if the deletion fails
 *
 * @sideEffects
 * - Deletes a row from the photo_gallery table
 *
 * @functions_called supabaseAdmin.from
 * @called_by DELETE /api/photo-gallery/[id]
 *
 * @version 1.0.0 - 2026-03-20T17:52:44Z - Initial implementation
 */
export async function deletePhoto(
  id: string
): Promise<DataResult<{ imageUrl: string | null; thumbnailUrl: string | null }>> {
  if (!supabaseAdmin) {
    return { data: null, error: { code: 'not_configured', message: 'Database not configured' } };
  }

  // Get the photo first to retrieve image URLs for potential cleanup
  const { data: photo } = await supabaseAdmin
    .from('photo_gallery')
    .select('image_url, thumbnail_url')
    .eq('id', id)
    .single();

  // Delete from database
  const { error } = await supabaseAdmin
    .from('photo_gallery')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting photo:', error);
    return { data: null, error: { code: 'query_error', message: 'Failed to delete photo' } };
  }

  return {
    data: {
      imageUrl: photo?.image_url ?? null,
      thumbnailUrl: photo?.thumbnail_url ?? null,
    },
    error: null,
  };
}
