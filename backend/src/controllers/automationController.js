const { WhatsAppAccount } = require('../models');
const logger = require('../utils/logger');

// @desc    Create auto-reply rule
// @route   POST /api/v1/automation/auto-reply
// @access  Private
exports.createAutoReply = async (req, res) => {
  try {
    const { accountId, trigger, response, enabled } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const settings = account.settings || {};
    const autoReplies = settings.autoReplies || [];

    autoReplies.push({
      id: Date.now().toString(),
      trigger,
      response,
      enabled: enabled !== false,
      createdAt: new Date()
    });

    await account.update({
      settings: { ...settings, autoReplies }
    });

    res.status(201).json({
      success: true,
      message: 'Auto-reply rule created',
      data: { autoReplies }
    });
  } catch (error) {
    logger.error('Create auto-reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create auto-reply'
    });
  }
};

// @desc    Get auto-reply rules
// @route   GET /api/v1/automation/auto-reply
// @access  Private
exports.getAutoReplies = async (req, res) => {
  try {
    const { accountId } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const autoReplies = account.settings?.autoReplies || [];

    res.json({
      success: true,
      data: { autoReplies }
    });
  } catch (error) {
    logger.error('Get auto-replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auto-replies'
    });
  }
};

// @desc    Update auto-reply rule
// @route   PUT /api/v1/automation/auto-reply/:id
// @access  Private
exports.updateAutoReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId, trigger, response, enabled } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const settings = account.settings || {};
    const autoReplies = settings.autoReplies || [];

    const index = autoReplies.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Auto-reply rule not found'
      });
    }

    autoReplies[index] = {
      ...autoReplies[index],
      trigger: trigger || autoReplies[index].trigger,
      response: response || autoReplies[index].response,
      enabled: enabled !== undefined ? enabled : autoReplies[index].enabled,
      updatedAt: new Date()
    };

    await account.update({
      settings: { ...settings, autoReplies }
    });

    res.json({
      success: true,
      message: 'Auto-reply rule updated',
      data: { autoReply: autoReplies[index] }
    });
  } catch (error) {
    logger.error('Update auto-reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update auto-reply'
    });
  }
};

// @desc    Delete auto-reply rule
// @route   DELETE /api/v1/automation/auto-reply/:id
// @access  Private
exports.deleteAutoReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const settings = account.settings || {};
    const autoReplies = (settings.autoReplies || []).filter(r => r.id !== id);

    await account.update({
      settings: { ...settings, autoReplies }
    });

    res.json({
      success: true,
      message: 'Auto-reply rule deleted'
    });
  } catch (error) {
    logger.error('Delete auto-reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete auto-reply'
    });
  }
};

// Process incoming message for automation
exports.processAutomation = async (accountId, message) => {
  try {
    const account = await WhatsAppAccount.findByPk(accountId);
    if (!account) return;

    const autoReplies = account.settings?.autoReplies || [];
    const messageText = message.text?.body?.toLowerCase() || '';

    // Check for matching triggers
    for (const rule of autoReplies) {
      if (!rule.enabled) continue;

      const triggerLower = rule.trigger.toLowerCase();
      if (messageText.includes(triggerLower)) {
        // Send auto-reply
        const MessageService = require('../services/messageService');
        const Contact = require('../models').Contact;

        const contact = await Contact.findOne({
          where: { accountId, phoneNumber: message.from }
        });

        if (contact) {
          await MessageService.sendMessage(accountId, contact.id, {
            type: 'text',
            text: rule.response
          });

          logger.info(`Auto-reply sent for trigger: ${rule.trigger}`);
        }
        break; // Only send one auto-reply per message
      }
    }
  } catch (error) {
    logger.error('Process automation error:', error);
  }
};
