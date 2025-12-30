// Gallery computer types for admin system
export interface GallerySpec {
  label: string;
  value: string;
}

export interface BlackFridayData {
  enabled: boolean;
  originalPrice: string;
  salePrice: string;
  discount: number;
  originalPartsWarranty?: string;
  originalFreeDiagnostics?: string;
}

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

// Sale types for global sale dropdown
export type SaleType = 'none' | 'black-friday';

export interface SaleConfig {
  type: SaleType;
  name: string;
  discount: number; // percentage
}

// Available sales - extend this array to add more sales
// Note: These must match the gallery_sales table in Supabase
export const AVAILABLE_SALES: SaleConfig[] = [
  { type: 'none', name: 'No Sale', discount: 0 },
  { type: 'black-friday', name: 'Black Friday (10% off)', discount: 10 },
];

// Database sale type from Supabase
export interface GallerySale {
  id: string;
  sale_type: string;
  name: string;
  discount_percent: number;
  applies_to: string[];
  is_active: boolean;
  created_at: string;
}

// Legacy GalleryData type - kept for migration script compatibility
export interface GalleryData {
  computers: GalleryComputer[];
  lastUpdated: string;
  version: string;
  globalSale?: SaleType; // Active global sale
}

// API response types
export interface GalleryApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  filename: string;
  path: string;
  url: string;
  thumbnailUrl?: string; // Small 400x300 WebP thumbnail
  thumbnailPath?: string;
}

// Form data for creating/editing computers
export interface ComputerFormData {
  name: string;
  type: 'desktop' | 'laptop';
  category: 'custom' | 'refurbished' | 'new';
  price: string;
  image: string;
  thumbnail?: string;
  specs: GallerySpec[];
}

// Input types for Supabase operations
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
