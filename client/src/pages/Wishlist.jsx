import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { wishlistAPI, cartAPI } from '../services/api'

const Wishlist = () => {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWishlistItems()
    }
  }, [user])

  const fetchWishlistItems = async () => {
    try {
      console.log('🔍 Fetching wishlist items...')
      const response = await wishlistAPI.get()
      console.log('🔍 Raw wishlist response:', response)
      console.log('🔍 Response data:', response?.data)
      console.log('🔍 Response data type:', typeof response?.data)
      console.log('🔍 Is response.data an array?', Array.isArray(response?.data))
      
      // The data is nested: response.data.data contains the actual array
      const wishlistData = response?.data?.data || []
      const wishlistArray = Array.isArray(wishlistData) ? wishlistData : []
      console.log('🔍 Final wishlist array:', wishlistArray)
      console.log('🔍 Fetched wishlist items:', wishlistArray.length, 'items')
      setWishlistItems(wishlistArray)
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error)
      console.error('❌ Error response:', error.response)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId)
      fetchWishlistItems() // Refresh wishlist
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      alert('Failed to remove from wishlist')
    }
  }

  const addToCart = async (productId) => {
    try {
      await cartAPI.addToCart(productId, 1)
      alert('Item added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    }
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="text-xl text-gray-600">Please log in to view your wishlist</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="text-2xl text-gray-600">Loading wishlist...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">💝</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love for later!</p>
          <a href="/" className="btn-primary">Browse Products</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.wishlist_id} className="card">
              <img 
                src={item.image_url || '/placeholder-image.jpg'} 
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-2 text-sm line-clamp-2">{item.description}</p>
              <p className="text-sm text-gray-600 mb-2">Sold by: {item.seller_name}</p>
              <p className="text-sm text-gray-600 mb-3">Condition: {item.condition_type}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary-600">${item.price}</span>
                <div className="space-x-2">
                  <button 
                    onClick={() => addToCart(item.product_id)}
                    className="btn-primary text-sm"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="btn-secondary text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist
