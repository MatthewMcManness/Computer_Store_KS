// Google Business Profile API Integration
// Documentation: https://developers.google.com/my-business

import type {
  GoogleBusinessReview,
  GoogleBusinessPost,
  GoogleBusinessLocation,
  DisplayReview,
  DisplayPost,
  DisplayBusinessInfo,
  GoogleBusinessCache,
} from '@/types/google-business';

// Environment configuration
const GBP_CLIENT_ID = process.env.GOOGLE_BUSINESS_CLIENT_ID;
const GBP_CLIENT_SECRET = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
const GBP_REFRESH_TOKEN = process.env.GOOGLE_BUSINESS_REFRESH_TOKEN;
const GBP_ACCOUNT_ID = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
const GBP_LOCATION_ID = process.env.GOOGLE_BUSINESS_LOCATION_ID;

// API base URLs
const BUSINESS_INFO_API = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const REVIEWS_API = 'https://mybusiness.googleapis.com/v4';

// In-memory cache (consider Redis or file-based for production)
let cache: GoogleBusinessCache = {};
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if Google Business Profile API is configured
 */
export function isGoogleBusinessConfigured(): boolean {
  return !!(
    GBP_CLIENT_ID &&
    GBP_CLIENT_SECRET &&
    GBP_REFRESH_TOKEN &&
    GBP_ACCOUNT_ID &&
    GBP_LOCATION_ID
  );
}

/**
 * Get configuration status for debugging
 */
export function getGoogleBusinessConfig() {
  return {
    configured: isGoogleBusinessConfigured(),
    hasClientId: !!GBP_CLIENT_ID,
    hasClientSecret: !!GBP_CLIENT_SECRET,
    hasRefreshToken: !!GBP_REFRESH_TOKEN,
    hasAccountId: !!GBP_ACCOUNT_ID,
    hasLocationId: !!GBP_LOCATION_ID,
  };
}

/**
 * Get a fresh access token using the refresh token
 */
async function getAccessToken(): Promise<string> {
  if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET || !GBP_REFRESH_TOKEN) {
    throw new Error('Google Business Profile credentials not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GBP_CLIENT_ID,
      client_secret: GBP_CLIENT_SECRET,
      refresh_token: GBP_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Convert API star rating to number
 */
function starRatingToNumber(rating: GoogleBusinessReview['starRating']): number {
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return map[rating] || 0;
}

/**
 * Fetch reviews from Google Business Profile
 */
export async function fetchReviews(pageSize = 50): Promise<DisplayReview[]> {
  // Check cache first
  if (cache.reviews && new Date().getTime() - new Date(cache.reviews.fetchedAt).getTime() < CACHE_DURATION_MS) {
    return cache.reviews.data;
  }

  if (!isGoogleBusinessConfigured()) {
    throw new Error('Google Business Profile not configured');
  }

  const accessToken = await getAccessToken();
  const locationPath = `accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}`;

  const response = await fetch(
    `${REVIEWS_API}/${locationPath}/reviews?pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch reviews: ${error}`);
  }

  const data = await response.json();
  const reviews: GoogleBusinessReview[] = data.reviews || [];

  const displayReviews: DisplayReview[] = reviews.map((review) => ({
    id: review.reviewId,
    authorName: review.reviewer.displayName,
    authorPhoto: review.reviewer.profilePhotoUrl,
    rating: starRatingToNumber(review.starRating),
    text: review.comment,
    date: review.createTime,
    reply: review.reviewReply
      ? {
          text: review.reviewReply.comment,
          date: review.reviewReply.updateTime,
        }
      : undefined,
  }));

  // Calculate average rating
  const totalRating = displayReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = displayReviews.length > 0 ? totalRating / displayReviews.length : 0;

  // Update cache
  cache.reviews = {
    data: displayReviews,
    fetchedAt: new Date().toISOString(),
    averageRating,
    totalCount: data.totalReviewCount || displayReviews.length,
  };

  return displayReviews;
}

/**
 * Get cached reviews data including stats
 */
export function getCachedReviewsStats() {
  return cache.reviews
    ? {
        averageRating: cache.reviews.averageRating,
        totalCount: cache.reviews.totalCount,
        fetchedAt: cache.reviews.fetchedAt,
      }
    : null;
}

/**
 * Fetch posts/updates from Google Business Profile
 */
export async function fetchPosts(pageSize = 20): Promise<DisplayPost[]> {
  // Check cache first
  if (cache.posts && new Date().getTime() - new Date(cache.posts.fetchedAt).getTime() < CACHE_DURATION_MS) {
    return cache.posts.data;
  }

  if (!isGoogleBusinessConfigured()) {
    throw new Error('Google Business Profile not configured');
  }

  const accessToken = await getAccessToken();
  const locationPath = `accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}`;

  const response = await fetch(
    `${REVIEWS_API}/${locationPath}/localPosts?pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch posts: ${error}`);
  }

  const data = await response.json();
  const posts: GoogleBusinessPost[] = data.localPosts || [];

  const displayPosts: DisplayPost[] = posts.map((post) => {
    const typeMap: Record<string, DisplayPost['type']> = {
      STANDARD: 'update',
      EVENT: 'event',
      OFFER: 'offer',
      ALERT: 'alert',
    };

    return {
      id: post.name,
      type: typeMap[post.topicType || 'STANDARD'] || 'update',
      summary: post.summary,
      date: post.createTime,
      imageUrl: post.media?.[0]?.googleUrl,
      callToAction: post.callToAction
        ? {
            type: post.callToAction.actionType,
            url: post.callToAction.url,
          }
        : undefined,
      event: post.event
        ? {
            title: post.event.title,
            startDate: `${post.event.schedule.startDate.year}-${post.event.schedule.startDate.month}-${post.event.schedule.startDate.day}`,
            endDate: `${post.event.schedule.endDate.year}-${post.event.schedule.endDate.month}-${post.event.schedule.endDate.day}`,
          }
        : undefined,
      offer: post.offer
        ? {
            couponCode: post.offer.couponCode,
            url: post.offer.redeemOnlineUrl,
            terms: post.offer.termsConditions,
          }
        : undefined,
    };
  });

  // Update cache
  cache.posts = {
    data: displayPosts,
    fetchedAt: new Date().toISOString(),
  };

  return displayPosts;
}

