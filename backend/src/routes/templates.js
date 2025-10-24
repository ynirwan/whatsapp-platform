const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const Joi = require('joi');

const createTemplateSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  category: Joi.string().valid('MARKETING', 'UTILITY', 'AUTHENTICATION').required(),
  language: Joi.string().default('en'),
  components: Joi.array().required()
});

const updateTemplateSchema = Joi.object({
  name: Joi.string().optional(),
  category: Joi.string().valid('MARKETING', 'UTILITY', 'AUTHENTICATION').optional(),
  components: Joi.array().optional()
});

router.post('/', auth, validate(createTemplateSchema), templateController.createTemplate);
router.get('/', auth, templateController.getTemplates);
router.put('/:id', auth, validate(updateTemplateSchema), templateController.updateTemplate);
router.delete('/:id', auth, templateController.deleteTemplate);

module.exports = router;
