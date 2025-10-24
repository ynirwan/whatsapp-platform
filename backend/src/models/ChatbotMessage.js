const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatbotMessage = sequelize.define('ChatbotMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ChatbotConversations',
      key: 'id'
    }
  },
  chatbotId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Chatbots',
      key: 'id'
    }
  },
  direction: {
    type: DataTypes.ENUM('incoming', 'outgoing'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'document', 'location', 'button', 'list'),
    defaultValue: 'text'
  },
  
  // AI Response Details
  isAiGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  aiProvider: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  aiModel: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  aiTokensUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  aiLatency: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // milliseconds
  },
  
  // Intent & Entity Recognition
  intent: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  intentConfidence: {
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  entities: {
    type: DataTypes.JSONB,
    defaultValue: []
    // Structure: [{ type: 'email', value: 'user@example.com', confidence: 0.95 }]
  },
  
  // Rule Matching
  matchedRule: {
    type: DataTypes.JSONB,
    defaultValue: null
  },
  
  // Response Metadata
  responseTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // milliseconds
  },
  confidence: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0
  },
  
  // Sentiment Analysis
  sentiment: {
    type: DataTypes.ENUM('positive', 'neutral', 'negative', 'unknown'),
    defaultValue: 'unknown'
  },
  sentimentScore: {
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  
  // Error Handling
  error: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  errorCode: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  
  // Message Status
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
    defaultValue: 'sent'
  },
  whatsappMessageId: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  
  // Context
  context: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'chatbot_messages',
  timestamps: true,
  indexes: [
    { fields: ['conversationId'] },
    { fields: ['chatbotId'] },
    { fields: ['direction'] },
    { fields: ['timestamp'] },
    { fields: ['intent'] }
  ]
});

module.exports = ChatbotMessage;
