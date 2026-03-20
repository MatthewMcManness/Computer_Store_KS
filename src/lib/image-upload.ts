/**
 * Shared Image Upload Pipeline
 *
 * Provides reusable image validation, processing, and storage upload
 * functions for gallery upload routes. Supports standard image formats
 * and professional RAW formats from Canon, Nikon, Sony, Fujifilm, and
 * other cameras.
 *
 * @see src/app/api/in-store/upload/route.ts
 * @see src/app/api/photo-gallery/upload/route.ts
 *
 * @version 1.0.0 - 2026-03-20T17:52:06Z - Extract shared upload pipeline from in-store and photo-gallery routes
 */

import sharp from 'sharp';

/** Maximum file size: 100MB (RAW files can be 20-80MB) */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

/** Allowed MIME types for image uploads */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/x-canon-cr2',
  'image/x-canon-cr3',
  'image/x-canon-crw',
  'image/x-nikon-nef',
  'image/x-sony-arw',
  'image/x-fuji-raf',
  'image/x-olympus-orf',
  'image/x-panasonic-rw2',
  'image/x-pentax-pef',
  'image/x-adobe-dng',
  'image/x-leica-rwl',
  'image/x-samsung-srw',
  'application/octet-stream', // RAW files often come as this
];

/** Allowed file extensions (for RAW format fallback validation) */
export const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif', '.tiff', '.tif',
  // Canon
  '.cr2', '.cr3', '.crw',
  // Nikon
  '.nef', '.nrw',
  // Sony
  '.arw', '.srf', '.sr2',
  // Fujifilm
  '.raf',
  // Olympus
  '.orf',
  // Panasonic
  '.rw2',
  // Pentax
  '.pef', '.ptx',
  // Adobe DNG (universal RAW)
  '.dng',
  // Leica
  '.rwl',
  // Samsung
  '.srw',
];

/**
 * Check if file is allowed based on MIME type or extension.
 *
 * Validates the file's MIME type against the allowed list first. For files
 * reported as application/octet-stream (common with RAW formats), also
 * verifies the file extension. Falls back to extension-only validation
 * when the MIME type is unrecognized, since RAW files often have incorrect
 * MIME types assigned by browsers.
 *
 * @param file - The File object to validate
 * @returns true if the file type is allowed, false otherwise
 *
 * @functions_called (none - uses module constants)
 * @called_by POST handler in in-store/upload/route.ts, POST handler in photo-gallery/upload/route.ts
 *
 * @version 1.0.0 - 2026-03-20T17:52:06Z - Extracted from in-store and photo-gallery upload routes
 */
