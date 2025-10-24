import api from './axiosConfig'

export const mediaApi = {
  uploadMedia: (file, accountId) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('accountId', accountId)
    
    return api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  getMedia: (params) => api.get('/media', { params }),
  deleteMedia: (id) => api.delete(`/media/${id}`)
}
