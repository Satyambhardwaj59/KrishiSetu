const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

// ── GET /products ──────────────────────────────────────────────────────────────
exports.getProducts = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter = { isAvailable: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isOrganic) filter.isOrganic = req.query.isOrganic === 'true';
  if (req.query.state) filter['location.state'] = new RegExp(req.query.state, 'i');

  let query = Product.find(filter).populate('farmer', 'name phone location');

  // Full-text search
  if (req.query.q) {
    query = Product.find({ ...filter, $text: { $search: req.query.q } })
      .populate('farmer', 'name phone location')
      .sort({ score: { $meta: 'textScore' } });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const [products, total] = await Promise.all([
    query.skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  sendPaginated(res, 'Products fetched', products, page, limit, total);
};

// ── GET /products/:id ──────────────────────────────────────────────────────────
exports.getProductById = async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('farmer', 'name phone location kycStatus');

  if (!product) return next(new ApiError(404, 'Product not found'));
  sendSuccess(res, 200, 'Product fetched', product);
};

// ── POST /products ─────────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  const images = (req.files || []).map((f, i) => ({
    url: f.path,
    publicId: f.filename,
    isPrimary: i === 0,
  }));

  const product = await Product.create({
    ...req.body,
    farmer: req.user._id,
    images,
    availableStock: req.body.quantity?.value,
  });

  sendSuccess(res, 201, 'Product created', product);
};

// ── PATCH /products/:id ────────────────────────────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id, farmer: req.user._id });
  if (!product) return next(new ApiError(404, 'Product not found or not yours'));

  Object.assign(product, req.body);

  // Handle new image uploads
  if (req.files?.length) {
    const newImages = req.files.map((f, i) => ({
      url: f.path,
      publicId: f.filename,
      isPrimary: i === 0 && product.images.length === 0,
    }));
    product.images.push(...newImages);
  }

  await product.save();
  sendSuccess(res, 200, 'Product updated', product);
};

// ── DELETE /products/:id ───────────────────────────────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id, farmer: req.user._id });
  if (!product) return next(new ApiError(404, 'Product not found or not yours'));

  // Remove images from Cloudinary
  await Promise.allSettled(
    product.images.map((img) =>
      img.publicId ? cloudinary.uploader.destroy(img.publicId) : Promise.resolve()
    )
  );

  await product.deleteOne();
  sendSuccess(res, 200, 'Product deleted');
};

// ── GET /products/my-listings  (farmer) ───────────────────────────────────────
exports.getMyListings = async (req, res) => {
  const products = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, 200, 'My listings', products);
};