export function isAllowedFile(file: File): boolean {
  // Check MIME type first
  if (ALLOWED_MIME_TYPES.includes(file.type)) {
    // For octet-stream, also verify extension
    if (file.type === 'application/octet-stream') {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return ALLOWED_EXTENSIONS.includes(ext);
    }
    return true;
  }

  // Fallback: check extension (RAW files often have wrong MIME type)
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Process an image buffer into optimized full-size and thumbnail WebP versions.
 *
 * Uses Sharp to resize and convert the input image. The full-size version is
 * constrained to 2048x2048 pixels with high quality (92) and higher compression
 * effort (6) for optimal quality/size balance. The thumbnail is constrained to
 * 400x400 pixels with good quality (85). Both preserve aspect ratio and do not
 * upscale small images.
 *
 * @param buffer - Raw image data buffer to process
 * @returns Object containing fullSize and thumbnail buffers in WebP format
 *
 * @throws {Error} When Sharp cannot process the input buffer (corrupt or unsupported format)
 *
 * @functions_called sharp.resize, sharp.webp, sharp.toBuffer
 * @called_by POST handler in in-store/upload/route.ts, POST handler in photo-gallery/upload/route.ts
 *
 * @version 1.0.0 - 2026-03-20T17:52:06Z - Extracted from in-store and photo-gallery upload routes
 */
export async function processImage(buffer: Buffer): Promise<{ fullSize: Buffer; thumbnail: Buffer }> {
  // Generate high-quality full-size image (max 2048px, preserves aspect ratio)
  const fullSize = await sharp(buffer)
    .resize(2048, 2048, {
      fit: 'inside',           // Preserve aspect ratio, fit within bounds
      withoutEnlargement: true, // Don't upscale small images
    })
    .webp({
      quality: 92,             // High quality for gallery display
      effort: 6,               // Higher compression effort for better quality/size
    })
    .toBuffer();

  // Generate thumbnail (400px max, preserves aspect ratio)
  const thumbnail = await sharp(buffer)
    .resize(400, 400, {
      fit: 'inside',           // Preserve aspect ratio
      withoutEnlargement: true,
    })
    .webp({
      quality: 85,             // Good quality for thumbnails
    })
    .toBuffer();

  return { fullSize, thumbnail };
}

/**
 * Upload full-size and thumbnail image buffers to Supabase Storage.
 *
 * Uploads both images in parallel to the 'gallery-images' bucket with WebP
 * content type and 1-year cache control. After successful upload, retrieves
 * and returns public URLs for both images.
 *
 * @param supabaseAdmin - Supabase admin client with storage access
 * @param fullSizeBuffer - Processed full-size image buffer in WebP format
 * @param thumbnailBuffer - Processed thumbnail image buffer in WebP format
 * @param fileName - Base filename without extension (e.g., "desktop-1234567890-full")
 *   Used as-is for the full-size upload; the thumbnail filename is derived by
 *   replacing "-full" with "-thumb"
 *
 * @returns Object with imageUrl and thumbnailUrl public URLs
 *
 * @throws {Error} When full-size image upload fails
 * @throws {Error} When thumbnail image upload fails
 *
 * @sideEffects
 * - Uploads two files to Supabase Storage 'gallery-images' bucket
 * - Logs errors to console on upload failure
 *
 * @functions_called supabaseAdmin.storage.from.upload, supabaseAdmin.storage.from.getPublicUrl
 * @called_by POST handler in in-store/upload/route.ts, POST handler in photo-gallery/upload/route.ts
 *
 * @version 1.0.0 - 2026-03-20T17:52:06Z - Extracted from in-store and photo-gallery upload routes
 */
export async function uploadToStorage(
  supabaseAdmin: { storage: { from: (bucket: string) => { upload: (path: string, body: Buffer, options: { contentType: string; cacheControl: string; upsert: boolean }) => Promise<{ error: { message: string } | null }>; getPublicUrl: (path: string) => { data: { publicUrl: string } } } } },
  fullSizeBuffer: Buffer,
  thumbnailBuffer: Buffer,
  fileName: string,
): Promise<{ imageUrl: string; thumbnailUrl: string }> {
  const fullFilename = `${fileName}-full.webp`;
  const thumbFilename = `${fileName}-thumb.webp`;

  // Upload both images to Supabase Storage in parallel
  const [fullUpload, thumbUpload] = await Promise.all([
    supabaseAdmin.storage
      .from('gallery-images')
      .upload(fullFilename, fullSizeBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      }),
    supabaseAdmin.storage
      .from('gallery-images')
      .upload(thumbFilename, thumbnailBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      }),
  ]);

  if (fullUpload.error) {
    console.error('Error uploading full image:', fullUpload.error);
    throw new Error('Failed to upload image');
  }

  if (thumbUpload.error) {
    console.error('Error uploading thumbnail:', thumbUpload.error);
    throw new Error('Failed to upload thumbnail');
  }

  // Get public URLs for both images
  const { data: fullUrlData } = supabaseAdmin.storage
    .from('gallery-images')
    .getPublicUrl(fullFilename);

  const { data: thumbUrlData } = supabaseAdmin.storage
    .from('gallery-images')
    .getPublicUrl(thumbFilename);

  return {
    imageUrl: fullUrlData.publicUrl,
    thumbnailUrl: thumbUrlData.publicUrl,
  };
}
