const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'accepted', 'rejected', 'shipped', 'delivered', 'cancelled', 'disputed'];

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { value: Number, unit: String },
  price: { value: Number, currency: { type: String, default: 'INR' } },
  imageUrl: String,
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [arr => arr.length > 0, 'Order must have at least one item'],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ── Delivery ─────────────────────────────────────────────────────────────
    deliveryAddress: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    expectedDelivery: Date,
    deliveredAt: Date,

    // ── Escrow flags ─────────────────────────────────────────────────────────
    isPaymentHeld: { type: Boolean, default: false },  // payment with escrow
    isPaymentReleased: { type: Boolean, default: false },  // released to farmer

    // ── Cancellation ─────────────────────────────────────────────────────────
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelReason: String,
  },
  { timestamps: true }
);

// ── Middleware: push to status history on every status change ─────────────────
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
