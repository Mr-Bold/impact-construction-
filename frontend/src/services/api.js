import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Projects API
export const projectsAPI = {
  getAll: (filters = {}) => apiClient.get('/projects', { params: filters }),
  getById: (id) => apiClient.get(`/projects/${id}`),
  create: (data) => apiClient.post('/projects', data),
  addMedia: (id, file, isCover = false) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('is_cover', String(isCover))
    return apiClient.post(`/projects/${id}/media`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  update: (id, data) => apiClient.put(`/projects/${id}`, data),
  delete: (id) => apiClient.delete(`/projects/${id}`),
  like: (id) => apiClient.post(`/projects/${id}/like`),
  rate: (id, rating) => apiClient.post(`/projects/${id}/rate`, { rating }),
  getComments: (id) => apiClient.get(`/projects/${id}/comments`),
  addComment: (id, comment) => apiClient.post(`/projects/${id}/comments`, { comment }),
}

// Requests API
export const requestsAPI = {
  getAll: () => apiClient.get('/requests'),
  getById: (id) => apiClient.get(`/requests/${id}`),
  create: (data) => apiClient.post('/requests', data),
  addAttachment: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(`/requests/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  updateStatus: (id, status) => apiClient.put(`/requests/${id}/status`, { status }),
  getMessages: (id) => apiClient.get(`/requests/${id}/messages`),
  addMessage: (id, message) => apiClient.post(`/requests/${id}/messages`, { message }),
  createQuotation: (id, data) => apiClient.post(`/requests/${id}/quotation`, data),
  getQuotation: (id) => apiClient.get(`/requests/${id}/quotation`),
  respondToQuotation: (id, response) => apiClient.put(`/requests/${id}/quotation/response`, { response }),
}

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
}

// Admin API
export const adminAPI = {
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getCategories: () => apiClient.get('/admin/categories'),
  createCategory: (data) => apiClient.post('/admin/categories', data),
  updateCategory: (id, data) => apiClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/admin/categories/${id}`),
  getCustomers: () => apiClient.get('/admin/customers'),
  getCustomerById: (id) => apiClient.get(`/admin/customers/${id}`),
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data),
}

export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.put(`/notifications/${id}/read`),
}

export const settingsAPI = {
  getPublic: () => apiClient.get('/settings'),
}

export default apiClient
