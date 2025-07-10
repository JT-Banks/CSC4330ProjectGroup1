import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Columbus Student Marketplace</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Profile
                </Link>
                <Link 
                  to="/cart" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Cart
                </Link>
                <Link 
                  to="/orders" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Orders
                </Link>
                <Link 
                  to="/wishlist" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Wishlist
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Welcome, {user.name}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="btn-secondary text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
