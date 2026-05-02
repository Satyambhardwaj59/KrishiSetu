const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Register all chat socket event handlers on a single socket connection.
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
const registerChatHandlers = (socket, io) => {
  const userId = socket.userId; // set by auth middleware in index.js

  // ── join ──────────────────────────────────────────────────────────────────
  socket.on('join', ({ roomId }) => {
    socket.join(roomId);
    logger.debug(`[chat] ${userId} joined room ${roomId}`);
  });

  // ── sendMessage ───────────────────────────────────────────────────────────
  socket.on('sendMessage', async ({ receiverId, content, orderId, type = 'text' }, ack) => {
    try {
      const message = await Message.create({
        sender: userId,
        receiver: receiverId,
        content,
        order: orderId || undefined,
        type,
      });

      const populated = await message.populate([
        { path: 'sender', select: 'name' },
        { path: 'receiver', select: 'name' },
      ]);

      // Deliver to receiver's personal room
      io.to(receiverId).emit('receiveMessage', populated);

      // Also echo back to sender (in case of multiple tabs)
      socket.emit('receiveMessage', populated);

      // Create + emit notification to receiver
      const notif = await Notification.create({
        recipient: receiverId,
        type: 'new_message',
        title: `New message from ${populated.sender.name}`,
        body: content.substring(0, 100),
        data: { senderId: userId, messageId: message._id, orderId },
      });
      io.to(receiverId).emit('notification', notif);

      if (typeof ack === 'function') ack({ success: true, messageId: message._id });
    } catch (err) {
      logger.error(`[chat] sendMessage error: ${err.message}`);
      if (typeof ack === 'function') ack({ success: false, error: err.message });
    }
  });

  // ── typing ────────────────────────────────────────────────────────────────
  socket.on('typing', ({ receiverId, isTyping }) => {
    io.to(receiverId).emit('typing', { senderId: userId, isTyping });
  });

  // ── messageSeen ───────────────────────────────────────────────────────────
  socket.on('messageSeen', async ({ messageIds, senderId }) => {
    try {
      await Message.updateMany(
        { _id: { $in: messageIds }, receiver: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      // Tell the original sender their messages were seen
      io.to(senderId).emit('messageSeen', { messageIds, seenBy: userId });
    } catch (err) {
      logger.error(`[chat] messageSeen error: ${err.message}`);
    }
  });
};

module.exports = { registerChatHandlers };
