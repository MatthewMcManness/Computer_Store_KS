/**
 * GBP API INTERNAL TYPES - Wire-format response shapes for the Google
 * Business Profile API endpoints (Account Management v1, Business
 * Information v1, and the legacy v4 reviews endpoint). Used only by
 * the server-side lib modules; never imported by client code.
 *
 * WHEN TO EDIT: When Google changes a response shape, or when a new
 * GBP endpoint is integrated.
 */

/** OAuth token response from https://oauth2.googleapis.com/token. */
export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
  refresh_token?: string;
}

/** One entry from accounts.list (`mybusinessaccountmanagement.googleapis.com/v1/accounts`). */
export interface GbpAccount {
  name: string;
  accountName: string;
  type: string;
  role: string;
  verificationState?: string;
  vettedState?: string;
}

/** Response from accounts.list. */
export interface GbpAccountsListResponse {
  accounts?: GbpAccount[];
  nextPageToken?: string;
}

/** One entry from accounts.locations.list. */
export interface GbpLocation {
  name: string;
  title?: string;
  storeCode?: string;
}

/** Response from accounts.locations.list. */
export interface GbpLocationsListResponse {
  locations?: GbpLocation[];
  nextPageToken?: string;
}

/** Raw review object from the legacy v4 reviews endpoint. */
export interface GbpReview {
  reviewId?: string;
  name?: string;
  reviewer?: {
    profilePhotoUrl?: string;
    displayName?: string;
    isAnonymous?: boolean;
  };
  starRating: 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime?: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

/** Response from accounts.locations.reviews.list (v4). */
export interface GbpReviewsListResponse {
  reviews?: GbpReview[];
  averageRating?: number;
  totalReviewCount?: number;
  nextPageToken?: string;
}
