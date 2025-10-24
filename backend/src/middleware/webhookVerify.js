const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Verify webhook signature from Meta
 */
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    logger.warn('Webhook signature missing');
    return res.status(401).json({
      success: false,
      message: 'Signature missing'
    });
  }

  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const payload = JSON.stringify(req.body);
  
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    logger.warn('Invalid webhook signature');
    return res.status(401).json({
      success: false,
      message: 'Invalid signature'
    });
  }

  next();
};

module.exports = { verifyWebhookSignature };
