const express = require('express');
const router = express.Router();
const whatsappAccountController = require('../controllers/whatsappAccountController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const createAccountSchema = Joi.object({
  phoneNumberId: Joi.string().required(),
  businessAccountId: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  displayName: Joi.string().optional(),
  accessToken: Joi.string().required()
});

const updateAccountSchema = Joi.object({
  displayName: Joi.string().optional(),
  accessToken: Joi.string().optional(),
  settings: Joi.object().optional()
});

const testConnectionSchema = Joi.object({
  phoneNumberId: Joi.string().required(),
  accessToken: Joi.string().required()
});

// Routes
router.post('/', auth, validate(createAccountSchema), whatsappAccountController.createAccount);
router.get('/', auth, whatsappAccountController.getAccounts);
router.get('/:id', auth, whatsappAccountController.getAccount);
router.put('/:id', auth, validate(updateAccountSchema), whatsappAccountController.updateAccount);
router.delete('/:id', auth, whatsappAccountController.deleteAccount);
router.post('/test', auth, validate(testConnectionSchema), whatsappAccountController.testConnection);
router.get('/:id/status', auth, whatsappAccountController.getAccountStatus);

module.exports = router;
