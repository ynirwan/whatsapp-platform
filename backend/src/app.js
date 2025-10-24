const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { cors: corsConfig, apiVersion } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: corsConfig.origin,
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Rate limiting
app.use(`/api/${apiVersion}`, apiLimiter);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use(`/api/${apiVersion}/auth`, require('./routes/auth'));
app.use(`/api/${apiVersion}/messages`, require('./routes/messages'));
app.use(`/api/${apiVersion}/contacts`, require('./routes/contacts'));
app.use(`/api/${apiVersion}/webhooks`, require('./routes/webhooks'));
app.use(`/api/${apiVersion}/whatsapp-accounts`, require('./routes/whatsappAccounts'));
app.use(`/api/${apiVersion}/templates`, require('./routes/templates'));
app.use(`/api/${apiVersion}/campaigns`, require('./routes/campaigns'));
app.use(`/api/${apiVersion}/analytics`, require('./routes/analytics'));
app.use(`/api/${apiVersion}/media`, require('./routes/media'));
app.use('/uploads', express.static('uploads'));
app.use(`/api/${apiVersion}/automation`, require('./routes/automation'));
app.use(`/api/${apiVersion}/chatbots`, require('./routes/chatbots'));


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
