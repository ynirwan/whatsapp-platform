import api from './axiosConfig'

export const whatsappAccountApi = {
  createAccount: (data) => api.post('/whatsapp-accounts', data),
  getAccounts: () => api.get('/whatsapp-accounts'),
  getAccount: (id) => api.get(`/whatsapp-accounts/${id}`),
  updateAccount: (id, data) => api.put(`/whatsapp-accounts/${id}`, data),
  deleteAccount: (id) => api.delete(`/whatsapp-accounts/${id}`),
  testConnection: (data) => api.post('/whatsapp-accounts/test', data),
  getAccountStatus: (id) => api.get(`/whatsapp-accounts/${id}/status`)
}
