const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: 2000,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'document', 'system'],
      default: 'text',
    },
    mediaUrl: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
