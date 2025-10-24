const { Message, Contact, WhatsAppAccount, Media } = require('../models');
const WhatsAppService = require('./whatsappService');
const logger = require('../utils/logger');

class MessageService {
  /**
   * Send message
   */
  static async sendMessage(accountId, contactId, messageData) {
    try {
      // Get account and contact
      const account = await WhatsAppAccount.findByPk(accountId);
      const contact = await Contact.findByPk(contactId);

      if (!account || !contact) {
        throw new Error('Account or contact not found');
      }

      // Initialize WhatsApp service
      const whatsappService = new WhatsAppService(account.accessToken, account.phoneNumberId);

      let whatsappResponse;

      // Send based on message type
      switch (messageData.type) {
        case 'text':
          whatsappResponse = await whatsappService.sendTextMessage(
            contact.phoneNumber,
            messageData.text
          );
          break;

        case 'template':
          whatsappResponse = await whatsappService.sendTemplateMessage(
            contact.phoneNumber,
            messageData.templateName,
            messageData.languageCode,
            messageData.components
          );
          break;

        case 'image':
        case 'video':
        case 'document':
        case 'audio':
          whatsappResponse = await whatsappService.sendMediaMessage(
            contact.phoneNumber,
            messageData.type,
            messageData.mediaIdOrUrl,
            messageData.caption,
            messageData.filename
          );
          break;

        default:
          throw new Error('Unsupported message type');
      }

      // Create message record
      const message = await Message.create({
        accountId,
        contactId,
        messageId: whatsappResponse.messages[0].id,
        wamId: whatsappResponse.messages[0].id,
        type: messageData.type,
        direction: 'outbound',
        status: 'sent',
        content: messageData,
        templateName: messageData.templateName || null,
        sentAt: new Date()
      });

      // Update contact last message time
      await contact.update({ lastMessageAt: new Date() });

      logger.info(`Message sent successfully`, { messageId: message.id });

      return message;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a contact
   */
  static async getContactMessages(accountId, contactId, options = {}) {
    const { limit = 50, offset = 0, direction = null } = options;

    const where = { accountId, contactId };
    if (direction) where.direction = direction;

    const messages = await Message.findAndCountAll({
      where,
      include: [
        { model: Contact, as: 'contact' },
        { model: Media, as: 'media' }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return messages;
  }

  /**
   * Update message status
   */
  static async updateMessageStatus(messageId, status, timestamp = new Date()) {
    try {
      const updateData = { status };

      switch (status) {
        case 'delivered':
          updateData.deliveredAt = timestamp;
          break;
        case 'read':
          updateData.readAt = timestamp;
          break;
        case 'failed':
          // Error details should be provided separately
          break;
      }

      const message = await Message.findOne({ where: { messageId } });
      if (message) {
        await message.update(updateData);
        logger.info(`Message status updated`, { messageId, status });
      }

      return message;
    } catch (error) {
      logger.error('Error updating message status:', error);
      throw error;
    }
  }

  /**
   * Process incoming message (from webhook)
   */
  static async processIncomingMessage(accountId, webhookData) {
    try {
      const { from, id, timestamp, type, ...messageContent } = webhookData;

      // Find or create contact
      let contact = await Contact.findOne({
        where: { accountId, phoneNumber: from }
      });

      if (!contact) {
        contact = await Contact.create({
          accountId,
          phoneNumber: from,
          name: webhookData.profile?.name || from,
          lastMessageAt: new Date()
        });
      } else {
        await contact.update({ lastMessageAt: new Date() });
      }

      // Create message record
      const message = await Message.create({
        accountId,
        contactId: contact.id,
        messageId: id,
        wamId: id,
        type,
        direction: 'inbound',
        status: 'delivered',
        content: messageContent,
        sentAt: new Date(parseInt(timestamp) * 1000),
        deliveredAt: new Date()
      });

      // Handle media messages
      if (['image', 'video', 'document', 'audio'].includes(type)) {
        await Media.create({
          messageId: message.id,
          mediaId: messageContent[type].id,
          mimeType: messageContent[type].mime_type,
          caption: messageContent[type].caption || null
        });
      }

      logger.info(`Incoming message processed`, { messageId: message.id });

      return { message, contact };
    } catch (error) {
      logger.error('Error processing incoming message:', error);
      throw error;
    }
  }
}

module.exports = MessageService;
