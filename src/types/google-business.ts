/**
 * Type definitions for Google Business Profile integration.
 *
 * Defines simplified display types used when rendering Google Business
 * data in frontend components.
 */

/**
 * Simplified review data for frontend display.
 *
 * Transforms complex Google API review format into simpler structure
 * suitable for rendering in React components.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface DisplayReview {
  id: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text?: string;
  date: string;
  reply?: {
    text: string;
    date: string;
  };
}
