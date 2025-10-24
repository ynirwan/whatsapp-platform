module.exports = (sequelize, DataTypes) => {
  const WhatsAppAccount = sequelize.define('WhatsAppAccount', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    phoneNumberId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    businessAccountId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    webhookVerifyToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'expired'),
      defaultValue: 'active'
    },
    qualityRating: {
      type: DataTypes.ENUM('GREEN', 'YELLOW', 'RED', 'UNKNOWN'),
      defaultValue: 'UNKNOWN'
    },
    messagingLimit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        autoReply: false,
        businessHours: {
          enabled: false,
          timezone: 'UTC',
          schedule: {}
        }
      }
    }
  }, {
    tableName: 'whatsapp_accounts',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['phoneNumberId'] },
      { fields: ['status'] }
    ]
  });

  WhatsAppAccount.associate = (models) => {
    WhatsAppAccount.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    WhatsAppAccount.hasMany(models.Contact, {
      foreignKey: 'accountId',
      as: 'contacts'
    });
    WhatsAppAccount.hasMany(models.Message, {
      foreignKey: 'accountId',
      as: 'messages'
    });
    WhatsAppAccount.hasMany(models.Template, {
      foreignKey: 'accountId',
      as: 'templates'
    });
    WhatsAppAccount.hasMany(models.Campaign, {
      foreignKey: 'accountId',
      as: 'campaigns'
    });
  };

  return WhatsAppAccount;
};
