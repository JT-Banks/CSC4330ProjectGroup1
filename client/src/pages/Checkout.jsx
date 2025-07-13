import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Checkout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get cart data passed from Cart component
  const { cartItems = [], total = 0 } = location.state || {}

  const safeTotal = typeof total === 'number' ? total : parseFloat(total) || 0
  
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentData, setPaymentData] = useState({
    // Credit/Debit Card
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Digital Payment
    email: '',
    phone: '',
    
    // Cash
    meetupPreference: 'campus'
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart')
      return
    }
  }, [user, cartItems, navigate])

  const validatePayment = () => {
    const newErrors = {}
    
    if (paymentMethod === 'card') {
      if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
        newErrors.cardNumber = 'Valid card number required'
      }
      if (!paymentData.expiryDate) {
        newErrors.expiryDate = 'Expiry date required'
      }
      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        newErrors.cvv = 'Valid CVV required'
      }
      if (!paymentData.cardName.trim()) {
        newErrors.cardName = 'Cardholder name required'
      }
    } else if (paymentMethod === 'digital') {
      if (!paymentData.email) {
        newErrors.email = 'Email required for digital payment'
      }
      if (!paymentData.phone) {
        newErrors.phone = 'Phone number required'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePayment()) {
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Navigate to pickup scheduling with order data
      navigate('/pickup-scheduler', {
        state: {
          cartItems,
          total: safeTotal,
          paymentMethod,
          paymentData: paymentMethod === 'cash' ? { meetupPreference: paymentData.meetupPreference } : null,
          orderData: {
            items: cartItems,
            total: safeTotal,
            paymentMethod,
            status: paymentMethod === 'cash' ? 'pending_pickup' : 'payment_confirmed'
          }
        }
      })
    } catch (error) {
      console.error('Payment processing error:', error)
      setErrors({ general: 'Payment processing failed. Please try again.' })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  if (!cartItems || cartItems.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        <p className="text-gray-600 mt-2">Complete your order with {cartItems.length} items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Information</h2>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">💵</span>
                    <div>
                      <div className="font-medium">Cash at Pickup</div>
                      <div className="text-sm text-gray-600">Pay in person when you meet the seller</div>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">💳</span>
                    <div>
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-gray-600">Secure online payment</div>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="digital"
                    checked={paymentMethod === 'digital'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">📱</span>
                    <div>
                      <div className="font-medium">Venmo/PayPal/Zelle</div>
                      <div className="text-sm text-gray-600">Digital payment apps</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              {/* Cash Payment Options */}
              {paymentMethod === 'cash' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Meeting Location
                    </label>
                    <select
                      value={paymentData.meetupPreference}
                      onChange={(e) => setPaymentData({...paymentData, meetupPreference: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="campus">On Campus</option>
                      <option value="library">Library</option>
                      <option value="student_center">Student Center</option>
                      <option value="dorm">Dorm Area</option>
                      <option value="other">Other (specify during scheduling)</option>
                    </select>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <span className="text-yellow-400 text-xl mr-2">⚠️</span>
                      <div>
                        <h4 className="font-medium text-yellow-800">Cash Payment</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          You'll pay the seller directly when you meet to pick up your items. 
                          Please bring exact change when possible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Payment */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({
                        ...paymentData, 
                        cardNumber: formatCardNumber(e.target.value)
                      })}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={paymentData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '')
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4)
                          }
                          setPaymentData({...paymentData, expiryDate: value})
                        }}
                        placeholder="MM/YY"
                        maxLength="5"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({
                          ...paymentData, 
                          cvv: e.target.value.replace(/\D/g, '').substring(0, 4)
                        })}
                        placeholder="123"
                        maxLength="4"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                      placeholder="John Doe"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.cardName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                  </div>
                </div>
              )}

              {/* Digital Payment */}
              {paymentMethod === 'digital' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                      placeholder="your@email.com"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={paymentData.phone}
                      onChange={(e) => setPaymentData({...paymentData, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <span className="text-blue-400 text-xl mr-2">ℹ️</span>
                      <div>
                        <h4 className="font-medium text-blue-800">Digital Payment</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          You'll receive payment instructions via email/text. The seller will confirm 
                          payment before scheduling pickup.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-700">{errors.general}</p>
                </div>
              )}

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Continue to Pickup Scheduling'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.cart_id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${safeTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
