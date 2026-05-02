const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

/**
 * Protect route – verify JWT and attach req.user
 */
const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'No token provided. Please login.'));
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);            // throws ApiError on failure

  const user = await User.findById(decoded.id).select('-refreshToken');
  if (!user) return next(new ApiError(401, 'User not found. Token is invalid.'));
  if (!user.isActive) return next(new ApiError(403, 'Account is deactivated.'));

  req.user = user;
  next();
};

/**
 * Optionally authenticate – won't fail on missing token
 */
const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id).select('-refreshToken');
    }
  } catch (_) { /* ignore – public route */ }
  next();
};

module.exports = { protect, optionalAuth };
