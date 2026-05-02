const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Razorpay fields ───────────────────────────────────────────────────────
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpaySignature: { type: String },

    amount: { type: Number, required: true, min: 1 },   // in paise
    currency: { type: String, default: 'INR' },

    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded', 'released'],
      default: 'created',
      index: true,
    },

    // ── Escrow ────────────────────────────────────────────────────────────────
    escrowHeld: { type: Boolean, default: false },
    escrowReleasedAt: { type: Date },
    escrowReleasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ── Refund ────────────────────────────────────────────────────────────────
    refundId: { type: String },
    refundedAt: { type: Date },
    refundReason: { type: String },

    // ── Receipt / Notes ───────────────────────────────────────────────────────
    receipt: { type: String },
    notes: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
