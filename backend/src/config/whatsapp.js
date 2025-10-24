require('dotenv').config();

module.exports = {
  apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0',
  apiToken: process.env.WHATSAPP_API_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
};
