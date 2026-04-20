/**
 * TYPE DEFINITIONS - Types for the in-store slideshow system.
 * Slides can be raw HTML or uploaded images (PNG/JPG).
 *
 * WHEN TO EDIT: When adding new slide types or changing the data model.
 */

/** Whether a slide contains raw HTML markup or a stored image URL. */
export type SlideType = 'html' | 'image';

/** Raw database row from the slideshow_slides table. */
export interface SlideshowSlideDB {
  id: string;
  title: string;
  type: SlideType;
  content: string | null;     // Raw HTML for 'html' slides
  image_url: string | null;   // Supabase Storage URL for 'image' slides
  sort_order: number;
  is_active: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A slideshow slide with camelCase fields for the frontend. */
export interface SlideshowSlide {
  id: string;
  title: string;
  type: SlideType;
  content: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a new slide. */
export interface CreateSlideInput {
  title: string;
  type: SlideType;
  content?: string;
  image_url?: string;
  sort_order?: number;
}

/** Input for updating an existing slide (all fields optional). */
export interface UpdateSlideInput {
  title?: string;
  content?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}
