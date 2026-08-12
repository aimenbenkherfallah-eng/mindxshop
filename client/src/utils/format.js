export const formatPrice = (value, lang = 'ar') => {
  const n = Number(value) || 0;
  const formatted = new Intl.NumberFormat('en-US').format(n);
  return lang === 'ar' ? `${formatted} دج` : `${formatted} DA`;
};

export const discountPercent = (price, discountedPrice) => {
  if (!discountedPrice || discountedPrice >= price) return 0;
  return Math.round(((price - discountedPrice) / price) * 100);
};

export const formatDate = (date, lang = 'ar') =>
  new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
