/* 
 * COPY TO: ~/whatsapp-platform/frontend/src/api/chatbotApi.js
 */
import axios from './axiosConfig';

/**
 * Chatbot API Client
 */
const chatbotApi = {
  // Get all chatbots
  getChatbots: async (params = {}) => {
    const response = await axios.get('/chatbots', { params });
    return response.data;
  },

  // Get single chatbot
  getChatbot: async (id) => {
    const response = await axios.get(`/chatbots/${id}`);
    return response.data;
  },

  // Create chatbot
  createChatbot: async (data) => {
    const response = await axios.post('/chatbots', data);
    return response.data;
  },

  // Update chatbot
  updateChatbot: async (id, data) => {
    const response = await axios.put(`/chatbots/${id}`, data);
    return response.data;
  },

  // Delete chatbot
  deleteChatbot: async (id) => {
    const response = await axios.delete(`/chatbots/${id}`);
    return response.data;
  },

  // Toggle chatbot status
  toggleStatus: async (id) => {
    const response = await axios.patch(`/chatbots/${id}/toggle`);
    return response.data;
  },

  // Test chatbot
  testChatbot: async (id, message, phoneNumber = 'test_user') => {
    const response = await axios.post(`/chatbots/${id}/test`, { message, phoneNumber });
    return response.data;
  },

  // Get conversations
  getConversations: async (id, params = {}) => {
    const response = await axios.get(`/chatbots/${id}/conversations`, { params });
    return response.data;
  },

  // Get conversation messages
  getConversationMessages: async (id, conversationId, params = {}) => {
    const response = await axios.get(`/chatbots/${id}/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  // End conversation
  endConversation: async (conversationId) => {
    const response = await axios.patch(`/chatbots/conversations/${conversationId}/end`);
    return response.data;
  },

  // Rate conversation
  rateConversation: async (conversationId, rating, feedback) => {
    const response = await axios.post(`/chatbots/conversations/${conversationId}/rate`, { rating, feedback });
    return response.data;
  },

  // Get analytics
  getAnalytics: async (id, startDate, endDate) => {
    const response = await axios.get(`/chatbots/${id}/analytics`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get rules
  getRules: async (id) => {
    const response = await axios.get(`/chatbots/${id}/rules`);
    return response.data;
  },

  // Add rule
  addRule: async (id, rule) => {
    const response = await axios.post(`/chatbots/${id}/rules`, rule);
    return response.data;
  },

  // Update rule
  updateRule: async (id, ruleId, rule) => {
    const response = await axios.put(`/chatbots/${id}/rules/${ruleId}`, rule);
    return response.data;
  },

  // Delete rule
  deleteRule: async (id, ruleId) => {
    const response = await axios.delete(`/chatbots/${id}/rules/${ruleId}`);
    return response.data;
  },

  // Bulk import rules
  bulkImportRules: async (id, rules) => {
    const response = await axios.post(`/chatbots/${id}/rules/bulk-import`, { rules });
    return response.data;
  }
};

export default chatbotApi;
