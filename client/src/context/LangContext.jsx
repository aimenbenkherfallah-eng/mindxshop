import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DICTIONARY = {
  ar: {
    'nav.shop': 'المتجر',
    'nav.home': 'الرئيسية',
    'nav.searchPlaceholder': 'ابحث عن منتج...',
    'nav.cart': 'السلة',
    'nav.admin': 'الإدارة',

    'trust.fastDelivery': 'توصيل سريع',
    'trust.fastDeliveryDesc': 'إلى جميع الولايات الـ69',
    'trust.inspection': 'افحص قبل الدفع',
    'trust.inspectionDesc': 'تأكد من المنتج عند الاستلام',
    'trust.warranty': 'ضمان الجودة',
    'trust.warrantyDesc': 'منتجات مضمونة 100%',
    'trust.cod': 'الدفع عند الاستلام',
    'trust.codDesc': 'ادفع نقدًا عند وصول طلبك',

    'home.heroTitle': 'تسوق الآن وادفع عند الاستلام',
    'home.heroSubtitle': 'توصيل سريع وآمن إلى جميع ولايات الجزائر الـ69 — بدون بطاقة بنكية، فقط اتصال هاتفي لتأكيد الطلب.',
    'home.heroCta': 'تسوق الآن',
    'home.trending': 'الأكثر مبيعًا',
    'home.categories': 'تسوق حسب الفئة',
    'home.viewAll': 'عرض الكل',
    'home.newArrivals': 'منتجات جديدة',

    'product.addToCart': 'أضف إلى السلة',
    'product.buyNow': 'اشترِ الآن',
    'product.outOfStock': 'نفدت الكمية',
    'product.inStock': 'متوفر',
    'product.quantity': 'الكمية',
    'product.category': 'الفئة',
    'product.reviews': 'التقييمات',
    'product.writeReview': 'أضف تقييمك',
    'product.noReviews': 'لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج.',
    'product.yourName': 'اسمك',
    'product.yourRating': 'تقييمك',
    'product.yourComment': 'رأيك في المنتج',
    'product.addPhotos': 'أضف صورًا (اختياري)',
    'product.submitReview': 'إرسال التقييم',
    'product.submitting': 'جارٍ الإرسال...',
    'product.reviewThanks': 'شكرًا! تم إضافة تقييمك.',
    'product.description': 'الوصف',
    'product.relatedProducts': 'منتجات مشابهة',

    'cod.title': 'اطلب الآن — الدفع عند الاستلام',
    'cod.subtitle': 'أدخل بياناتك وسنتصل بك لتأكيد الطلب',
    'cod.fullName': 'الاسم الكامل',
    'cod.fullNamePlaceholder': 'مثال: أحمد بن علي',
    'cod.phone': 'رقم الهاتف',
    'cod.phonePlaceholder': '05XX XX XX XX',
    'cod.province': 'الولاية',
    'cod.selectProvince': 'اختر ولايتك',
    'cod.commune': 'البلدية (اختياري)',
    'cod.communePlaceholder': 'اسم البلدية',
    'cod.address': 'العنوان (اختياري)',
    'cod.addressPlaceholder': 'الحي، الشارع، رقم المنزل...',
    'cod.submit': 'تأكيد الطلب',
    'cod.submitting': 'جارٍ إرسال الطلب...',
    'cod.paymentNote': 'الدفع نقدًا عند الاستلام فقط — لا حاجة لبطاقة بنكية',
    'cod.shippingFee': 'رسوم التوصيل',
    'cod.total': 'المجموع',

    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.emptyCta': 'تصفح المنتجات',
    'cart.continueShopping': 'مواصلة التسوق',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.checkout': 'إتمام الطلب',
    'cart.remove': 'إزالة',
    'cart.viewCart': 'عرض السلة',

    'checkout.title': 'إتمام الطلب',
    'checkout.orderSummary': 'ملخص الطلب',
    'checkout.shipping': 'التوصيل',
    'checkout.total': 'المجموع الكلي',
    'checkout.placeOrder': 'تأكيد الطلب — الدفع عند الاستلام',
    'checkout.placingOrder': 'جارٍ تأكيد الطلب...',
    'checkout.codOnly': 'الدفع عند الاستلام فقط، بدون أي رسوم إضافية أو بطاقة بنكية',
    'checkout.deliveryInfo': 'معلومات التوصيل',

    'thankyou.title': 'شكرًا لك! تم استلام طلبك',
    'thankyou.message': 'سيتصل بك أحد ممثلينا قريبًا لتأكيد الشحن.',
    'thankyou.orderNumber': 'رقم الطلب',
    'thankyou.callSoon': 'ترقب مكالمة هاتفية من فريقنا خلال 24 ساعة',
    'thankyou.backHome': 'العودة إلى الرئيسية',
    'thankyou.continueShopping': 'مواصلة التسوق',

    'footer.about': 'من نحن',
    'footer.aboutText': 'Sidahmed Shop متجر إلكتروني جزائري يوفر منتجات متنوعة بأسعار مناسبة مع خدمة الدفع عند الاستلام لجميع الولايات.',
    'footer.links': 'روابط',
    'footer.contact': 'تواصل معنا',
    'footer.rights': 'جميع الحقوق محفوظة',

    'filters.category': 'الفئة',
    'filters.allCategories': 'كل الفئات',
    'filters.priceRange': 'نطاق السعر',
    'filters.rating': 'التقييم',
    'filters.anyRating': 'أي تقييم',
    'filters.search': 'بحث',
    'filters.searchPlaceholder': 'ابحث عن منتج...',
    'filters.apply': 'تطبيق',
    'filters.clear': 'مسح الفلاتر',
    'filters.sort': 'ترتيب حسب',
    'filters.sortNewest': 'الأحدث',
    'filters.sortPriceAsc': 'السعر: الأقل أولاً',
    'filters.sortPriceDesc': 'السعر: الأعلى أولاً',
    'filters.sortRating': 'الأعلى تقييمًا',
    'filters.noResults': 'لا توجد منتجات مطابقة',
    'filters.min': 'من',
    'filters.max': 'إلى',
  },
  fr: {
    'nav.shop': 'Boutique',
    'nav.home': 'Accueil',
    'nav.searchPlaceholder': 'Rechercher un produit...',
    'nav.cart': 'Panier',
    'nav.admin': 'Admin',

    'trust.fastDelivery': 'Livraison rapide',
    'trust.fastDeliveryDesc': 'Vers les 69 wilayas',
    'trust.inspection': 'Vérifiez avant de payer',
    'trust.inspectionDesc': 'Inspectez le produit à la livraison',
    'trust.warranty': 'Garantie qualité',
    'trust.warrantyDesc': 'Produits 100% garantis',
    'trust.cod': 'Paiement à la livraison',
    'trust.codDesc': 'Payez en espèces à la réception',

    'home.heroTitle': 'Achetez maintenant, payez à la livraison',
    'home.heroSubtitle': 'Livraison rapide et sécurisée dans les 69 wilayas d\u2019Algérie — pas de carte bancaire, juste un appel pour confirmer.',
    'home.heroCta': 'Découvrir la boutique',
    'home.trending': 'Tendance',
    'home.categories': 'Acheter par catégorie',
    'home.viewAll': 'Voir tout',
    'home.newArrivals': 'Nouveautés',

    'product.addToCart': 'Ajouter au panier',
    'product.buyNow': 'Acheter maintenant',
    'product.outOfStock': 'Rupture de stock',
    'product.inStock': 'En stock',
    'product.quantity': 'Quantité',
    'product.category': 'Catégorie',
    'product.reviews': 'Avis',
    'product.writeReview': 'Laisser un avis',
    'product.noReviews': 'Aucun avis pour le moment. Soyez le premier à évaluer ce produit.',
    'product.yourName': 'Votre nom',
    'product.yourRating': 'Votre note',
    'product.yourComment': 'Votre avis',
    'product.addPhotos': 'Ajouter des photos (optionnel)',
    'product.submitReview': "Envoyer l'avis",
    'product.submitting': 'Envoi en cours...',
    'product.reviewThanks': 'Merci ! Votre avis a été ajouté.',
    'product.description': 'Description',
    'product.relatedProducts': 'Produits similaires',

    'cod.title': 'Commander — Paiement à la livraison',
    'cod.subtitle': 'Entrez vos coordonnées, nous vous appellerons pour confirmer',
    'cod.fullName': 'Nom complet',
    'cod.fullNamePlaceholder': 'ex: Ahmed Benali',
    'cod.phone': 'Numéro de téléphone',
    'cod.phonePlaceholder': '05XX XX XX XX',
    'cod.province': 'Wilaya',
    'cod.selectProvince': 'Sélectionnez votre wilaya',
    'cod.commune': 'Commune (optionnel)',
    'cod.communePlaceholder': 'Nom de la commune',
    'cod.address': 'Adresse (optionnel)',
    'cod.addressPlaceholder': 'Quartier, rue, numéro...',
    'cod.submit': 'Confirmer la commande',
    'cod.submitting': 'Envoi de la commande...',
    'cod.paymentNote': 'Paiement en espèces à la livraison uniquement — aucune carte requise',
    'cod.shippingFee': 'Frais de livraison',
    'cod.total': 'Total',

    'cart.title': 'Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.emptyCta': 'Parcourir les produits',
    'cart.continueShopping': 'Continuer les achats',
    'cart.subtotal': 'Sous-total',
    'cart.checkout': 'Passer la commande',
    'cart.remove': 'Retirer',
    'cart.viewCart': 'Voir le panier',

    'checkout.title': 'Passer la commande',
    'checkout.orderSummary': 'Résumé de la commande',
    'checkout.shipping': 'Livraison',
    'checkout.total': 'Total',
    'checkout.placeOrder': 'Confirmer — Paiement à la livraison',
    'checkout.placingOrder': 'Confirmation en cours...',
    'checkout.codOnly': 'Paiement à la livraison uniquement, sans frais cachés ni carte bancaire',
    'checkout.deliveryInfo': 'Informations de livraison',

    'thankyou.title': 'Merci ! Votre commande est confirmée',
    'thankyou.message': 'Un de nos agents vous appellera bientôt pour confirmer la livraison.',
    'thankyou.orderNumber': 'Numéro de commande',
    'thankyou.callSoon': 'Attendez un appel de notre équipe dans les 24h',
    'thankyou.backHome': "Retour à l'accueil",
    'thankyou.continueShopping': 'Continuer les achats',

    'footer.about': 'À propos',
    'footer.aboutText':
      "Sidahmed Shop est une boutique en ligne algérienne proposant des produits variés à prix avantageux, avec paiement à la livraison partout en Algérie.",
    'footer.links': 'Liens',
    'footer.contact': 'Contact',
    'footer.rights': 'Tous droits réservés',

    'filters.category': 'Catégorie',
    'filters.allCategories': 'Toutes les catégories',
    'filters.priceRange': 'Fourchette de prix',
    'filters.rating': 'Note',
    'filters.anyRating': 'Toutes les notes',
    'filters.search': 'Recherche',
    'filters.searchPlaceholder': 'Rechercher un produit...',
    'filters.apply': 'Appliquer',
    'filters.clear': 'Effacer les filtres',
    'filters.sort': 'Trier par',
    'filters.sortNewest': 'Plus récent',
    'filters.sortPriceAsc': 'Prix : croissant',
    'filters.sortPriceDesc': 'Prix : décroissant',
    'filters.sortRating': 'Mieux notés',
    'filters.noResults': 'Aucun produit trouvé',
    'filters.min': 'Min',
    'filters.max': 'Max',
  },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('sidahmed_lang') || 'ar');

  useEffect(() => {
    localStorage.setItem('sidahmed_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = useMemo(() => {
    const dict = DICTIONARY[lang] || DICTIONARY.ar;
    return (key) => dict[key] || key;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      toggleLang: () => setLang((l) => (l === 'ar' ? 'fr' : 'ar')),
      setLang,
      t,
    }),
    [lang, t]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
