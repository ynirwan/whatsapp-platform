const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const Joi = require('joi');

const createCampaignSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  templateId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  targetContacts: Joi.object().required(),
  scheduledAt: Joi.date().optional()
});

const updateCampaignSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid('draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled').optional(),
  scheduledAt: Joi.date().optional()
});

router.post('/', auth, validate(createCampaignSchema), campaignController.createCampaign);
router.get('/', auth, campaignController.getCampaigns);
router.put('/:id', auth, validate(updateCampaignSchema), campaignController.updateCampaign);
router.delete('/:id', auth, campaignController.deleteCampaign);

module.exports = router;
