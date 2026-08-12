import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { formatPrice } from '../utils/format.js';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { t, lang } = useLang();

  if (items.length === 0) {
    return (
      <div className="container-shop flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag size={48} className="text-slate-300" />
        <h1 className="font-display text-xl font-black text-ink">{t('cart.empty')}</h1>
        <Link to="/shop" className="btn-primary">
          {t('cart.emptyCta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-shop py-8">
      <h1 className="mb-6 font-display text-2xl font-black text-ink">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.productId} className="card flex gap-4 p-4">
              <img src={item.image} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="font-bold text-ink">{lang === 'ar' && item.titleAr ? item.titleAr : item.title}</p>
                  <p className="tnum mt-0.5 text-sm font-black text-primary-700">{formatPrice(item.price, lang)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      className="p-2 text-ink/60 hover:text-primary-600"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      className="p-2 text-ink/60 hover:text-primary-600"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="flex items-center gap-1 text-xs font-bold text-sale hover:underline"
                  >
                    <Trash2 size={14} /> {t('cart.remove')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="card h-fit p-5">
          <h2 className="mb-4 font-display text-lg font-black text-ink">{t('checkout.orderSummary')}</h2>
          <div className="mb-4 flex justify-between font-bold">
            <span>{t('cart.subtotal')}</span>
            <span className="tnum text-primary-700">{formatPrice(subtotal, lang)}</span>
          </div>
          <Link to="/checkout" className="btn-accent w-full">
            {t('cart.checkout')}
          </Link>
          <Link to="/shop" className="btn-ghost mt-2 w-full border border-slate-200">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
