const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

// ── Helper: create + emit notification ────────────────────────────────────────
const notify = async (io, recipientId, type, title, body, data = {}) => {
  const notification = await Notification.create({ recipient: recipientId, type, title, body, data });
  if (io) io.to(String(recipientId)).emit('notification', notification);
};

// ── POST /orders ───────────────────────────────────────────────────────────────
exports.placeOrder = async (req, res, next) => {
  const { farmerId, items, deliveryAddress } = req.body;
  const io = req.app.get('io');

  // Validate products & compute amounts
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) return next(new ApiError(404, `Product ${item.productId} not found`));
    if (!product.isAvailable) return next(new ApiError(400, `Product "${product.name}" is not available`));

    const weights = { kg: 1, quintal: 100, ton: 1000 };

    // Unit conversion for stock checking
    const pStockUnit = product.quantity.unit || 'kg';
    const oUnit = item.quantity.unit || 'kg';

    let toNativeStockQty = item.quantity.value;
    if (weights[pStockUnit] && weights[oUnit]) {
      toNativeStockQty = item.quantity.value * (weights[oUnit] / weights[pStockUnit]);
    }

    if (product.availableStock < toNativeStockQty) {
      return next(new ApiError(400, `Insufficient stock for "${product.name}". Only ${product.availableStock} ${pStockUnit} available.`));
    }

    // Unit conversion for pricing
    const pPriceUnit = (product.price.unit || '').replace('per ', '').trim() || 'kg';
    let toPriceUnitQty = item.quantity.value;
    if (weights[pPriceUnit] && weights[oUnit]) {
      toPriceUnitQty = item.quantity.value * (weights[oUnit] / weights[pPriceUnit]);
    }

    const lineTotal = product.price.value * toPriceUnitQty;
    totalAmount += lineTotal;

    // Deduct stock from the seller
    product.availableStock -= toNativeStockQty;
    if (product.availableStock === 0) {
      product.isAvailable = false;
    }
    await product.save();

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: { value: product.price.value, currency: product.price.currency },
      imageUrl: product.images?.[0]?.url,
    });
  }

  const platformFee = Math.round(totalAmount * 0.02); // 2% platform fee
  const netAmount = totalAmount + platformFee;

  const order = await Order.create({
    buyer: req.user._id,
    farmer: farmerId,
    items: orderItems,
    totalAmount,
    platformFee,
    netAmount,
    deliveryAddress,
  });

  // Notify farmer
  await notify(io, farmerId, 'order_placed',
    'New Order Received 🌾',
    `You have a new order worth ₹${netAmount}`,
    { orderId: order._id }
  );

  sendSuccess(res, 201, 'Order placed successfully', order);
};

// ── GET /orders ────────────────────────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.user.role === 'buyer') filter.buyer = req.user._id;
  if (req.user.role === 'farmer') filter.farmer = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('buyer', 'name phone')
      .populate('farmer', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  sendPaginated(res, 'Orders fetched', orders, page, limit, total);
};

// ── GET /orders/:id ────────────────────────────────────────────────────────────
exports.getOrderById = async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name phone location')
    .populate('farmer', 'name phone location')
    .populate('items.product', 'name images');

  if (!order) return next(new ApiError(404, 'Order not found'));

  const userId = String(req.user._id);
  const isParty = [String(order.buyer._id), String(order.farmer._id)].includes(userId);
  if (!isParty && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorised to view this order'));
  }

  sendSuccess(res, 200, 'Order fetched', order);
};

// ── PATCH /orders/:id/status ───────────────────────────────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  const { status, note } = req.body;
  const io = req.app.get('io');

  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError(404, 'Order not found'));

  const userId = String(req.user._id);
  const isFarmer = String(order.farmer) === userId;
  const isBuyer = String(order.buyer) === userId;
  const isAdmin = req.user.role === 'admin';

  // Permission matrix
  const farmerAllowed = ['accepted', 'rejected', 'shipped'];
  const buyerAllowed = ['cancelled', 'delivered'];

  if ((isFarmer && !farmerAllowed.includes(status)) ||
    (isBuyer && !buyerAllowed.includes(status)) ||
    (!isFarmer && !isBuyer && !isAdmin)) {
    return next(new ApiError(403, 'You cannot set this status'));
  }

  order.status = status;
  order.statusHistory.push({ status, changedBy: req.user._id, note });
  if (status === 'delivered') order.deliveredAt = new Date();

  await order.save();

  // Emit notification to the other party
  const recipientId = isFarmer ? order.buyer : order.farmer;
  const notifTypeMap = {
    accepted: 'order_accepted',
    rejected: 'order_rejected',
    shipped: 'order_shipped',
    delivered: 'order_delivered',
    cancelled: 'order_cancelled',
  };

  await notify(io, recipientId, notifTypeMap[status],
    `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    `Your order #${order._id} has been ${status}`,
    { orderId: order._id }
  );

  sendSuccess(res, 200, `Order ${status}`, order);
};
