const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/Product');

// @desc    List ALL products (including inactive) for the admin table
// @route   GET /api/admin/products?search=&category=&page=&limit=
// @access  Private/Admin
const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('-reviews')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ success: true, products, page, pages: Math.ceil(total / limit) || 1, total });
});

// @desc    Get one product (admin — includes inactive)
// @route   GET /api/admin/products/:id
// @access  Private/Admin
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { title, titleAr, description, descriptionAr, price, discountedPrice, images, category, stock, sku, isTrending, isActive } =
    req.body;

  const product = await Product.create({
    title,
    titleAr,
    description,
    descriptionAr,
    price,
    discountedPrice: discountedPrice || undefined,
    images,
    category,
    stock,
    sku,
    isTrending: !!isTrending,
    isActive: isActive !== undefined ? !!isActive : true,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const allowedFields = [
    'title',
    'titleAr',
    'description',
    'descriptionAr',
    'price',
    'discountedPrice',
    'images',
    'category',
    'stock',
    'sku',
    'isTrending',
    'isActive',
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field] === '' ? undefined : req.body[field];
    }
  }

  await product.save();
  res.json({ success: true, product });
});

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
