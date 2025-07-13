import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { categoriesAPI, productsAPI } from '../services/api'

const SellItem = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    condition: '',
    tags: [],
    images: []
  })
  
  // UI state
  const [categories, setCategories] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState([])
  const [errors, setErrors] = useState({})

  // Condition options
  const conditions = [
    { value: 'new', label: 'Brand New', description: 'Never used, still in original packaging' },
    { value: 'like-new', label: 'Like New', description: 'Barely used, excellent condition' },
    { value: 'good', label: 'Good', description: 'Used but well maintained' },
    { value: 'fair', label: 'Fair', description: 'Shows wear but fully functional' },
    { value: 'poor', label: 'Poor', description: 'Heavy wear, may need repairs' }
  ]

  // Load categories and tags on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading categories and tags...')
        const categoriesResponse = await categoriesAPI.getCategories()
        const tagsResponse = await categoriesAPI.getTags()
        
        console.log('Categories response:', categoriesResponse)
        console.log('Tags response:', tagsResponse)
        
        // Handle different response structures
        const categoriesData = categoriesResponse?.data?.data || categoriesResponse?.data || []
        const tagsData = tagsResponse?.data?.data || tagsResponse?.data || []
        
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        setAvailableTags(Array.isArray(tagsData) ? tagsData : [])
        
        console.log('Categories set:', categoriesData)
        console.log('Tags set:', tagsData)
      } catch (error) {
        console.error('Error loading categories/tags:', error)
        // Set empty arrays as fallback
        setCategories([])
        setAvailableTags([])
      }
    }
    loadData()
  }, [])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle image uploads
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + formData.images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }))
      return
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreview(prev => [...prev, ...newPreviews])
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
    
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }))
    }
  }

  // Remove image
  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreview[index])
    setImagePreview(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Handle tag selection
  const toggleTag = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      } else if (prev.length < 10) { // Limit to 10 tags
        return [...prev, tagId]
      }
      return prev
    })
  }

  // Form validation
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.category_id) newErrors.category_id = 'Category is required'
    if (!formData.condition) newErrors.condition = 'Condition is required'
    if (formData.images.length === 0) newErrors.images = 'At least one image is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Create product data
      const productData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category_id: formData.category_id,
        condition: formData.condition,
        tags: selectedTags,
        images: formData.images
      }

      const response = await productsAPI.create(productData)
      
      if (response.data.success) {
        alert('Product posted successfully!')
        navigate('/')
      } else {
        throw new Error(response.data.message || 'Failed to post product')
      }
      
    } catch (error) {
      console.error('Error posting product:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error posting product. Please try again.'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Filter tags by selected category
  const getFilteredTags = () => {
    if (!Array.isArray(availableTags)) return []
    if (!formData.category_id) return availableTags
    return availableTags.filter(tag => 
      !tag.category_id || tag.category_id.toString() === formData.category_id
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Sell/Trade Your Item
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Post your item to reach thousands of students
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">
                Basic Information
              </h2>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., iPhone 13 Pro Max 256GB"
                  className={`w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your item in detail..."
                  className={`w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                      errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                      errors.category_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {Array.isArray(categories) && categories.map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">
                Condition *
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conditions.map(condition => (
                  <label key={condition.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={condition.value}
                      checked={formData.condition === condition.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg transition-all ${
                      formData.condition === condition.value
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                    }`}>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {condition.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {condition.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
            </div>

            {/* Tags */}
            {formData.category_id && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">
                  Tags (Optional)
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select up to 10 tags to help buyers find your item
                </p>
                <div className="flex flex-wrap gap-2">
                  {getFilteredTags().map(tag => (
                    <button
                      key={tag.tag_id}
                      type="button"
                      onClick={() => toggleTag(tag.tag_id)}
                      className={`px-3 py-2 rounded-full text-sm transition-all ${
                        selectedTags.includes(tag.tag_id)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                {selectedTags.length >= 10 && (
                  <p className="text-yellow-600 text-sm">Maximum 10 tags selected</p>
                )}
              </div>
            )}

            {/* Images */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">
                Images *
              </h2>
              
              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    Click to upload images or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    PNG, JPG up to 10MB each (max 5 images)
                  </p>
                </label>
              </div>
              
              {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}

              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Posting...' : 'Post Item'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SellItem
