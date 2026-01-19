/**
 * Photo Gallery Type Definitions
 *
 * Types for the public photo gallery feature that showcases
 * store photos, events, work samples, and team photos.
 *
 * Database column mapping:
 * - caption -> title (display name)
 * - alt_text -> description (display name)
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-01-19T00:00:00Z - Updated to match existing DB schema
 */

/**
 * Photo gallery item from database (matches actual DB columns).
 */
export interface PhotoGalleryItem {
  id: string;
  caption: string;
  alt_text: string | null;
  image_url: string;
  thumbnail_url: string | null;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Photo gallery item for display (camelCase, user-friendly names).
 */
export interface PhotoGalleryDisplay {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new photo.
 */
export interface CreatePhotoInput {
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category?: string;
  sortOrder?: number;
}

/**
 * Input for updating a photo.
 */
export interface UpdatePhotoInput {
  title?: string;
  description?: string | null;
  imageUrl?: string;
  thumbnailUrl?: string | null;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Photo categories for filtering.
 */
export const PHOTO_CATEGORIES = [
  { value: 'all', label: 'All Photos' },
  { value: 'store', label: 'Our Store' },
  { value: 'repairs', label: 'Repairs & Work' },
  { value: 'custom-builds', label: 'Custom Builds' },
  { value: 'events', label: 'Events' },
  { value: 'team', label: 'Our Team' },
  { value: 'general', label: 'General' },
] as const;

export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number]['value'];

/**
 * Transforms database photo to display format.
 * Maps DB columns (caption, alt_text) to user-friendly names (title, description).
 */
export function transformPhoto(photo: PhotoGalleryItem): PhotoGalleryDisplay {
  return {
    id: photo.id,
    title: photo.caption,
    description: photo.alt_text,
    imageUrl: photo.image_url,
    thumbnailUrl: photo.thumbnail_url,
    category: photo.category,
    sortOrder: photo.sort_order,
    isActive: photo.is_active,
    createdAt: photo.created_at,
    updatedAt: photo.updated_at,
  };
}
