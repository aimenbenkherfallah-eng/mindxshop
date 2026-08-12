import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../api/axios.js';
import { useLang } from '../context/LangContext.jsx';
import ProductCard from '../components/product/ProductCard.jsx';

export default function ProductCatalog() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { category, minPrice, maxPrice, rating, search, sort, page, limit: 12 } })
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [category, minPrice, maxPrice, rating, search, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="container-shop py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-black text-ink">{t('nav.shop')}</h1>
        <button className="btn-outline py-2 lg:hidden" onClick={() => setFiltersOpen(true)}>
          <SlidersHorizontal size={16} />
          {t('filters.category')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters sidebar (desktop) */}
        <aside className="hidden lg:block">
          <FiltersPanel
            t={t}
            categories={categories}
            category={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
            rating={rating}
            updateParam={updateParam}
            clearFilters={clearFilters}
          />
        </aside>

        {/* Filters drawer (mobile) */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
            <div className="relative ms-auto h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-black">{t('filters.category')}</h3>
                <button onClick={() => setFiltersOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <FiltersPanel
                t={t}
                categories={categories}
                category={category}
                minPrice={minPrice}
                maxPrice={maxPrice}
                rating={rating}
                updateParam={updateParam}
                clearFilters={clearFilters}
              />
            </div>
          </div>
        )}

        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-ink/50">{products.length ? `${products.length} ${t('nav.shop')}` : ''}</p>
            <select className="input w-auto py-2" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
              <option value="newest">{t('filters.sortNewest')}</option>
              <option value="price_asc">{t('filters.sortPriceAsc')}</option>
              <option value="price_desc">{t('filters.sortPriceDesc')}</option>
              <option value="rating">{t('filters.sortRating')}</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-sand" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="py-16 text-center text-ink/50">{t('filters.noResults')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', String(p))}
                  className={`h-9 w-9 rounded-lg text-sm font-bold ${
                    p === page ? 'bg-primary-600 text-white' : 'bg-sand text-ink/60 hover:bg-primary-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FiltersPanel({ t, categories, category, minPrice, maxPrice, rating, updateParam, clearFilters }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="label mb-2">{t('filters.category')}</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('category', '')}
            className={`block w-full rounded-lg px-3 py-1.5 text-start text-sm ${!category ? 'bg-primary-50 font-bold text-primary-700' : 'text-ink/60 hover:bg-sand'}`}
          >
            {t('filters.allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              className={`block w-full rounded-lg px-3 py-1.5 text-start text-sm ${category === cat ? 'bg-primary-50 font-bold text-primary-700' : 'text-ink/60 hover:bg-sand'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="label mb-2">{t('filters.priceRange')}</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="input py-2 text-sm"
            placeholder={t('filters.min')}
            defaultValue={minPrice}
            onBlur={(e) => updateParam('minPrice', e.target.value)}
          />
          <span className="text-ink/40">—</span>
          <input
            type="number"
            className="input py-2 text-sm"
            placeholder={t('filters.max')}
            defaultValue={maxPrice}
            onBlur={(e) => updateParam('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div>
        <h4 className="label mb-2">{t('filters.rating')}</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('rating', '')}
            className={`block w-full rounded-lg px-3 py-1.5 text-start text-sm ${!rating ? 'bg-primary-50 font-bold text-primary-700' : 'text-ink/60 hover:bg-sand'}`}
          >
            {t('filters.anyRating')}
          </button>
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => updateParam('rating', String(r))}
              className={`block w-full rounded-lg px-3 py-1.5 text-start text-sm ${rating === String(r) ? 'bg-primary-50 font-bold text-primary-700' : 'text-ink/60 hover:bg-sand'}`}
            >
              {r}+ ★
            </button>
          ))}
        </div>
      </div>

      <button onClick={clearFilters} className="btn-ghost w-full border border-slate-200 text-sm">
        {t('filters.clear')}
      </button>
    </div>
  );
}
