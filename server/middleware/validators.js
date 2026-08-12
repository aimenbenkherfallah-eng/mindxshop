const { body, query, param, validationResult } = require('express-validator');

/** Run after any validator chain to short-circuit with 400 + field errors. */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Algerian mobile numbers: 05/06/07 + 8 digits, optionally with +213 prefix
const ALGERIA_PHONE_REGEX = /^(?:\+?213|0)(5|6|7)[0-9]{8}$/;

const loginValidators = [
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ max: 50 }),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6, max: 100 }),
];

const orderValidators = [
  body('items').isArray({ min: 1 }).withMessage('Order must include at least one item'),
  body('items.*.product').isMongoId().withMessage('Invalid product id'),
  body('items.*.quantity').isInt({ min: 1, max: 50 }).withMessage('Invalid quantity'),
  body('customer.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Full name must be between 3 and 100 characters'),
  body('customer.phone')
    .trim()
    .matches(ALGERIA_PHONE_REGEX)
    .withMessage('Enter a valid Algerian phone number (e.g. 0551 23 45 67)'),
  body('customer.provinceCode')
    .isInt({ min: 1, max: 69 })
    .withMessage('Select a valid province (1-69)'),
  body('customer.commune').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('customer.address').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
  body('botToken').optional({ checkFalsy: true }).isString().isLength({ max: 5000 }),
  body('eventId').optional({ checkFalsy: true }).isString().isLength({ max: 100 }),
];

const reviewValidators = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 1000 }),
  body('photos').optional().isArray({ max: 5 }).withMessage('Maximum 5 photos per review'),
];

const productValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
  body('titleAr').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 5000 }),
  body('descriptionAr').optional({ checkFalsy: true }).trim().isLength({ max: 5000 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('discountedPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Discounted price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required').isLength({ max: 60 }),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
];

const productQueryValidators = [
  query('category').optional().trim().isLength({ max: 60 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('rating').optional().isFloat({ min: 0, max: 5 }),
  query('search').optional().trim().isLength({ max: 100 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['newest', 'price_asc', 'price_desc', 'rating', 'trending']),
];

const mongoIdParam = (name = 'id') => param(name).isMongoId().withMessage('Invalid id');

module.exports = {
  validate,
  loginValidators,
  orderValidators,
  reviewValidators,
  productValidators,
  productQueryValidators,
  mongoIdParam,
  ALGERIA_PHONE_REGEX,
};
