import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PickupScheduler = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { cartItems = [], total = 0, paymentMethod, orderData } = location.state || {}
  
  // Ensure total is a number
  const safeTotal = typeof total === 'number' ? total : parseFloat(total) || 0
  
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Generate available dates (next 14 days, excluding past dates)
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Skip Sundays for campus pickups (campus might be less accessible)
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })
        })
      }
    }
    return dates
  }

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = []
    
    // Morning slots (9 AM - 12 PM)
    for (let hour = 9; hour < 12; hour++) {
      slots.push({
        value: `${hour}:00`,
        label: `${hour === 12 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
        period: 'morning'
      })
      slots.push({
        value: `${hour}:30`,
        label: `${hour === 12 ? 12 : hour % 12}:30 ${hour < 12 ? 'AM' : 'PM'}`,
        period: 'morning'
      })
    }
    
    // Afternoon slots (12 PM - 6 PM)
    for (let hour = 12; hour < 18; hour++) {
      slots.push({
        value: `${hour}:00`,
        label: `${hour === 12 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
        period: 'afternoon'
      })
      slots.push({
        value: `${hour}:30`,
        label: `${hour === 12 ? 12 : hour % 12}:30 ${hour < 12 ? 'AM' : 'PM'}`,
        period: 'afternoon'
      })
    }
    
    // Evening slots (6 PM - 9 PM)
    for (let hour = 18; hour < 21; hour++) {
      slots.push({
        value: `${hour}:00`,
        label: `${hour === 12 ? 12 : hour % 12}:00 PM`,
        period: 'evening'
      })
      slots.push({
        value: `${hour}:30`,
        label: `${hour === 12 ? 12 : hour % 12}:30 PM`,
        period: 'evening'
      })
    }
    
    return slots
  }

  const pickupLocations = [
    { value: 'library', label: '📚 Library Main Entrance', description: 'Easy to find, well-lit area' },
    { value: 'student_center', label: '🏢 Student Center', description: 'Central campus location' },
    { value: 'union', label: '🍔 Student Union Food Court', description: 'Busy, safe meeting spot' },
    { value: 'quad', label: '🌳 Campus Quad', description: 'Open outdoor space' },
    { value: 'parking_garage', label: '🚗 Main Parking Garage', description: 'Covered area, easy parking' },
    { value: 'dorm_lobby', label: '🏠 Dorm Lobby', description: 'Secure, monitored area' },
    { value: 'custom', label: '📍 Other Location', description: 'Specify your own meeting spot' }
  ]

  const availableDates = generateAvailableDates()
  const timeSlots = generateTimeSlots()

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

  const validateScheduling = () => {
    const newErrors = {}
    
    if (!selectedDate) {
      newErrors.date = 'Please select a pickup date'
    }
    
    if (!selectedTime) {
      newErrors.time = 'Please select a pickup time'
    }
    
    if (!selectedLocation) {
      newErrors.location = 'Please select a pickup location'
    }
    
    if (selectedLocation === 'custom' && !customLocation.trim()) {
      newErrors.customLocation = 'Please specify the custom location'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateScheduling()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create the pickup appointment data
      const pickupData = {
        date: selectedDate,
        time: selectedTime,
        location: selectedLocation === 'custom' ? customLocation : selectedLocation,
        locationLabel: selectedLocation === 'custom' ? customLocation : 
          pickupLocations.find(loc => loc.value === selectedLocation)?.label,
        notes,
        items: cartItems,
        total: safeTotal,
        paymentMethod,
        buyerInfo: {
          name: user.name,
          email: user.email,
          id: user.user_id
        }
      }
      
      // Simulate API call to create order and schedule pickup
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Navigate to confirmation page
      navigate('/order-confirmation', {
        state: {
          orderData: {
            ...orderData,
            pickupData,
            orderId: `ORD${Date.now()}`, // Mock order ID
            status: 'confirmed'
          }
        }
      })
      
    } catch (error) {
      console.error('Scheduling error:', error)
      setErrors({ general: 'Failed to schedule pickup. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
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

  const sellerGroups = groupItemsBySeller(cartItems)

  if (!cartItems || cartItems.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Schedule Pickup</h1>
        <p className="text-gray-600 mt-2">
          Coordinate with sellers to pick up your items
          {paymentMethod === 'cash' && ' and complete payment'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scheduling Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Pickup Information</h2>
            
            <form onSubmit={handleScheduleSubmit}>
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableDates.map((date) => (
                    <label key={date.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="pickupDate"
                        value={date.value}
                        checked={selectedDate === date.value}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{date.label}</span>
                    </label>
                  ))}
                </div>
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Time
                </label>
                <div className="space-y-4">
                  {['morning', 'afternoon', 'evening'].map(period => (
                    <div key={period}>
                      <h4 className="font-medium text-gray-600 capitalize mb-2">{period}</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.filter(slot => slot.period === period).map((slot) => (
                          <label key={slot.value} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="pickupTime"
                              value={slot.value}
                              checked={selectedTime === slot.value}
                              onChange={(e) => setSelectedTime(e.target.value)}
                              className="mr-1"
                            />
                            <span className="text-xs">{slot.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>

              {/* Location Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pickup Location
                </label>
                <div className="space-y-3">
                  {pickupLocations.map((location) => (
                    <label key={location.value} className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="pickupLocation"
                        value={location.value}
                        checked={selectedLocation === location.value}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="mr-3 mt-1"
                      />
                      <div>
                        <div className="font-medium">{location.label}</div>
                        <div className="text-sm text-gray-600">{location.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                
                {/* Custom Location Input */}
                {selectedLocation === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Enter specific location (e.g., 'Coffee shop on Main St')"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.customLocation ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.customLocation && <p className="text-red-500 text-sm mt-1">{errors.customLocation}</p>}
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or preferences..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Payment Method Reminder */}
              <div className={`border rounded-md p-4 mb-6 ${
                paymentMethod === 'cash' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex">
                  <span className="text-xl mr-2">
                    {paymentMethod === 'cash' ? '💵' : paymentMethod === 'card' ? '💳' : '📱'}
                  </span>
                  <div>
                    <h4 className={`font-medium ${
                      paymentMethod === 'cash' ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      Payment: {paymentMethod === 'cash' ? 'Cash at Pickup' : 
                               paymentMethod === 'card' ? 'Credit Card (Processed)' : 'Digital Payment'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      paymentMethod === 'cash' ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      {paymentMethod === 'cash' 
                        ? `Bring $${safeTotal.toFixed(2)} in cash to complete the transaction`
                        : 'Payment will be processed according to your selected method'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <p className="text-red-700">{errors.general}</p>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/checkout', { state: { cartItems, total } })}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Payment
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Order...' : 'Confirm Pickup Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary & Seller Info */}
        <div className="space-y-6">
          {/* Items by Seller */}
          {sellerGroups.map((group, index) => (
            <div key={index} className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Items from {group.sellerName}
              </h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.cart_id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <hr />
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>${group.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Total Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Total</h3>              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items ({cartItems.length})</span>
                  <span>${safeTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>Pickup</span>
                </div>
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

export default PickupScheduler
