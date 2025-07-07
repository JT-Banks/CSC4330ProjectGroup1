const express = require('express')
const authController = require('../controllers/authController')
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

router.get('/user/cart', authController.isLoggedIn, (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        })
    }

    // Return cart data - to be implemented with database
    res.json({
        success: true,
        cart: [],
        user: req.user
    })
})

router.get('/user/wishlist', authController.isLoggedIn, (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        })
    }

    // Return wishlist data - to be implemented with database
    res.json({
        success: true,
        wishlist: [],
        user: req.user
    })
})

module.exports = router