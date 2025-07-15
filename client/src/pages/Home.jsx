import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg text-white p-8 mb-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Columbus Marketplace
          </h1>
          <p className="text-xl mb-6">
            Your exclusive student marketplace - connecting college communities through commerce
          </p>
          {!user && (
            <div className="space-x-4">
              <Link to="/register" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Get Started
              </Link>
              <Link to="/login" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Featured Categories */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              name: 'Electronics', 
              description: 'Gaming, study & tech gear',
              icon: '💻',
              gradient: 'from-blue-400 to-blue-600',
              textColor: 'text-blue-800'
            },
            { 
              name: 'Clothing', 
              description: 'Campus fashion & accessories',
              icon: '👕',
              gradient: 'from-purple-400 to-purple-600',
              textColor: 'text-purple-800'
            },
            { 
              name: 'Textbooks', 
              description: 'Study materials & books',
              icon: '📚',
              gradient: 'from-green-400 to-green-600',
              textColor: 'text-green-800'
            },
            { 
              name: 'Sports & Recreation', 
              description: 'Campus recreation & fitness',
              icon: '🏀',
              gradient: 'from-orange-400 to-orange-600',
              textColor: 'text-orange-800'
            }
          ].map((category) => (
            <Link 
              key={category.name} 
              to={`/categories?category=${category.name.toLowerCase()}`}
              className="card hover:shadow-lg transition-all duration-300 cursor-pointer group block"
            >
              <div className={`h-32 bg-gradient-to-br ${category.gradient} rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <span className="text-6xl">{category.icon}</span>
              </div>
              <h3 className={`text-lg font-semibold ${category.textColor} mb-1`}>{category.name}</h3>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 1, name: 'Gaming Headphones', price: 89.99, image: '/headphones.jpg', description: 'Perfect for dorm gaming and online classes' },
            { id: 2, name: 'Student Backpack', price: 79.95, image: '/backpack.jpg', description: 'Essential for campus life and textbooks' },
            { id: 3, name: 'Healthy Snacks', price: 2.99, image: '/banana.jpg', description: 'Perfect study fuel for busy students' },
            { id: 4, name: 'Campus Recreation Canoe', price: 899.99, image: '/Canoe.jpg', description: 'Great for outdoor campus activities' },
            { id: 5, name: 'Gaming Controller', price: 59.99, image: '/xboxController.jpg', description: 'Essential for dorm room entertainment' },
            { id: 6, name: 'School Spirit Gear', price: 24.99, image: '/lsu_image.1.jpg', description: 'Show your Tigers pride on campus' }
          ].map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow">
              <img 
                src={product.image} 
                alt={product.name}
                className="h-48 w-full object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.src = '/shopping.jpg' // Fallback image
                }}
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-3">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary-600">${product.price}</span>
                {user ? (
                  <Link 
                    to={`/product/${product.id}`}
                    className="btn-primary text-sm"
                  >
                    View Details
                  </Link>
                ) : (
                  <Link 
                    to="/login"
                    className="btn-primary text-sm"
                  >
                    Login to View
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
