const { WhatsAppAccount, Webhook } = require('../models');
const MessageService = require('../services/messageService');
const automationController = require('./automationController');
const logger = require('../utils/logger');

// @desc    Verify webhook (GET)
// @route   GET /api/v1/webhooks/whatsapp
// @access  Public
exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    logger.info('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    logger.warn('Webhook verification failed');
    res.sendStatus(403);
  }
};

// @desc    Receive webhook events (POST)
// @route   POST /api/v1/webhooks/whatsapp
// @access  Public (with signature verification)
exports.receiveWebhook = async (req, res) => {
  try {
    const body = req.body;

    // Respond quickly to acknowledge receipt
    res.sendStatus(200);

    // Process webhook asynchronously
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          await processWebhookChange(change);
        }
      }
    }
  } catch (error) {
    logger.error('Webhook processing error:', error);
    // Still return 200 to Meta to prevent retries
    res.sendStatus(200);
  }
};

/**
 * Process webhook change event
 */
async function processWebhookChange(change) {
  try {
    const { field, value } = change;

    if (field !== 'messages') {
      logger.info('Ignoring non-message webhook', { field });
      return;
    }

    // Find account by phone number ID
    const account = await WhatsAppAccount.findOne({
      where: { phoneNumberId: value.metadata.phone_number_id }
    });

    if (!account) {
      logger.warn('Account not found for webhook', { 
        phoneNumberId: value.metadata.phone_number_id 
      });
      return;
    }

    // Log webhook
    await Webhook.create({
      accountId: account.id,
      eventType: field,
      payload: value,
      status: 'pending'
    });

    // Process messages
    if (value.messages) {
      for (const message of value.messages) {
        await MessageService.processIncomingMessage(account.id, message);
	await automationController.processAutomation(account.id, message);      
      }
    }

    // Process message statuses
    if (value.statuses) {
      for (const status of value.statuses) {
        await MessageService.updateMessageStatus(
          status.id,
          status.status,
          new Date(parseInt(status.timestamp) * 1000)
        );
      }
    }

    // Update webhook status
    await Webhook.update(
      { status: 'processed', processedAt: new Date() },
      { where: { payload: value, status: 'pending' } }
    );

    logger.info('Webhook processed successfully');
  } catch (error) {
    logger.error('Error processing webhook change:', error);
    
    // Mark webhook as failed
    await Webhook.update(
      { 
        status: 'failed', 
        errorMessage: error.message,
        processedAt: new Date()
      },
      { where: { payload: change.value, status: 'pending' } }
    );
  }
}
