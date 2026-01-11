/**
 * Type definitions for Google Business Profile API integration.
 *
 * Defines types for reviews, posts, business information, and cache structures
 * used when fetching data from Google Business Profile API (formerly Google My Business).
 *
 * Types are split into two categories:
 * 1. Raw API response types (GoogleBusiness*) - matching API structure
 * 2. Simplified display types (Display*) - frontend-friendly format
 */

/**
 * Review from Google Business Profile API.
 *
 * Represents a customer review with optional owner reply.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface GoogleBusinessReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export interface GoogleBusinessPost {
  name: string;
  languageCode: string;
  summary: string;
  callToAction?: {
    actionType: 'BOOK' | 'ORDER' | 'SHOP' | 'LEARN_MORE' | 'SIGN_UP' | 'CALL';
    url?: string;
  };
  createTime: string;
  updateTime: string;
  media?: Array<{
    mediaFormat: 'PHOTO' | 'VIDEO';
    googleUrl: string;
  }>;
  topicType?: 'STANDARD' | 'EVENT' | 'OFFER' | 'ALERT';
  event?: {
    title: string;
    schedule: {
      startDate: { year: number; month: number; day: number };
      endDate: { year: number; month: number; day: number };
    };
  };
  offer?: {
    couponCode?: string;
    redeemOnlineUrl?: string;
    termsConditions?: string;
  };
}

export interface GoogleBusinessHours {
  periods: Array<{
    openDay: string;
    openTime: string;
    closeDay: string;
    closeTime: string;
  }>;
}

export interface GoogleBusinessLocation {
  name: string;
  title: string;
  phoneNumbers?: {
    primaryPhone?: string;
    additionalPhones?: string[];
  };
  categories?: {
    primaryCategory: {
      displayName: string;
    };
    additionalCategories?: Array<{
      displayName: string;
    }>;
  };
  storefrontAddress?: {
    addressLines: string[];
    locality: string;
    administrativeArea: string;
    postalCode: string;
    regionCode: string;
  };
  websiteUri?: string;
  regularHours?: GoogleBusinessHours;
  specialHours?: {
    specialHourPeriods: Array<{
      startDate: { year: number; month: number; day: number };
      endDate?: { year: number; month: number; day: number };
      openTime?: string;
      closeTime?: string;
      isClosed?: boolean;
    }>;
  };
  serviceArea?: {
    businessType: 'CUSTOMER_LOCATION_ONLY' | 'CUSTOMER_AND_BUSINESS_LOCATION';
    places?: {
      placeInfos: Array<{
        placeName: string;
        placeId: string;
      }>;
    };
  };
  latlng?: {
    latitude: number;
    longitude: number;
  };
  metadata?: {
    mapsUri?: string;
    newReviewUri?: string;
  };
}

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

export interface DisplayPost {
  id: string;
  type: 'update' | 'event' | 'offer' | 'alert';
  summary: string;
  date: string;
  imageUrl?: string;
  callToAction?: {
    type: string;
    url?: string;
  };
  event?: {
    title: string;
    startDate: string;
    endDate: string;
  };
  offer?: {
    couponCode?: string;
    url?: string;
    terms?: string;
  };
}

export interface DisplayBusinessInfo {
  name: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  website?: string;
  hours?: Array<{
    day: string;
    open: string;
    close: string;
  }>;
  mapsUrl?: string;
  reviewUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// API response types
export interface GoogleBusinessApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  cachedAt?: string;
}

/**
 * Cache structure for storing fetched Google Business data.
 *
 * Reduces API calls by caching reviews, posts, and business info
 * with timestamps for cache invalidation.
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export interface GoogleBusinessCache {
  reviews?: {
    data: DisplayReview[];
    fetchedAt: string;
    averageRating: number;
    totalCount: number;
  };
  posts?: {
    data: DisplayPost[];
    fetchedAt: string;
  };
  businessInfo?: {
    data: DisplayBusinessInfo;
    fetchedAt: string;
  };
}
