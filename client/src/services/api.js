import axios from 'axios'

const getApiUrl = () => {
  const hostname = window.location.hostname
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5005/api'
  }

  // Production: Always use direct Render backend URL
  return 'https://columbus-marketplace.onrender.com/api'
}

const API_URL = getApiUrl()

console.log('🔍 API URL:', API_URL)
console.log('🔍 Current hostname:', window.location.hostname)
console.log('🔍 Current location:', window.location.href)

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

// Profile API calls
export const profileAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
}

// Products API calls
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/products${queryString ? `?${queryString}` : ''}`)
  },
  getById: (id) => api.get(`/products/${id}`),
  search: (query) => api.get(`/products/search?q=${query}`),
  create: (productData) => {
    // Create FormData for file uploads
    const formData = new FormData()
    
    // Add basic product fields
    Object.keys(productData).forEach(key => {
      if (key === 'images') {
        // Handle image files
        productData.images.forEach((image, index) => {
          formData.append(`images`, image)
        })
      } else if (key === 'tags') {
        // Handle tags array
        formData.append('tags', JSON.stringify(productData.tags))
      } else {
        formData.append(key, productData[key])
      }
    })
    
    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getUserProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/products/user/my-products${queryString ? `?${queryString}` : ''}`)
  },
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

// Categories API calls
export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  getTags: (categoryId = null) => api.get(`/tags${categoryId ? `?category_id=${categoryId}` : ''}`),
  getProductsByCategory: (categoryId, tagIds = []) => {
    const tagQuery = tagIds.length > 0 ? `?tags=${tagIds.join(',')}` : ''
    return api.get(`/categories/${categoryId}/products${tagQuery}`)
  },
  addProductTags: (productId, tagIds) => api.post(`/products/${productId}/tags`, { productId, tagIds }),
}

export default api
