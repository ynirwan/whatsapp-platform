const axios = require('axios');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor(accessToken, phoneNumberId) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Send text message
   */
  async sendTextMessage(to, text) {
    try {
      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { body: text }
      });

      logger.info(`Text message sent to ${to}`, { messageId: response.data.messages[0].id });
      return response.data;
    } catch (error) {
      logger.error('Error sending text message:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Send template message
   */
  async sendTemplateMessage(to, templateName, languageCode, components = []) {
    try {
      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components
        }
      });

      logger.info(`Template message sent to ${to}`, { 
        template: templateName,
        messageId: response.data.messages[0].id 
      });
      return response.data;
    } catch (error) {
      logger.error('Error sending template message:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Send media message (image, video, document, audio)
   */
  async sendMediaMessage(to, type, mediaIdOrUrl, caption = null, filename = null) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: type
      };

      // Construct media object
      const mediaObject = {};
      if (mediaIdOrUrl.startsWith('http')) {
        mediaObject.link = mediaIdOrUrl;
      } else {
        mediaObject.id = mediaIdOrUrl;
      }

      if (caption) mediaObject.caption = caption;
      if (filename) mediaObject.filename = filename;

      payload[type] = mediaObject;

      const response = await this.client.post(`/${this.phoneNumberId}/messages`, payload);

      logger.info(`${type} message sent to ${to}`, { messageId: response.data.messages[0].id });
      return response.data;
    } catch (error) {
      logger.error(`Error sending ${type} message:`, error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Send interactive button message
   */
  async sendButtonMessage(to, bodyText, buttons) {
    try {
      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: {
            buttons: buttons.map((btn, idx) => ({
              type: 'reply',
              reply: {
                id: btn.id || `btn_${idx}`,
                title: btn.title
              }
            }))
          }
        }
      });

      logger.info(`Button message sent to ${to}`, { messageId: response.data.messages[0].id });
      return response.data;
    } catch (error) {
      logger.error('Error sending button message:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Send interactive list message
   */
  async sendListMessage(to, bodyText, buttonText, sections) {
    try {
      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: bodyText },
          action: {
            button: buttonText,
            sections: sections
          }
        }
      });

      logger.info(`List message sent to ${to}`, { messageId: response.data.messages[0].id });
      return response.data;
    } catch (error) {
      logger.error('Error sending list message:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    try {
      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      });

      logger.info(`Message marked as read: ${messageId}`);
      return response.data;
    } catch (error) {
      logger.error('Error marking message as read:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Upload media
   */
  async uploadMedia(file, mimeType) {
    try {
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('file', file);
      formData.append('type', mimeType);

      const response = await this.client.post(`/${this.phoneNumberId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      logger.info('Media uploaded', { mediaId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Error uploading media:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Download media
   */
  async downloadMedia(mediaId) {
    try {
      // First get media URL
      const mediaInfo = await this.client.get(`/${mediaId}`);
      const mediaUrl = mediaInfo.data.url;

      // Download media
      const response = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        responseType: 'arraybuffer'
      });

      logger.info('Media downloaded', { mediaId });
      return response.data;
    } catch (error) {
      logger.error('Error downloading media:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Get media info
   */
  async getMediaInfo(mediaId) {
    try {
      const response = await this.client.get(`/${mediaId}`);
      return response.data;
    } catch (error) {
      logger.error('Error getting media info:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Delete media
   */
  async deleteMedia(mediaId) {
    try {
      const response = await this.client.delete(`/${mediaId}`);
      logger.info('Media deleted', { mediaId });
      return response.data;
    } catch (error) {
      logger.error('Error deleting media:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Create message template
   */
  async createTemplate(templateData) {
    try {
      const response = await this.client.post(`/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`, {
        name: templateData.name,
        category: templateData.category,
        language: templateData.language,
        components: templateData.components
      });

      logger.info('Template created', { templateName: templateData.name });
      return response.data;
    } catch (error) {
      logger.error('Error creating template:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Get templates
   */
  async getTemplates() {
    try {
      const response = await this.client.get(`/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`);
      return response.data;
    } catch (error) {
      logger.error('Error getting templates:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateName) {
    try {
      const response = await this.client.delete(`/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`, {
        params: { name: templateName }
      });
      logger.info('Template deleted', { templateName });
      return response.data;
    } catch (error) {
      logger.error('Error deleting template:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Get business profile
   */
  async getBusinessProfile() {
    try {
      const response = await this.client.get(`/${this.phoneNumberId}/whatsapp_business_profile`, {
        params: { fields: 'about,address,description,email,profile_picture_url,websites,vertical' }
      });
      return response.data.data[0];
    } catch (error) {
      logger.error('Error getting business profile:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(profileData) {
    try {
      const response = await this.client.post(`/${this.phoneNumberId}/whatsapp_business_profile`, {
        messaging_product: 'whatsapp',
        ...profileData
      });
      logger.info('Business profile updated');
      return response.data;
    } catch (error) {
      logger.error('Error updating business profile:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Get phone number info
   */
  async getPhoneNumberInfo() {
    try {
      const response = await this.client.get(`/${this.phoneNumberId}`, {
        params: { fields: 'verified_name,display_phone_number,quality_rating' }
      });
      return response.data;
    } catch (error) {
      logger.error('Error getting phone number info:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  _handleError(error) {
    if (error.response) {
      const { error: errorData } = error.response.data;
      return {
        code: errorData?.code || error.response.status,
        message: errorData?.message || 'WhatsApp API Error',
        details: errorData
      };
    }
    return {
      code: 'NETWORK_ERROR',
      message: error.message
    };
  }
}

module.exports = WhatsAppService;
