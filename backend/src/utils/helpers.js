 * Format phone number to E.164 format
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add + if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset: parseInt(offset) };
};

/**
 * Format error response
 */
const formatError = (error) => {
  return {
    success: false,
    message: error.message || 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? error : undefined
  };
};

/**
 * Format success response
 */
const formatSuccess = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

module.exports = {
  formatPhoneNumber,
  generateRandomString,
  paginate,
  formatError,
  formatSuccess
};
