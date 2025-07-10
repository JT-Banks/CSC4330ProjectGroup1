import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ordersAPI } from '../services/api'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getOrders()
      setOrders(response.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your orders</h1>
        <a href="/login" className="btn-primary">Log In</a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="text-2xl text-gray-600">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
          <a href="/" className="btn-primary">Browse Products</a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{order.order_id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-lg font-bold text-gray-800 mt-1">
                    ${order.total_amount}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Items:</h4>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.product_id} className="flex items-center space-x-4">
                      <img 
                        src={item.image_url || '/placeholder-image.jpg'} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{item.name}</h5>
                        <p className="text-sm text-gray-600">
                          Sold by: {item.seller_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${item.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {order.status === 'pending' && (
                <div className="border-t pt-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Next Steps:</h5>
                    <p className="text-sm text-blue-700">
                      Your order is pending. The seller(s) will contact you to arrange pickup/delivery.
                      Check your email for contact details.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
