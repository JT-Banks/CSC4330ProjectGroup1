import axios from 'axios'

// Debug: Log the environment and location info
console.log('🔍 VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('🔍 window.location.hostname:', window.location.hostname)
console.log('🔍 window.location.href:', window.location.href)

// Always use the Railway backend for production
const PRODUCTION_API_URL = 'https://columbus-marketplace-backend-production.up.railway.app/api'

// Determine the API URL based on environment
const getApiUrl = () => {
  const hostname = window.location.hostname
  console.log('🔍 Current hostname:', hostname)
  
  // Only use local backend if we're actually on localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('🔍 Using local backend')
    return 'http://localhost:5005/api'
  } else {
    console.log('🔍 Using production backend (Railway)')
    return PRODUCTION_API_URL
  }
}

const apiUrl = getApiUrl()
console.log('🔍 Final API URL:', apiUrl)

// Create axios instance with base configuration
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Debug: Log the actual baseURL being used
console.log('🔍 Axios baseURL:', api.defaults.baseURL)

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