/**
 * Fetch business information from Google Business Profile
 */
export async function fetchBusinessInfo(): Promise<DisplayBusinessInfo> {
  // Check cache first
  if (cache.businessInfo && new Date().getTime() - new Date(cache.businessInfo.fetchedAt).getTime() < CACHE_DURATION_MS) {
    return cache.businessInfo.data;
  }

  if (!isGoogleBusinessConfigured()) {
    throw new Error('Google Business Profile not configured');
  }

  const accessToken = await getAccessToken();
  const locationPath = `locations/${GBP_LOCATION_ID}`;

  const response = await fetch(
    `${BUSINESS_INFO_API}/${locationPath}?readMask=name,title,phoneNumbers,storefrontAddress,websiteUri,regularHours,latlng,metadata`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch business info: ${error}`);
  }

  const location: GoogleBusinessLocation = await response.json();

  // Convert hours to display format
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const hours = location.regularHours?.periods.map((period) => ({
    day: period.openDay,
    open: period.openTime,
    close: period.closeTime,
  }));

  const displayInfo: DisplayBusinessInfo = {
    name: location.title,
    phone: location.phoneNumbers?.primaryPhone,
    address: location.storefrontAddress
      ? {
          street: location.storefrontAddress.addressLines.join(', '),
          city: location.storefrontAddress.locality,
          state: location.storefrontAddress.administrativeArea,
          zip: location.storefrontAddress.postalCode,
        }
      : undefined,
    website: location.websiteUri,
    hours,
    mapsUrl: location.metadata?.mapsUri,
    reviewUrl: location.metadata?.newReviewUri,
    coordinates: location.latlng
      ? {
          lat: location.latlng.latitude,
          lng: location.latlng.longitude,
        }
      : undefined,
  };

  // Update cache
  cache.businessInfo = {
    data: displayInfo,
    fetchedAt: new Date().toISOString(),
  };

  return displayInfo;
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache = {};
}

/**
 * Clear specific cache
 */
export function clearCacheType(type: 'reviews' | 'posts' | 'businessInfo'): void {
  delete cache[type];
}

/**
 * Get all cached data (for debugging/admin)
 */
export function getAllCachedData(): GoogleBusinessCache {
  return { ...cache };
}

/**
 * Fetch all data at once (for initial page load)
 */
export async function fetchAllGoogleBusinessData(): Promise<{
  reviews: DisplayReview[];
  posts: DisplayPost[];
  businessInfo: DisplayBusinessInfo;
  stats: {
    averageRating: number;
    totalReviews: number;
  };
}> {
  const [reviews, posts, businessInfo] = await Promise.all([
    fetchReviews(),
    fetchPosts(),
    fetchBusinessInfo(),
  ]);

  const stats = getCachedReviewsStats();

  return {
    reviews,
    posts,
    businessInfo,
    stats: {
      averageRating: stats?.averageRating || 0,
      totalReviews: stats?.totalCount || reviews.length,
    },
  };
}
