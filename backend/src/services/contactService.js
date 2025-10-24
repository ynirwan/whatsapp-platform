const { Contact } = require('../models');
const logger = require('../utils/logger');

class ContactService {
  static async findOrCreateContact(accountId, phoneNumber, additionalData = {}) {
    try {
      const [contact, created] = await Contact.findOrCreate({
        where: { accountId, phoneNumber },
        defaults: { ...additionalData, phoneNumber }
      });

      return { contact, created };
    } catch (error) {
      logger.error('Find or create contact error:', error);
      throw error;
    }
  }

  static async updateContactActivity(contactId) {
    try {
      await Contact.update(
        { lastMessageAt: new Date() },
        { where: { id: contactId } }
      );
    } catch (error) {
      logger.error('Update contact activity error:', error);
    }
  }

  static async bulkImport(accountId, contacts) {
    const results = { imported: 0, skipped: 0, errors: [] };

    for (const contactData of contacts) {
      try {
        const { created } = await this.findOrCreateContact(accountId, contactData.phoneNumber, contactData);
        if (created) results.imported++;
        else results.skipped++;
      } catch (error) {
        results.errors.push({ phoneNumber: contactData.phoneNumber, error: error.message });
      }
    }

    return results;
  }
}

module.exports = ContactService;
