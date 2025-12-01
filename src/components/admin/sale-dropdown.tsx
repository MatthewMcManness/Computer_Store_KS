'use client';

import { useState, useEffect } from 'react';
import { Tag, ChevronDown, Check, Loader2 } from 'lucide-react';
import type { SaleType, SaleConfig } from '@/types/gallery';

interface SaleDropdownProps {
  onSaleChange?: (saleType: SaleType, affectedCount: number) => void;
}

export function SaleDropdown({ onSaleChange }: SaleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSale, setCurrentSale] = useState<SaleType>('none');
  const [availableSales, setAvailableSales] = useState<SaleConfig[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load current sale setting
  useEffect(() => {
    const loadSaleSetting = async () => {
      try {
        const response = await fetch('/api/gallery/sale');
        const result = await response.json();

        if (result.success) {
          setCurrentSale(result.data.currentSale);
          setAvailableSales(result.data.availableSales);
        }
      } catch (err) {
        console.error('Failed to load sale setting:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSaleSetting();
  }, []);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle sale selection
  const handleSelectSale = async (saleType: SaleType) => {
    if (saleType === currentSale) {
      setIsOpen(false);
      return;
    }

    const saleConfig = availableSales.find(s => s.type === saleType);
    const confirmMessage = saleType === 'none'
      ? 'This will remove the sale from all computers. Continue?'
      : `This will apply ${saleConfig?.name} to all computers. Continue?`;

    if (!confirm(confirmMessage)) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    setIsOpen(false);

    try {
      const response = await fetch('/api/gallery/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleType }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentSale(saleType);
        showToast(result.message, 'success');
        onSaleChange?.(saleType, result.data.affectedComputers);
      } else {
        showToast(result.error || 'Failed to update sale', 'error');
      }
    } catch (err) {
      console.error('Failed to update sale:', err);
      showToast('Failed to update sale', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const currentSaleConfig = availableSales.find(s => s.type === currentSale);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          currentSale !== 'none'
            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Tag className="h-4 w-4" />
        )}
        <span>{currentSaleConfig?.name || 'No Sale'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Select Sale
            </div>
            {availableSales.map((sale) => (
              <button
                key={sale.type}
                onClick={() => handleSelectSale(sale.type)}
                className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors ${
                  currentSale === sale.type
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{sale.name}</span>
                {currentSale === sale.type && (
                  <Check className="h-4 w-4 text-purple-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-lg p-4 shadow-lg ${
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
