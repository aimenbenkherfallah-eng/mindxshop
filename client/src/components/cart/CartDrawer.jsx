import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useLang } from '../../context/LangContext.jsx';
import { formatPrice } from '../../utils/format.js';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, subtotal } = useCart();
  const { t, lang, dir } = useLang();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
      <div
        className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slideInEnd`}
        style={{ direction: dir }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-black text-ink">
            <ShoppingBag size={20} className="text-primary-600" />
            {t('cart.title')}
          </h2>
          <button onClick={closeDrawer} className="rounded-lg p-2 hover:bg-sand" aria-label="close">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag size={40} className="text-slate-300" />
              <p className="text-ink/50">{t('cart.empty')}</p>
              <Link to="/shop" onClick={closeDrawer} className="btn-outline">
                {t('cart.emptyCta')}
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <img src={item.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="line-clamp-2 text-sm font-bold text-ink">
                      {lang === 'ar' && item.titleAr ? item.titleAr : item.title}
                    </p>
                    <p className="tnum mt-0.5 text-sm font-black text-primary-700">{formatPrice(item.price, lang)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button
                          className="p-1.5 text-ink/60 hover:text-primary-600"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          className="p-1.5 text-ink/60 hover:text-primary-600"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-xs font-bold text-sale hover:underline"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between font-bold">
              <span>{t('cart.subtotal')}</span>
              <span className="tnum text-lg text-primary-700">{formatPrice(subtotal, lang)}</span>
            </div>
            <Link to="/checkout" onClick={closeDrawer} className="btn-accent w-full">
              {t('cart.checkout')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
