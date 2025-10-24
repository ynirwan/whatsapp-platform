module.exports = (sequelize, DataTypes) => {
  const Media = sequelize.define('Media', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'messages',
        key: 'id'
      }
    },
    mediaId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    localPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: true
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'media',
    timestamps: true,
    indexes: [
      { fields: ['messageId'] },
      { fields: ['mediaId'] }
    ]
  });

  Media.associate = (models) => {
    Media.belongsTo(models.Message, {
      foreignKey: 'messageId',
      as: 'message'
    });
  };

  return Media;
};
