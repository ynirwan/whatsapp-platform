const { Message, Contact, Campaign } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.getDashboardStats = async (req, res) => {
  try {
    const { accountId, startDate, endDate } = req.query;
    
    const dateFilter = startDate && endDate ? {
      createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] }
    } : {};

    const totalMessages = await Message.count({
      where: { accountId, ...dateFilter }
    });

    const sentMessages = await Message.count({
      where: { accountId, direction: 'outbound', ...dateFilter }
    });

    const receivedMessages = await Message.count({
      where: { accountId, direction: 'inbound', ...dateFilter }
    });

    const deliveredMessages = await Message.count({
      where: { accountId, status: 'delivered', ...dateFilter }
    });

    const totalContacts = await Contact.count({
      where: { accountId }
    });

    res.json({
      success: true,
      data: {
        totalMessages,
        sentMessages,
        receivedMessages,
        deliveredMessages,
        totalContacts,
        deliveryRate: sentMessages > 0 ? ((deliveredMessages / sentMessages) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

exports.getMessageTrends = async (req, res) => {
  try {
    const { accountId, days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const messages = await Message.findAll({
      where: {
        accountId,
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        [Message.sequelize.fn('DATE', Message.sequelize.col('createdAt')), 'date'],
        [Message.sequelize.fn('COUNT', Message.sequelize.col('id')), 'count']
      ],
      group: [Message.sequelize.fn('DATE', Message.sequelize.col('createdAt'))],
      order: [[Message.sequelize.fn('DATE', Message.sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    res.json({ success: true, data: { trends: messages } });
  } catch (error) {
    logger.error('Get message trends error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trends' });
  }
};
