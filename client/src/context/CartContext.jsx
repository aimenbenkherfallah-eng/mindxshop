import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { trackAddToCart } from '../utils/pixels.js';
import { useLang } from './LangContext.jsx';

const STORAGE_KEY = 'sidahmed_cart';
const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { lang } = useLang();
  const [items, setItems] = useState(loadCart);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1, { silent = false } = {}) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      const maxQty = product.stock ?? 99;
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxQty);
        return prev.map((i) => (i.productId === product._id ? { ...i, quantity: nextQty } : i));
      }
      return [
        ...prev,
        {
          productId: product._id,
          slug: product.slug,
          title: product.title,
          titleAr: product.titleAr,
          image: product.images?.[0],
          price: product.discountedPrice ?? product.price,
          stock: maxQty,
          quantity: Math.min(quantity, maxQty),
        },
      ];
    });
    trackAddToCart(product, quantity);
    if (!silent) {
      toast.success(lang === 'ar' ? 'تمت الإضافة إلى السلة' : 'Ajouté au panier');
      setDrawerOpen(true);
    }
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId));

  const updateQuantity = (productId, quantity) =>
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock || 99)) } : i))
    );

  const clearCart = () => setItems([]);

  const { subtotal, totalQuantity } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        subtotal: acc.subtotal + i.price * i.quantity,
        totalQuantity: acc.totalQuantity + i.quantity,
      }),
      { subtotal: 0, totalQuantity: 0 }
    );
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalQuantity,
    isDrawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
