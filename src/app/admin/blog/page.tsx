'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag, Loader2 } from 'lucide-react';
import type { BlogPost, BlogCategory } from '@/lib/supabase';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load posts and metadata
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('/api/blog?admin=true&metadata=true');
        const result = await response.json();

        if (response.ok) {
          setPosts(result.posts || []);
          setCategories(result.categories || []);
        } else {
          setError(result.error || 'Failed to load blog posts');
        }
      } catch (err) {
        setError('Failed to load blog posts');
        console.error('Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id));
        showToast('Post deleted successfully', 'success');
      } else {
        const result = await response.json();
        showToast(result.error || 'Failed to delete post', 'error');
      }
    } catch (err) {
      showToast('Failed to delete post', 'error');
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-1 text-gray-500">
            Manage your blog content
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
          <p className="mt-2 text-xs text-red-500">
            Make sure Supabase is configured correctly in your environment variables.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Posts</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{posts.length}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Published</p>
          <p className="mt-1 text-3xl font-bold text-green-600">
            {posts.filter(p => p.status === 'published').length}
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="mt-1 text-3xl font-bold text-yellow-600">
            {posts.filter(p => p.status === 'draft').length}
          </p>
        </div>
      </div>

      {/* Posts Table */}
      {posts.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Plus className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No blog posts yet</h3>
          <p className="mt-1 text-gray-500">Get started by creating your first post.</p>
          <Link
            href="/admin/blog/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">{post.title}</div>
                        <div className="text-sm text-gray-500">/blog/{post.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {post.category ? (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Tag className="h-3 w-3" />
                        {post.category.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <User className="h-3 w-3" />
                      {post.author_name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === 'published' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="View post"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-purple-600"
                        title="Edit post"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deletingId === post.id}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Delete post"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-lg p-4 shadow-lg ${
          toast.type === 'success'
            ? 'border-l-4 border-green-500 bg-white'
            : 'border-l-4 border-red-500 bg-white'
        }`}>
          <p className={`text-sm font-medium ${
            toast.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}
