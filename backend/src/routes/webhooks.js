const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { verifyWebhookSignature } = require('../middleware/webhookVerify');

// Webhook verification (GET)
router.get('/whatsapp', webhookController.verifyWebhook);

// Receive webhook events (POST)
router.post('/whatsapp', verifyWebhookSignature, webhookController.receiveWebhook);

module.exports = router;

