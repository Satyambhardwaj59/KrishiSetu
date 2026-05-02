const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

// ── GET /chat/messages/:userId ─────────────────────────────────────────────────
// Fetch conversation between req.user and :userId (optionally filtered by orderId)
exports.getMessages = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 30);
  const skip = (page - 1) * limit;

  const me = req.user._id;
  const other = req.params.userId;

  const filter = {
    $or: [
      { sender: me, receiver: other },
      { sender: other, receiver: me },
    ],
    deletedBy: { $nin: [me] },
  };
  if (req.query.orderId) filter.order = req.query.orderId;

  const [messages, total] = await Promise.all([
    Message.find(filter)
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .lean(),
    Message.countDocuments(filter),
  ]);

  // Mark unread messages (sent by "other") as read
  await Message.updateMany(
    { sender: other, receiver: me, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  sendPaginated(res, 'Messages fetched', messages.reverse(), page, limit, total);
};

// ── GET /chat/conversations ────────────────────────────────────────────────────
// Returns the latest message per unique conversation partner
exports.getConversations = async (req, res) => {
  const me = req.user._id;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: me }, { receiver: me }],
        deletedBy: { $nin: [me] },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ['$sender', me] }, '$receiver', '$sender'],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiver', me] }, { $eq: ['$isRead', false] }] },
              1, 0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'partner',
      },
    },
    { $unwind: '$partner' },
    {
      $project: {
        partner: { _id: 1, name: 1, phone: 1 },
        lastMessage: { content: 1, type: 1, createdAt: 1, isRead: 1 },
        unreadCount: 1,
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  sendSuccess(res, 200, 'Conversations fetched', conversations);
};

// ── DELETE /chat/messages/:messageId ──────────────────────────────────────────
exports.deleteMessage = async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) return next(new ApiError(404, 'Message not found'));

  const userId = req.user._id;
  if (!message.deletedBy.includes(userId)) {
    message.deletedBy.push(userId);
    await message.save();
  }

  sendSuccess(res, 200, 'Message deleted for you');
};
