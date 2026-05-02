const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Register notification socket event handlers.
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
const registerNotificationHandlers = (socket, io) => {
  const userId = socket.userId;

  // ── joinNotificationRoom ──────────────────────────────────────────────────
  // Client should call this immediately after connect
  socket.on('joinNotificationRoom', () => {
    socket.join(`notif:${userId}`);
    logger.debug(`[notif] ${userId} joined notification room`);
  });

  // ── markNotificationRead ──────────────────────────────────────────────────
  socket.on('markNotificationRead', async ({ notificationId }) => {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true, readAt: new Date() }
      );
      socket.emit('notificationRead', { notificationId });
    } catch (err) {
      logger.error(`[notif] markNotificationRead error: ${err.message}`);
    }
  });

  // ── getUnreadCount ────────────────────────────────────────────────────────
  socket.on('getUnreadCount', async () => {
    try {
      const count = await Notification.countDocuments({ recipient: userId, isRead: false });
      socket.emit('unreadCount', { count });
    } catch (err) {
      logger.error(`[notif] getUnreadCount error: ${err.message}`);
    }
  });
};

/**
 * Utility: push a notification to a specific user's socket room.
 * Can be imported and used by any controller.
 *
 * @param {import('socket.io').Server} io
 * @param {string} recipientId
 * @param {object} notification  - Mongoose Notification document
 */
const emitNotification = (io, recipientId, notification) => {
  io.to(String(recipientId)).emit('notification', notification);
  io.to(`notif:${recipientId}`).emit('notification', notification);
};

module.exports = { registerNotificationHandlers, emitNotification };
