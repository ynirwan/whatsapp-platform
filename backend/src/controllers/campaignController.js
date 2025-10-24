const { Campaign, Template, WhatsAppAccount } = require('../models');
const logger = require('../utils/logger');

exports.createCampaign = async (req, res) => {
  try {
    const { accountId, templateId, name, description, targetContacts, scheduledAt } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const campaign = await Campaign.create({
      accountId,
      templateId,
      name,
      description,
      targetContacts,
      scheduledAt,
      status: 'draft'
    });

    res.status(201).json({ success: true, data: { campaign } });
  } catch (error) {
    logger.error('Create campaign error:', error);
    res.status(500).json({ success: false, message: 'Failed to create campaign' });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const { accountId } = req.query;

    const campaigns = await Campaign.findAll({
      where: { accountId },
      include: [{ model: Template, as: 'template' }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: { campaigns } });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch campaigns' });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    await campaign.update(updates);
    res.json({ success: true, data: { campaign } });
  } catch (error) {
    logger.error('Update campaign error:', error);
    res.status(500).json({ success: false, message: 'Failed to update campaign' });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByPk(id);
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    await campaign.destroy();
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    logger.error('Delete campaign error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete campaign' });
  }
};
