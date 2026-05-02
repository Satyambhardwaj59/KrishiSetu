const Notification = require('../models/Notification');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

// ── GET /notifications ─────────────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  sendPaginated(res, 'Notifications fetched', notifications, page, limit, total);
};

// ── PATCH /notifications/:id/read ─────────────────────────────────────────────
exports.markAsRead = async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) return next(new ApiError(404, 'Notification not found'));
  sendSuccess(res, 200, 'Marked as read', notification);
};

// ── PATCH /notifications/read-all ─────────────────────────────────────────────
exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  sendSuccess(res, 200, 'All notifications marked as read');
};

// ── DELETE /notifications/:id ──────────────────────────────────────────────────
exports.deleteNotification = async (req, res, next) => {
  const result = await Notification.deleteOne({ _id: req.params.id, recipient: req.user._id });
  if (!result.deletedCount) return next(new ApiError(404, 'Notification not found'));
  sendSuccess(res, 200, 'Notification deleted');
};
