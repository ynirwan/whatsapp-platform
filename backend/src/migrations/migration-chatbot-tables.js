/* 
 * COPY TO: ~/whatsapp-platform/backend/src/migrations/20240101000010-create-chatbot-tables.js
 */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Chatbots table
    await queryInterface.createTable('chatbots', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      whatsappAccountId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'whatsapp_accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      type: {
        type: Sequelize.ENUM('rule-based', 'ai-powered', 'hybrid'),
        defaultValue: 'rule-based'
      },
      
      // AI Configuration
      aiProvider: {
        type: Sequelize.ENUM('openai', 'anthropic', 'google', 'custom'),
        defaultValue: null
      },
      aiModel: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      aiApiKey: {
        type: Sequelize.TEXT,
        defaultValue: null
      },
      aiSystemPrompt: {
        type: Sequelize.TEXT,
        defaultValue: 'You are a helpful assistant for WhatsApp customer support.'
      },
      aiTemperature: {
        type: Sequelize.FLOAT,
        defaultValue: 0.7
      },
      aiMaxTokens: {
        type: Sequelize.INTEGER,
        defaultValue: 500
      },
      
      // Rule-based Configuration
      rules: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      
      // Greeting Messages
      welcomeMessage: {
        type: Sequelize.TEXT,
        defaultValue: 'Hello! How can I help you today?'
      },
      welcomeEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      
      // Fallback
      fallbackMessage: {
        type: Sequelize.TEXT,
        defaultValue: 'I\'m sorry, I didn\'t understand that. Can you please rephrase?'
      },
      fallbackEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      
      // Business Hours
      businessHoursEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      businessHours: {
        type: Sequelize.JSONB,
        defaultValue: {
          monday: { start: '09:00', end: '18:00', enabled: true },
          tuesday: { start: '09:00', end: '18:00', enabled: true },
          wednesday: { start: '09:00', end: '18:00', enabled: true },
          thursday: { start: '09:00', end: '18:00', enabled: true },
          friday: { start: '09:00', end: '18:00', enabled: true },
          saturday: { start: '09:00', end: '14:00', enabled: false },
          sunday: { start: '09:00', end: '14:00', enabled: false }
        }
      },
      outOfOfficeMessage: {
        type: Sequelize.TEXT,
        defaultValue: 'We are currently offline. Our business hours are Monday-Friday, 9 AM - 6 PM.'
      },
      
      // Conversation Settings
      conversationTimeout: {
        type: Sequelize.INTEGER,
        defaultValue: 1800
      },
      maxMessagesPerConversation: {
        type: Sequelize.INTEGER,
        defaultValue: 50
      },
      enableContextMemory: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      contextWindowSize: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },
      
      // Human Handoff
      humanHandoffEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      humanHandoffKeywords: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: ['speak to human', 'talk to agent', 'human support', 'representative']
      },
      humanHandoffMessage: {
        type: Sequelize.TEXT,
        defaultValue: 'Let me connect you with a human agent. Please wait a moment.'
      },
      
      // Quick Replies
      quickReplies: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      
      // Menu
      menuEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      menuKeyword: {
        type: Sequelize.STRING,
        defaultValue: 'menu'
      },
      menuOptions: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      
      // Analytics
      totalConversations: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      totalMessages: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      averageResponseTime: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      satisfactionScore: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      
      // Advanced Features
      enableSentimentAnalysis: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      enableLanguageDetection: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      supportedLanguages: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: ['en']
      },
      enableSpellCheck: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      
      // Integration
      webhookUrl: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      webhookHeaders: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      
      // Rate Limiting
      rateLimitEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      maxMessagesPerUser: {
        type: Sequelize.INTEGER,
        defaultValue: 10
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

    // Create indexes for chatbots
    await queryInterface.addIndex('chatbots', ['userId']);
    await queryInterface.addIndex('chatbots', ['whatsappAccountId']);
    await queryInterface.addIndex('chatbots', ['isActive']);
    await queryInterface.addIndex('chatbots', ['type']);

    // Create ChatbotConversations table
    await queryInterface.createTable('chatbot_conversations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      chatbotId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'chatbots',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      contactId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'contacts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      whatsappPhoneNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'handed-off', 'expired'),
        defaultValue: 'active'
      },
      startedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      endedAt: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      messageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      context: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      sentiment: {
        type: Sequelize.ENUM('positive', 'neutral', 'negative', 'unknown'),
        defaultValue: 'unknown'
      },
      language: {
        type: Sequelize.STRING,
        defaultValue: 'en'
      },
      handedOffToUser: {
        type: Sequelize.UUID,
        defaultValue: null,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      handedOffAt: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      rating: {
        type: Sequelize.INTEGER,
        defaultValue: null
      },
      feedback: {
        type: Sequelize.TEXT,
        defaultValue: null
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
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

    // Create indexes for conversations
    await queryInterface.addIndex('chatbot_conversations', ['chatbotId']);
    await queryInterface.addIndex('chatbot_conversations', ['contactId']);
    await queryInterface.addIndex('chatbot_conversations', ['whatsappPhoneNumber']);
    await queryInterface.addIndex('chatbot_conversations', ['status']);
    await queryInterface.addIndex('chatbot_conversations', ['startedAt']);

    // Create ChatbotMessages table
    await queryInterface.createTable('chatbot_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      conversationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'chatbot_conversations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      chatbotId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'chatbots',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      direction: {
        type: Sequelize.ENUM('incoming', 'outgoing'),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'video', 'audio', 'document', 'location', 'button', 'list'),
        defaultValue: 'text'
      },
      isAiGenerated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      aiProvider: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      aiModel: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      aiTokensUsed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      aiLatency: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      intent: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      intentConfidence: {
        type: Sequelize.FLOAT,
        defaultValue: null
      },
      entities: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      matchedRule: {
        type: Sequelize.JSONB,
        defaultValue: null
      },
      responseTime: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      confidence: {
        type: Sequelize.FLOAT,
        defaultValue: 1.0
      },
      sentiment: {
        type: Sequelize.ENUM('positive', 'neutral', 'negative', 'unknown'),
        defaultValue: 'unknown'
      },
      sentimentScore: {
        type: Sequelize.FLOAT,
        defaultValue: null
      },
      error: {
        type: Sequelize.TEXT,
        defaultValue: null
      },
      errorCode: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      status: {
        type: Sequelize.ENUM('sent', 'delivered', 'read', 'failed'),
        defaultValue: 'sent'
      },
      whatsappMessageId: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      context: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
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

    // Create indexes for messages
    await queryInterface.addIndex('chatbot_messages', ['conversationId']);
    await queryInterface.addIndex('chatbot_messages', ['chatbotId']);
    await queryInterface.addIndex('chatbot_messages', ['direction']);
    await queryInterface.addIndex('chatbot_messages', ['timestamp']);
    await queryInterface.addIndex('chatbot_messages', ['intent']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('chatbot_messages');
    await queryInterface.dropTable('chatbot_conversations');
    await queryInterface.dropTable('chatbots');
  }
};
