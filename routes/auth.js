const express = require('express')
const authController = require('../controllers/authController')
const router = express.Router()

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Columbus Marketplace Auth API is running',
        timestamp: new Date().toISOString()
    })
})

//API routes for authentication
router.post('/register', authController.register) //register endpoint

router.post('/login', authController.login) //login endpoint

router.get('/logout', authController.logout) //logout endpoint

router.get('/verify', authController.verify) //verify token endpoint

router.get('/product/:id', authController.products) //product endpoint

module.exports = router 