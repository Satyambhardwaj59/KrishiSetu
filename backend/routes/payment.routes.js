const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Razorpay webhook – raw body needed (configured in app.js)
router.post('/webhook', ctrl.webhook);

router.use(protect);

router.post('/create-order', authorize('buyer'), ctrl.createPaymentOrder);
router.post('/verify', authorize('buyer'), ctrl.verifyPayment);
router.post('/:paymentId/release-escrow', authorize('admin'), ctrl.releaseEscrow);
router.get('/order/:orderId', ctrl.getPaymentByOrder);

module.exports = router;
