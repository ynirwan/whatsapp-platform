const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const { port, nodeEnv } = require('./config/env');
const logger = require('./utils/logger');

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup (will be implemented later)
// const io = require('./socket')(server);

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('✓ Database connection established');

    // Sync models (use migrations in production)
    if (nodeEnv === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('✓ Database models synchronized');
    }

    // Start server
    server.listen(port, () => {
      logger.info(`✓ Server running on port ${port} in ${nodeEnv} mode`);
      logger.info(`✓ API endpoint: http://localhost:${port}/api/v1`);
    });
  } catch (error) {
    logger.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

// Start the server
startServer();
