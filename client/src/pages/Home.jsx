import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, HandCoins } from 'lucide-react';
import api from '../api/axios.js';
import { useLang } from '../context/LangContext.jsx';
import TrustIndicators from '../components/layout/TrustIndicators.jsx';
import ProductCard from '../components/product/ProductCard.jsx';

export default function Home() {
  const { t, lang, dir } = useLang();
  const [trending, setTrending] = useState([]);
  const [newest, setNewest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    (async () => {
      try {
        const [trendingRes, newestRes, catRes] = await Promise.all([
          api.get('/products', { params: { trending: true, limit: 8 } }),
          api.get('/products', { params: { sort: 'newest', limit: 8 } }),
          api.get('/products/categories'),
        ]);
        setTrending(trendingRes.data.products);
        setNewest(newestRes.data.products);
        setCategories(catRes.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800">
        <div className="absolute -end-24 -top-24 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -start-16 bottom-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="container-shop relative flex flex-col items-center gap-6 py-16 text-center text-white sm:py-24">
          <span className="cod-stub border-white/40 bg-white/10 text-white">
            <HandCoins size={14} />
            {t('trust.cod')}
          </span>
          <h1 className="max-w-2xl font-display text-3xl font-black leading-tight sm:text-5xl">
            {t('home.heroTitle')}
          </h1>
          <p className="max-w-xl text-primary-100 sm:text-lg">{t('home.heroSubtitle')}</p>
          <Link to="/shop" className="btn-accent mt-2 px-8 py-3.5 text-base">
            {t('home.heroCta')}
            <ArrowIcon size={18} />
          </Link>
        </div>
      </section>

      <TrustIndicators />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-shop py-10">
          <h2 className="mb-5 font-display text-xl font-black text-ink">{t('home.categories')}</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/shop?category=${encodeURIComponent(cat)}`}
                className="rounded-full border-2 border-primary-100 bg-primary-50 px-5 py-2.5 text-sm font-bold text-primary-700 transition-colors hover:border-primary-600 hover:bg-primary-600 hover:text-white"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      <section className="container-shop py-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-ink">{t('home.trending')}</h2>
          <Link to="/shop" className="text-sm font-bold text-primary-600 hover:underline">
            {t('home.viewAll')}
          </Link>
        </div>
        {loading ? (
          <GridSkeleton />
        ) : trending.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {trending.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : null}
      </section>

      {/* New arrivals */}
      <section className="container-shop py-6 pb-16">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-ink">{t('home.newArrivals')}</h2>
          <Link to="/shop" className="text-sm font-bold text-primary-600 hover:underline">
            {t('home.viewAll')}
          </Link>
        </div>
        {loading ? (
          <GridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newest.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-sand" />
      ))}
    </div>
  );
}
