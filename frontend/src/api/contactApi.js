import api from './axiosConfig'

export const contactApi = {
  createContact: (data) => api.post('/contacts', data),
  getContacts: (params) => api.get('/contacts', { params }),
  getContact: (id, params) => api.get(`/contacts/${id}`, { params }),
  updateContact: (id, data) => api.put(`/contacts/${id}`, data),
  deleteContact: (id, params) => api.delete(`/contacts/${id}`, { params }),
  importContacts: (data) => api.post('/contacts/import', data)
}

