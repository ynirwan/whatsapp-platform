const { messageQueue } = require('../services/queueService');
const MessageService = require('../services/messageService');
const logger = require('../utils/logger');

messageQueue.process(async (job) => {
  const { accountId, contactId, messageData } = job.data;
  
  try {
    logger.info(`Processing message job ${job.id}`);
    await MessageService.sendMessage(accountId, contactId, messageData);
    return { success: true };
  } catch (error) {
    logger.error(`Message job ${job.id} failed:`, error);
    throw error;
  }
});

module.exports = messageQueue;
