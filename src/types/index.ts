/**
 * Core application type definitions.
 *
 * This file contains common types used throughout the application.
 */

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
 * Re-export all Google Business Profile types for convenience.
 */
export * from './google-business';
