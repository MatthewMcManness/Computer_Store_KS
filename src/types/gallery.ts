/**
 * Type definitions for the gallery computer inventory system.
 *
 * This file defines all types used by the admin gallery management system
 * for displaying and managing computers available for sale.
 */

/**
 * Computer specification item (e.g., CPU, RAM, Storage).
 *
 * Used to display technical specs in a label-value format.
 *
 * @example
 * { label: 'Processor', value: 'Intel Core i5-10400' }
 * { label: 'RAM', value: '16GB DDR4' }
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface GallerySpec {
  label: string;
  value: string;
}

/**
 * Black Friday sale data for a computer.
 *
 * Stores original pricing and sale information. When enabled,
 * the computer displays sale pricing on the gallery page.
 *
 * @property enabled - Whether Black Friday pricing is active for this computer
 * @property originalPrice - Original price before discount (e.g., "$599.99")
 * @property salePrice - Discounted sale price (e.g., "$539.99")
 * @property discount - Discount percentage (e.g., 10 for 10% off)
 * @property originalPartsWarranty - Original warranty text before sale modification
 * @property originalFreeDiagnostics - Original diagnostics offer before sale modification
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface BlackFridayData {
  enabled: boolean;
  originalPrice: string;
  salePrice: string;
  discount: number;
  originalPartsWarranty?: string;
  originalFreeDiagnostics?: string;
}

/**
 * Gallery computer item with all display and metadata.
 *
 * Represents a single computer in the gallery inventory system.
 * Stored in Supabase and displayed on the public gallery page.
 *
 * @property id - UUID from Supabase database
 * @property name - Display name (e.g., "Gaming Desktop - Intel i5")
 * @property type - Computer form factor
 * @property category - Sales category (custom-built, refurbished, or new)
 * @property price - Display price as string (e.g., "$599.99")
 * @property image - URL to full-size image in Supabase Storage
 * @property thumbnail - URL to 400x300 WebP thumbnail for grid display
 * @property specs - Array of specifications (CPU, RAM, storage, etc.)
 * @property blackFriday - Optional sale pricing data
 * @property created_at - ISO timestamp of creation
 * @property updated_at - ISO timestamp of last modification
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface GalleryComputer {
  id: string; // UUID from Supabase
  name: string;
  type: 'desktop' | 'laptop';
  category: 'custom' | 'refurbished' | 'new';
  price: string;
  image: string;
  thumbnail?: string; // Small 400x300 WebP for grid display
  specs: GallerySpec[];
  blackFriday?: BlackFridayData;
  created_at?: string;
  updated_at?: string;
}

/**
 * Type identifier for different sale events.
 * 'none' indicates no active sale.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export type SaleType = 'none' | 'black-friday';

/**
 * Configuration for a site-wide sale event.
 *
 * @property type - Unique identifier for the sale
 * @property name - Display name shown in admin dropdown
 * @property discount - Percentage discount applied (0-100)
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface SaleConfig {
  type: SaleType;
  name: string;
  discount: number; // percentage
}

/**
 * Available sale configurations for admin selection.
 *
 * Extend this array to add new sale types. Must match the
 * gallery_sales table structure in Supabase.
 */
export const AVAILABLE_SALES: SaleConfig[] = [
  { type: 'none', name: 'No Sale', discount: 0 },
  { type: 'black-friday', name: 'Black Friday (10% off)', discount: 10 },
];

/**
 * Gallery sale record from Supabase database.
 *
 * Represents an active or inactive sale in the gallery_sales table.
 *
 * @property id - UUID primary key
 * @property sale_type - Type identifier (matches SaleType)
 * @property name - Display name of sale
 * @property discount_percent - Discount percentage (0-100)
 * @property applies_to - Array of computer IDs this sale applies to
 * @property is_active - Whether sale is currently active
 * @property created_at - ISO timestamp of creation
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface GallerySale {
  id: string;
  sale_type: string;
  name: string;
  discount_percent: number;
  applies_to: string[];
  is_active: boolean;
  created_at: string;
}

/**
 * LEGACY: Gallery data structure from old JSON-based system.
 *
 * @deprecated Kept for migration script compatibility only.
 * New code should use Supabase queries directly.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface GalleryData {
  computers: GalleryComputer[];
  lastUpdated: string;
  version: string;
  globalSale?: SaleType; // Active global sale
}

/**
 * Generic API response wrapper for gallery endpoints.
 *
 * @template T - Type of data payload
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface GalleryApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Response from image upload API endpoint.
 *
 * Includes URLs for both full-size image and optimized thumbnail.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface ImageUploadResponse {
  success: boolean;
  filename: string;
  path: string;
  url: string;
  thumbnailUrl?: string; // Small 400x300 WebP thumbnail
  thumbnailPath?: string;
}

/**
 * Form data for creating or editing a computer in admin UI.
 *
 * Uses string price (e.g., "$599.99") to match display format.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface ComputerFormData {
  name: string;
  type: 'desktop' | 'laptop';
  category: 'custom' | 'refurbished' | 'new';
  price: string;
  image: string;
  thumbnail?: string;
  specs: GallerySpec[];
}

/**
 * Input for creating new computer in Supabase.
 *
 * Uses numeric price for database storage.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface CreateComputerInput {
  name: string;
  type: 'desktop' | 'laptop';
  category: 'refurbished' | 'custom' | 'new';
  price: number;
  image_url?: string;
  thumbnail_url?: string;
  specs?: GallerySpec[];
  sort_order?: number;
}

/**
 * Input for updating existing computer in Supabase.
 *
 * All fields optional for partial updates.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface UpdateComputerInput {
  name?: string;
  type?: 'desktop' | 'laptop';
  category?: 'refurbished' | 'custom' | 'new';
  price?: number;
  image_url?: string;
  thumbnail_url?: string;
  specs?: GallerySpec[];
  is_active?: boolean;
  sort_order?: number;
}
