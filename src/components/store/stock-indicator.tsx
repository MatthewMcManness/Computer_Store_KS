/**
 * Stock status indicator dot with label.
 *
 * Renders a colored dot and text label based on the product's stock status.
 *
 * @param status - Stock status enum value
 *
 * @functions_called none
 * @called_by ProductCard, ProductDetail, CartItemRow
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import type { StockStatus } from '@/types/store';
import { clsx } from 'clsx';

interface StockIndicatorProps {
  status: StockStatus;
}

const config: Record<StockStatus, { color: string; label: string }> = {
  in_stock: { color: 'bg-green-500', label: 'In Stock' },
  low_stock: { color: 'bg-yellow-500', label: 'Low Stock' },
  out_of_stock: { color: 'bg-red-500', label: 'Out of Stock' },
  discontinued: { color: 'bg-gray-400', label: 'Discontinued' },
};

export function StockIndicator({ status }: StockIndicatorProps) {
  const { color, label } = config[status];

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className={clsx('h-2 w-2 rounded-full', color)} aria-hidden />
      <span
        className={clsx(
          status === 'in_stock' && 'text-green-700',
          status === 'low_stock' && 'text-yellow-700',
          status === 'out_of_stock' && 'text-red-700',
          status === 'discontinued' && 'text-gray-500'
        )}
      >
        {label}
      </span>
    </span>
  );
}
