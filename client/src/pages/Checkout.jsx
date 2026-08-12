import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, HandCoins } from 'lucide-react';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { ALGERIA_PROVINCES } from '../data/algeriaProvinces.js';
import { formatPrice } from '../utils/format.js';
import { useBotProtection } from '../utils/botProtection.js';
import { trackInitiateCheckout, trackPurchase } from '../utils/pixels.js';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { t, lang } = useLang();
  const { settings, getShippingFee } = useSettings();
  const navigate = useNavigate();
  const { getToken, containerRef } = useBotProtection(settings?.botProtection);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length) trackInitiateCheckout(items, subtotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shippingFee = provinceCode ? getShippingFee(provinceCode) : 0;
  const total = subtotal + shippingFee;

  const provinceOptions = useMemo(() => ALGERIA_PROVINCES, []);

  if (items.length === 0) {
    return (
      <div className="container-shop py-24 text-center">
        <p className="mb-4 text-ink/60">{t('cart.empty')}</p>
        <Link to="/shop" className="btn-primary">
          {t('cart.emptyCta')}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const eventId = crypto.randomUUID();
      const botToken = await getToken();

      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ product: i.productId, quantity: i.quantity })),
        customer: { fullName, phone, provinceCode: Number(provinceCode), commune, address },
        botToken,
        eventId,
      });

      trackPurchase(data.order, data.eventId);
      clearCart();
      navigate('/thank-you', { state: { order: data.order } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-shop py-8">
      <h1 className="mb-2 font-display text-2xl font-black text-ink">{t('checkout.title')}</h1>
      <p className="mb-6 flex items-center gap-1.5 text-sm font-bold text-accent-700">
        <HandCoins size={16} /> {t('checkout.codOnly')}
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-black text-ink">{t('checkout.deliveryInfo')}</h2>

          <div>
            <label className="label">{t('cod.fullName')}</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={3} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('cod.phone')}</label>
              <input
                className="input"
                placeholder={t('cod.phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
              />
            </div>
            <div>
              <label className="label">{t('cod.province')}</label>
              <select className="input" value={provinceCode} onChange={(e) => setProvinceCode(e.target.value)} required>
                <option value="">{t('cod.selectProvince')}</option>
                {provinceOptions.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code}. {lang === 'ar' ? p.nameAr : p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('cod.commune')}</label>
              <input className="input" value={commune} onChange={(e) => setCommune(e.target.value)} maxLength={150} />
            </div>
            <div>
              <label className="label">{t('cod.address')}</label>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} />
            </div>
          </div>

          <div ref={containerRef} />

          <button type="submit" disabled={submitting} className="btn-accent w-full text-base">
            {submitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs font-bold text-accent-700">
            <ShieldCheck size={14} />
            {t('cod.paymentNote')}
          </p>
        </form>

        <div className="card h-fit p-6">
          <h2 className="mb-4 font-display text-lg font-black text-ink">{t('checkout.orderSummary')}</h2>
          <ul className="mb-4 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 text-sm">
                <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="line-clamp-1 font-bold text-ink">{lang === 'ar' && item.titleAr ? item.titleAr : item.title}</p>
                  <p className="text-ink/50">x{item.quantity}</p>
                </div>
                <p className="tnum font-bold">{formatPrice(item.price * item.quantity, lang)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-ink/60">
              <span>{t('cart.subtotal')}</span>
              <span className="tnum">{formatPrice(subtotal, lang)}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>{t('checkout.shipping')}</span>
              <span className="tnum">{provinceCode ? formatPrice(shippingFee, lang) : '—'}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-black text-ink">
              <span>{t('checkout.total')}</span>
              <span className="tnum text-primary-700">{formatPrice(total, lang)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
