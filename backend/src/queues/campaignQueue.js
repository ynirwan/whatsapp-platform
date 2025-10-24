const { campaignQueue } = require('../services/queueService');
const MessageService = require('../services/messageService');
const { Campaign, Contact } = require('../models');
const logger = require('../utils/logger');

campaignQueue.process(async (job) => {
  const { campaignId } = job.data;
  
  try {
    logger.info(`Processing campaign job ${job.id}`);
    
    const campaign = await Campaign.findByPk(campaignId, {
      include: ['template']
    });

    if (!campaign) throw new Error('Campaign not found');

    const contacts = await Contact.findAll({
      where: { accountId: campaign.accountId }
    });

    for (const contact of contacts) {
      await MessageService.sendMessage(campaign.accountId, contact.id, {
        type: 'template',
        templateName: campaign.template.name,
        languageCode: campaign.template.language
      });
    }

    await campaign.update({ status: 'completed', completedAt: new Date() });
    
    return { success: true, messagesSent: contacts.length };
  } catch (error) {
    logger.error(`Campaign job ${job.id} failed:`, error);
    throw error;
  }
});

module.exports = campaignQueue;
