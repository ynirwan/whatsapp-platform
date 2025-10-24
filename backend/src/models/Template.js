module.exports = (sequelize, DataTypes) => {
  const Template = sequelize.define('Template', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('MARKETING', 'UTILITY', 'AUTHENTICATION'),
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'en'
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
    components: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    whatsappTemplateId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'templates',
    timestamps: true,
    indexes: [
      { fields: ['accountId'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { unique: true, fields: ['accountId', 'name', 'language'] }
    ]
  });

  Template.associate = (models) => {
    Template.belongsTo(models.WhatsAppAccount, {
      foreignKey: 'accountId',
      as: 'account'
    });
    Template.hasMany(models.Campaign, {
      foreignKey: 'templateId',
      as: 'campaigns'
    });
  };

  return Template;
};
