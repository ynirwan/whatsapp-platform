module.exports = (sequelize, DataTypes) => {
  const Chatbot = sequelize.define('Chatbot', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',  // FIXED: was 'Users'
        key: 'id'
      }
    },
    whatsappAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'whatsapp_accounts',  // FIXED: was 'WhatsAppAccounts'
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    type: {
      type: DataTypes.ENUM('rule-based', 'ai-powered', 'hybrid'),
      defaultValue: 'rule-based'
    },
    aiProvider: {
      type: DataTypes.ENUM('openai', 'anthropic', 'google', 'custom'),
      defaultValue: null
    },
    aiModel: DataTypes.STRING,
    aiApiKey: DataTypes.TEXT,
    aiSystemPrompt: {
      type: DataTypes.TEXT,
      defaultValue: 'You are a helpful assistant for WhatsApp customer support.'
    },
    aiTemperature: {
      type: DataTypes.FLOAT,
      defaultValue: 0.7,
      validate: { min: 0, max: 2 }
    },
    aiMaxTokens: {
      type: DataTypes.INTEGER,
      defaultValue: 500
    },
    rules: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    welcomeMessage: {
      type: DataTypes.TEXT,
      defaultValue: 'Hello! How can I help you today?'
    },
    welcomeEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    fallbackMessage: {
      type: DataTypes.TEXT,
      defaultValue: "I'm sorry, I didn't understand that. Can you please rephrase?"
    },
    fallbackEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    businessHoursEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    businessHours: {
      type: DataTypes.JSONB,
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
      type: DataTypes.TEXT,
      defaultValue: 'We are currently offline. Our business hours are Monday–Friday, 9 AM – 6 PM.'
    },
    conversationTimeout: {
      type: DataTypes.INTEGER,
      defaultValue: 1800
    },
    maxMessagesPerConversation: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
    enableContextMemory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    contextWindowSize: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    humanHandoffEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    humanHandoffKeywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['speak to human', 'talk to agent', 'human support', 'representative']
    },
    humanHandoffMessage: {
      type: DataTypes.TEXT,
      defaultValue: 'Let me connect you with a human agent. Please wait a moment.'
    },
    quickReplies: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    menuEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    menuKeyword: {
      type: DataTypes.STRING,
      defaultValue: 'menu'
    },
    menuOptions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    totalConversations: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalMessages: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    averageResponseTime: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    satisfactionScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    enableSentimentAnalysis: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    enableLanguageDetection: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    supportedLanguages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['en']
    },
    enableSpellCheck: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    webhookUrl: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    webhookHeaders: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    rateLimitEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    maxMessagesPerUser: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    rateLimitWindow: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'chatbots',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['whatsappAccountId'] },
      { fields: ['isActive'] },
      { fields: ['type'] }
    ]
  })

  Chatbot.associate = (models) => {
    Chatbot.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    Chatbot.belongsTo(models.WhatsAppAccount, { foreignKey: 'whatsappAccountId', as: 'whatsappAccount' })
    Chatbot.hasMany(models.ChatbotConversation, { foreignKey: 'chatbotId', as: 'conversations' })
  }

  return Chatbot
}