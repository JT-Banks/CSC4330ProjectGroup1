const express = require('express')
const authController = require('../controllers/auth')
const router = express.Router()

router.get('/', authController.isLoggedIn, (req, res) => {
    res.render('index', {
        user: req.user
    })
})
//router requests, passed in controller, if router passes checks, render corrosponding page
router.get("/register", (req, res) => {
    res.render('register')
})

router.get('/login', (req, res) => {
    res.render('login')

})

router.get('/profile', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.render('profile', {
            user: req.user
        })
    }
    else {
        res.redirect('/login')
    }
})

router.get('/product', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.render('product', {
            user: req.user
        })
    }
    else {
        res.redirect('/login')
    }
})

router.get('/cart', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.render('cart', {
            user: req.user
        })
    }
    else {
        res.redirect('/login')
    }
})

router.get('/wishlist', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.render('wishlist', {
            user: req.user
        })
    }
    else {
        res.redirect('/login')
    }
})

module.exports = router