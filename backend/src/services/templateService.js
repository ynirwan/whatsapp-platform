const { Template } = require('../models');
const logger = require('../utils/logger');

class TemplateService {
  static async getApprovedTemplates(accountId) {
    try {
      return await Template.findAll({
        where: { accountId, status: 'APPROVED' },
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      logger.error('Get approved templates error:', error);
      throw error;
    }
  }

  static async validateTemplateParameters(template, parameters) {
    // Add validation logic here
    return true;
  }
}

module.exports = TemplateService;
