import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { ordersAPI, cartAPI, wishlistAPI, profileAPI } from '../services/api'

const Profile = () => {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    orders: 0,
    wishlistItems: 0,
    cartItems: 0,
    totalSpent: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [profileCustomization, setProfileCustomization] = useState({
    profilePhoto: null,
    profilePhotoUrl: '',
    bannerColor: '#6366f1', // Default purple
    bannerImage: null,
    bannerImageUrl: '',
    bio: '',
    interests: [],
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
      discord: ''
    },
    preferences: {
      theme: theme,
      showEmail: false,
      showPhone: false
    }
  })
  const [showCustomization, setShowCustomization] = useState(false)

  useEffect(() => {
    fetchProfileData()
  }, [])

  // Sync theme with profileCustomization when theme changes
  useEffect(() => {
    setProfileCustomization(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: theme
      }
    }))
  }, [theme])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      // Fetch orders
      const ordersResponse = await ordersAPI.getOrders()
      const orders = ordersResponse.data.data || []
      
      // Fetch cart
      const cartResponse = await cartAPI.getCart()
      const cartItems = cartResponse.data.data || []
      
      // Fetch wishlist
      const wishlistResponse = await wishlistAPI.get()
      const wishlistItems = wishlistResponse.data.data || []
      
      // Calculate stats
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0)
      
      setStats({
        orders: orders.length,
        wishlistItems: wishlistItems.length,
        cartItems: cartItems.length,
        totalSpent
      })
      
      setRecentOrders(orders.slice(0, 5)) // Show only 5 most recent
      
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (!isEditing) {
      setEditData({
        name: user?.name || '',
        email: user?.email || ''
      })
    }
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      
      const response = await profileAPI.updateProfile({
        name: editData.name,
        email: editData.email
      })
      
      if (response.data.success) {
        // Update the user context or trigger a re-fetch
        console.log('✅ Profile updated successfully:', response.data.user)
        
        // Update the auth context if possible (you may need to add an update function to AuthContext)
        // For now, we'll just close the edit mode
        setIsEditing(false)
        
        // Optionally refresh the page to get updated user data
        window.location.reload()
      }
      
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      
      // Show error message to user
      let errorMessage = 'Failed to update profile'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      alert(errorMessage) // In a real app, you'd use a proper notification system
      
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileCustomization(prev => ({
          ...prev,
          profilePhoto: file,
          profilePhotoUrl: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileCustomization(prev => ({
          ...prev,
          bannerImage: file,
          bannerImageUrl: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInterestToggle = (interest) => {
    setProfileCustomization(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const predefinedInterests = [
    '📚 Textbooks', '💻 Electronics', '🎮 Gaming', '👕 Fashion', 
    '🏠 Dorm Essentials', '🚴 Sports', '🎨 Art Supplies', '🎵 Music',
    '🍕 Food', '📱 Phone Accessories', '🚗 Transportation', '📖 Study Materials'
  ]

  const bannerColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', 
    '#10b981', '#06b6d4', '#6366f1', '#8b5cf6', '#1f2937'
  ]

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Banner */}
      <div className="card overflow-hidden p-0">
        {/* Banner Section */}
        <div 
          className="h-32 relative"
          style={{
            background: profileCustomization.bannerImageUrl 
              ? `url(${profileCustomization.bannerImageUrl}) center/cover`
              : profileCustomization.bannerColor
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <button
            onClick={() => setShowCustomization(true)}
            className="absolute top-4 right-4 px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg text-sm hover:bg-opacity-30 transition-all"
          >
            ✨ Customize
          </button>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Profile Photo */}
              <div className="relative -mt-16">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {profileCustomization.profilePhotoUrl ? (
                    <img 
                      src={profileCustomization.profilePhotoUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <button
                  onClick={() => document.getElementById('profile-photo-input').click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-purple-600 transition-colors"
                >
                  📷
                </button>
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                />
              </div>
              
              <div className="mt-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name}!</h1>
                <p className="text-gray-600">
                  {profileCustomization.bio || 'Manage your account and view your activity'}
                </p>
                {profileCustomization.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileCustomization.interests.slice(0, 3).map((interest, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {interest}
                      </span>
                    ))}
                    {profileCustomization.interests.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{profileCustomization.interests.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleEditToggle}
              className="btn-primary"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{stats.orders}</div>
              <div className="text-sm text-blue-600">Total Orders</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{stats.wishlistItems}</div>
              <div className="text-sm text-green-600">Wishlist Items</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{stats.cartItems}</div>
              <div className="text-sm text-purple-600">Cart Items</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">${stats.totalSpent.toFixed(2)}</div>
              <div className="text-sm text-yellow-600">Total Spent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '👤' },
              { id: 'orders', name: 'Order History', icon: '📦' },
              { id: 'settings', name: 'Account Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                          className="form-input"
                        />
                      ) : (
                        <div className="form-input bg-gray-50">{user?.name}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                          className="form-input"
                        />
                      ) : (
                        <div className="form-input bg-gray-50">{user?.email}</div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSaveProfile}
                          className="btn-primary"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleEditToggle}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/cart')}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">🛒</span>
                        <div>
                          <div className="font-medium">View Cart</div>
                          <div className="text-sm text-gray-600">{stats.cartItems} items waiting</div>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => navigate('/wishlist')}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">❤️</span>
                        <div>
                          <div className="font-medium">View Wishlist</div>
                          <div className="text-sm text-gray-600">{stats.wishlistItems} saved items</div>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">🔍</span>
                        <div>
                          <div className="font-medium">Browse Products</div>
                          <div className="text-sm text-gray-600">Discover new items</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                {recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div key={order.order_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">📦</span>
                          </div>
                          <div>
                            <div className="font-medium">Order #{order.order_id}</div>
                            <div className="text-sm text-gray-600">{formatDate(order.created_at)} • {order.items.length} items</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${parseFloat(order.total_amount).toFixed(2)}</div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <span className="text-4xl mb-2 block">🛍️</span>
                    <p className="text-gray-500">No recent orders</p>
                    <p className="text-sm text-gray-400 mt-1">Start shopping to see your activity here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Order History</h3>
                <div className="text-sm text-gray-600">
                  {recentOrders.length} {recentOrders.length === 1 ? 'order' : 'orders'} total
                </div>
              </div>
              
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.order_id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">Order #{order.order_id}</h4>
                          <p className="text-gray-600">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">${parseFloat(order.total_amount).toFixed(2)}</div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                              ) : (
                                <span className="text-gray-400">📦</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-600">
                                Sold by {item.seller_name} • Qty: {item.quantity}
                              </div>
                            </div>
                            <div className="font-semibold">
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <span className="text-6xl mb-4 block">📦</span>
                  <h4 className="text-xl font-medium text-gray-800 mb-2">No orders yet</h4>
                  <p className="text-gray-600 mb-4">When you make your first purchase, it will appear here</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="btn-primary"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-gray-600">Receive updates about your orders</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">SMS Notifications</div>
                        <div className="text-sm text-gray-600">Get text updates about deliveries</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">Danger Zone</h4>
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-red-800">Delete Account</div>
                      <div className="text-sm text-red-600">Permanently delete your account and all data</div>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">✨ Customize Your Profile</h2>
              <button
                onClick={() => setShowCustomization(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="space-y-8">
                {/* Banner Customization */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Banner Design</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Choose Banner Color</label>
                      <div className="flex flex-wrap gap-2">
                        {bannerColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setProfileCustomization(prev => ({...prev, bannerColor: color, bannerImageUrl: ''}))}
                            className={`w-8 h-8 rounded-full border-2 ${
                              profileCustomization.bannerColor === color ? 'border-gray-800' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Or Upload Banner Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Bio & About</h3>
                  <textarea
                    value={profileCustomization.bio}
                    onChange={(e) => setProfileCustomization(prev => ({...prev, bio: e.target.value}))}
                    placeholder="Tell others about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    maxLength="200"
                  />
                  <p className="text-sm text-gray-500 mt-1">{profileCustomization.bio.length}/200 characters</p>
                </div>

                {/* Interests */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Shopping Interests</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {predefinedInterests.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          profileCustomization.interests.includes(interest)
                            ? 'bg-purple-100 border-purple-300 text-purple-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🔗 Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profileCustomization.socialLinks).map(([platform, value]) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {platform === 'linkedin' ? 'LinkedIn' : platform}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setProfileCustomization(prev => ({
                            ...prev,
                            socialLinks: {...prev.socialLinks, [platform]: e.target.value}
                          }))}
                          placeholder={`Your ${platform} username`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🔒 Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">Show Email Publicly</div>
                        <div className="text-sm text-gray-600">Let other students see your email</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={profileCustomization.preferences.showEmail}
                          onChange={(e) => setProfileCustomization(prev => ({
                            ...prev,
                            preferences: {...prev.preferences, showEmail: e.target.checked}
                          }))}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Theme Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Theme Preference</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', name: 'Light', icon: '☀️', desc: 'Clean and bright' },
                      { id: 'dark', name: 'Dark', icon: '🌙', desc: 'Easy on the eyes' },
                      { id: 'auto', name: 'Auto', icon: '🌗', desc: 'Follow system' }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setTheme(theme.id)
                          setProfileCustomization(prev => ({
                            ...prev,
                            preferences: {...prev.preferences, theme: theme.id}
                          }))
                        }}
                        className={`p-4 rounded-lg border-2 text-center transition-colors ${
                          profileCustomization.preferences.theme === theme.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{theme.icon}</div>
                        <div className="font-medium">{theme.name}</div>
                        <div className="text-sm text-gray-600">{theme.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCustomization(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Save customization to backend
                    console.log('Saving customization:', profileCustomization)
                    setShowCustomization(false)
                  }}
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
