const Joi = require('joi');

const phone = Joi.string()
  .pattern(/^\+?[1-9]\d{9,14}$/)
  .messages({
    'string.pattern.base': 'Phone must be a valid international number',
  });

const email = Joi.string()
  .email()
  .messages({
    'string.email': 'Email must be a valid address',
  });

const password = Joi.string().min(6).messages({
  'string.min': 'Password must be at least 6 characters long',
});

const otp = Joi.string().length(6).pattern(/^\d+$/).messages({
  'string.length': 'OTP must be exactly 6 digits',
  'string.pattern.base': 'OTP must contain only digits',
});

const registerSchema = Joi.object({
  phone,
  email,
  name: Joi.string().required(),
  password: password.required(),
  role: Joi.string().valid('farmer', 'buyer', 'admin').optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  pincode: Joi.string().optional(),
}).or('phone', 'email');

const verifyRegistrationSchema = Joi.object({
  phone,
  email,
  otp: otp.required(),
}).or('phone', 'email');

const loginSchema = Joi.object({
  phone,
  email,
  password: password.required(),
}).or('phone', 'email');

const requestResetSchema = Joi.object({
  phone,
  email,
}).or('phone', 'email');

const resetPasswordSchema = Joi.object({
  phone,
  email,
  otp: otp.required(),
  newPassword: password.required(),
}).or('phone', 'email');

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  registerSchema,
  verifyRegistrationSchema,
  loginSchema,
  requestResetSchema,
  resetPasswordSchema,
  refreshTokenSchema,
};
