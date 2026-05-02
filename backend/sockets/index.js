const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');
const { registerChatHandlers } = require('./chat.socket');
const { registerNotificationHandlers } = require('./notification.socket');

/**
 * Initialize Socket.io on the HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Auth middleware ────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('Authentication token missing'));

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('name role isActive');

      if (!user) return next(new Error('User not found'));
      if (!user.isActive) return next(new Error('Account deactivated'));

      socket.userId = String(user._id);
      socket.userRole = user.role;
      socket.userName = user.name;
      next();
    } catch (err) {
      logger.warn(`Socket auth failed: ${err.message}`);
      next(new Error('Authentication failed'));
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { userId, userName } = socket;
    logger.info(`[socket] Connected: ${userName} (${userId}) | id: ${socket.id}`);

    // Each user automatically joins their personal room (userId)
    socket.join(userId);

    // ── Register feature handlers ────────────────────────────────────────
    registerChatHandlers(socket, io);
    registerNotificationHandlers(socket, io);

    // ── joinOrderRoom ────────────────────────────────────────────────────
    socket.on('joinOrderRoom', ({ orderId }) => {
      socket.join(`order:${orderId}`);
      logger.debug(`[socket] ${userId} joined order room: ${orderId}`);
    });

    // ── disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info(`[socket] Disconnected: ${userId} | reason: ${reason}`);
    });

    // ── error ────────────────────────────────────────────────────────────
    socket.on('error', (err) => {
      logger.error(`[socket] Error on ${userId}: ${err.message}`);
    });
  });

  return io;
};

module.exports = initSocket;
