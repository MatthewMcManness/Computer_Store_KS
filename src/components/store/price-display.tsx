/**
 * Price display with optional MSRP comparison.
 *
 * Shows the retail price prominently. If MSRP is higher, shows a
 * crossed-out MSRP and a "Save X%" badge.
 *
 * @param price - Current retail price
 * @param msrp - Optional manufacturer's suggested retail price
 * @param size - Display size variant
 *
 * @functions_called formatPrice
 * @called_by ProductCard, ProductDetail
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import { formatPrice } from '@/lib/store/pricing';
import { clsx } from 'clsx';

interface PriceDisplayProps {
  price: number;
  msrp?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({ price, msrp, size = 'md' }: PriceDisplayProps) {
  const hasSaving = msrp != null && msrp > price;
  const savePercent = hasSaving
    ? Math.round(((msrp - price) / msrp) * 100)
    : 0;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span
        className={clsx(
          'font-bold text-gray-900',
          size === 'sm' && 'text-base',
          size === 'md' && 'text-lg',
          size === 'lg' && 'text-2xl'
        )}
      >
        {formatPrice(price)}
      </span>

      {hasSaving && (
        <>
          <span
            className={clsx(
              'line-through text-gray-400',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {formatPrice(msrp)}
          </span>
          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-700">
            Save {savePercent}%
          </span>
        </>
      )}
    </div>
  );
}
