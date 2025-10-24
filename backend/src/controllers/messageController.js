const MessageService = require('../services/messageService');
const { Message, Contact, WhatsAppAccount } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.sendMessage = async (req, res) => {
  try {
    const { accountId, contactId, type, ...messageData } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const message = await MessageService.sendMessage(accountId, contactId, {
      type,
      ...messageData
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { accountId, limit, offset, direction } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const messages = await MessageService.getContactMessages(accountId, contactId, {
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      direction
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { accountId, limit = 50, offset = 0, search } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const where = { accountId };
    
    if (search) {
      where['$content$'] = { [Op.iLike]: `%${search}%` };
    }

    const messages = await Message.findAndCountAll({
      where,
      include: [
        { 
          model: Contact, 
          as: 'contact',
          attributes: ['id', 'phoneNumber', 'name', 'profilePicUrl']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { accountId } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const message = await Message.findOne({
      where: { id: messageId, accountId }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const WhatsAppService = require('../services/whatsappService');
    const whatsappService = new WhatsAppService(account.accessToken, account.phoneNumberId);
    await whatsappService.markAsRead(message.messageId);

    await message.update({ status: 'read', readAt: new Date() });

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
};

exports.getMessageStats = async (req, res) => {
  try {
    const { accountId, startDate, endDate } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const where = { accountId };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const stats = await Message.findAll({
      where,
      attributes: [
        'direction',
        'status',
        'type',
        [Message.sequelize.fn('COUNT', Message.sequelize.col('id')), 'count']
      ],
      group: ['direction', 'status', 'type'],
      raw: true
    });

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};
