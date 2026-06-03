const http      = require('http');
const app       = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets');
const logger    = require('./utils/logger');
const { initWeatherCron } = require('./utils/weatherCron');

const PORT = process.env.PORT || 5000;

// ── Startup ────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  // Attach Socket.io and expose `io` on the Express app (accessible in controllers)
  const io = initSocket(httpServer);
  app.set('io', io);

  // Start weather alert cron jobs (passes io for real-time WebSocket alerts)
  initWeatherCron(io);

  httpServer.listen(PORT, () => {
    logger.info(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌾  KrishiSetu API  –  v1.0.0
  🚀  Running on port  ${PORT}
  🌍  Environment: ${process.env.NODE_ENV || 'development'}
  📡  Socket.io: enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  const shutdown = (signal) => {
    logger.info(`${signal} received – shutting down gracefully...`);
    httpServer.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    shutdown('UnhandledRejection');
  });
};

start();
