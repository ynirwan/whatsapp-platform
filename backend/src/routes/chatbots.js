/* 
 * COPY TO: ~/whatsapp-platform/backend/src/routes/chatbots.js
 */
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { auth } = require('../middleware/auth');
//const { validate } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Validation schemas
const createChatbotValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('whatsappAccountId').notEmpty().withMessage('WhatsApp account ID is required').isUUID(),
  body('type').optional().isIn(['rule-based', 'ai-powered', 'hybrid']),
  body('aiProvider').optional().isIn(['openai', 'anthropic', 'google', 'custom']),
  body('aiModel').optional().isString(),
  body('aiApiKey').optional().isString(),
  body('aiSystemPrompt').optional().isString(),
  body('aiTemperature').optional().isFloat({ min: 0, max: 2 }),
  body('aiMaxTokens').optional().isInt({ min: 1, max: 4000 })
];

const updateChatbotValidation = [
  param('id').isUUID(),
  body('name').optional().notEmpty(),
  body('type').optional().isIn(['rule-based', 'ai-powered', 'hybrid']),
  body('aiProvider').optional().isIn(['openai', 'anthropic', 'google', 'custom']),
  body('isActive').optional().isBoolean()
];

const testChatbotValidation = [
  param('id').isUUID(),
  body('message').notEmpty().withMessage('Message is required'),
  body('phoneNumber').optional().isString()
];

const addRuleValidation = [
  param('id').isUUID(),
  body('trigger').notEmpty().withMessage('Trigger is required'),
  body('response').notEmpty().withMessage('Response is required'),
  body('type').optional().isIn(['exact', 'contains', 'regex', 'starts-with', 'ends-with']),
  body('priority').optional().isInt()
];

// Apply authentication to all routes
router.use(auth);

// Chatbot CRUD
router.post('/', createChatbotValidation, validate, chatbotController.createChatbot);
router.get('/', chatbotController.getChatbots);
router.get('/:id', param('id').isUUID(), validate, chatbotController.getChatbot);
router.put('/:id', updateChatbotValidation, validate, chatbotController.updateChatbot);
router.delete('/:id', param('id').isUUID(), validate, chatbotController.deleteChatbot);

// Chatbot actions
router.patch('/:id/toggle', param('id').isUUID(), validate, chatbotController.toggleStatus);
router.post('/:id/test', testChatbotValidation, validate, chatbotController.testChatbot);

// Conversations
router.get('/:id/conversations', param('id').isUUID(), validate, chatbotController.getConversations);
router.get('/:id/conversations/:conversationId/messages', chatbotController.getConversationMessages);
router.patch('/conversations/:conversationId/end', chatbotController.endConversation);
router.post('/conversations/:conversationId/rate', chatbotController.rateConversation);

// Analytics
router.get('/:id/analytics', param('id').isUUID(), validate, chatbotController.getAnalytics);

// Rules management
router.get('/:id/rules', param('id').isUUID(), validate, chatbotController.getRules);
router.post('/:id/rules', addRuleValidation, validate, chatbotController.addRule);
router.put('/:id/rules/:ruleId', chatbotController.updateRule);
router.delete('/:id/rules/:ruleId', chatbotController.deleteRule);
router.post('/:id/rules/bulk-import', param('id').isUUID(), validate, chatbotController.bulkImportRules);

module.exports = router;
