import React from 'react';
import { Truck, PackageSearch, ShieldCheck, HandCoins } from 'lucide-react';
import { useLang } from '../../context/LangContext.jsx';

export default function TrustIndicators() {
  const { t } = useLang();

  const items = [
    { icon: Truck, title: t('trust.fastDelivery'), desc: t('trust.fastDeliveryDesc') },
    { icon: PackageSearch, title: t('trust.inspection'), desc: t('trust.inspectionDesc') },
    { icon: ShieldCheck, title: t('trust.warranty'), desc: t('trust.warrantyDesc') },
    { icon: HandCoins, title: t('trust.cod'), desc: t('trust.codDesc') },
  ];

  return (
    <div className="border-y border-slate-100 bg-sand">
      <div className="container-shop grid grid-cols-2 gap-4 py-6 sm:grid-cols-4 sm:gap-6">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-accent-600 shadow-card">
              <Icon size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-ink">{title}</p>
              <p className="text-xs text-ink/60">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
