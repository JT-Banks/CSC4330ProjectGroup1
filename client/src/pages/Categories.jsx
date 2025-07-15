import React, { useState, useEffect } from 'react'
import { categoriesAPI } from '../services/api'
import { useNavigate, useSearchParams } from 'react-router-dom'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  // Handle URL category parameter after categories are loaded
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && categories.length > 0) {
      // Find the category by name (case-insensitive)
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase() === categoryParam.toLowerCase()
      )
      if (matchingCategory) {
        setSelectedCategory(matchingCategory.category_id)
      }
    }
  }, [categories, searchParams])

  useEffect(() => {
    if (selectedCategory !== 'all') {
      fetchTags(selectedCategory)
    } else {
      setTags([])
    }
    setSelectedTags([])
    fetchProducts()
  }, [selectedCategory])

  useEffect(() => {
    fetchProducts()
  }, [selectedTags])

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories()
      if (response.data.success) {
        setCategories(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to load categories')
    }
  }

  const fetchTags = async (categoryId) => {
    try {
      const response = await categoriesAPI.getTags(categoryId)
      if (response.data.success) {
        setTags(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await categoriesAPI.getProductsByCategory(
        selectedCategory, 
        selectedTags
      )
      if (response.data.success) {
        setProducts(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Browse by Category
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Find exactly what you're looking for from fellow students
        </p>
      </div>

      {/* Category Filter */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              selectedCategory === 'all'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">🔍</div>
            <div className="text-sm font-medium dark:text-white">All Items</div>
          </button>
          {categories.map((category) => (
            <button
              key={category.category_id}
              onClick={() => setSelectedCategory(category.category_id)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                selectedCategory === category.category_id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              style={{
                borderColor: selectedCategory === category.category_id ? category.color : undefined
              }}
            >
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className="text-sm font-medium dark:text-white">{category.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Filter by Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.tag_id}
                onClick={() => handleTagToggle(tag.tag_id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag.tag_id)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {selectedCategory === 'all' ? 'All Products' : 
             categories.find(c => c.category_id == selectedCategory)?.name || 'Products'}
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {products.length} {products.length === 1 ? 'item' : 'items'} found
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 aspect-video rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/product/${product.product_id}`)}
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{product.category_icon || '📦'}</span>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {formatPrice(product.price)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      {product.condition_type}
                    </div>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h4 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
              No products found
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your category or tag filters
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories
