import api from './axiosConfig'

export const messageApi = {
  sendMessage: (data) => api.post('/messages/send', data),
  getMessages: (params) => api.get('/messages', { params }),
  getContactMessages: (contactId, params) => 
    api.get(`/messages/contact/${contactId}`, { params }),
  markAsRead: (messageId, data) => api.put(`/messages/${messageId}/read`, data),
  getStats: (params) => api.get('/messages/stats', { params })
}
