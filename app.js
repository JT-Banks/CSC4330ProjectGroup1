const express = require("express")
const mysql = require("mysql2")
const app = express()
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const cors = require('cors')

var port = process.env.PORT || 5005;

console.log("🔍 Starting Columbus Marketplace Backend v2.0...")
console.log("🔍 CORS Fix Applied - Build:", new Date().toISOString())
console.log("🔍 NODE_ENV:", process.env.NODE_ENV)
console.log("🔍 PORT:", port)
console.log("🔍 DATABASE_URL exists:", !!process.env.DATABASE_URL)

//dotenv gets .env file from root directory
dotenv.config({ path: './.env' })

//Database connections are held in .env
// Database connections - prefer individual variables for Railway
let userDB;

// For Railway, use individual environment variables (more reliable)
if (process.env.NODE_ENV === 'production') {
    console.log("🔍 Production environment detected - using Railway MySQL variables")
    userDB = mysql.createConnection({
        host: process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DATABASE_HOST,
        user: process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DATABASE_USER,
        password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DATABASE_PASSWORD,
        database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DATABASE,
        port: process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306
    })
} else if (process.env.DATABASE_URL) {
    console.log("🔍 Using DATABASE_URL for local development")
    userDB = mysql.createConnection(process.env.DATABASE_URL)
} else {
    // Fallback to individual environment variables for local development
    console.log("🔍 Using individual environment variables for local development")
    userDB = mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE || 'Columbus_Marketplace'
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200, // For legacy browser support
    preflightContinue: false
}))

// Handle preflight requests explicitly
app.options('*', (req, res) => {
    console.log(`🔍 OPTIONS request from ${req.get('Origin')} for ${req.path}`)
    res.header('Access-Control-Allow-Origin', req.get('Origin'))
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.sendStatus(200)
})

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
const server = app.listen(port, () => {
    console.log("✅ Server started on port " + port)
    console.log("🚀 Server is ready to accept connections")
    console.log("🔗 Health endpoint: http://localhost:" + port + "/health")
})

// Graceful error handling
server.on('error', (error) => {
    console.log("❌ Server error:", error)
})

process.on('uncaughtException', (error) => {
    console.log("❌ Uncaught exception:", error)
})

process.on('unhandledRejection', (error) => {
    console.log("❌ Unhandled rejection:", error)
})

// Attempt database connection separately (non-blocking)
if (userDB) {
    console.log("\n🔍 Testing Database Connection...")
    console.log("📋 Railway's Actual MySQL Variables:")
    console.log("  MYSQLHOST:", process.env.MYSQLHOST ? "✅ Set" : "❌ Missing")
    console.log("  MYSQLUSER:", process.env.MYSQLUSER ? "✅ Set" : "❌ Missing")
    console.log("  MYSQLPASSWORD:", process.env.MYSQLPASSWORD ? "✅ Set" : "❌ Missing")
    console.log("  MYSQLDATABASE:", process.env.MYSQLDATABASE || "❌ Missing")
    console.log("  MYSQLPORT:", process.env.MYSQLPORT || "❌ Missing")
    console.log("\n📋 Standard MySQL Variables:")
    console.log("  MYSQL_HOST:", process.env.MYSQL_HOST ? "✅ Set" : "❌ Missing")
    console.log("  MYSQL_USER:", process.env.MYSQL_USER ? "✅ Set" : "❌ Missing")
    console.log("  MYSQL_PASSWORD:", process.env.MYSQL_PASSWORD ? "✅ Set" : "❌ Missing")
    console.log("  MYSQL_DATABASE:", process.env.MYSQL_DATABASE || "❌ Missing")
    console.log("  MYSQL_PORT:", process.env.MYSQL_PORT || "❌ Missing")
    console.log("\n📋 Generic Database Variables:")
    console.log("  DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing")
    console.log("  DATABASE_HOST:", process.env.DATABASE_HOST ? "✅ Set" : "❌ Missing")
    console.log("  DATABASE_USER:", process.env.DATABASE_USER ? "✅ Set" : "❌ Missing")
    console.log("  DATABASE_PASSWORD:", process.env.DATABASE_PASSWORD ? "✅ Set" : "❌ Missing")
    console.log("  DATABASE:", process.env.DATABASE || "❌ Missing")
    
    userDB.connect(async (error) => {
        if (error) {
            console.log("\n❌ Database connection failed:")
            console.log("  Error Code:", error.code)
            console.log("  Error Message:", error.message)
            console.log("  Host:", error.hostname || "undefined")
            console.log("  Port:", error.port || "undefined")
            console.log("⚠️ Server will continue without database connection...")
        } else {
            console.log("\n✅ MySQL connected successfully!")
            console.log("📊 Database ready for use!")
        }
    })
} else {
    console.log("⚠️ Database connection skipped - no userDB object created")
}