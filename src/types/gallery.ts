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
  id: number;
  name: string;
  type: 'desktop' | 'laptop';
  category: 'custom' | 'refurbished' | 'new';
  price: string;
  image: string;
  specs: GallerySpec[];
  blackFriday?: BlackFridayData;
}

// Sale types for global sale dropdown
export type SaleType = 'none' | 'black-friday';

export interface SaleConfig {
  type: SaleType;
  name: string;
  discount: number; // percentage
}

// Available sales - extend this array to add more sales
export const AVAILABLE_SALES: SaleConfig[] = [
  { type: 'none', name: 'No Sale', discount: 0 },
  { type: 'black-friday', name: 'Black Friday (10% off)', discount: 10 },
];

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
}

export interface PublishResponse {
  success: boolean;
  message: string;
  commitSha?: string;
  commitUrl?: string;
}

// Form data for creating/editing computers
export interface ComputerFormData {
  name: string;
  type: 'desktop' | 'laptop';
  category: 'custom' | 'refurbished' | 'new';
  price: string;
  image: string;
  specs: GallerySpec[];
}
