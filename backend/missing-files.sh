
#!/bin/bash
# Complete Backend Setup - ALL REMAINING FILES

echo "🚀 Creating ALL remaining backend files..."

# =====================================================
# FILE: src/routes/auth.js
# =====================================================
cat > src/routes/auth.js << 'EOF'
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const validators = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(validators.register), authController.register);
router.post('/login', authLimiter, validate(validators.login), authController.login);
router.post('/refresh', validate(validators.refreshToken), authController.refreshToken);
router.get('/me', auth, authController.getMe);
router.post('/logout', auth, authController.logout);
router.put('/profile', auth, validate(validators.updateProfile), authController.updateProfile);
router.put('/password', auth, validate(validators.changePassword), authController.changePassword);

module.exports = router;
EOF

# =====================================================
# FILE: src/controllers/authController.js
# =====================================================
cat > src/controllers/authController.js << 'EOF'
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwt: jwtConfig } = require('../config/env');
const logger = require('../utils/logger');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expire }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpire }
  );
  
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone
    });
    
    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({ refreshToken });
    
    logger.info(`New user registered: ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const { accessToken, refreshToken } = generateTokens(user);
    
    await user.update({
      refreshToken,
      lastLogin: new Date()
    });
    
    logger.info(`User logged in: ${email}`);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    
    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    const tokens = generateTokens(user);
    await user.update({ refreshToken: tokens.refreshToken });
    
    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
};

exports.logout = async (req, res) => {
  try {
    await req.user.update({ refreshToken: null });
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    await req.user.update({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      phone: phone || req.user.phone
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.user.id);
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashedPassword });
    
    logger.info(`Password changed for user: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
};
EOF

# =====================================================
# FILE: src/controllers/messageController.js
# =====================================================
cat > src/controllers/messageController.js << 'EOF'
const MessageService = require('../services/messageService');
const { Message, Contact, WhatsAppAccount } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.sendMessage = async (req, res) => {
  try {
    const { accountId, contactId, type, ...messageData } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const message = await MessageService.sendMessage(accountId, contactId, {
      type,
      ...messageData
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { accountId, limit, offset, direction } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const messages = await MessageService.getContactMessages(accountId, contactId, {
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      direction
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { accountId, limit = 50, offset = 0, search } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const where = { accountId };
    
    if (search) {
      where['$content$'] = { [Op.iLike]: `%${search}%` };
    }

    const messages = await Message.findAndCountAll({
      where,
      include: [
        { 
          model: Contact, 
          as: 'contact',
          attributes: ['id', 'phoneNumber', 'name', 'profilePicUrl']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { accountId } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const message = await Message.findOne({
      where: { id: messageId, accountId }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const WhatsAppService = require('../services/whatsappService');
    const whatsappService = new WhatsAppService(account.accessToken, account.phoneNumberId);
    await whatsappService.markAsRead(message.messageId);

    await message.update({ status: 'read', readAt: new Date() });

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
};

exports.getMessageStats = async (req, res) => {
  try {
    const { accountId, startDate, endDate } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'WhatsApp account not found'
      });
    }

    const where = { accountId };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const stats = await Message.findAll({
      where,
      attributes: [
        'direction',
        'status',
        'type',
        [Message.sequelize.fn('COUNT', Message.sequelize.col('id')), 'count']
      ],
      group: ['direction', 'status', 'type'],
      raw: true
    });

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};
EOF

# =====================================================
# FILE: src/routes/messages.js
# =====================================================
cat > src/routes/messages.js << 'EOF'
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
EOF

# =====================================================
# FILE: src/migrations/20240101000001-create-users.js (FIXED)
# =====================================================
cat > src/migrations/20240101000001-create-users.js << 'EOF'
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'manager', 'agent', 'user'),
        defaultValue: 'user'
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      refreshToken: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['isActive']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
EOF


