import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Product = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  // Mock product data based on your database schema - Student focused
  const mockProducts = {
    1: {
      product_id: 1,
      name: 'Gaming Headphones',
      description: 'Perfect for late-night gaming sessions in the dorm! High-quality gaming headphones with surround sound and noise cancellation. Features include: wireless connectivity, 20-hour battery life, crystal clear microphone for online classes and gaming, and premium comfort padding for long study sessions.',
      store_quantity: 15,
      category: 1, // Electronics
      price: 89.99,
      rating: 4,
      image_url: '/headphones.jpg'
    },
    2: {
      product_id: 2,
      name: 'Student Backpack',
      description: 'Essential for campus life! Durable and spacious backpack perfect for carrying textbooks, laptop, and daily essentials. Features include: laptop compartment, multiple organization pockets, water-resistant material, and ergonomic design for comfortable all-day wear.',
      store_quantity: 8,
      category: 2, // Clothing/Accessories
      price: 79.95,
      rating: 5,
      image_url: '/backpack.jpg'
    },
    3: {
      product_id: 3,
      name: 'Healthy Snack - Bananas',
      description: 'Perfect study fuel! Organic bananas for busy students on the go. Rich in potassium and natural energy to keep you focused during long study sessions. Great for smoothies, quick snacks between classes, or post-workout nutrition.',
      store_quantity: 50,
      category: 3, // Food & Grocery
      price: 2.99,
      rating: 4,
      image_url: '/banana.jpg'
    },
    4: {
      product_id: 4,
      name: 'Campus Recreation Canoe',
      description: 'Make the most of campus outdoor activities! Lightweight canoe perfect for lake adventures and outdoor recreation programs. Seats 2-3 students comfortably with excellent stability. Great for campus outdoor clubs and weekend adventures.',
      store_quantity: 3,
      category: 4, // Sports & Recreation
      price: 899.99,
      rating: 5,
      image_url: '/Canoe.jpg'
    },
    5: {
      product_id: 5,
      name: 'Gaming Controller',
      description: 'Essential for dorm gaming setup! Latest Xbox wireless controller with enhanced grip and precision. Perfect for gaming with roommates, stress relief after exams, and compatible with both Xbox and PC gaming setups.',
      store_quantity: 12,
      category: 1, // Electronics
      price: 59.99,
      rating: 5,
      image_url: '/xboxController.jpg'
    },
    6: {
      product_id: 6,
      name: 'School Spirit Gear',
      description: 'Show your Tigers pride! Official LSU branded merchandise for true school spirit. Perfect for game days, campus events, and showing off your college pride. Made with premium materials in official team colors.',
      store_quantity: 25,
      category: 5, // School Merchandise
      price: 24.99,
      rating: 4,
      image_url: '/lsu_image.1.jpg'
    }
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundProduct = mockProducts[id]
      setProduct(foundProduct)
      setLoading(false)
    }, 500)
  }, [id])

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    alert(`Added ${quantity} ${product.name}(s) to cart!`)
  }

  const handleAddToWishlist = () => {
    // TODO: Implement add to wishlist functionality
    alert(`Added ${product.name} to wishlist!`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Product Not Found</h2>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="mb-6 text-primary-600 hover:text-primary-700 flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
            onError={(e) => {
              e.target.src = '/shopping.jpg' // Fallback image
            }}
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i}
                className={`w-5 h-5 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-gray-600">({product.rating}/5)</span>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-primary-600 mb-6">
            ${product.price}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.store_quantity > 0 ? (
              <span className="text-green-600 font-medium">
                ✓ In Stock ({product.store_quantity} available)
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                ✗ Out of Stock
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-lg font-medium w-12 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.store_quantity, quantity + 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <button 
              onClick={handleAddToCart}
              disabled={product.store_quantity === 0}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
            <button 
              onClick={handleAddToWishlist}
              className="btn-secondary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Product
