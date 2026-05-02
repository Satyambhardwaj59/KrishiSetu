const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/product.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { uploadProduct } = require('../config/cloudinary');
const { productSchema, updateProductSchema } = require('../validators/product.validator');

// Middleware to parse flat multipart/form-data bracket notation (e.g., quantity[value]) back into proper nested objects for Joi to validate.
const parseNestedFormData = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      const match = key.match(/^([^\[]+)\[([^\]]+)\]$/);
      if (match) {
        const parent = match[1];
        const child = match[2];
        if (!req.body[parent]) req.body[parent] = {};
        req.body[parent][child] = req.body[key];
        delete req.body[key];
      }
    }
  }
  next();
};

// Public
router.get('/', optionalAuth, ctrl.getProducts);
router.get('/:id', optionalAuth, ctrl.getProductById);

// Farmer-only
router.use(protect);
router.get('/farmer/my-listings', authorize('farmer'), ctrl.getMyListings);
router.post('/', authorize('farmer'), uploadProduct.array('images', 5), parseNestedFormData, validate(productSchema), ctrl.createProduct);
router.patch('/:id', authorize('farmer', 'admin'), uploadProduct.array('images', 5), parseNestedFormData, validate(updateProductSchema), ctrl.updateProduct);
router.delete('/:id', authorize('farmer', 'admin'), ctrl.deleteProduct);

module.exports = router;
