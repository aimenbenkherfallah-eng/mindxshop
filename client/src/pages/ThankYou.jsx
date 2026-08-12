import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2, PhoneCall, Home as HomeIcon, ShoppingBag } from 'lucide-react';
import { useLang } from '../context/LangContext.jsx';
import { formatPrice } from '../utils/format.js';

export default function ThankYou() {
  const { t, lang } = useLang();
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-shop flex flex-col items-center py-16 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent-50 text-accent-600 animate-slideUp">
        <CheckCircle2 size={44} />
      </div>

      <h1 className="mb-2 font-display text-2xl font-black text-ink sm:text-3xl">{t('thankyou.title')}</h1>
      <p className="mb-6 max-w-md text-ink/60">{t('thankyou.message')}</p>

      <div className="card mb-6 w-full max-w-sm p-5 text-start">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-sm text-ink/50">{t('thankyou.orderNumber')}</span>
          <span className="font-display font-black text-primary-700">{order.orderNumber}</span>
        </div>
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-ink/50">{t('checkout.total')}</span>
          <span className="tnum font-bold">{formatPrice(order.totalPrice, lang)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink/50">{t('cod.province')}</span>
          <span className="font-bold">{order.customer?.provinceName}</span>
        </div>
      </div>

      <div className="cod-stub mb-8">
        <PhoneCall size={14} />
        {t('thankyou.callSoon')}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-outline">
          <HomeIcon size={16} />
          {t('thankyou.backHome')}
        </Link>
        <Link to="/shop" className="btn-primary">
          <ShoppingBag size={16} />
          {t('thankyou.continueShopping')}
        </Link>
      </div>
    </div>
  );
}
