import React from 'react';
import { Truck } from 'lucide-react';
import { useLang } from '../../context/LangContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export default function AnnouncementBar() {
  const { lang } = useLang();
  const { settings } = useSettings();

  const text =
    settings?.announcement?.[lang] ||
    (lang === 'ar'
      ? 'الدفع عند الاستلام والتوصيل إلى جميع الولايات 🚚'
      : 'Paiement à la livraison partout en Algérie 🚚');

  if (settings && settings.announcement?.active === false) return null;

  return (
    <div className="bg-primary-600 text-white">
      <div className="container-shop flex items-center justify-center gap-2 py-2 text-center text-xs font-bold sm:text-sm">
        <Truck size={16} className="flip-rtl shrink-0" />
        <span>{text}</span>
      </div>
    </div>
  );
}
