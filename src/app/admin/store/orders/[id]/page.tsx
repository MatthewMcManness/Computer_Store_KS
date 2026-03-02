'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  Truck,
  User,
  MapPin,
  CreditCard,
  Clock,
  Save,
  CheckCircle,
  FileText,
} from 'lucide-react';
import type { StoreOrder, OrderStatus } from '@/types/store';

/** All order statuses for the status update dropdown. */
const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'payment_confirmed', label: 'Payment Confirmed' },
  { value: 'submitted_to_supplier', label: 'Submitted to Supplier' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

/**
 * Admin order detail page displaying full order information with editing capabilities.
 *
 * Shows customer info, shipping/billing addresses, line items with pricing,
 * status update controls, tracking information fields, TD Synnex PO data,
 * and an editable notes field.
 *
 * @returns {JSX.Element} Order detail page component
 *
 * @sideEffects
 * - Fetches order data from /api/admin/store/orders/[id] on mount
 * - Sends PATCH requests for status, tracking, and notes updates
 *
 * @functions_called fetch, useParams, useRouter
 * @called_by Next.js App Router (/admin/store/orders/[id])
 *
 * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
 */
export default function AdminStoreOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Editable fields
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [notes, setNotes] = useState('');

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await fetch(`/api/admin/store/orders/${orderId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Order not found');
          throw new Error('Failed to load order');
        }
        const data: StoreOrder = await response.json();
        setOrder(data);
        setStatus(data.status);
        setTrackingNumber(data.tracking_number || '');
        setTrackingCarrier(data.tracking_carrier || '');
        setNotes(data.notes || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
        console.error('[ORDER DETAIL] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  /**
   * Saves updated order fields (status, tracking, notes) via the admin API.
   *
   * @sideEffects Sends PATCH to /api/admin/store/orders/[id]
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/store/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber || null,
          tracking_carrier: trackingCarrier || null,
          notes: notes || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to save changes');
      const updatedOrder: StoreOrder = await response.json();
      setOrder(updatedOrder);
      showToast('Order updated successfully', 'success');
    } catch (err) {
      showToast('Failed to save changes', 'error');
      console.error('[ORDER DETAIL] Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Formats a number as a USD currency string.
   *
   * @param amount - Dollar amount
   * @returns Formatted currency string
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  /**
   * Formats an ISO datetime string for display.
   *
   * @param dateStr - ISO 8601 datetime string
   * @returns Formatted date/time string
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  /**
   * Returns Tailwind CSS classes for an order status badge.
   *
   * @param s - The order status value
   * @returns CSS class string for the badge
   *
   * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
   */
  const getStatusBadgeClasses = (s: OrderStatus): string => {
    switch (s) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'payment_confirmed':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'submitted_to_supplier':
        return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400';
      case 'processing':
        return 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400';
      case 'shipped':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'refunded':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Link
          href="/admin/store/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error || 'Order not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const hasChanges =
    status !== order.status ||
    (trackingNumber || '') !== (order.tracking_number || '') ||
    (trackingCarrier || '') !== (order.tracking_carrier || '') ||
    (notes || '') !== (order.notes || '');

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/admin/store/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Order {order.order_number}
            </h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
              {order.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Placed {formatDate(order.created_at)}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Package className="h-5 w-5 text-gray-400" />
                Items ({order.items?.length || 0})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SKU: {item.sku} | Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.total_price)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.unit_price)} each
                    </p>
                  </div>
                </div>
              )) || (
                <div className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No items loaded
                </div>
              )}
            </div>
            {/* Order Totals */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Tracking & Shipping */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <Truck className="h-5 w-5 text-gray-400" />
              Tracking Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Carrier
                </label>
                <input
                  type="text"
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  placeholder="e.g., UPS, FedEx, USPS"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* TD Synnex PO Info */}
          {(order.td_synnex_po_number || order.td_synnex_order_number) && (
            <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <FileText className="h-5 w-5 text-gray-400" />
                TD Synnex Fulfillment
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">PO Number</p>
                  <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                    {order.td_synnex_po_number || '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">TD Synnex Order #</p>
                  <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                    {order.td_synnex_order_number || '--'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about this order..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Info */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <User className="h-5 w-5 text-gray-400" />
              Customer
            </h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer_email}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <MapPin className="h-5 w-5 text-gray-400" />
              Shipping Address
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p className="font-medium">{order.shipping_address.full_name}</p>
              <p>{order.shipping_address.address_line1}</p>
              {order.shipping_address.address_line2 && (
                <p>{order.shipping_address.address_line2}</p>
              )}
              <p>
                {order.shipping_address.city}, {order.shipping_address.state}{' '}
                {order.shipping_address.zip_code}
              </p>
              {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
            </div>
          </div>

          {/* Billing Address */}
          {order.billing_address && (
            <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <CreditCard className="h-5 w-5 text-gray-400" />
                Billing Address
              </h2>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p className="font-medium">{order.billing_address.full_name}</p>
                <p>{order.billing_address.address_line1}</p>
                {order.billing_address.address_line2 && (
                  <p>{order.billing_address.address_line2}</p>
                )}
                <p>
                  {order.billing_address.city}, {order.billing_address.state}{' '}
                  {order.billing_address.zip_code}
                </p>
                {order.billing_address.phone && <p>{order.billing_address.phone}</p>}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <CreditCard className="h-5 w-5 text-gray-400" />
              Payment
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Stripe Session</p>
                <p className="mt-0.5 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                  {order.stripe_session_id || '--'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Payment Intent</p>
                <p className="mt-0.5 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                  {order.stripe_payment_intent_id || '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <Clock className="h-5 w-5 text-gray-400" />
              Timeline
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Order Created</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.created_at)}</p>
                </div>
              </div>
              {order.updated_at !== order.created_at && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Last Updated</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-lg p-4 shadow-lg ${
          toast.type === 'success'
            ? 'border-l-4 border-green-500 bg-white dark:bg-gray-900'
            : 'border-l-4 border-red-500 bg-white dark:bg-gray-900'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <p className={`text-sm font-medium ${
              toast.type === 'success' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
            }`}>
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
