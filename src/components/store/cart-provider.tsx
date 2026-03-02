'use client';

/**
 * React Context provider for shopping cart state.
 *
 * Persists cart to localStorage for guests and syncs with the server
 * for authenticated users. Exposes cart mutations and computed totals
 * via the useCart hook.
 *
 * @functions_called none (context provider)
 * @called_by RootLayout, StoreLayout
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { CartItem, CartItemData } from '@/types/store';

const STORAGE_KEY = 'csk-store-cart';

/** Default shipping rate when we cannot fetch config. */
const DEFAULT_SHIPPING_RATE = 9.99;

/** Default free shipping threshold. */
const DEFAULT_FREE_SHIPPING_THRESHOLD = 50;

/** Default tax rate (6.5% Kansas). */
const DEFAULT_TAX_RATE = 0.065;

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Load cart items from localStorage.
 *
 * @returns Persisted cart items or empty array
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */
function loadLocalCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * Persist cart items to localStorage.
 *
 * @param items - Cart items to persist
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */
function saveLocalCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable; silently ignore.
  }
}

/**
 * Extract minimal data for server sync.
 *
 * @param items - Full cart items
 * @returns Minimal cart item data array
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */
function toItemData(items: CartItem[]): CartItemData[] {
  return items.map(({ product_id, sku, quantity }) => ({
    product_id,
    sku,
    quantity,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadLocalCart());
    setHydrated(true);
  }, []);

  // Attempt to load server cart on mount (if user is logged in)
  useEffect(() => {
    if (!hydrated) return;

    async function fetchServerCart() {
      try {
        const res = await fetch('/api/store/cart');
        if (!res.ok) return;
        const data = await res.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items as CartItem[]);
        }
      } catch {
        // Not logged in or endpoint unavailable; use local cart.
      }
    }

    fetchServerCart();
  }, [hydrated]);

  // Persist to localStorage and debounce server sync whenever items change
  useEffect(() => {
    if (!hydrated) return;
    saveLocalCart(items);

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      fetch('/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: toItemData(items) }),
      }).catch(() => {
        // Server sync failed; local cart is still saved.
      });
    }, 1000);
  }, [items, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id);
      if (existing) {
        const newQty = Math.min(
          existing.quantity + item.quantity,
          item.max_quantity
        );
        return prev.map((i) =>
          i.product_id === item.product_id ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.product_id === productId
            ? { ...i, quantity: Math.min(quantity, i.max_quantity) }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      Math.round(
        items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100
      ) / 100,
    [items]
  );

  const shipping = useMemo(
    () => (subtotal >= DEFAULT_FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_RATE),
    [subtotal]
  );

  const tax = useMemo(
    () => Math.round(subtotal * DEFAULT_TAX_RATE * 100) / 100,
    [subtotal]
  );

  const total = useMemo(
    () => Math.round((subtotal + shipping + tax) * 100) / 100,
    [subtotal, shipping, tax]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      shipping,
      tax,
      total,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, shipping, tax, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Access the cart context. Must be used within a CartProvider.
 *
 * @returns Cart context value with items, mutations, and computed totals
 * @throws Error if used outside of CartProvider
 *
 * @version 1.0.0 - 2026-03-02T19:01:13Z - Initial implementation
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
