module.exports = (sequelize, DataTypes) => {
  const ChatbotConversation = sequelize.define('chatbot_conversations', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    chatbotId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'chatbots', key: 'id' }
    },
    contactId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'contacts', key: 'id' }
    },
    whatsappPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'handed-off', 'expired'),
      defaultValue: 'active'
    },
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    endedAt: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    messageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    context: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    sentiment: {
      type: DataTypes.ENUM('positive', 'neutral', 'negative', 'unknown'),
      defaultValue: 'unknown'
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en'
    },
    handedOffToUser: {
      type: DataTypes.UUID,
      defaultValue: null,
      references: { model: 'users', key: 'id' }
    },
    handedOffAt: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      validate: { min: 1, max: 5 }
    },
    feedback: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'chatbot_conversations',
    timestamps: true,
    indexes: [
      { fields: ['chatbotId'] },
      { fields: ['contactId'] },
      { fields: ['whatsappPhoneNumber'] },
      { fields: ['status'] },
      { fields: ['startedAt'] }
    ]
  })

  ChatbotConversation.associate = (models) => {
    ChatbotConversation.belongsTo(models.Chatbot, {
      foreignKey: 'chatbotId',
      as: 'chatbot'
    })
    ChatbotConversation.belongsTo(models.Contact, {
      foreignKey: 'contactId',
      as: 'contact'
    })
    ChatbotConversation.belongsTo(models.User, {
      foreignKey: 'handedOffToUser',
      as: 'handedOffUser'
    })
  }

  return ChatbotConversation
}
