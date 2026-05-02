const ApiError = require('../utils/apiError');

/**
 * Role-based access control middleware factory.
 * Usage: authorize('admin') or authorize('farmer', 'admin')
 */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }
  if (!roles.includes(req.user.role)) {
    return next(
      new ApiError(403, `Access denied. Required role: [${roles.join(', ')}]`)
    );
  }
  next();
};

/**
 * Restrict to KYC-verified users only
 */
const requireKYC = (req, _res, next) => {
  if (req.user?.kycStatus !== 'verified') {
    return next(new ApiError(403, 'KYC verification required to perform this action.'));
  }
  next();
};

module.exports = { authorize, requireKYC };
