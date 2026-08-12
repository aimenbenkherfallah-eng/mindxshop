const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/Product');

// @desc    List products with filtering, search, sort & pagination
// @route   GET /api/products?category=&minPrice=&maxPrice=&rating=&search=&sort=&page=&limit=
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, rating, search, sort, trending } = req.query;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (trending === 'true') filter.isTrending = true;
  if (rating) filter.rating = { $gte: Number(rating) };

  if (minPrice || maxPrice) {
    // Filter on the effective (discounted-if-present) price
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    filter.$expr = {
      $and: [
        priceFilter.$gte !== undefined
          ? { $gte: [{ $ifNull: ['$discountedPrice', '$price'] }, priceFilter.$gte] }
          : { $literal: true },
        priceFilter.$lte !== undefined
          ? { $lte: [{ $ifNull: ['$discountedPrice', '$price'] }, priceFilter.$lte] }
          : { $literal: true },
      ],
    };
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    trending: { isTrending: -1, createdAt: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('-reviews')
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  });
});

// @desc    Get distinct product categories (for filter UI)
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ success: true, categories: categories.sort() });
});

// @desc    Get a single product by id or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  const product = await Product.findOne(
    isObjectId ? { _id: id, isActive: true } : { slug: id, isActive: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, product });
});

// @desc    Add a customer review (with optional photo URLs) to a product
// @route   POST /api/products/:id/reviews
// @access  Public
const addReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { name, rating, comment, photos } = req.body;

  product.reviews.push({
    name,
    rating: Number(rating),
    comment,
    photos: Array.isArray(photos) ? photos.slice(0, 5) : [],
  });

  product.recalculateRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added', product });
});

module.exports = { getProducts, getCategories, getProductById, addReview };
