/**
 * Core application type definitions.
 *
 * This file contains common types used throughout the application including
 * computers, services, forms, API responses, and business hours.
 */

/**
 * Computer product with full details and metadata.
 *
 * NOTE: This may be legacy or unused. Check if gallery uses GalleryComputer instead.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface Computer {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: 'desktop' | 'laptop' | 'all-in-one';
  price: number;
  originalPrice?: number;
  description: string;
  specs: ComputerSpecs;
  images: string[];
  inStock: boolean;
  featured: boolean;
  condition: 'excellent' | 'good' | 'fair';
  warranty: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComputerSpecs {
  processor: string;
  ram: string;
  storage: string;
  graphics?: string;
  display?: string;
  os: string;
  ports?: string[];
  wireless?: string;
  battery?: string;
}

/**
 * Service offering with pricing and details.
 *
 * Represents a computer repair or sales service offered by the shop.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: string;
  category: string;
}

/**
 * Contact form submission data.
 *
 * Used by the /contact page form.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Repair service request with device details and status tracking.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface RepairRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generic API response wrapper.
 *
 * Standard structure for all API endpoint responses.
 *
 * @template T - Type of data payload
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response with metadata.
 *
 * @template T - Type of items in the array
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Navigation menu item with optional nested children.
 *
 * Used for building hierarchical navigation structures.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

/**
 * Business operating hours for a single day.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface BusinessHours {
  open: string;
  close: string;
  closed: boolean;
}

/**
 * Complete weekly business hours schedule.
 *
 * Maps each day of the week to its operating hours.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface WeeklyHours {
  monday: BusinessHours;
  tuesday: BusinessHours;
  wednesday: BusinessHours;
  thursday: BusinessHours;
  friday: BusinessHours;
  saturday: BusinessHours;
  sunday: BusinessHours;
}

/**
 * Re-export all Google Business Profile types for convenience.
 */
export * from './google-business';
