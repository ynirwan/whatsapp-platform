import api from './axiosConfig'

export const templateApi = {
  createTemplate: (data) => api.post('/templates', data),
  getTemplates: (params) => api.get('/templates', { params }),
  getTemplate: (id) => api.get(`/templates/${id}`),
  updateTemplate: (id, data) => api.put(`/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/templates/${id}`)
}
