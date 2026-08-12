const mongoose = require('mongoose');
const slugify = require('slugify');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    photos: {
      type: [String],
      default: [],
      validate: (arr) => arr.length <= 5,
    },
  },
  { timestamps: true, strict: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    titleAr: { type: String, trim: true, maxlength: 150 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 5000 },
    descriptionAr: { type: String, trim: true, maxlength: 5000 },

    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountedPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return value == null || value <= this.price;
        },
        message: 'Discounted price cannot exceed the original price',
      },
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one product image is required',
      },
    },

    category: { type: String, required: [true, 'Category is required'], trim: true, index: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, trim: true },

    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true, strict: true }
);

productSchema.index({ title: 'text', titleAr: 'text', description: 'text' });

productSchema.pre('validate', function generateSlug(next) {
  if (this.isModified('title') || !this.slug) {
    const base = slugify(this.title || 'product', { lower: true, strict: true });
    this.slug = `${base}-${this._id.toString().slice(-6)}`;
  }
  next();
});

productSchema.methods.recalculateRating = function recalculateRating() {
  if (!this.reviews.length) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.rating = Math.round((total / this.reviews.length) * 10) / 10;
  this.numReviews = this.reviews.length;
};

// Virtual for effective/display price (discounted if present, else regular)
productSchema.virtual('finalPrice').get(function () {
  return this.discountedPrice != null ? this.discountedPrice : this.price;
});
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
