const express = require("express")
const mysql = require("mysql2")
const app = express()
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const cors = require('cors')

var port = process.env.PORT || 5005;

console.log("🔍 Starting Columbus Marketplace Backend...")
console.log("🔍 NODE_ENV:", process.env.NODE_ENV)
console.log("🔍 PORT:", port)
console.log("🔍 DATABASE_URL exists:", !!process.env.DATABASE_URL)

//dotenv gets .env file from root directory
dotenv.config({ path: './.env' })

//Database connections are held in .env
// Support both individual variables and Railway's DATABASE_URL format
let userDB;

if (process.env.DATABASE_URL) {
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
        'https://columbus-marketplace.netlify.app',
        process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

//parse JSON
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use(cookieParser())

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`🔍 ${req.method} ${req.path} from ${req.get('Origin') || 'unknown origin'}`)
    next()
})

//Define API routes BEFORE database connection
app.use('/api', require('./routes/pages'))
app.use('/api/auth', require('./routes/auth'))

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Columbus Student Marketplace API backend is running',
        timestamp: new Date().toISOString()
    })
})

// Start the server immediately, regardless of database connection
app.listen(port, () => {
    console.log("Server started on localhost port " + port + " ... OK!")
    console.log("🚀 Server is currently running, check browser @ http://localhost:" + port)
})

// Attempt database connection separately (non-blocking)
userDB.connect(async (error) => {
    if (error) {
        console.log("❌ Database connection failed:", error.code)
        console.log("Please check .env file and ensure MySQL is running")
        console.log("Database Host:", process.env.DATABASE_HOST)
        console.log("Database User:", process.env.DATABASE_USER)
        console.log("Database Name:", process.env.DATABASE)
        
        console.log("⚠️ Server will continue without database connection...")
    }
    else {
        console.log("✅ MySQL connecting .... OK!")
        console.log("📊 Connected to database:", process.env.DATABASE)
        console.log("📊 Database ready for use!")
        console.log("💡 Tables should already exist via DBeaver setup")
    }
})