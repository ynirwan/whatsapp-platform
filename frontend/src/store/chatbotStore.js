/* 
 * COPY TO: ~/whatsapp-platform/frontend/src/store/chatbotStore.js
 */
import { create } from 'zustand';
import chatbotApi from '../api/chatbotApi';

const useChatbotStore = create((set, get) => ({
  // State
  chatbots: [],
  currentChatbot: null,
  conversations: [],
  currentConversation: null,
  messages: [],
  rules: [],
  analytics: null,
  loading: false,
  error: null,

  // Actions
  fetchChatbots: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.getChatbots(params);
      set({ chatbots: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch chatbots', loading: false });
      throw error;
    }
  },

  fetchChatbot: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.getChatbot(id);
      set({ currentChatbot: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch chatbot', loading: false });
      throw error;
    }
  },

  createChatbot: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.createChatbot(data);
      set((state) => ({
        chatbots: [response.data, ...state.chatbots],
        loading: false
      }));
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create chatbot', loading: false });
      throw error;
    }
  },

  updateChatbot: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.updateChatbot(id, data);
      set((state) => ({
        chatbots: state.chatbots.map((bot) => (bot.id === id ? response.data : bot)),
        currentChatbot: state.currentChatbot?.id === id ? response.data : state.currentChatbot,
        loading: false
      }));
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update chatbot', loading: false });
      throw error;
    }
  },

  deleteChatbot: async (id) => {
    set({ loading: true, error: null });
    try {
      await chatbotApi.deleteChatbot(id);
      set((state) => ({
        chatbots: state.chatbots.filter((bot) => bot.id !== id),
        currentChatbot: state.currentChatbot?.id === id ? null : state.currentChatbot,
        loading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete chatbot', loading: false });
      throw error;
    }
  },

  toggleChatbotStatus: async (id) => {
    try {
      const response = await chatbotApi.toggleStatus(id);
      set((state) => ({
        chatbots: state.chatbots.map((bot) => (bot.id === id ? response.data : bot)),
        currentChatbot: state.currentChatbot?.id === id ? response.data : state.currentChatbot
      }));
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to toggle status' });
      throw error;
    }
  },

  testChatbot: async (id, message, phoneNumber) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.testChatbot(id, message, phoneNumber);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to test chatbot', loading: false });
      throw error;
    }
  },

  fetchConversations: async (id, params) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.getConversations(id, params);
      set({ conversations: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch conversations', loading: false });
      throw error;
    }
  },

  fetchConversationMessages: async (id, conversationId, params) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.getConversationMessages(id, conversationId, params);
      set({ messages: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch messages', loading: false });
      throw error;
    }
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },

  endConversation: async (conversationId) => {
    try {
      await chatbotApi.endConversation(conversationId);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, status: 'completed' } : conv
        )
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to end conversation' });
      throw error;
    }
  },

  rateConversation: async (conversationId, rating, feedback) => {
    try {
      await chatbotApi.rateConversation(conversationId, rating, feedback);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, rating, feedback } : conv
        )
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to rate conversation' });
      throw error;
    }
  },

  fetchAnalytics: async (id, startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.getAnalytics(id, startDate, endDate);
      set({ analytics: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch analytics', loading: false });
      throw error;
    }
  },

  fetchRules: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.getRules(id);
      set({ rules: response.data, loading: false });
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch rules', loading: false });
      throw error;
    }
  },

  addRule: async (id, rule) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.addRule(id, rule);
      set((state) => ({
        rules: [...state.rules, response.data],
        loading: false
      }));
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to add rule', loading: false });
      throw error;
    }
  },

  updateRule: async (id, ruleId, rule) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.updateRule(id, ruleId, rule);
      set((state) => ({
        rules: state.rules.map((r) => (r.id === ruleId ? response.data : r)),
        loading: false
      }));
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update rule', loading: false });
      throw error;
    }
  },

  deleteRule: async (id, ruleId) => {
    set({ loading: true, error: null });
    try {
      await chatbotApi.deleteRule(id, ruleId);
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== ruleId),
        loading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete rule', loading: false });
      throw error;
    }
  },

  bulkImportRules: async (id, rules) => {
    set({ loading: true, error: null });
    try {
      const response = await chatbotApi.bulkImportRules(id, rules);
      set((state) => ({
        rules: [...state.rules, ...response.data],
        loading: false
      }));
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to import rules', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    chatbots: [],
    currentChatbot: null,
    conversations: [],
    currentConversation: null,
    messages: [],
    rules: [],
    analytics: null,
    loading: false,
    error: null
  })
}));

export default useChatbotStore;
