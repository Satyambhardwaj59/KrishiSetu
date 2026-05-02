const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { uploadKYC } = require('../config/cloudinary');

// All routes require authentication
router.use(protect);

router.get('/', authorize('admin'), ctrl.getAllUsers);
router.get('/:id', ctrl.getUserById);
router.patch('/profile', ctrl.updateProfile);
router.post('/kyc', uploadKYC.single('document'), ctrl.submitKYC);
router.patch('/:id/kyc-status', authorize('admin'), ctrl.updateKYCStatus);
router.delete('/:id', authorize('admin'), ctrl.deactivateUser);

module.exports = router;
