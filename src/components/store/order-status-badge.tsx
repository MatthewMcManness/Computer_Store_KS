/**
 * Colored badge for order lifecycle status.
 *
 * Maps each OrderStatus to a specific color scheme and human-readable label.
 *
 * @param status - Order lifecycle status
 *
 * @functions_called none
 * @called_by OrderDetailPage, OrderListPage, AccountOrderRow
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import type { OrderStatus } from '@/types/store';
import { clsx } from 'clsx';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { classes: string; label: string }> = {
  pending: {
    classes: 'bg-yellow-100 text-yellow-800',
    label: 'Pending',
  },
  payment_confirmed: {
    classes: 'bg-blue-100 text-blue-800',
    label: 'Payment Confirmed',
  },
  submitted_to_supplier: {
    classes: 'bg-indigo-100 text-indigo-800',
    label: 'Submitted to Supplier',
  },
  processing: {
    classes: 'bg-purple-100 text-purple-800',
    label: 'Processing',
  },
  shipped: {
    classes: 'bg-green-100 text-green-800',
    label: 'Shipped',
  },
  delivered: {
    classes: 'bg-emerald-100 text-emerald-800',
    label: 'Delivered',
  },
  cancelled: {
    classes: 'bg-red-100 text-red-800',
    label: 'Cancelled',
  },
  refunded: {
    classes: 'bg-gray-100 text-gray-800',
    label: 'Refunded',
  },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { classes, label } = statusConfig[status];

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        classes
      )}
    >
      {label}
    </span>
  );
}
