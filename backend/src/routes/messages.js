const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const Joi = require('joi');

const sendMessageSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  contactId: Joi.string().uuid().required(),
  type: Joi.string().valid('text', 'image', 'video', 'audio', 'document', 'template').required(),
  text: Joi.string().when('type', { is: 'text', then: Joi.required() }),
  templateName: Joi.string().when('type', { is: 'template', then: Joi.required() }),
  languageCode: Joi.string().when('type', { is: 'template', then: Joi.required() }),
  components: Joi.array().when('type', { is: 'template', then: Joi.optional() }),
  mediaIdOrUrl: Joi.string().when('type', { 
    is: Joi.valid('image', 'video', 'audio', 'document'), 
    then: Joi.required() 
  }),
  caption: Joi.string().optional(),
  filename: Joi.string().optional()
});

router.post('/send', auth, validate(sendMessageSchema), messageController.sendMessage);
router.get('/contact/:contactId', auth, messageController.getContactMessages);
router.get('/', auth, messageController.getMessages);
router.put('/:messageId/read', auth, messageController.markAsRead);
router.get('/stats', auth, messageController.getMessageStats);

module.exports = router;
