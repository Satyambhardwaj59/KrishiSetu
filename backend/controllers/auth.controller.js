const crypto = require('crypto');
const User = require('../models/User');
const { sendSmsOTP } = require('../utils/otp');
const sendEmailOTP = require('../utils/sendEmailOTP');
const { buildTokenResponse, verifyRefreshToken, generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

const generateAndSendOtp = async (user, email, phone) => {
  const otp = crypto.randomInt(100000, 999999).toString();

  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save();

  if (email) {
    await sendEmailOTP(email, otp);
  } else if (phone) {
    await sendSmsOTP(phone, otp);
  }

  return process.env.USE_MOCK_OTP === 'true' ? { otp } : {};
};

// ── POST /auth/register ────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  const { phone, email, name, password, role, address, city, state, pincode } = req.body;

  if (!phone && !email) {
    return next(new ApiError(400, 'Either phone or email is required'));
  }

  const query = phone ? { phone } : { email };
  let user = await User.findOne(query);

  if (user && user.isVerified) {
    return next(new ApiError(400, 'User already exists and is verified. Please login.'));
  }

  const updatePayload = {
    name,
    password,
    role: role || 'buyer',
    isVerified: false,
    location: {
      address: address || user?.location?.address,
      city: city || user?.location?.city,
      state: state || user?.location?.state,
      pincode: pincode || user?.location?.pincode,
    }
  };

  if (!user) {
    if (phone) updatePayload.phone = phone;
    if (email) updatePayload.email = email;
    user = await User.create(updatePayload);
  } else {
    // If user exists but not verified, update their info including new password
    Object.assign(user, updatePayload);
    await user.save();
  }

  const devPayload = await generateAndSendOtp(user, email, phone);
  sendSuccess(res, 200, 'Registration initiated. OTP sent successfully', devPayload);
};

// ── POST /auth/verify-registration ─────────────────────────────────────────────
exports.verifyRegistration = async (req, res, next) => {
  const { phone, email, otp } = req.body;

  if (!phone && !email) return next(new ApiError(400, 'Either phone or email is required'));

  const query = phone ? { phone } : { email };
  const user = await User.findOne(query).select('+otp +otpExpiry +otpAttempts');

  if (!user) return next(new ApiError(404, 'User not found'));

  // Security checks
  if (user.otpAttempts >= 5) {
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    return next(new ApiError(429, 'Too many failed attempts. Request a new OTP.'));
  }

  if (!user.otp || user.otp !== otp) {
    user.otpAttempts += 1;
    await user.save();
    return next(new ApiError(400, 'Invalid OTP'));
  }

  if (new Date() > user.otpExpiry) {
    return next(new ApiError(400, 'OTP has expired'));
  }

  // OTP verified successfully
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpAttempts = 0;
  user.lastLogin = new Date();

  const tokens = buildTokenResponse(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  sendSuccess(res, 200, 'Registration successful', tokens);
};

// ── POST /auth/login ───────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  const { phone, email, password } = req.body;

  if (!phone && !email) return next(new ApiError(400, 'Either phone or email is required'));

  const query = phone ? { phone } : { email };
  const user = await User.findOne(query).select('+password');

  if (!user) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  if (!user.isVerified) {
    return next(new ApiError(403, 'Account not verified. Please register to verify your account.'));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  user.lastLogin = new Date();
  const tokens = buildTokenResponse(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  sendSuccess(res, 200, 'Login successful', tokens);
};

// ── POST /auth/request-reset ───────────────────────────────────────────────────
exports.requestPasswordReset = async (req, res, next) => {
  const { phone, email } = req.body;

  if (!phone && !email) return next(new ApiError(400, 'Either phone or email is required'));

  const query = phone ? { phone } : { email };
  const user = await User.findOne(query);

  if (!user || !user.isVerified) {
    return next(new ApiError(404, 'Verified user not found with this contact'));
  }

  const devPayload = await generateAndSendOtp(user, email, phone);
  sendSuccess(res, 200, 'Password reset OTP sent successfully', devPayload);
};

// ── POST /auth/reset-password ──────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  const { phone, email, otp, newPassword } = req.body;

  if (!phone && !email) return next(new ApiError(400, 'Either phone or email is required'));

  const query = phone ? { phone } : { email };
  const user = await User.findOne(query).select('+otp +otpExpiry +otpAttempts');

  if (!user || !user.isVerified) {
    return next(new ApiError(404, 'Verified user not found'));
  }

  // Security checks
  if (user.otpAttempts >= 5) {
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    return next(new ApiError(429, 'Too many failed attempts. Request a new OTP.'));
  }

  if (!user.otp || user.otp !== otp) {
    user.otpAttempts += 1;
    await user.save();
    return next(new ApiError(400, 'Invalid OTP'));
  }

  if (new Date() > user.otpExpiry) {
    return next(new ApiError(400, 'OTP has expired'));
  }

  // OTP verified successfully, change password
  user.password = newPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpAttempts = 0;
  await user.save();

  sendSuccess(res, 200, 'Password reset successfully');
};

// ── POST /auth/refresh-token ───────────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    return next(new ApiError(401, 'Invalid refresh token'));
  }

  const newAccess = generateAccessToken({ id: user._id, role: user.role });
  const newRefresh = generateRefreshToken({ id: user._id, role: user.role });

  user.refreshToken = newRefresh;
  await user.save();

  sendSuccess(res, 200, 'Token refreshed', { accessToken: newAccess, refreshToken: newRefresh });
};

// ── POST /auth/logout ──────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  const user = await User.findById(req.user._id).select('+refreshToken');
  if (user) { user.refreshToken = undefined; await user.save(); }
  sendSuccess(res, 200, 'Logged out successfully');
};

// ── GET /auth/me ───────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  sendSuccess(res, 200, 'Profile fetched', req.user.toSafeObject());
};
