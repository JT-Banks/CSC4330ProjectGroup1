import axios from 'axios'

const getApiUrl = () => {
  const hostname = window.location.hostname
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5005/api'
  }

  // Production: Use Netlify redirects to Railway backend
  return '/api'
}

const API_URL = getApiUrl()

console.log('🔍 API URL:', API_URL)
console.log('🔍 Current hostname:', window.location.hostname)
console.log('🔍 Current location:', window.location.href)
console.log('🔍 BUILD TIMESTAMP: 2025-07-09-NETLIFY-REDIRECTS') // Force new build

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log('🔍 Axios baseURL (with redirects):', api.defaults.baseURL)

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

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
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
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity) => api.post('/cart', { productId, quantity }),
  updateCart: (productId, quantity) => api.put('/cart', { productId, quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  checkout: () => api.post('/checkout'),
}

// Orders API calls
export const ordersAPI = {
  getOrders: () => api.get('/orders'),
}

// Wishlist API calls
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
}

export default api
