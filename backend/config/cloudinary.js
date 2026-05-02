const cloudinary  = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer      = require('multer');

cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
  secure     : true,
});

// ── Product image storage ──────────────────────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder        : 'krishisetu/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation : [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// ── KYC / profile image storage ───────────────────────────────────────────────
const kycStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder         : 'krishisetu/kyc',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type  : 'auto',
  },
});

const uploadProduct = multer({
  storage: productStorage,
  limits : { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const uploadKYC = multer({
  storage: kycStorage,
  limits : { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = { cloudinary, uploadProduct, uploadKYC };
