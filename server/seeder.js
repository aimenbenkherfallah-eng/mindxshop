require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Product = require('./models/Product');
const Settings = require('./models/Settings');
const { ALGERIA_PROVINCES } = require('./data/algeriaProvinces');

const samplePlaceholder = (seed) => `https://picsum.photos/seed/${seed}/800/800`;

const sampleProducts = [
  {
    title: 'Wireless Bluetooth Earbuds',
    titleAr: 'سماعات بلوتوث لاسلكية',
    description:
      'Compact true-wireless earbuds with 24h battery life (with case), touch controls, and clear call quality. Comes with a charging cable and 3 ear-tip sizes.',
    descriptionAr: 'سماعات لاسلكية صغيرة الحجم ببطارية تدوم 24 ساعة مع العلبة، تحكم باللمس وجودة صوت واضحة.',
    price: 6500,
    discountedPrice: 4200,
    images: [samplePlaceholder('earbuds1'), samplePlaceholder('earbuds2')],
    category: 'Electronics',
    stock: 42,
    isTrending: true,
  },
  {
    title: 'Stainless Steel Vacuum Flask 1L',
    titleAr: 'ترمس فولاذي 1 لتر',
    description: 'Double-wall vacuum insulation keeps drinks hot for 12h or cold for 24h. Leak-proof lid, wide mouth for easy cleaning.',
    descriptionAr: 'عزل مزدوج يحافظ على سخونة المشروبات لمدة 12 ساعة أو برودتها لمدة 24 ساعة، غطاء مانع للتسرب.',
    price: 3200,
    discountedPrice: 2400,
    images: [samplePlaceholder('flask1'), samplePlaceholder('flask2')],
    category: 'Home & Kitchen',
    stock: 60,
    isTrending: true,
  },
  {
    title: 'Adjustable Laptop Stand',
    titleAr: 'حامل لابتوب قابل للتعديل',
    description: 'Aluminum laptop stand with 6 height levels, improves posture and airflow. Folds flat for travel. Fits 10"-17" laptops.',
    descriptionAr: 'حامل ألمنيوم للابتوب بـ6 مستويات ارتفاع، يحسن وضعية الجلوس والتهوية، قابل للطي.',
    price: 4500,
    images: [samplePlaceholder('stand1'), samplePlaceholder('stand2')],
    category: 'Office',
    stock: 25,
  },
  {
    title: 'Men\'s Sport Running Shoes',
    titleAr: 'حذاء رياضي رجالي للجري',
    description: 'Lightweight breathable mesh upper, cushioned sole for daily runs or the gym. Available in multiple sizes.',
    descriptionAr: 'حذاء رياضي خفيف وشبكي قابل للتهوية، نعل مبطن مناسب للجري اليومي أو الصالة الرياضية.',
    price: 7800,
    discountedPrice: 5900,
    images: [samplePlaceholder('shoes1'), samplePlaceholder('shoes2')],
    category: 'Fashion',
    stock: 33,
    isTrending: true,
  },
  {
    title: 'LED Desk Lamp with USB Charging Port',
    titleAr: 'مصباح مكتب LED مع منفذ شحن USB',
    description: '3 color modes, 10 brightness levels, foldable arm, built-in USB port to charge your phone while you work.',
    descriptionAr: '3 أوضاع إضاءة، 10 مستويات سطوع، ذراع قابل للطي، منفذ USB مدمج لشحن هاتفك.',
    price: 3900,
    images: [samplePlaceholder('lamp1'), samplePlaceholder('lamp2')],
    category: 'Home & Kitchen',
    stock: 18,
  },
  {
    title: 'Kids Educational Building Blocks (120pcs)',
    titleAr: 'مكعبات بناء تعليمية للأطفال (120 قطعة)',
    description: 'Safe, colorful building blocks that boost creativity and fine motor skills. Compatible with major block brands. Ages 3+.',
    descriptionAr: 'مكعبات بناء آمنة وملونة تنمي الإبداع والمهارات الحركية الدقيقة. للأطفال من عمر 3 سنوات فأكثر.',
    price: 2800,
    discountedPrice: 1990,
    images: [samplePlaceholder('blocks1'), samplePlaceholder('blocks2')],
    category: 'Toys',
    stock: 50,
  },
  {
    title: 'Smart Fitness Watch',
    titleAr: 'ساعة ذكية رياضية',
    description: 'Tracks heart rate, steps, sleep and workouts. Water-resistant, 7-day battery life, notifications from your phone.',
    descriptionAr: 'تتبع معدل ضربات القلب، الخطوات، النوم والتمارين. مقاومة للماء، بطارية تدوم 7 أيام.',
    price: 9800,
    discountedPrice: 7500,
    images: [samplePlaceholder('watch1'), samplePlaceholder('watch2')],
    category: 'Electronics',
    stock: 20,
    isTrending: true,
  },
  {
    title: 'Non-Stick Cookware Set (10 pieces)',
    titleAr: 'طقم أواني طبخ غير لاصقة (10 قطع)',
    description: 'Durable non-stick coating, heat-resistant handles, works on all stovetops including induction.',
    descriptionAr: 'طلاء غير لاصق متين، مقابض مقاومة للحرارة، تعمل على جميع مواقد الطبخ بما فيها الحث.',
    price: 12500,
    discountedPrice: 9900,
    images: [samplePlaceholder('cookware1'), samplePlaceholder('cookware2')],
    category: 'Home & Kitchen',
    stock: 15,
  },
];

const importData = async () => {
  await connectDB();
  try {
    // --- Admin user (idempotent: skip if it already exists) ---
    const adminUsername = (process.env.ADMIN_USERNAME || 'sidahmed').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'slhgta62004';

    const existingAdmin = await User.findOne({ username: adminUsername });
    if (existingAdmin) {
      console.log(`[Seeder] Admin user "${adminUsername}" already exists — skipping.`);
    } else {
      await User.create({ username: adminUsername, password: adminPassword, role: 'admin' });
      console.log(`[Seeder] Created admin user "${adminUsername}".`);
    }

    // --- Settings singleton with shipping fees for all 69 provinces ---
    const settingsExists = await Settings.findOne({ singletonKey: 'main' });
    if (!settingsExists) {
      await Settings.create({
        singletonKey: 'main',
        shippingFees: ALGERIA_PROVINCES.map((p) => ({
          provinceCode: p.code,
          provinceName: p.name,
          provinceNameAr: p.nameAr,
          fee: 500, // DZD flat default — adjust per-province in Admin > Settings
        })),
      });
      console.log(`[Seeder] Created default settings with ${ALGERIA_PROVINCES.length} province shipping fees.`);
    } else {
      console.log('[Seeder] Settings already exist — skipping.');
    }

    // --- Sample products (only if the catalog is empty) ---
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.create(sampleProducts);
      console.log(`[Seeder] Created ${sampleProducts.length} sample products.`);
    } else {
      console.log('[Seeder] Products already exist — skipping sample product import.');
    }

    console.log('[Seeder] Done.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  try {
    await Promise.all([User.deleteMany(), Product.deleteMany(), Settings.deleteMany()]);
    console.log('[Seeder] All data destroyed.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv.includes('-d')) {
  destroyData();
} else {
  importData();
}
