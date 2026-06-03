const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'order_placed',
        'order_accepted',
        'order_rejected',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'payment_received',
        'payment_released',
        'kyc_approved',
        'kyc_rejected',
        'new_message',
        'system',
        'weather_alert',
        'crop_advisory',
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 1000 },
    data: { type: mongoose.Schema.Types.Mixed },   // e.g. { orderId, productId }
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
