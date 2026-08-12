require('dotenv').config();

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { helmetMiddleware, corsMiddleware } = require('./middleware/security');
const { generalApiLimiter } = require('./middleware/rateLimiters');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`[Startup] Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('[Startup] Copy server/.env.example to server/.env and fill in real values.');
  process.exit(1);
}

connectDB();

const app = express();

// Trust the first proxy hop (needed for correct req.ip / X-Forwarded-For behind Nginx, Render, etc.)
app.set('trust proxy', 1);

// --- Security & hardening middleware -------------------------------------
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10kb' })); // small JSON payload cap (DoS mitigation)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ and . operators from req.body/query/params
app.use('/api', generalApiLimiter);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ----------------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Sidahmed Shop API is running' }));
app.get('/', (req, res) => res.json({ success: true, message: 'Sidahmed Shop API — see /api/health' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

// --- Error handling ----------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Sidahmed Shop API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Guard rails: never crash silently on unexpected async errors
process.on('unhandledRejection', (err) => {
  console.error(`[UnhandledRejection] ${err.message}`);
});
