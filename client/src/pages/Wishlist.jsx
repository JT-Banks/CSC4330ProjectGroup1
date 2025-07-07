import React from 'react'

const Wishlist = () => {
  // Mock wishlist data - will be replaced with real data later
  const wishlistItems = []

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
          {/* Wishlist items will be mapped here */}
          {wishlistItems.map((item, index) => (
            <div key={index} className="card">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-3">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary-600">${item.price}</span>
                <div className="space-x-2">
                  <button className="btn-primary text-sm">Add to Cart</button>
                  <button className="btn-secondary text-sm">Remove</button>
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
