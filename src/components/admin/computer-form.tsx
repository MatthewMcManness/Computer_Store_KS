'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from './image-upload';
import type { GalleryComputer, GallerySpec, ComputerFormData } from '@/types/gallery';

interface ComputerFormProps {
  computer?: GalleryComputer;
  onSubmit?: (data: ComputerFormData) => Promise<void>;
  isLoading?: boolean;
}

// Spec configurations
const specConfigs = {
  desktop: [
    { label: 'Graphics Card', placeholder: 'e.g., RTX 4060 Ti' },
    { label: 'Processor', placeholder: 'e.g., Intel i7-12700K' },
    { label: 'Memory', placeholder: 'e.g., 32GB DDR4' },
    { label: 'Storage', placeholder: 'e.g., 1TB NVMe SSD' },
  ],
  laptop: [
    { label: 'Display Size', placeholder: 'e.g., 15.6 Inches' },
    { label: 'Processor', placeholder: 'e.g., Intel i7-12700H' },
    { label: 'Memory', placeholder: 'e.g., 16GB DDR4' },
    { label: 'Storage', placeholder: 'e.g., 512GB NVMe SSD' },
  ],
};

const warrantyConfigs = {
  refurbished: [
    { label: 'Parts Warranty', defaultValue: '3 Months' },
    { label: 'Free Diagnostics', defaultValue: '6 Months' },
  ],
  custom: [
    { label: 'Manufacturer Warranty', defaultValue: '1 Year' },
    { label: 'Free Diagnostics', defaultValue: 'Lifetime' },
  ],
  new: [
    { label: 'Manufacturer Warranty', defaultValue: '1 Year' },
    { label: 'Free Diagnostics', defaultValue: 'Lifetime' },
  ],
};

export function ComputerForm({ computer, onSubmit, isLoading }: ComputerFormProps) {
  const router = useRouter();
  const isEditing = !!computer;

  const [formData, setFormData] = useState({
    name: computer?.name || '',
    type: computer?.type || 'desktop' as 'desktop' | 'laptop',
    category: computer?.category || 'custom' as 'custom' | 'refurbished' | 'new',
    price: computer?.price || '',
    image: computer?.image || '',
  });

  const [specs, setSpecs] = useState<GallerySpec[]>([]);
  const [hasGraphicsCard, setHasGraphicsCard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize specs based on type and category
  useEffect(() => {
    generateSpecs(formData.type, formData.category, computer?.specs);
  }, [formData.type, formData.category]);

  const findSpecValue = (existingSpecs: GallerySpec[] | undefined, label: string): string => {
    if (!existingSpecs) return '';
    const spec = existingSpecs.find(s =>
      s.label.replace(/::?$/, '').trim() === label
    );
    return spec?.value || '';
  };

  const generateSpecs = (
    type: 'desktop' | 'laptop',
    category: 'custom' | 'refurbished' | 'new',
    existingSpecs?: GallerySpec[]
  ) => {
    const typeConfig = specConfigs[type];
    const warrantyConfig = warrantyConfigs[category] || warrantyConfigs.custom;

    const newSpecs: GallerySpec[] = [];

    // Add type-specific specs
    typeConfig.forEach(config => {
      newSpecs.push({
        label: config.label,
        value: findSpecValue(existingSpecs, config.label),
      });
    });

    // Add warranty specs
    warrantyConfig.forEach(config => {
      newSpecs.push({
        label: config.label,
        value: findSpecValue(existingSpecs, config.label) || config.defaultValue,
      });
    });

    // Check for graphics card in laptops
    if (type === 'laptop' && existingSpecs) {
      const graphicsValue = findSpecValue(existingSpecs, 'Graphics Card');
      if (graphicsValue) {
        newSpecs.push({ label: 'Graphics Card', value: graphicsValue });
        setHasGraphicsCard(true);
      } else {
        setHasGraphicsCard(false);
      }
    } else if (type === 'desktop') {
      setHasGraphicsCard(true); // Desktops always have graphics card
    } else {
      setHasGraphicsCard(false);
    }

    setSpecs(newSpecs);
  };

  const addGraphicsCard = () => {
    if (hasGraphicsCard || formData.type !== 'laptop') return;
    setSpecs([...specs, { label: 'Graphics Card', value: '' }]);
    setHasGraphicsCard(true);
  };

  const updateSpec = (index: number, value: string) => {
    const newSpecs = [...specs];
    const spec = newSpecs[index];
    if (spec) {
      spec.value = value;
      setSpecs(newSpecs);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate
      if (!formData.name || !formData.price || !formData.image) {
        throw new Error('Please fill in all required fields');
      }

      const data: ComputerFormData = {
        name: formData.name,
        type: formData.type,
        category: formData.category,
        price: formData.price,
        image: formData.image,
        specs: specs.filter(s => s.value.trim() !== ''),
      };

      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default API call
        const url = isEditing
          ? `/api/gallery/${computer.id}`
          : '/api/gallery';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to save computer');
        }

        router.push('/admin/gallery');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Computer Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Gaming Pro Desktop"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          required
        />
      </div>

      {/* Type and Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'desktop' | 'laptop' })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          >
            <option value="desktop">Desktop</option>
            <option value="laptop">Laptop</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as 'custom' | 'refurbished' | 'new' })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          >
            <option value="custom">{formData.type === 'laptop' ? 'New' : 'Custom Build'}</option>
            <option value="refurbished">Refurbished</option>
            {formData.type === 'laptop' && <option value="new">New</option>}
          </select>
        </div>
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Price *
        </label>
        <input
          type="text"
          id="price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="$1,299"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          required
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image *
        </label>
        <ImageUpload
          currentImage={formData.image}
          computerType={formData.type}
          onImageChange={(image) => setFormData({ ...formData, image })}
        />
      </div>

      {/* Specifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Specifications *
        </label>
        <div className="space-y-3">
          {specs.map((spec, index) => (
            <div key={`${spec.label}-${index}`} className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={spec.label}
                readOnly
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-400"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => updateSpec(index, e.target.value)}
                placeholder={specConfigs[formData.type]?.find(s => s.label === spec.label)?.placeholder || 'Enter value'}
                className="col-span-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          ))}
        </div>

        {formData.type === 'laptop' && !hasGraphicsCard && (
          <button
            type="button"
            onClick={addGraphicsCard}
            className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            + Add Graphics Card
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || isLoading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting || isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Computer')}
        </button>
      </div>
    </form>
  );
}
