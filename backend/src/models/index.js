const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.WhatsAppAccount = require('./WhatsAppAccount')(sequelize, Sequelize);
db.Contact = require('./Contact')(sequelize, Sequelize);
db.Message = require('./Message')(sequelize, Sequelize);
db.Template = require('./Template')(sequelize, Sequelize);
db.Campaign = require('./Campaign')(sequelize, Sequelize);
db.Webhook = require('./Webhook')(sequelize, Sequelize);
db.Media = require('./Media')(sequelize, Sequelize);
db.Chatbot = require('./Chatbot')(sequelize, Sequelize);
db.ChatbotConversation = require('./ChatbotConversation')(sequelize, Sequelize);
db.ChatbotMessage = require('./ChatbotMessage')(sequelize, Sequelize);

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
