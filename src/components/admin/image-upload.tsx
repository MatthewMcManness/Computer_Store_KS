'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Maximum allowed file size for image uploads (50MB).
 */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Allowed MIME types for image uploads.
 */
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

/**
 * Result object returned after successful image upload.
 */
interface ImageUploadResult {
  url: string;
  thumbnailUrl?: string;
}

/**
 * Props for the ImageUpload component.
 */
interface ImageUploadProps {
  currentImage?: string;
  currentThumbnail?: string;
  computerType: 'desktop' | 'laptop';
  onImageChange: (result: ImageUploadResult) => void;
}

/**
 * Drag-and-drop image upload component with preview and progress tracking.
 *
 * Features:
 * - Click-to-upload or drag-and-drop file selection
 * - Real-time image preview
 * - Upload progress bar with percentage
 * - File type and size validation
 * - Automatic thumbnail generation (server-side)
 * - Error handling and user feedback
 * - Visual states: empty, uploading, preview, error
 *
 * Validates files client-side before upload:
 * - Accepts: JPG, PNG, WebP, GIF, HEIC, HEIF
 * - Maximum size: 50MB
 *
 * @param props - Component properties
 * @param props.currentImage - URL of existing image (for edit mode)
 * @param props.currentThumbnail - URL of existing thumbnail
 * @param props.computerType - Type of computer (affects upload endpoint)
 * @param props.onImageChange - Callback with upload result (URLs)
 *
 * @returns {JSX.Element} Upload area with preview or dropzone
 *
 * @sideEffects
 * - Makes POST request to `/api/in-store/upload`
 * - Creates FormData with image file and type
 * - Shows browser file picker dialog
 * - Reads file as Data URL for preview
 * - Tracks upload progress via XMLHttpRequest
 *
 * @example
 * <ImageUpload
 *   currentImage={computer.image}
 *   computerType="desktop"
 *   onImageChange={(result) => setImageUrl(result.url)}
 * />
 *
 * @functions_called cn
 * @called_by ComputerForm
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function ImageUpload({
  currentImage,
  currentThumbnail,
  computerType,
  onImageChange,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setUploadProgress(0);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please select a JPG, PNG, WebP, or GIF image');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 50MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);

      // Simulate initial progress for large files
      setUploadProgress(10);

      // Upload to server
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', computerType);

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 90) + 10;
          setUploadProgress(percent);
        }
      };

      const uploadPromise = new Promise<{
        success: boolean;
        url?: string;
        thumbnailUrl?: string;
        error?: string;
      }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error('Invalid response'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
      });

      xhr.open('POST', '/api/in-store/upload');
      xhr.send(formData);

      const result = await uploadPromise;
      setUploadProgress(100);

      if (result.success && result.url) {
        onImageChange({
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
        });
      } else {
        // If upload fails, use the preview as fallback
        console.warn('Upload to server failed:', result.error);
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageChange({ url: '', thumbnailUrl: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : preview
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        )}
      >
        {preview ? (
          <div className="relative">
            <Image
              src={preview}
              alt="Preview"
              width={300}
              height={200}
              className="mx-auto rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              className="absolute right-2 top-2 rounded-full bg-white dark:bg-gray-800 p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        ) : (
          <div>
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Uploading... {uploadProgress}%
                </p>
                {/* Progress bar */}
                <div className="mt-2 w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG, WebP, or GIF up to 50MB
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
