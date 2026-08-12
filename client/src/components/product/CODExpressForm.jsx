import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PhoneCall, Minus, Plus, ShieldCheck } from 'lucide-react';
import api from '../../api/axios.js';
import { useLang } from '../../context/LangContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { ALGERIA_PROVINCES } from '../../data/algeriaProvinces.js';
import { formatPrice } from '../../utils/format.js';
import { useBotProtection } from '../../utils/botProtection.js';
import { trackInitiateCheckout, trackPurchase } from '../../utils/pixels.js';

export default function CODExpressForm({ product }) {
  const { t, lang } = useLang();
  const { settings, getShippingFee } = useSettings();
  const navigate = useNavigate();
  const { getToken, containerRef } = useBotProtection(settings?.botProtection);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const unitPrice = product.discountedPrice ?? product.price;
  const shippingFee = provinceCode ? getShippingFee(provinceCode) : 0;
  const total = unitPrice * quantity + shippingFee;

  const maxQty = Math.min(product.stock ?? 10, 10);

  const provinceOptions = useMemo(() => ALGERIA_PROVINCES, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    setSubmitting(true);

    try {
      const eventId = crypto.randomUUID();
      trackInitiateCheckout(
        [{ productId: product._id, quantity }],
        total
      );

      const botToken = await getToken();

      const { data } = await api.post('/orders', {
        items: [{ product: product._id, quantity }],
        customer: { fullName, phone, provinceCode: Number(provinceCode), commune, address },
        botToken,
        eventId,
      });

      trackPurchase(data.order, data.eventId);
      navigate('/thank-you', { state: { order: data.order } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card border-2 border-accent-200 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white">
          <PhoneCall size={18} />
        </div>
        <div>
          <h3 className="font-display text-base font-black text-ink">{t('cod.title')}</h3>
          <p className="text-xs text-ink/50">{t('cod.subtitle')}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="label">{t('cod.fullName')}</label>
          <input
            className="input"
            placeholder={t('cod.fullNamePlaceholder')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={3}
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('cod.commune')}</label>
            <input
              className="input"
              placeholder={t('cod.communePlaceholder')}
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              maxLength={150}
            />
          </div>
          <div>
            <label className="label">{t('product.quantity')}</label>
            <div className="flex items-center rounded-xl border border-slate-200">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center text-ink/60 hover:text-primary-600"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} />
              </button>
              <span className="flex-1 text-center font-bold">{quantity}</span>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center text-ink/60 hover:text-primary-600"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="label">{t('cod.address')}</label>
          <input
            className="input"
            placeholder={t('cod.addressPlaceholder')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={300}
          />
        </div>
      </div>

      <div ref={containerRef} />

      <div className="mt-4 space-y-1 rounded-xl bg-sand p-3 text-sm">
        <div className="flex justify-between text-ink/60">
          <span>{t('cod.shippingFee')}</span>
          <span className="tnum">{provinceCode ? formatPrice(shippingFee, lang) : '—'}</span>
        </div>
        <div className="flex justify-between font-black text-ink">
          <span>{t('cod.total')}</span>
          <span className="tnum text-primary-700">{formatPrice(total, lang)}</span>
        </div>
      </div>

      <button type="submit" disabled={submitting || product.stock === 0} className="btn-accent mt-4 w-full text-base">
        {submitting ? t('cod.submitting') : t('cod.submit')}
      </button>

      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-xs font-bold text-accent-700">
        <ShieldCheck size={14} />
        {t('cod.paymentNote')}
      </p>
    </form>
  );
}
