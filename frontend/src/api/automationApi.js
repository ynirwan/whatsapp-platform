import api from './axiosConfig'

export const automationApi = {
  createAutoReply: (data) => api.post('/automation/auto-reply', data),
  getAutoReplies: (params) => api.get('/automation/auto-reply', { params }),
  updateAutoReply: (id, data) => api.put(`/automation/auto-reply/${id}`, data),
  deleteAutoReply: (id, params) => api.delete(`/automation/auto-reply/${id}`, { params })
}
