const { createClient } = require('redis');
const logger = require('../utils/logger');

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('✓ Redis connected successfully');
});

redisClient.on('ready', () => {
  logger.info('✓ Redis ready to accept commands');
});

module.exports = redisClient;
