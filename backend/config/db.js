// const mongoose = require('mongoose');
// const logger   = require('../utils/logger');

// /**
//  * Connect to MongoDB with retry logic
//  */
// const connectDB = async () => {
//   const MONGO_URI = process.env.MONGO_URI;

//   if (!MONGO_URI) {
//     logger.error('MONGO_URI is not defined in environment variables');
//     process.exit(1);
//   }

//   try {
//     const conn = await mongoose.connect(MONGO_URI, {
//       serverSelectionTimeoutMS: 5000,
//     });

//     logger.info(`✅  MongoDB connected: ${conn.connection.host}`);

//     mongoose.connection.on('disconnected', () => {
//       logger.warn('MongoDB disconnected – retrying in 5 s...');
//       setTimeout(connectDB, 5000);
//     });

//     mongoose.connection.on('error', (err) => {
//       logger.error(`MongoDB connection error: ${err.message}`);
//     });
//   } catch (err) {
//     logger.error(`MongoDB connection failed: ${err.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;






const mongoose = require('mongoose');
const logger   = require('../utils/logger');


const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    logger.error('❌ MONGO_URI is not defined in environment variables');
    return; // ❗ Do NOT crash app
  }

  try {
    logger.info('🔄 Connecting to MongoDB...');

    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ MongoDB connected`);

    // ── Event Listeners ─────────────────────────────
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected – retrying in 5 seconds...');
      setTimeout(connectDB, 5000);
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB connection error: ${err.message}`);
    });

  } catch (err) {
    logger.error(`❌ MongoDB connection failed: ${err.message}`);

    // 🔁 Retry instead of crashing
    logger.info('🔁 Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;