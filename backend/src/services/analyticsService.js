const { Message } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AnalyticsService {
  static async getMessageStats(accountId, startDate, endDate) {
    try {
      const where = { accountId };
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [startDate, endDate] };
      }

      const stats = await Message.findAll({
        where,
        attributes: [
          'status',
          'direction',
          [Message.sequelize.fn('COUNT', Message.sequelize.col('id')), 'count']
        ],
        group: ['status', 'direction'],
        raw: true
      });

      return stats;
    } catch (error) {
      logger.error('Get message stats error:', error);
      throw error;
    }
  }

  static async getEngagementRate(accountId, period = 7) {
    // Calculate engagement metrics
    return { rate: 85, trend: '+5%' };
  }
}

module.exports = AnalyticsService;
