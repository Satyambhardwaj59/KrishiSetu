const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

// ── GET /users/  (admin) ───────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.kycStatus) filter.kycStatus = req.query.kycStatus;

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).select('-refreshToken').lean(),
    User.countDocuments(filter),
  ]);

  sendPaginated(res, 'Users fetched', users, page, limit, total);
};

// ── GET /users/:id ─────────────────────────────────────────────────────────────
exports.getUserById = async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-refreshToken');
  if (!user) return next(new ApiError(404, 'User not found'));
  sendSuccess(res, 200, 'User fetched', user.toSafeObject());
};

// ── PATCH /users/profile ───────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const allowed = ['name', 'location'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(
    req.user._id, updates, { new: true, runValidators: true }
  ).select('-refreshToken');

  sendSuccess(res, 200, 'Profile updated', user.toSafeObject());
};

// ── POST /users/kyc ────────────────────────────────────────────────────────────
exports.submitKYC = async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'KYC document file is required'));

  const { idType, idNumber, bankAccount, bankIFSC, bankName, accountHolderName } = req.body;

  const kycDetails = {
    idType,
    idNumber,
    bankAccount,
    bankIFSC,
    bankName,
    accountHolderName,
    submittedAt: new Date()
  };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      kycDocumentUrl: req.file.path,
      kycStatus: 'submitted',
      kycDetails
    },
    { new: true, runValidators: true }
  ).select('-refreshToken');

  sendSuccess(res, 200, 'KYC submitted successfully', { kycStatus: user.kycStatus });
};

// ── PATCH /users/:id/kyc-status  (admin) ──────────────────────────────────────
exports.updateKYCStatus = async (req, res, next) => {
  const { status, reason } = req.body;
  const allowed = ['verified', 'rejected'];
  if (!allowed.includes(status)) {
    return next(new ApiError(400, `Status must be one of: ${allowed.join(', ')}`));
  }

  const update = { kycStatus: status };
  if (status === 'rejected' && reason) update.kycRejectedReason = reason;

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-refreshToken');
  if (!user) return next(new ApiError(404, 'User not found'));

  sendSuccess(res, 200, `KYC ${status}`, { kycStatus: user.kycStatus });
};

// ── DELETE /users/:id  (admin) ────────────────────────────────────────────────
exports.deactivateUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return next(new ApiError(404, 'User not found'));
  sendSuccess(res, 200, 'User deactivated');
};
