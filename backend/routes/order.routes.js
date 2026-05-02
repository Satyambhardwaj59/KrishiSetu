const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { placeOrderSchema, updateStatusSchema } = require('../validators/order.validator');

router.use(protect);

router.post('/', authorize('buyer'), validate(placeOrderSchema), ctrl.placeOrder);
router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrderById);
router.patch('/:id/status', validate(updateStatusSchema), ctrl.updateOrderStatus);

module.exports = router;
