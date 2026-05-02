const mongoose = require('mongoose');

const CROP_CATEGORIES = [
  'cereals', 'pulses', 'oilseeds', 'vegetables',
  'fruits', 'spices', 'cotton', 'sugarcane', 'other',
];

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: CROP_CATEGORIES,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    quantity: {
      value: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0.1, 'Quantity must be positive'],
      },
      unit: {
        type: String,
        enum: ['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece'],
        default: 'kg',
      },
    },
    price: {
      value: {
        type: Number,
        required: [true, 'Price is required'],
        min: [1, 'Price must be at least ₹1'],
      },
      currency: { type: String, default: 'INR' },
      unit: { type: String, default: 'per kg' },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },          // Cloudinary public_id for deletion
        isPrimary: { type: Boolean, default: false },
      },
    ],
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    harvestDate: { type: Date },
    expiryDate: { type: Date },
    isOrganic: { type: Boolean, default: false },
    quality: {
      type: String,
      enum: ['Premium', 'Grade A', 'Grade B', 'Average'],
      default: 'Grade A'
    },
    isAvailable: { type: Boolean, default: true },
    availableStock: {
      type: Number,
      default: function () { return this.quantity?.value || 0; },
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
productSchema.index({ farmer: 1, isAvailable: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ 'location.coordinates.coordinates': '2dsphere' });

module.exports = mongoose.model('Product', productSchema);
