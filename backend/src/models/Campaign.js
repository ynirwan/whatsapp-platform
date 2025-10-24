module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define('Campaign', {
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
    templateId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'),
      defaultValue: 'draft'
    },
    targetContacts: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        type: 'all', // 'all', 'tags', 'custom'
        tags: [],
        contactIds: []
      }
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    stats: {
      type: DataTypes.JSONB,
      defaultValue: {
        total: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0
      }
    }
  }, {
    tableName: 'campaigns',
    timestamps: true,
    indexes: [
      { fields: ['accountId'] },
      { fields: ['templateId'] },
      { fields: ['status'] },
      { fields: ['scheduledAt'] }
    ]
  });

  Campaign.associate = (models) => {
    Campaign.belongsTo(models.WhatsAppAccount, {
      foreignKey: 'accountId',
      as: 'account'
    });
    Campaign.belongsTo(models.Template, {
      foreignKey: 'templateId',
      as: 'template'
    });
    Campaign.hasMany(models.Message, {
      foreignKey: 'campaignId',
      as: 'messages'
    });
  };

  return Campaign;
};
