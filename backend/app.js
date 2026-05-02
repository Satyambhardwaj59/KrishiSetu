require('dotenv').config();
require('express-async-errors');

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

const { errorHandler, notFound } = require('./middlewares/error.middleware');
const logger      = require('./utils/logger');

// ── Routes ─────────────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth.routes');
const userRoutes         = require('./routes/user.routes');
const productRoutes      = require('./routes/product.routes');
const orderRoutes        = require('./routes/order.routes');
const paymentRoutes      = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const chatRoutes         = require('./routes/chat.routes');

const app = express();

// ── Security ───────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin     : process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods    : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ── Rate limiting ──────────────────────────────────────────────────────────────
app.use('/api/auth', rateLimit({
  windowMs       : 15 * 60 * 1000, // 15 min
  max            : 20,
  standardHeaders: true,
  message        : { success: false, message: 'Too many requests, please try again later' },
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 200,
}));

// ── Body parsing ───────────────────────────────────────────────────────────────
// Webhook needs raw body for Razorpay signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'KrishiSetu API is running 🌾',
    version: '1.0.0',
    env    : process.env.NODE_ENV,
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat',          chatRoutes);

// ── 404 + Error handlers (must be last) ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
