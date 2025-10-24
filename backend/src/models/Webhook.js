module.exports = (sequelize, DataTypes) => {
  const Webhook = sequelize.define('Webhook', {
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
    eventType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processed', 'failed'),
      defaultValue: 'pending'
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'webhooks',
    timestamps: true,
    indexes: [
      { fields: ['accountId'] },
      { fields: ['eventType'] },
      { fields: ['status'] },
      { fields: ['createdAt'] }
    ]
  });

  Webhook.associate = (models) => {
    Webhook.belongsTo(models.WhatsAppAccount, {
      foreignKey: 'accountId',
      as: 'account'
    });
  };

  return Webhook;
};
