const { Template, WhatsAppAccount } = require('../models');
const logger = require('../utils/logger');

exports.createTemplate = async (req, res) => {
  try {
    const { accountId, name, category, language, components } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const template = await Template.create({
      accountId,
      name,
      category,
      language,
      components,
      status: 'PENDING'
    });

    res.status(201).json({ success: true, data: { template } });
  } catch (error) {
    logger.error('Create template error:', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const { accountId } = req.query;

    const templates = await Template.findAll({
      where: { accountId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: { templates } });
  } catch (error) {
    logger.error('Get templates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const template = await Template.findByPk(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    await template.update(updates);
    res.json({ success: true, data: { template } });
  } catch (error) {
    logger.error('Update template error:', error);
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findByPk(id);
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    await template.destroy();
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    logger.error('Delete template error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
};
