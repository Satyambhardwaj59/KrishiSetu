const jwt = require('jsonwebtoken');
const ApiError = require('./apiError');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXP = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate an access token
 * @param {object} payload  - { id, role }
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/**
 * Generate a refresh token
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXP });

/**
 * Verify an access token
 * @throws ApiError(401) on invalid / expired token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Access token expired'
      : 'Invalid access token';
    throw new ApiError(401, msg);
  }
};

/**
 * Verify a refresh token
 * @throws ApiError(401) on invalid / expired token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};

/**
 * Build the standard token response object
 */
const buildTokenResponse = (user) => {
  const payload = { id: user._id, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kycStatus,
    },
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  buildTokenResponse,
};
