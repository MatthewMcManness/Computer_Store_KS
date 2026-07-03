/**
 * ADD SLIDE - Form to create a new slideshow slide.
 * Choose between uploading a PNG/image or entering raw HTML markup.
 *
 * WHEN TO EDIT: When changing how new slides are created or what file
 * types are accepted for image slides.
 */
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Code2, ImageIcon, Loader2, Plus } from 'lucide-react';
import type { SlideType } from '@/types/slideshow';

export default function NewSlidePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [slideType, setSlideType] = useState<SlideType>('image');
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a PNG, JPG, WEBP, or GIF image.');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError(null);
    setImageFile(file);

    // Generate local preview URL
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Slide title is required.');
      return;
    }

    if (slideType === 'html' && !htmlContent.trim()) {
      setError('HTML content is required for HTML slides.');
      return;
    }

    if (slideType === 'image' && !imageFile) {
      setError('Please select an image to upload.');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined;

      // Step 1: If image slide, upload the file first
      if (slideType === 'image' && imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResponse = await fetch('/api/slideshow/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResult.success) {
          setError(uploadResult.error || 'Failed to upload image.');
          setIsSubmitting(false);
          return;
        }

        imageUrl = uploadResult.imageUrl;
      }

      // Step 2: Create the slide record
      const slidePayload = {
        title: title.trim(),
        type: slideType,
        ...(slideType === 'html' ? { content: htmlContent } : { image_url: imageUrl }),
      };

      const response = await fetch('/api/slideshow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slidePayload),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/slideshow?message=added');
      } else {
        setError(result.error || 'Failed to create slide.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/slideshow"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Slideshow Manager
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Add Slide</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload an image or enter HTML markup for the new slide.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Slide title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Slide Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Black Friday Sale, Weekly Deals..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Used for identification in the admin panel — not shown during the slideshow.
          </p>
        </div>

        {/* Slide type selector */}
        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slide Type <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setSlideType('image'); setError(null); }}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                slideType === 'image'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <ImageIcon className={`h-6 w-6 flex-none ${slideType === 'image' ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <p className={`text-sm font-medium ${slideType === 'image' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  Image
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP, GIF</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setSlideType('html'); setError(null); }}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                slideType === 'html'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Code2 className={`h-6 w-6 flex-none ${slideType === 'html' ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <p className={`text-sm font-medium ${slideType === 'html' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  HTML
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Raw HTML markup</p>
              </div>
            </button>
          </div>
        </div>

        {/* Image upload */}
        {slideType === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Image File <span className="text-red-500">*</span>
            </label>

            {imagePreview ? (
              // Show preview with replace button
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Slide preview"
                    className="max-h-48 w-full object-contain p-2"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{imageFile?.name}</p>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove and choose different image
                </button>
              </div>
            ) : (
              // Upload drop zone
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PNG, JPG, WEBP, GIF · Max 10MB
                  </p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* HTML content textarea */}
        {slideType === 'html' && (
          <div>
            <label htmlFor="htmlContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              HTML Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="htmlContent"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={16}
              placeholder={`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      background: #1a1a2e;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: sans-serif;
      color: white;
    }
    h1 { font-size: 4rem; }
  </style>
</head>
<body>
  <h1>Your slide content here</h1>
</body>
</html>`}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 font-mono text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Full HTML document rendered in a sandboxed iframe. Include all CSS inside a{' '}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&lt;style&gt;</code> tag.
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {slideType === 'image' ? 'Uploading...' : 'Adding Slide...'}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Slide
              </>
            )}
          </button>
          <Link
            href="/admin/slideshow"
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  );
}
