import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import StarRating from './StarRating.jsx';
import { useLang } from '../../context/LangContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice, discountPercent } from '../../utils/format.js';

export default function ProductCard({ product }) {
  const { t, lang } = useLang();
  const { addItem } = useCart();

  const title = lang === 'ar' && product.titleAr ? product.titleAr : product.title;
  const pct = discountPercent(product.price, product.discountedPrice);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <Link
      to={`/product/${product.slug || product._id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-cardHover"
    >
      <div className="relative aspect-square overflow-hidden bg-sand">
        <img
          src={product.images?.[0]}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {pct > 0 && <span className="badge-sale absolute top-2 start-2">-{pct}%</span>}
        {product.stock === 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-bold text-ink">
            {t('product.outOfStock')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-bold text-ink">{title}</p>

        {product.numReviews > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.rating} size={13} />
            <span className="text-xs text-ink/50">({product.numReviews})</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-1">
          <div className="tnum">
            <p className="font-display text-base font-black text-primary-700">
              {formatPrice(product.discountedPrice ?? product.price, lang)}
            </p>
            {pct > 0 && (
              <p className="text-xs text-ink/40 line-through">{formatPrice(product.price, lang)}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white transition-transform hover:bg-primary-700 active:scale-90 disabled:opacity-40"
            aria-label={t('product.addToCart')}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
