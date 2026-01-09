'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Loader2, Trash2, Upload } from 'lucide-react';
import type { BlogPost, BlogCategory, BlogTag } from '@/lib/supabase';

interface PageProps {
  params: { id: string };
}

export default function EditBlogPostPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [featuredImageThumbnail, setFeaturedImageThumbnail] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  // Load post and metadata
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load post
        const postResponse = await fetch(`/api/blog/${id}?admin=true`);
        const postResult = await postResponse.json();

        if (!postResponse.ok) {
          setError(postResult.error || 'Failed to load post');
          setIsLoading(false);
          return;
        }

        const loadedPost = postResult.post;
        setPost(loadedPost);
        setTitle(loadedPost.title);
        setSlug(loadedPost.slug);
        setExcerpt(loadedPost.excerpt || '');
        setContent(loadedPost.content);
        setCategoryId(loadedPost.category_id || '');
        setSelectedTags(loadedPost.tags?.map((t: BlogTag) => t.id) || []);
        setFeaturedImageUrl(loadedPost.featured_image_url || '');
        setFeaturedImageThumbnail(loadedPost.featured_image_thumbnail || '');
        setStatus(loadedPost.status);

        // Load metadata
        const metaResponse = await fetch('/api/blog?admin=true&metadata=true');
        const metaResult = await metaResponse.json();
        if (metaResponse.ok) {
          setCategories(metaResult.categories || []);
          setTags(metaResult.tags || []);
        }
      } catch (err) {
        setError('Failed to load post');
        console.error('Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent, newStatus?: 'draft' | 'published' | 'archived') => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const finalStatus = newStatus || status;

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || null,
          content,
          category_id: categoryId || null,
          tag_ids: selectedTags,
          featured_image_url: featuredImageUrl || null,
          featured_image_thumbnail: featuredImageThumbnail || null,
          status: finalStatus,
          published_at: finalStatus === 'published' && status !== 'published'
            ? new Date().toISOString()
            : undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        setError(result.error || 'Failed to update post');
      }
    } catch (err) {
      setError('Failed to update post');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to delete post');
      }
    } catch (err) {
      setError('Failed to delete post');
      console.error('Delete error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post && !isLoading) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-900 p-12 text-center shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Post not found</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">The blog post you're looking for doesn't exist.</p>
        <Link
          href="/admin/blog"
          className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/admin/blog"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Posts
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">Update your blog post.</p>
          </div>
          <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="space-y-6">
          {/* Title */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2 text-lg font-medium focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter post title..."
            />
          </div>

          {/* Slug */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="url-slug"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Brief summary of the post (shown in previews)..."
            />
          </div>

          {/* Content */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Supports basic markdown: **bold**, *italic*, ## headers, [links](url), `code`
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={15}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-3 font-mono text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Write your post content here..."
            />
          </div>

          {/* Featured Image */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={featuredImageUrl}
                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
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

                        // Check file size before upload (50MB max)
                        if (file.size > 50 * 1024 * 1024) {
                          setError('Image must be less than 50MB');
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
                            setFeaturedImageThumbnail(result.thumbnailUrl || '');
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isUploading
                    ? 'Uploading and optimizing image...'
                    : 'Upload an image (max 50MB) or paste a URL. Images are optimized to WebP automatically.'}
                </p>
              </div>
              {featuredImageUrl && (
                <div className="h-20 w-32 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
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
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No tags available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
                className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={(e) => handleSubmit(e as React.FormEvent, 'draft')}
                disabled={isSubmitting || !title || !content}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
              {status !== 'published' && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as React.FormEvent, 'published')}
                  disabled={isSubmitting || !title || !content}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  Publish
                </button>
              )}
              {status === 'published' && (
                <a
                  href={`/blog/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-emerald-700"
                >
                  <Eye className="h-4 w-4" />
                  View Post
                </a>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
