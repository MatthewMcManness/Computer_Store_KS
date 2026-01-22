'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import type { PhotoGalleryItem } from '@/types/photo-gallery';
import { PHOTO_CATEGORIES, transformPhoto, type PhotoGalleryDisplay } from '@/types/photo-gallery';

/**
 * Admin Photo Gallery Management Page
 *
 * Allows managers, social media specialists, and lead developers to
 * manage the public photo gallery.
 *
 * @version 1.0.0 - 2026-01-19T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-01-19T00:00:00Z - Added dark mode support for modals
 */
export default function AdminPhotoGalleryPage() {
  const [photos, setPhotos] = useState<PhotoGalleryDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoGalleryDisplay | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    imageUrl: '',
    thumbnailUrl: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch photos
  const fetchPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/photo-gallery?admin=true');
      const result = await response.json();

      if (result.success && result.data) {
        const transformed = result.data.map(transformPhoto);
        setPhotos(transformed);
      } else {
        setError(result.error || 'Failed to load photos');
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Show toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Open modal for new photo
  const openNewModal = () => {
    setEditingPhoto(null);
    setFormData({
      title: '',
      description: '',
      category: 'general',
      imageUrl: '',
      thumbnailUrl: '',
    });
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (photo: PhotoGalleryDisplay) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description || '',
      category: photo.category,
      imageUrl: photo.imageUrl,
      thumbnailUrl: photo.thumbnailUrl || '',
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingPhoto(null);
    setFormData({
      title: '',
      description: '',
      category: 'general',
      imageUrl: '',
      thumbnailUrl: '',
    });
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch('/api/photo-gallery/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: result.url,
          thumbnailUrl: result.thumbnailUrl,
        }));
        showToast('Image uploaded successfully', 'success');
      } else {
        showToast(result.error || 'Failed to upload image', 'error');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      showToast('Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save photo (create or update)
  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl) {
      showToast('Title and image are required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingPhoto
        ? `/api/photo-gallery/${editingPhoto.id}`
        : '/api/photo-gallery';

      const response = await fetch(url, {
        method: editingPhoto ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          imageUrl: formData.imageUrl,
          thumbnailUrl: formData.thumbnailUrl || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          editingPhoto ? 'Photo updated successfully' : 'Photo added successfully',
          'success'
        );
        closeModal();
        fetchPhotos();
      } else {
        showToast(result.error || 'Failed to save photo', 'error');
      }
    } catch (err) {
      console.error('Error saving photo:', err);
      showToast('Failed to save photo', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle photo visibility
  const toggleVisibility = async (photo: PhotoGalleryDisplay) => {
    try {
      const response = await fetch(`/api/photo-gallery/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !photo.isActive }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          photo.isActive ? 'Photo hidden from gallery' : 'Photo now visible in gallery',
          'success'
        );
        fetchPhotos();
      } else {
        showToast(result.error || 'Failed to update photo', 'error');
      }
    } catch (err) {
      console.error('Error toggling visibility:', err);
      showToast('Failed to update photo', 'error');
    }
  };

  // Delete photo
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/photo-gallery/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        showToast('Photo deleted successfully', 'success');
        setDeleteConfirm(null);
        fetchPhotos();
      } else {
        showToast(result.error || 'Failed to delete photo', 'error');
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
      showToast('Failed to delete photo', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Photo Gallery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage photos displayed on the public gallery page
            </p>
          </div>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Photo
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading photos...</p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchPhotos}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && photos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No photos yet. Add your first photo!</p>
          <button
            onClick={openNewModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Photo
          </button>
        </div>
      )}

      {/* Photo Grid */}
      {!isLoading && !error && photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 ${
                !photo.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              <div className="aspect-[4/3] relative">
                <Image
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.title}
                  fill
                  className="object-cover"
                />
                {!photo.isActive && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                    <span className="text-white font-medium">Hidden</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{photo.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{photo.category}</p>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => toggleVisibility(photo)}
                  className="p-1.5 rounded bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 shadow text-gray-700 dark:text-gray-200"
                  title={photo.isActive ? 'Hide from gallery' : 'Show in gallery'}
                >
                  {photo.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => openEditModal(photo)}
                  className="p-1.5 rounded bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 shadow text-gray-700 dark:text-gray-200"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(photo.id)}
                  className="p-1.5 rounded bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 shadow text-red-600 dark:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingPhoto ? 'Edit Photo' : 'Add New Photo'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Image Upload/Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image *
                </label>
                {formData.imageUrl ? (
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={formData.thumbnailUrl || formData.imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '', thumbnailUrl: '' }))}
                      className="absolute top-2 right-2 p-1.5 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700"
                  >
                    {isUploading ? (
                      <p className="text-gray-500 dark:text-gray-400">Uploading...</p>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPEG, PNG, WebP, RAW up to 100MB</p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Photo title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PHOTO_CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.title || !formData.imageUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : editingPhoto ? 'Update' : 'Add Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Photo?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone. The photo will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
