const mysql = require("mysql2")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs') 
const { promisify } = require('util') 

//Database connection - will be set by app.js
let userDB = null;

console.log("🔍 AuthController: Module loaded (database connection will be set by app.js)")

// Function to set database connection from app.js
exports.setDatabase = (database) => {
    userDB = database;
    console.log("✅ AuthController: Database connection set from app.js")
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide an email and password'
            })
        }

        // Validate .edu email
        if (!email.endsWith('.edu')) {
            return res.status(400).json({
                success: false,
                message: 'Only .edu email addresses are allowed'
            })
        }

        // Check if userDB exists
        if (!userDB) {
            console.log("❌ No database connection available for login")
            return res.status(503).json({
                success: false,
                message: 'Database service unavailable. Please try again later.'
            })
        }

        userDB.query('SELECT * FROM Users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                console.log("❌ Login database error:", error)
                return res.status(500).json({
                    success: false,
                    message: 'Database error occurred'
                })
            }

            console.log("🔍 Login query results:", results)
            console.log("🔍 Results length:", results ? results.length : 'null')

            if (!results || results.length === 0) {
                console.log("❌ No user found with email:", email)
                return res.status(401).json({
                    success: false,
                    message: 'Email or password is incorrect'
                })
            }

            console.log("🔍 Found user:", results[0].email)
            console.log("🔍 Stored password hash:", results[0].password)
            console.log("🔍 Input password:", password)

            const passwordMatch = await bcrypt.compare(password, results[0].password)
            console.log("🔍 Password comparison result:", passwordMatch)

            if (!passwordMatch) {
                console.log("❌ Password mismatch for user:", email)
                return res.status(401).json({
                    success: false,
                    message: 'Email or password is incorrect'
                })
            }

            const user = results[0]
            const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            })

            const cookieOptions = {
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                ),
                httpOnly: true
            }

            res.cookie('jwt', token, cookieOptions)
            res.status(200).json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email
                }
            })
        })
    }
    catch (error) {
        console.log("❌ Login general error:", error)
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        })
    }
}

exports.register = async (req, res) => {
    console.log("🔍 Register request received:", req.body)
    
    try {
        const { name, email, password, passwordConfirm } = req.body

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            })
        }

        if (!email.endsWith('.edu')) {
            return res.status(400).json({
                success: false,
                message: 'Only .edu email addresses are allowed for student registration'
            })
        }

        // Check if userDB exists and is connected
        if (!userDB) {
            console.log("❌ No database connection available")
            return res.status(503).json({
                success: false,
                message: 'Database service unavailable. Please try again later.'
            })
        }

        userDB.query('SELECT email FROM Users WHERE email = ?', [email], async (error, result) => {
            if (error) {
                console.log("❌ Database query error:", error)
                return res.status(500).json({
                    success: false,
                    message: 'Database error occurred'
                })
            }

            if (result.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'That email is already in use!'
                })
            }

            if (!password || password === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Password field cannot be blank!'
                })
            }

            try {
                let hashedPassword = await bcrypt.hash(password, 8)

                userDB.query('INSERT INTO Users SET ?', { 
                    name: name, 
                    email: email, 
                    password: hashedPassword 
                }, (error, results) => {
                    if (error) {
                        console.log("❌ User insert error:", error)
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create user account'
                        })
                    }

                    console.log("✅ User created successfully:", results)
                    return res.status(201).json({
                        success: true,
                        message: 'Student account created successfully!'
                    })
                })
            } catch (hashError) {
                console.log("❌ Password hashing error:", hashError)
                return res.status(500).json({
                    success: false,
                    message: 'Error creating account'
                })
            }
        })
    } catch (generalError) {
        console.log("❌ General register error:", generalError)
        return res.status(500).json({
            success: false,
            message: 'Server error occurred'
        })
    }
}

