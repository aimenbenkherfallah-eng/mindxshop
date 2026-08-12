const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true, strict: true }
);

// Hash password with bcrypt (salt factor 12) whenever it changes
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const SALT_FACTOR = 12;
  this.password = await bcrypt.hash(this.password, SALT_FACTOR);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
