import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Languages } from 'lucide-react';
import { useLang } from '../../context/LangContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function Navbar() {
  const { t, lang, toggleLang } = useLang();
  const { totalQuantity, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : '/shop');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="container-shop flex h-16 items-center gap-4">
        <button
          className="rounded-lg p-2 hover:bg-sand lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 font-display text-lg font-black text-white">
            S
          </span>
          <span className="font-display text-lg font-black text-primary-700">Sidahmed Shop</span>
        </Link>

        <nav className="hidden items-center gap-6 font-bold text-ink/80 lg:flex">
          <Link to="/" className="hover:text-primary-600">
            {t('nav.home')}
          </Link>
          <Link to="/shop" className="hover:text-primary-600">
            {t('nav.shop')}
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="mx-auto hidden max-w-md flex-1 items-center md:flex">
          <div className="relative w-full">
            <input
              className="input py-2.5 ps-10"
              placeholder={t('nav.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </form>

        <div className="ms-auto flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-bold text-ink/70 hover:bg-sand"
            aria-label="toggle language"
          >
            <Languages size={18} />
            <span className="hidden sm:inline">{lang === 'ar' ? 'FR' : 'AR'}</span>
          </button>

          <button
            onClick={openDrawer}
            className="relative rounded-lg p-2 hover:bg-sand"
            aria-label={t('nav.cart')}
          >
            <ShoppingCart size={22} />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-xs font-bold text-white">
                {totalQuantity}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white p-4 lg:hidden">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <input
                className="input py-2.5 ps-10"
                placeholder={t('nav.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </form>
          <div className="flex flex-col gap-3 font-bold">
            <Link to="/" onClick={() => setMobileOpen(false)}>
              {t('nav.home')}
            </Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)}>
              {t('nav.shop')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