exports.isLoggedIn = async (req, res, next) => {
    console.log('Checking authentication...')
    console.log('Cookies:', req.cookies)
    console.log('Headers:', req.headers.authorization)

    try {
        let token = null

        // Check for token in Authorization header first
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        }
        // Fall back to cookie
        else if (req.cookies.jwt) {
            token = req.cookies.jwt
        }

        if (!token) {
            return next() // No token, continue without user
        }

        // Verify token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

        // Check if user still exists
        userDB.query('SELECT user_id, name, email FROM Users WHERE user_id = ?', [decoded.id], (error, result) => {
            if (error) {
                console.log('Database error:', error)
                return next()
            }

            if (!result || result.length === 0) {
                return next() // User doesn't exist, continue without user
            }

            req.user = {
                id: result[0].user_id,
                name: result[0].name,
                email: result[0].email
            }
            return next()
        })
    } catch (error) {
        console.log('Auth middleware error:', error)
        return next() // Invalid token, continue without user
    }
}

exports.products = (req, res) => {
    const product_id = req.params.id
    try {
        userDB.query('SELECT * FROM Products WHERE product_id = ?', [product_id], (error, result) => {
            if (error) {
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Database error occurred'
                })
            }
            
            if (!result || result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                })
            }

            res.status(200).json({
                success: true,
                data: result[0]
            })
        })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        })
    }
}

exports.logout = async (req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    })
}

// Add token verification endpoint
exports.verify = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.cookies.jwt

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            })
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

        userDB.query('SELECT user_id, name, email FROM Users WHERE user_id = ?', [decoded.id], (error, result) => {
            if (error) {
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Database error occurred'
                })
            }

            if (!result || result.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                })
            }

            res.status(200).json({
                success: true,
                user: {
                    id: result[0].user_id,
                    name: result[0].name,
                    email: result[0].email
                }
            })
        })
    } catch (error) {
        console.log(error)
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        })
    }
}

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body
        const userId = req.user.id

        if (!userDB) {
            console.log("❌ No database connection available for profile update")
            return res.status(503).json({
                success: false,
                message: 'Database service unavailable. Please try again later.'
            })
        }

        // Validate input
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            })
        }

        // Validate .edu email
        if (!email.endsWith('.edu')) {
            return res.status(400).json({
                success: false,
                message: 'Only .edu email addresses are allowed'
            })
        }

        // Check if email is already in use by another user
        userDB.query('SELECT user_id FROM Users WHERE email = ? AND user_id != ?', [email, userId], (error, results) => {
            if (error) {
                console.log("❌ Profile update email check error:", error)
                return res.status(500).json({
                    success: false,
                    message: 'Database error occurred'
                })
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email address is already in use'
                })
            }

            // Update user profile
            userDB.query('UPDATE Users SET name = ?, email = ? WHERE user_id = ?', [name, email, userId], (updateError, updateResults) => {
                if (updateError) {
                    console.log("❌ Profile update error:", updateError)
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update profile'
                    })
                }

                if (updateResults.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    })
                }

                console.log("✅ Profile updated successfully for user:", userId)
                
                // Return updated user data
                res.status(200).json({
                    success: true,
                    message: 'Profile updated successfully',
                    user: {
                        id: userId,
                        name: name,
                        email: email
                    }
                })
            })
        })

    } catch (error) {
        console.log("❌ Profile update error:", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

exports.verifyToken = async (req, res, next) => {
    console.log('🔍 Verifying authentication token...')
    console.log('Cookies:', req.cookies)
    console.log('Headers:', req.headers.authorization)

    try {
        let token = null

        // Check for token in Authorization header first
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        }
        // Fall back to cookie
        else if (req.cookies.jwt) {
            token = req.cookies.jwt
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in.'
            })
        }

        // Verify token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

        // Check if user still exists
        userDB.query('SELECT user_id, name, email FROM Users WHERE user_id = ?', [decoded.id], (error, result) => {
            if (error) {
                console.log('Database error:', error)
                return res.status(500).json({
                    success: false,
                    message: 'Database error during authentication'
                })
            }

            if (!result || result.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User no longer exists'
                })
            }

            req.user = {
                userId: result[0].user_id,
                id: result[0].user_id,
                name: result[0].name,
                email: result[0].email
            }
            
            console.log('✅ Authentication successful for user:', req.user.name)
            return next()
        })
    } catch (error) {
        console.log('Auth middleware error:', error)
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        })
    }
}