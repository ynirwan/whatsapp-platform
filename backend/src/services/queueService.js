const Queue = require('bull');
const logger = require('../utils/logger');

const messageQueue = new Queue('messages', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

const webhookQueue = new Queue('webhooks', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

const campaignQueue = new Queue('campaigns', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

messageQueue.on('completed', (job) => {
  logger.info(`Message job ${job.id} completed`);
});

messageQueue.on('failed', (job, err) => {
  logger.error(`Message job ${job.id} failed:`, err);
});

module.exports = {
  messageQueue,
  webhookQueue,
  campaignQueue
};
