import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cartAPI } from '../services/api'

const Cart = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCartItems()
    }
  }, [user])

  const fetchCartItems = async () => {
    try {
      console.log('🔍 Fetching cart items...')
      const response = await cartAPI.getCart()
      console.log('🔍 Raw cart response:', response)
      console.log('🔍 Response data:', response?.data)
      console.log('🔍 Response data type:', typeof response?.data)
      console.log('🔍 Is response.data an array?', Array.isArray(response?.data))
      
      // The data is nested: response.data.data contains the actual array
      const cartData = response?.data?.data || []
      const cartArray = Array.isArray(cartData) ? cartData : []
      console.log('🔍 Final cart array:', cartArray)
      console.log('🔍 Fetched cart items:', cartArray.length, 'items')
      setCartItems(cartArray)
    } catch (error) {
      console.error('❌ Error fetching cart:', error)
      console.error('❌ Error response:', error.response)
      // On error, set empty array to prevent crashes
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await cartAPI.updateCart(productId, newQuantity)
      fetchCartItems() // Refresh cart
    } catch (error) {
      console.error('Error updating cart:', error)
      alert('Failed to update cart')
    }
  }

  const removeItem = async (productId) => {
    try {
      await cartAPI.removeFromCart(productId)
      fetchCartItems() // Refresh cart
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Failed to remove item')
    }
  }

  const handleCheckout = async () => {
    const safeCartItems = Array.isArray(cartItems) ? cartItems : []
    if (safeCartItems.length === 0) return
    
    // Calculate total as a number, not string
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    
    // Navigate to checkout with cart data
    navigate('/checkout', {
      state: {
        cartItems: safeCartItems,
        total: totalAmount // Pass as number
      }
    })
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your cart</h1>
        <a href="/login" className="btn-primary">Log In</a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="text-2xl text-gray-600">Loading cart...</div>
      </div>
    )
  }

  // Ensure cartItems is always an array to prevent crashes
  const safeCartItems = Array.isArray(cartItems) ? cartItems : []

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      
      {safeCartItems.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started!</p>
          <a href="/" className="btn-primary">Continue Shopping</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Cart Items</h2>
              <div className="space-y-4">
                {safeCartItems.map((item) => (
                  <div key={item.cart_id} className="flex items-center space-x-4 border-b pb-4">
                    <img 
                      src={item.image_url || '/placeholder-image.jpg'} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">Sold by: {item.seller_name}</p>
                      <p className="text-sm text-gray-600">Condition: {item.condition_type}</p>
                      <p className="font-semibold text-green-600">${item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.product_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${calculateTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Meet in person</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
