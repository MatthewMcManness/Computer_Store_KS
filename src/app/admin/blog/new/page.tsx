'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Loader2, Upload } from 'lucide-react';
import type { BlogCategory, BlogTag } from '@/lib/supabase';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Load categories and tags
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch('/api/blog?admin=true&metadata=true');
        const result = await response.json();
        if (response.ok) {
          setCategories(result.categories || []);
          setTags(result.tags || []);
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent, publishStatus: 'draft' | 'published') => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || null,
          content,
          category_id: categoryId || null,
          tag_ids: selectedTags,
          featured_image_url: featuredImageUrl || null,
          status: publishStatus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Failed to create post');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Posts
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">New Blog Post</h1>
        <p className="mt-1 text-gray-500">Create a new blog post for your website.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, status)}>
        <div className="space-y-6">
          {/* Title */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-lg font-medium focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter post title..."
            />
          </div>

          {/* Slug */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="url-slug"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Brief summary of the post (shown in previews)..."
            />
          </div>

          {/* Content */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <div className="mb-2 text-xs text-gray-500">
              Supports basic markdown: **bold**, *italic*, ## headers, [links](url), `code`
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={15}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Write your post content here..."
            />
          </div>

          {/* Featured Image */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={featuredImageUrl}
                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Check file size before upload (10MB max)
                        if (file.size > 10 * 1024 * 1024) {
                          setError('Image must be less than 10MB');
                          e.target.value = '';
                          return;
                        }

                        setIsUploading(true);
                        setError(null);
                        try {
                          const formData = new FormData();
                          formData.append('image', file);

                          const response = await fetch('/api/blog/upload', {
                            method: 'POST',
                            body: formData,
                          });

                          const result = await response.json();
                          if (result.success) {
                            setFeaturedImageUrl(result.url);
                          } else {
                            setError(result.error || 'Failed to upload image');
                          }
                        } catch (err) {
                          setError('Failed to upload image. Please try a smaller file.');
                        } finally {
                          setIsUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {isUploading
                    ? 'Uploading and optimizing image...'
                    : 'Upload an image (max 10MB) or paste a URL. Images are optimized automatically.'}
                </p>
              </div>
              {featuredImageUrl && (
                <div className="h-20 w-32 overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={featuredImageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Category & Tags */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                        selectedTags.includes(tag.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-sm text-gray-500">No tags available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
            <div className="text-sm text-gray-500">
              {status === 'draft' ? 'Will be saved as draft' : 'Will be published immediately'}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  setStatus('draft');
                  handleSubmit(e as React.FormEvent, 'draft');
                }}
                disabled={isSubmitting || !title || !content}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {isSubmitting && status === 'draft' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Draft
              </button>
              <button
                type="button"
                onClick={(e) => {
                  setStatus('published');
                  handleSubmit(e as React.FormEvent, 'published');
                }}
                disabled={isSubmitting || !title || !content}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting && status === 'published' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Publish
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
