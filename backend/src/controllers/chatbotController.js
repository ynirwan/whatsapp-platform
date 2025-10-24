/* 
 * COPY TO: ~/whatsapp-platform/backend/src/controllers/chatbotController.js
 */
const chatbotService = require('../services/chatbotService');
const Chatbot = require('../models/Chatbot');
const ChatbotConversation = require('../models/ChatbotConversation');
const ChatbotMessage = require('../models/ChatbotMessage');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Create a new chatbot
 */
exports.createChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.create({
      ...req.body,
      userId: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: chatbot
    });
  } catch (error) {
    logger.error('Error creating chatbot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chatbot',
      error: error.message
    });
  }
};

/**
 * Get all chatbots for user
 */
exports.getChatbots = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { userId: req.user.id };
    
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    
    if (status) {
      where.isActive = status === 'active';
    }
    
    if (type) {
      where.type = type;
    }
    
    const { count, rows } = await Chatbot.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching chatbots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chatbots',
      error: error.message
    });
  }
};

/**
 * Get chatbot by ID
 */
exports.getChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }
    
    res.json({
      success: true,
      data: chatbot
    });
  } catch (error) {
    logger.error('Error fetching chatbot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chatbot',
      error: error.message
    });
  }
};

/**
 * Update chatbot
 */
exports.updateChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }
    
    await chatbot.update(req.body);
    
    // Clear cache
    await cacheService.del(`chatbot:${chatbot.id}`);
    
    res.json({
      success: true,
      data: chatbot
    });
  } catch (error) {
    logger.error('Error updating chatbot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chatbot',
      error: error.message
    });
  }
};

/**
 * Delete chatbot
 */
exports.deleteChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }
    
    await chatbot.destroy();
    
    res.json({
      success: true,
      message: 'Chatbot deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting chatbot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chatbot',
      error: error.message
    });
  }
};

/**
 * Toggle chatbot status
 */
exports.toggleStatus = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }
    
    chatbot.isActive = !chatbot.isActive;
    await chatbot.save();
    
    res.json({
      success: true,
      data: chatbot
    });
  } catch (error) {
    logger.error('Error toggling chatbot status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle chatbot status',
      error: error.message
    });
  }
};

/**
 * Test chatbot with a message
 */
exports.testChatbot = async (req, res) => {
  try {
    const { message, phoneNumber = 'test_user' } = req.body;
    const chatbotId = req.params.id;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const chatbot = await Chatbot.findOne({
      where: {
        id: chatbotId,
        userId: req.user.id
      }
    });
    
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }
    
    // Process message through chatbot (without actually sending to WhatsApp)
    const response = await chatbotService.processMessage(
      chatbotId,
      phoneNumber,
      message,
      'text'
    );
    
    res.json({
      success: true,
      data: {
        input: message,
        response: response
      }
    });
  } catch (error) {
    logger.error('Error testing chatbot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test chatbot',
      error: error.message
    });
  }
};

/**
 * Get chatbot conversations
 */
exports.getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const chatbotId = req.params.id;
    const offset = (page - 1) * limit;
    
    const where = { chatbotId };
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.whatsappPhoneNumber = { [Op.iLike]: `%${search}%` };
    }
    
    const { count, rows } = await ChatbotConversation.findAndCountAll({
      where,
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'name', 'whatsappPhoneNumber', 'profilePicUrl']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['startedAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

/**
 * Get conversation messages
 */
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const messages = await ChatbotMessage.findAll({
      where: { conversationId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'ASC']]
    });
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    logger.error('Error fetching conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

/**
 * End conversation
 */
exports.endConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await ChatbotConversation.findByPk(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    conversation.status = 'completed';
    conversation.endedAt = new Date();
    await conversation.save();
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    logger.error('Error ending conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end conversation',
      error: error.message
    });
  }
};

/**
 * Rate conversation
 */
exports.rateConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const conversation = await ChatbotConversation.findByPk(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    conversation.rating = rating;
    if (feedback) {
      conversation.feedback = feedback;
    }
    await conversation.save();
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    logger.error('Error rating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate conversation',
      error: error.message
    });
  }
};

/**
 * Get chatbot analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const chatbotId = req.params.id;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const analytics = await chatbotService.getAnalytics(chatbotId, start, end);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

/**
 * Get chatbot rules
 */
exports.getRules = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }
    
    res.json({
      success: true,
      data: chatbot.rules || []
    });
  } catch (error) {
    logger.error('Error fetching rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rules',
      error: error.message
    });
  }
};

/**
 * Add rule to chatbot
 */
exports.addRule = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }
    
    const { trigger, response, type = 'contains', priority = 0 } = req.body;
    
    if (!trigger || !response) {
      return res.status(400).json({
        success: false,
        message: 'Trigger and response are required'
      });
    }
    
    const rules = chatbot.rules || [];
    const newRule = {
      id: require('crypto').randomUUID(),
      trigger,
      response,
      type,
      priority,
      createdAt: new Date()
    };
    
    rules.push(newRule);
    chatbot.rules = rules;
    await chatbot.save();
    
    res.json({
      success: true,
      data: newRule
    });
  } catch (error) {
    logger.error('Error adding rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add rule',
      error: error.message
    });
  }
};

/**
 * Update rule
 */
exports.updateRule = async (req, res) => {
  try {
    const { id: chatbotId, ruleId } = req.params;
    
    const chatbot = await Chatbot.findOne({
      where: {
        id: chatbotId,
        userId: req.user.id
      }
    });
    
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }
    
    const rules = chatbot.rules || [];
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    
    if (ruleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
    
    rules[ruleIndex] = {
      ...rules[ruleIndex],
      ...req.body,
      id: ruleId,
      updatedAt: new Date()
    };
    
    chatbot.rules = rules;
    await chatbot.save();
    
    res.json({
      success: true,
      data: rules[ruleIndex]
    });
  } catch (error) {
    logger.error('Error updating rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rule',
      error: error.message
    });
  }
};

/**
 * Delete rule
 */
exports.deleteRule = async (req, res) => {
  try {
    const { id: chatbotId, ruleId } = req.params;
    
    const chatbot = await Chatbot.findOne({
      where: {
        id: chatbotId,
        userId: req.user.id
      }
    });
    
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }
    
    const rules = chatbot.rules || [];
    const filteredRules = rules.filter(r => r.id !== ruleId);
    
    if (rules.length === filteredRules.length) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
    
    chatbot.rules = filteredRules;
    await chatbot.save();
    
    res.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rule',
      error: error.message
    });
  }
};

/**
 * Bulk import rules
 */
exports.bulkImportRules = async (req, res) => {
  try {
    const { rules } = req.body;
    const chatbotId = req.params.id;
    
    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rules array'
      });
    }
    
    const chatbot = await Chatbot.findOne({
      where: {
        id: chatbotId,
        userId: req.user.id
      }
    });
    
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }
    
    const formattedRules = rules.map(rule => ({
      id: require('crypto').randomUUID(),
      trigger: rule.trigger,
      response: rule.response,
      type: rule.type || 'contains',
      priority: rule.priority || 0,
      createdAt: new Date()
    }));
    
    chatbot.rules = [...(chatbot.rules || []), ...formattedRules];
    await chatbot.save();
    
    res.json({
      success: true,
      message: `${formattedRules.length} rules imported successfully`,
      data: formattedRules
    });
  } catch (error) {
    logger.error('Error importing rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import rules',
      error: error.message
    });
  }
};

module.exports = exports;
