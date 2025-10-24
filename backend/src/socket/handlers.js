const MessageService = require('../services/messageService');
const logger = require('../utils/logger');

/**
 * Emit new message event
 */
exports.emitNewMessage = (io, message, contactId) => {
  if (!io) return;
  io.to(`account:${message.accountId}`).emit('message:new', {
    message,
    contactId
  });
};

/**
 * Emit message status update
 */
exports.emitMessageStatus = (io, accountId, messageId, status, timestamp) => {
  if (!io) return;
  io.to(`account:${accountId}`).emit('message:status', {
    messageId,
    status,
    timestamp
  });
};

/**
 * Emit new contact event
 */
exports.emitNewContact = (io, accountId, contact) => {
  if (!io) return;
  io.to(`account:${accountId}`).emit('contact:new', { contact });
};

/**
 * Emit contact updated event
 */
exports.emitContactUpdated = (io, accountId, contact) => {
  if (!io) return;
  io.to(`account:${accountId}`).emit('contact:updated', { contact });
};

/**
 * Emit webhook received event
 */
exports.emitWebhookReceived = (io, accountId, webhook) => {
  if (!io) return;
  io.to(`account:${accountId}`).emit('webhook:received', { webhook });
};
