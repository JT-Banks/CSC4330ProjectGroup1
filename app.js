const express = require("express")
const mysql = require("mysql2")
const app = express()
const dotenv = require('dotenv')
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const fs = require('fs')

var port = process.env.PORT || 5005;

//dotenv gets .env file from root directory
dotenv.config({ path: './.env' })

//Database connections are held in .env
// Support both individual variables and Railway's DATABASE_URL format
let userDB;

if (process.env.DATABASE_URL) {
    // Railway provides DATABASE_URL in format: mysql://user:password@host:port/database
    userDB = mysql.createConnection(process.env.DATABASE_URL)
} else {
    // Fallback to individual environment variables
    userDB = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE
    })
}

// Enable CORS for React frontend
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:5173',
        'https://columbusmarketplace.netlify.app',
        process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true
}))

//parse JSON
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use(cookieParser())

userDB.connect(async (error) => {
    if (error) {
        console.log("❌ Database connection failed:", error.code)
        console.log("Please check your .env file and ensure MySQL is running")
        console.log("Database Host:", process.env.DATABASE_HOST)
        console.log("Database User:", process.env.DATABASE_USER)
        console.log("Database Name:", process.env.DATABASE)
        
        // Don't exit the process - let the app start without database for now
        console.log("⚠️  Starting server without database connection...")
    }
    else {
        console.log("✅ MySQL connecting .... OK!")
        console.log("📊 Connected to database:", process.env.DATABASE)
        
        // Run database setup on Railway (production only)
        if (process.env.NODE_ENV === 'production') {
            console.log("🔧 Setting up database tables...")
            try {
                const setupScript = fs.readFileSync(path.join(__dirname, 'Database', 'db_load.sql'), 'utf8')
                const statements = setupScript.split(';').filter(stmt => stmt.trim().length > 0)
                
                for (const statement of statements) {
                    if (statement.trim()) {
                        await new Promise((resolve, reject) => {
                            userDB.query(statement, (err, results) => {
                                if (err) {
                                    console.log("⚠️  SQL statement warning:", err.message)
                                    resolve() // Continue even if some statements fail
                                } else {
                                    resolve(results)
                                }
                            })
                        })
                    }
                }
                console.log("✅ Database setup completed!")
            } catch (setupError) {
                console.log("⚠️  Database setup warning:", setupError.message)
                console.log("📱 App will continue without setup...")
            }
        }
    }
    
    console.log("🚀 Server is currently running, check browser @ http://localhost:" + port)
})

//Define API routes
app.use('/api', require('./routes/pages'))
app.use('/api/auth', require('./routes/auth'))

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Columbus Student Marketplace API is running',
        timestamp: new Date().toISOString()
    })
})

app.listen(port, () => {
    console.log("Server started on localhost port " + port + " ... OK!")
})