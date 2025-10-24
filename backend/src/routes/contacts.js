const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const createContactSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  phoneNumber: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  customFields: Joi.object().optional()
});

const updateContactSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  customFields: Joi.object().optional(),
  status: Joi.string().valid('active', 'blocked', 'unsubscribed').optional(),
  notes: Joi.string().optional()
});

const importContactsSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  contacts: Joi.array().items(Joi.object({
    phoneNumber: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    customFields: Joi.object().optional()
  })).required()
});

// Routes
router.post('/', auth, validate(createContactSchema), contactController.createContact);
router.get('/', auth, contactController.getContacts);
router.get('/:id', auth, contactController.getContact);
router.put('/:id', auth, validate(updateContactSchema), contactController.updateContact);
router.delete('/:id', auth, contactController.deleteContact);
router.post('/import', auth, validate(importContactsSchema), contactController.importContacts);

module.exports = router;

