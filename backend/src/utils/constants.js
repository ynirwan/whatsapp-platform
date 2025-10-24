module.exports = {
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'document',
    LOCATION: 'location',
    CONTACT: 'contact',
    TEMPLATE: 'template',
    INTERACTIVE: 'interactive'
  },

  MESSAGE_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed'
  },

  MESSAGE_DIRECTION: {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound'
  },

  CONTACT_STATUS: {
    ACTIVE: 'active',
    BLOCKED: 'blocked',
    UNSUBSCRIBED: 'unsubscribed'
  },

  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    AGENT: 'agent',
    USER: 'user'
  },

  TEMPLATE_STATUS: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
  },

  TEMPLATE_CATEGORY: {
    MARKETING: 'MARKETING',
    UTILITY: 'UTILITY',
    AUTHENTICATION: 'AUTHENTICATION'
  },

  CAMPAIGN_STATUS: {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    RUNNING: 'running',
    COMPLETED: 'completed',
    PAUSED: 'paused',
    CANCELLED: 'cancelled'
  },

  WEBHOOK_STATUS: {
    PENDING: 'pending',
    PROCESSED: 'processed',
    FAILED: 'failed'
  }
};
