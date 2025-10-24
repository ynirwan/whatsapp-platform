const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');
const { User } = require('../models');
const logger = require('../utils/logger');
const CacheService = require('../services/cacheService');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await User.findByPk(decoded.id);
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user.id;
      socket.userEmail = user.email;
      next();
    } catch (error) {
      logger.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userEmail} (${socket.id})`);

    socket.join(`user:${socket.userId}`);
    CacheService.addToSet('online:users', socket.userId);

    socket.on('join:account', (accountId) => {
      socket.join(`account:${accountId}`);
      logger.info(`User ${socket.userId} joined account ${accountId}`);
    });

    socket.on('leave:account', (accountId) => {
      socket.leave(`account:${accountId}`);
      logger.info(`User ${socket.userId} left account ${accountId}`);
    });

    socket.on('typing:start', ({ accountId, contactId }) => {
      socket.to(`account:${accountId}`).emit('typing:start', {
        userId: socket.userId,
        contactId
      });
    });

    socket.on('typing:stop', ({ accountId, contactId }) => {
      socket.to(`account:${accountId}`).emit('typing:stop', {
        userId: socket.userId,
        contactId
      });
    });

    socket.on('message:read', async ({ messageId, accountId }) => {
      socket.to(`account:${accountId}`).emit('message:read', {
        messageId,
        userId: socket.userId,
        readAt: new Date()
      });
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userEmail} (${socket.id})`);
      CacheService.removeFromSet('online:users', socket.userId);
    });
  });

  io.emitToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  io.emitToAccount = (accountId, event, data) => {
    io.to(`account:${accountId}`).emit(event, data);
  };

  logger.info('✓ Socket.io initialized');

  return io;
}

module.exports = initializeSocket;
