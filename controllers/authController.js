const mysql = require("mysql2")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs') 
const { promisify } = require('util') 

//Database connection - use Railway's DATABASE_URL directly
let userDB;

console.log("🔍 AuthController: Initializing database connection...")
console.log("🔍 NODE_ENV:", process.env.NODE_ENV)
console.log("🔍 DATABASE_URL available:", !!process.env.DATABASE_URL)

// Use Railway's DATABASE_URL directly (points to 'railway' database)
if (process.env.DATABASE_URL) {
    console.log("🔍 AuthController: Using Railway DATABASE_URL")
    userDB = mysql.createConnection(process.env.DATABASE_URL)
    console.log("✅ AuthController: Database connection object created")
} else {
    // Fallback for local development
    console.log("🔍 AuthController: Using individual environment variables for local development")
    userDB = mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE || 'Columbus_Marketplace'
    })
    console.log("✅ AuthController: Local database connection object created")
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

            if (!results || results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
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