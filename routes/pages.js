const express = require('express')
const authController = require('../controllers/authController')
const cartController = require('../controllers/cartController')
const setupController = require('../controllers/setupController')
const router = express.Router()

// API endpoints for data
router.get('/products', authController.isLoggedIn, (req, res) => {
    // Return products data as JSON
    res.json({
        success: true,
        message: 'Products endpoint - to be implemented',
        user: req.user || null
    })
})

router.get('/user/profile', authController.isLoggedIn, (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        })
    }

    res.json({
        success: true,
        user: req.user
    })
})

// Setup route (for creating tables)
router.post('/setup-tables', setupController.setupTables)

// Cart routes
router.get('/cart', authController.isLoggedIn, cartController.getCart)
router.post('/cart', authController.isLoggedIn, cartController.addToCart)
router.put('/cart', authController.isLoggedIn, cartController.updateCart)
router.delete('/cart/:productId', authController.isLoggedIn, cartController.removeFromCart)

// Checkout route - TODO: implement
// router.post('/checkout', authController.isLoggedIn, cartController.checkout)

// Orders route - TODO: implement  
// router.get('/orders', authController.isLoggedIn, cartController.getOrders)

// Wishlist routes
router.get('/wishlist', authController.isLoggedIn, cartController.getWishlist)
router.post('/wishlist', authController.isLoggedIn, cartController.addToWishlist)
router.delete('/wishlist/:productId', authController.isLoggedIn, cartController.removeFromWishlist)

module.exports = router