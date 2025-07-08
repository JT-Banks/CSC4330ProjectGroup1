import axios from 'axios'

// Production-ready API URL detection
const getApiUrl = () => {
  const hostname = window.location.hostname
  
  // Use local backend only for localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5005/api'
  }
  
  // ALWAYS use Railway backend for any deployed site
  return 'https://columbus-marketplace-backend-production.up.railway.app/api'
}

const API_URL = getApiUrl()

console.log('🔍 Production API URL:', API_URL)
console.log('🔍 Current hostname:', window.location.hostname)
console.log('🔍 Current location:', window.location.href)

// Create axios instance with hardcoded Railway URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log('🔍 Axios baseURL (hardcoded):', api.defaults.baseURL)

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  logout: () => api.get('/auth/logout'),
  verify: () => api.get('/auth/verify'),
}

// Products API calls
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  search: (query) => api.get(`/products/search?q=${query}`),
}

// Cart API calls
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity) => api.post('/cart', { productId, quantity }),
  update: (productId, quantity) => api.put('/cart', { productId, quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
}

// Wishlist API calls
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
}

export default api
