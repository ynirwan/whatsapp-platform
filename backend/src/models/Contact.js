module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
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
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profilePicUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    customFields: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('active', 'blocked', 'unsubscribed'),
      defaultValue: 'active'
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'contacts',
    timestamps: true,
    indexes: [
      { fields: ['accountId'] },
      { fields: ['phoneNumber'] },
      { fields: ['status'] },
      { fields: ['tags'], using: 'gin' },
      { unique: true, fields: ['accountId', 'phoneNumber'] }
    ]
  });

  Contact.associate = (models) => {
    Contact.belongsTo(models.WhatsAppAccount, {
      foreignKey: 'accountId',
      as: 'account'
    });
    Contact.hasMany(models.Message, {
      foreignKey: 'contactId',
      as: 'messages'
    });
  };

  return Contact;
};
