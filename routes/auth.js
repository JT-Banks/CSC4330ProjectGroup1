const express = require('express')
const authController = require('../controllers/auth')
const router = express.Router()

//Control to pass to pages to auth(authentication)
router.post('/register', authController.register) //register page

router.post('/login', authController.login) //login page

router.get('/logout', authController.logout) //logout page

router.get('/product/:id', authController.products) //product page

module.exports = router 