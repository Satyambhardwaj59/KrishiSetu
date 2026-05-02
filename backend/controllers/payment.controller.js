const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

// ── POST /payments/create-order ────────────────────────────────────────────────
exports.createPaymentOrder = async (req, res, next) => {
  const { orderId } = req.body;
  const io = req.app.get('io');

  const order = await Order.findById(orderId);
  if (!order) return next(new ApiError(404, 'Order not found'));
  if (String(order.buyer) !== String(req.user._id)) {
    return next(new ApiError(403, 'Not your order'));
  }
  const allowedStatuses = ['pending', 'accepted'];
  if (!allowedStatuses.includes(order.status)) {
    return next(new ApiError(400, `Order status must be one of: ${allowedStatuses.join(', ')}`));
  }

  const receipt = `rcpt_${String(orderId).slice(-8)}_${Date.now()}`;
  const amountPaise = Math.round(order.netAmount * 100); // Razorpay expects paise

  const rzpOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes: { orderId: String(orderId), buyerId: String(req.user._id) },
  });

  // Persist payment record with escrow hold
  const payment = await Payment.create({
    order: orderId,
    buyer: order.buyer,
    farmer: order.farmer,
    razorpayOrderId: rzpOrder.id,
    amount: amountPaise,
    receipt,
    escrowHeld: true,
    status: 'created',
  });

  order.isPaymentHeld = true;
  await order.save();

  sendSuccess(res, 201, 'Razorpay order created', {
    razorpayOrderId: rzpOrder.id,
    amount: amountPaise,
    currency: 'INR',
    key: process.env.RAZORPAY_KEY_ID,
    paymentId: payment._id,
  });
};

// ── POST /payments/verify ──────────────────────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
  const io = req.app.get('io');

  // Signature verification
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpaySignature) {
    return next(new ApiError(400, 'Payment signature mismatch. Possible fraud.'));
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    { razorpayPaymentId, razorpaySignature, status: 'paid' },
    { new: true }
  );
  if (!payment) return next(new ApiError(404, 'Payment record not found'));

  // Notify farmer
  const order = await Order.findById(orderId);
  if (order) {
    const notif = await Notification.create({
      recipient: order.farmer,
      type: 'payment_received',
      title: 'Payment Received 💰',
      body: `Payment of ₹${order.netAmount} received for order #${orderId} (held in escrow)`,
      data: { orderId, paymentId: payment._id },
    });
    if (io) io.to(String(order.farmer)).emit('notification', notif);
  }

  sendSuccess(res, 200, 'Payment verified. Amount held in escrow.', { payment });
};

// ── POST /payments/:paymentId/release-escrow  (admin / delivery confirmed) ────
exports.releaseEscrow = async (req, res, next) => {
  const io = req.app.get('io');

  const payment = await Payment.findById(req.params.paymentId);
  if (!payment) return next(new ApiError(404, 'Payment not found'));
  if (payment.status !== 'paid') return next(new ApiError(400, 'Payment not yet received'));
  if (payment.escrowHeld === false) return next(new ApiError(400, 'Escrow already released'));

  // In production: trigger actual payout to farmer bank account via Razorpay Route/X
  payment.escrowHeld = false;
  payment.status = 'released';
  payment.escrowReleasedAt = new Date();
  payment.escrowReleasedBy = req.user._id;
  await payment.save();

  const order = await Order.findByIdAndUpdate(
    payment.order, { isPaymentReleased: true }, { new: true }
  );

  // Notify farmer
  if (order) {
    const notif = await Notification.create({
      recipient: payment.farmer,
      type: 'payment_released',
      title: 'Payment Released! 🎉',
      body: `₹${order.netAmount} has been released to your account.`,
      data: { orderId: payment.order, paymentId: payment._id },
    });
    if (io) io.to(String(payment.farmer)).emit('notification', notif);
  }

  sendSuccess(res, 200, 'Escrow released. Payment sent to farmer.', { payment });
};

// ── GET /payments/order/:orderId ───────────────────────────────────────────────
exports.getPaymentByOrder = async (req, res, next) => {
  const payment = await Payment.findOne({ order: req.params.orderId })
    .populate('buyer', 'name phone')
    .populate('farmer', 'name phone');
  if (!payment) return next(new ApiError(404, 'Payment record not found'));
  sendSuccess(res, 200, 'Payment fetched', payment);
};

// ── POST /payments/webhook (Razorpay webhook) ─────────────────────────────────
exports.webhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSig) {
    logger.warn('Razorpay webhook signature mismatch');
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const { event, payload } = req.body;
  logger.info(`Razorpay webhook: ${event}`);

  if (event === 'payment.failed') {
    const rzpOrderId = payload.payment.entity.order_id;
    await Payment.findOneAndUpdate({ razorpayOrderId: rzpOrderId }, { status: 'failed' });
  }

  res.json({ received: true });
};
