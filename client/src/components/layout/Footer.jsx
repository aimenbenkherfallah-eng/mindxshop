import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, HandCoins } from 'lucide-react';
import { useLang } from '../../context/LangContext.jsx';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="mt-16 border-t border-slate-100 bg-sand">
      <div className="container-shop grid grid-cols-1 gap-8 py-12 sm:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 font-display text-sm font-black text-white">
              S
            </span>
            <span className="font-display text-base font-black text-primary-700">Sidahmed Shop</span>
          </div>
          <h4 className="mb-2 text-sm font-bold text-ink">{t('footer.about')}</h4>
          <p className="text-sm leading-relaxed text-ink/60">{t('footer.aboutText')}</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-ink">{t('footer.links')}</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li>
              <Link to="/" className="hover:text-primary-600">
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-primary-600">
                {t('nav.shop')}
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-primary-600">
                {t('nav.cart')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-ink">{t('footer.contact')}</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-accent-600" /> 0550 00 00 00
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-accent-600" /> Algérie
            </li>
            <li className="cod-stub mt-1">
              <HandCoins size={14} /> {t('trust.cod')}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4">
        <p className="container-shop text-center text-xs text-ink/50">
          © {new Date().getFullYear()} Sidahmed Shop — {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
