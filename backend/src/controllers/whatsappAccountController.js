const { WhatsAppAccount } = require('../models');
const WhatsAppService = require('../services/whatsappService');
const logger = require('../utils/logger');
const crypto = require('crypto');

// @desc    Create WhatsApp Account
// @route   POST /api/v1/whatsapp-accounts
// @access  Private
exports.createAccount = async (req, res) => {
  try {
    const {
      phoneNumberId,
      businessAccountId,
      phoneNumber,
      displayName,
      accessToken
    } = req.body;

    // Verify the access token and credentials work
    const whatsappService = new WhatsAppService(accessToken, phoneNumberId);
    
    try {
      // Test the credentials by getting phone number info
      const phoneInfo = await whatsappService.getPhoneNumberInfo();
      logger.info('WhatsApp credentials verified:', phoneInfo);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid WhatsApp API credentials',
        error: error.message
      });
    }

    // Generate webhook verify token
    const webhookVerifyToken = crypto.randomBytes(32).toString('hex');

    // Create WhatsApp account
    const account = await WhatsAppAccount.create({
      userId: req.user.id,
      phoneNumberId,
      businessAccountId,
      phoneNumber,
      displayName,
      accessToken,
      webhookVerifyToken,
      status: 'active'
    });

    logger.info(`WhatsApp account created for user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'WhatsApp account connected successfully',
      data: {
        account: {
          id: account.id,
          phoneNumberId: account.phoneNumberId,
          phoneNumber: account.phoneNumber,
          displayName: account.displayName,
          webhookVerifyToken: account.webhookVerifyToken,
          status: account.status
        }
      }
    });
  } catch (error) {
    logger.error('Create WhatsApp account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create WhatsApp account'
    });
  }
};

// @desc    Get all WhatsApp accounts for user
// @route   GET /api/v1/whatsapp-accounts
// @access  Private
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await WhatsAppAccount.findAll({
      where: { userId: req.user.id },
      attributes: { exclude: ['accessToken'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { accounts }
    });
  } catch (error) {
    logger.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts'
    });
  }
};

// @desc    Get single WhatsApp account
// @route   GET /api/v1/whatsapp-accounts/:id
// @access  Private
exports.getAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await WhatsAppAccount.findOne({
      where: { id, userId: req.user.id },
      attributes: { exclude: ['accessToken'] }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    res.json({
      success: true,
      data: { account }
    });
  } catch (error) {
    logger.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account'
    });
  }
};

// @desc    Update WhatsApp account
// @route   PUT /api/v1/whatsapp-accounts/:id
// @access  Private
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, accessToken, settings } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    // If updating access token, verify it works
    if (accessToken) {
      const whatsappService = new WhatsAppService(accessToken, account.phoneNumberId);
      try {
        await whatsappService.getPhoneNumberInfo();
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid access token'
        });
      }
    }

    await account.update({
      displayName: displayName || account.displayName,
      accessToken: accessToken || account.accessToken,
      settings: settings || account.settings
    });

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: {
        account: {
          id: account.id,
          displayName: account.displayName,
          settings: account.settings
        }
      }
    });
  } catch (error) {
    logger.error('Update account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update account'
    });
  }
};

// @desc    Delete WhatsApp account
// @route   DELETE /api/v1/whatsapp-accounts/:id
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await WhatsAppAccount.findOne({
      where: { id, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    await account.destroy();

    logger.info(`WhatsApp account ${id} deleted by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'WhatsApp account deleted successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

// @desc    Test WhatsApp account connection
// @route   POST /api/v1/whatsapp-accounts/test
// @access  Private
exports.testConnection = async (req, res) => {
  try {
    const { phoneNumberId, accessToken } = req.body;

    const whatsappService = new WhatsAppService(accessToken, phoneNumberId);
    
    const phoneInfo = await whatsappService.getPhoneNumberInfo();
    const businessProfile = await whatsappService.getBusinessProfile();

    res.json({
      success: true,
      message: 'Connection successful',
      data: {
        phoneInfo,
        businessProfile
      }
    });
  } catch (error) {
    logger.error('Test connection error:', error);
    res.status(400).json({
      success: false,
      message: 'Connection test failed',
      error: error.message
    });
  }
};

// @desc    Get account status and metrics
// @route   GET /api/v1/whatsapp-accounts/:id/status
// @access  Private
exports.getAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await WhatsAppAccount.findOne({
      where: { id, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const whatsappService = new WhatsAppService(account.accessToken, account.phoneNumberId);
    const phoneInfo = await whatsappService.getPhoneNumberInfo();

    await account.update({
      qualityRating: phoneInfo.quality_rating || 'UNKNOWN',
      messagingLimit: phoneInfo.messaging_limit || null
    });

    res.json({
      success: true,
      data: {
        status: account.status,
        qualityRating: phoneInfo.quality_rating,
        messagingLimit: phoneInfo.messaging_limit,
        verifiedName: phoneInfo.verified_name,
        displayPhoneNumber: phoneInfo.display_phone_number
      }
    });
  } catch (error) {
    logger.error('Get account status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account status'
    });
  }
};
