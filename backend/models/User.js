const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: [0, 0] },   // [longitude, latitude]
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'],
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      select: false,
    },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    role: {
      type: String,
      enum: ['farmer', 'buyer', 'admin'],
      default: 'buyer',
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'rejected'],
      default: 'pending',
    },
    kycDocumentUrl: { type: String },
    kycRejectedReason: { type: String },
    kycDetails: {
      idType: { type: String },
      idNumber: { type: String },
      bankAccount: { type: String },
      bankIFSC: { type: String },
      bankName: { type: String },
      accountHolderName: { type: String },
      submittedAt: { type: Date }
    },

    location: locationSchema,

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // Razorpay customer id for saved payment methods
    razorpayCustomerId: { type: String },

    // Refresh token stored for rotation strategy
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// ── Hooks ──────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Indexes ────────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });

// ── Virtuals ───────────────────────────────────────────────────────────────────
userSchema.virtual('isKycVerified').get(function () {
  return this.kycStatus === 'verified';
});

// ── Methods ────────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.refreshToken;
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
