import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const OrderConfirmation = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  const { orderData } = location.state || {}

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (!orderData) {
      navigate('/cart')
      return
    }
  }, [user, orderData, navigate])

  if (!orderData) {
    return <div>Loading...</div>
  }

  const { items, total, paymentMethod, pickupData, orderId } = orderData

  // Ensure total is a number
  const safeTotal = typeof total === 'number' ? total : parseFloat(total) || 0

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const groupItemsBySeller = (items) => {
    const grouped = {}
    items.forEach(item => {
      const sellerId = item.seller_id
      if (!grouped[sellerId]) {
        grouped[sellerId] = {
          sellerName: item.seller_name,
          items: [],
          total: 0
        }
      }
      grouped[sellerId].items.push(item)
      grouped[sellerId].total += item.price * item.quantity
    })
    return Object.values(grouped)
  }

  const sellerGroups = groupItemsBySeller(items)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl text-green-500 mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Your pickup has been scheduled</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono text-sm">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  Confirmed
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-semibold">${safeTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Pickup Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pickup Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 block">Date & Time</span>
                <span className="font-semibold">
                  {formatDate(pickupData.date)} at {formatTime(pickupData.time)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block">Location</span>
                <span className="font-semibold">{pickupData.locationLabel}</span>
              </div>
              {pickupData.notes && (
                <div>
                  <span className="text-gray-600 block">Notes</span>
                  <span className="text-sm">{pickupData.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment</h2>
            <div className={`flex items-center p-3 rounded-lg ${
              paymentMethod === 'cash' ? 'bg-yellow-50' : 'bg-green-50'
            }`}>
              <span className="text-2xl mr-3">
                {paymentMethod === 'cash' ? '💵' : paymentMethod === 'card' ? '💳' : '📱'}
              </span>
              <div>
                <div className="font-semibold">
                  {paymentMethod === 'cash' ? 'Cash Payment' : 
                   paymentMethod === 'card' ? 'Credit Card' : 'Digital Payment'}
                </div>
                <div className="text-sm text-gray-600">
                  {paymentMethod === 'cash' 
                    ? `Bring $${safeTotal.toFixed(2)} in cash to pickup`
                    : 'Payment will be processed as scheduled'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items by Seller */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Items</h2>
            <div className="space-y-6">
              {sellerGroups.map((group, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                    From: {group.sellerName}
                  </h3>
                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div key={item.cart_id} className="flex items-center space-x-3">
                        <img 
                          src={item.image_url || '/placeholder-image.jpg'} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            Condition: {item.condition_type} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Subtotal from {group.sellerName}</span>
                      <span>${group.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">What Happens Next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">📧</div>
            <h3 className="font-semibold mb-1">Notification Sent</h3>
            <p className="text-sm text-gray-600">
              Sellers have been notified of your pickup request
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold mb-1">Confirmation</h3>
            <p className="text-sm text-gray-600">
              Sellers will confirm the pickup time and location
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🤝</div>
            <h3 className="font-semibold mb-1">Meet & Exchange</h3>
            <p className="text-sm text-gray-600">
              Meet at the scheduled time to complete the transaction
            </p>
          </div>
        </div>
      </div>

      {/* Important Reminders */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-blue-800 mb-3">📋 Important Reminders</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li>• Arrive on time at the scheduled pickup location</li>
          {paymentMethod === 'cash' && (
            <li>• Bring exact change: ${safeTotal.toFixed(2)} in cash</li>
          )}
          <li>• Check items before finalizing the transaction</li>
          <li>• Meet in safe, public locations</li>
          <li>• Contact sellers if you need to reschedule</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mt-8">
        <button
          onClick={() => navigate('/')}
          className="flex-1 btn-primary"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View All Orders
        </button>
      </div>
    </div>
  )
}

export default OrderConfirmation
