const express = require('express');
const router = express.Router();

const { register, verifyRegistration, login, requestPasswordReset, resetPassword, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, verifyRegistrationSchema, loginSchema, requestResetSchema, resetPasswordSchema, refreshTokenSchema } = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), register);
router.post('/verify-registration', validate(verifyRegistrationSchema), verifyRegistration);
router.post('/login', validate(loginSchema), login);
router.post('/request-reset', validate(requestResetSchema), requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
