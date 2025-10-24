const { webhookQueue } = require('../services/queueService');
const logger = require('../utils/logger');

webhookQueue.process(async (job) => {
  const { webhookData } = job.data;
  
  try {
    logger.info(`Processing webhook job ${job.id}`);
    // Process webhook data
    return { success: true };
  } catch (error) {
    logger.error(`Webhook job ${job.id} failed:`, error);
    throw error;
  }
});

module.exports = webhookQueue;
