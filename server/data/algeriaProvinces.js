/**
 * Official list of Algeria's provinces (wilayas), codes 1–69.
 *
 * Codes 1–58 are the long-standing wilaya list (48 original + 10 added in
 * December 2019). Codes 59–69 are the 11 new provinces created from the
 * April 2026 decentralization law (Loi 26-06), which took Algeria from 58
 * to 69 wilayas: Aflou, Barika, Ksar Chellala, Messaad, Aïn Oussera,
 * Bou Saâda, El Abiodh Sidi Cheikh, El Kantara, Bir El Ater, Ksar El
 * Boukhari and El Aricha.
 *
 * NOTE: codes 59–69 are ordered as most commonly reported at the time this
 * project was generated. If the Journal Officiel publishes a different
 * official numbering for these 11 provinces, update this single file —
 * every part of the app (product shipping, order province filter, admin
 * shipping-fee table) reads from here.
 */

const ALGERIA_PROVINCES = [
  { code: 1, name: 'Adrar', nameAr: 'أدرار' },
  { code: 2, name: 'Chlef', nameAr: 'الشلف' },
  { code: 3, name: 'Laghouat', nameAr: 'الأغواط' },
  { code: 4, name: 'Oum El Bouaghi', nameAr: 'أم البواقي' },
  { code: 5, name: 'Batna', nameAr: 'باتنة' },
  { code: 6, name: 'Béjaïa', nameAr: 'بجاية' },
  { code: 7, name: 'Biskra', nameAr: 'بسكرة' },
  { code: 8, name: 'Béchar', nameAr: 'بشار' },
  { code: 9, name: 'Blida', nameAr: 'البليدة' },
  { code: 10, name: 'Bouira', nameAr: 'البويرة' },
  { code: 11, name: 'Tamanrasset', nameAr: 'تمنراست' },
  { code: 12, name: 'Tébessa', nameAr: 'تبسة' },
  { code: 13, name: 'Tlemcen', nameAr: 'تلمسان' },
  { code: 14, name: 'Tiaret', nameAr: 'تيارت' },
  { code: 15, name: 'Tizi Ouzou', nameAr: 'تيزي وزو' },
  { code: 16, name: 'Alger', nameAr: 'الجزائر' },
  { code: 17, name: 'Djelfa', nameAr: 'الجلفة' },
  { code: 18, name: 'Jijel', nameAr: 'جيجل' },
  { code: 19, name: 'Sétif', nameAr: 'سطيف' },
  { code: 20, name: 'Saïda', nameAr: 'سعيدة' },
  { code: 21, name: 'Skikda', nameAr: 'سكيكدة' },
  { code: 22, name: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس' },
  { code: 23, name: 'Annaba', nameAr: 'عنابة' },
  { code: 24, name: 'Guelma', nameAr: 'قالمة' },
  { code: 25, name: 'Constantine', nameAr: 'قسنطينة' },
  { code: 26, name: 'Médéa', nameAr: 'المدية' },
  { code: 27, name: 'Mostaganem', nameAr: 'مستغانم' },
  { code: 28, name: "M'Sila", nameAr: 'المسيلة' },
  { code: 29, name: 'Mascara', nameAr: 'معسكر' },
  { code: 30, name: 'Ouargla', nameAr: 'ورقلة' },
  { code: 31, name: 'Oran', nameAr: 'وهران' },
  { code: 32, name: 'El Bayadh', nameAr: 'البيض' },
  { code: 33, name: 'Illizi', nameAr: 'إليزي' },
  { code: 34, name: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج' },
  { code: 35, name: 'Boumerdès', nameAr: 'بومرداس' },
  { code: 36, name: 'El Tarf', nameAr: 'الطارف' },
  { code: 37, name: 'Tindouf', nameAr: 'تندوف' },
  { code: 38, name: 'Tissemsilt', nameAr: 'تيسمسيلت' },
  { code: 39, name: 'El Oued', nameAr: 'الوادي' },
  { code: 40, name: 'Khenchela', nameAr: 'خنشلة' },
  { code: 41, name: 'Souk Ahras', nameAr: 'سوق أهراس' },
  { code: 42, name: 'Tipaza', nameAr: 'تيبازة' },
  { code: 43, name: 'Mila', nameAr: 'ميلة' },
  { code: 44, name: 'Aïn Defla', nameAr: 'عين الدفلى' },
  { code: 45, name: 'Naâma', nameAr: 'النعامة' },
  { code: 46, name: 'Aïn Témouchent', nameAr: 'عين تموشنت' },
  { code: 47, name: 'Ghardaïa', nameAr: 'غرداية' },
  { code: 48, name: 'Relizane', nameAr: 'غليزان' },
  { code: 49, name: 'Timimoun', nameAr: 'تيميمون' },
  { code: 50, name: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار' },
  { code: 51, name: 'Ouled Djellal', nameAr: 'أولاد جلال' },
  { code: 52, name: 'Béni Abbès', nameAr: 'بني عباس' },
  { code: 53, name: 'In Salah', nameAr: 'إن صالح' },
  { code: 54, name: 'In Guezzam', nameAr: 'إن قزام' },
  { code: 55, name: 'Touggourt', nameAr: 'تقرت' },
  { code: 56, name: 'Djanet', nameAr: 'جانت' },
  { code: 57, name: "El M'Ghair", nameAr: 'المغير' },
  { code: 58, name: 'El Meniaa', nameAr: 'المنيعة' },
  { code: 59, name: 'Aflou', nameAr: 'أفلو' },
  { code: 60, name: 'Barika', nameAr: 'بريكة' },
  { code: 61, name: 'Ksar Chellala', nameAr: 'قصر الشلالة' },
  { code: 62, name: 'Messaad', nameAr: 'مسعد' },
  { code: 63, name: 'Aïn Oussera', nameAr: 'عين وسارة' },
  { code: 64, name: 'Bou Saâda', nameAr: 'بوسعادة' },
  { code: 65, name: 'El Abiodh Sidi Cheikh', nameAr: 'الأبيض سيدي الشيخ' },
  { code: 66, name: 'El Kantara', nameAr: 'القنطرة' },
  { code: 67, name: 'Bir El Ater', nameAr: 'بئر العاتر' },
  { code: 68, name: 'Ksar El Boukhari', nameAr: 'قصر البخاري' },
  { code: 69, name: 'El Aricha', nameAr: 'العريشة' },
];

const isValidProvinceCode = (code) =>
  Number.isInteger(Number(code)) && Number(code) >= 1 && Number(code) <= 69;

const getProvinceByCode = (code) =>
  ALGERIA_PROVINCES.find((p) => p.code === Number(code)) || null;

module.exports = { ALGERIA_PROVINCES, isValidProvinceCode, getProvinceByCode };
