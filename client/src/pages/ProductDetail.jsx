import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import api from '../api/axios.js';
import { useLang } from '../context/LangContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import ImageGallery from '../components/product/ImageGallery.jsx';
import StarRating from '../components/product/StarRating.jsx';
import CODExpressForm from '../components/product/CODExpressForm.jsx';
import ReviewSection from '../components/product/ReviewSection.jsx';
import { formatPrice, discountPercent } from '../utils/format.js';
import { trackViewContent } from '../utils/pixels.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.product);
        trackViewContent(data.product);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="container-shop py-16 text-center text-ink/40">…</div>;
  }

  if (!product) {
    return (
      <div className="container-shop py-24 text-center">
        <p className="mb-4 text-ink/60">Product not found</p>
        <Link to="/shop" className="btn-primary">
          {t('nav.shop')}
        </Link>
      </div>
    );
  }

  const title = lang === 'ar' && product.titleAr ? product.titleAr : product.title;
  const description = lang === 'ar' && product.descriptionAr ? product.descriptionAr : product.description;
  const pct = discountPercent(product.price, product.discountedPrice);

  return (
    <div className="container-shop py-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ImageGallery images={product.images} alt={title} />

        <div>
          <p className="mb-1 text-sm font-bold uppercase tracking-wide text-primary-600">{product.category}</p>
          <h1 className="mb-3 font-display text-2xl font-black text-ink sm:text-3xl">{title}</h1>

          {product.numReviews > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <StarRating rating={product.rating} size={17} />
              <span className="text-sm text-ink/50">
                {product.rating} ({product.numReviews} {t('product.reviews')})
              </span>
            </div>
          )}

          <div className="mb-5 flex items-center gap-3 tnum">
            <span className="font-display text-3xl font-black text-primary-700">
              {formatPrice(product.discountedPrice ?? product.price, lang)}
            </span>
            {pct > 0 && (
              <>
                <span className="text-lg text-ink/40 line-through">{formatPrice(product.price, lang)}</span>
                <span className="badge-sale">-{pct}%</span>
              </>
            )}
          </div>

          <div className="mb-5 flex items-center gap-2 text-sm font-bold">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1 text-accent-600">
                <Check size={16} /> {t('product.inStock')}
              </span>
            ) : (
              <span className="text-sale">{t('product.outOfStock')}</span>
            )}
          </div>

          <p className="mb-6 whitespace-pre-line leading-relaxed text-ink/70">{description}</p>

          <button
            onClick={() => addItem(product, 1)}
            disabled={product.stock === 0}
            className="btn-primary mb-6 w-full sm:w-auto"
          >
            <ShoppingCart size={18} />
            {t('product.addToCart')}
          </button>

          <CODExpressForm product={product} />
        </div>
      </div>

      <div className="mt-16 border-t border-slate-100 pt-10">
        <ReviewSection product={product} onReviewAdded={setProduct} />
      </div>
    </div>
  );
}
