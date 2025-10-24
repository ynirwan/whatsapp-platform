module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'whatsapp_accounts',
        key: 'id'
      }
    },
    contactId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'contacts',
        key: 'id'
      }
    },
    campaignId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'campaigns',
        key: 'id'
      }
    },
    messageId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    wamId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'template', 'interactive'),
      allowNull: false
    },
    direction: {
      type: DataTypes.ENUM('inbound', 'outbound'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed'),
      defaultValue: 'pending'
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    templateName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    context: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    errorCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'messages',
    timestamps: true,
    indexes: [
      { fields: ['accountId'] },
      { fields: ['contactId'] },
      { fields: ['campaignId'] },
      { fields: ['messageId'] },
      { fields: ['direction'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['createdAt'] }
    ]
  });

  Message.associate = (models) => {
    Message.belongsTo(models.WhatsAppAccount, {
      foreignKey: 'accountId',
      as: 'account'
    });
    Message.belongsTo(models.Contact, {
      foreignKey: 'contactId',
      as: 'contact'
    });
    Message.belongsTo(models.Campaign, {
      foreignKey: 'campaignId',
      as: 'campaign'
    });
    Message.hasMany(models.Media, {
      foreignKey: 'messageId',
      as: 'media'
    });
  };

  return Message;
};
