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
console.log('🔍 BUILD TIMESTAMP: 2025-07-14-RENDER-FIX') // Fix Render backend deployment

dotenv.config({ path: './.env' })
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

let userDB;

console.log("🔍 Main App: Initializing database connection...")
console.log("🔍 NODE_ENV:", process.env.NODE_ENV)
console.log("🔍 MYSQLDATABASE:", process.env.MYSQLDATABASE)
console.log("🔍 MYSQLHOST:", process.env.MYSQLHOST)
console.log('--- ENV DUMP ---');
console.log(process.env);
console.log('-----------------');

if (process.env.DATABASE_URL) {
    console.log("🔍 Using Railway DATABASE_URL")
    userDB = mysql.createConnection(process.env.DATABASE_URL)
} else {
    // Fallback for local development
    console.log("🔍 Using individual environment variables for local development")
    userDB = mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE || 'Columbus_Marketplace'
    })
}

// Enable CORS for React frontend - Simplified approach
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://columbusmarketplace.netlify.app',
            'https://columbus-marketplace.netlify.app',
            'https://www.columbusmarketplace.netlify.app',
            'https://www.columbus-marketplace.netlify.app'
        ];
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        console.log('❌ CORS blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
}));

// Log CORS requests for debugging
app.use((req, res, next) => {
    console.log(`🔍 ${req.method} ${req.path} from ${req.get('Origin') || 'unknown origin'}`)
    if (req.method === 'OPTIONS') {
        console.log('🔍 Preflight request detected')
    }
    next()
})

//parse JSON
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use(cookieParser())

// Serve static files (for uploaded images)
app.use('/uploads', express.static('public/uploads'))

// Health check endpoint (before routes)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Columbus Student Marketplace API backend is running',
        timestamp: new Date().toISOString()
    })
})

// Test endpoint to verify routing works
app.get('/api/test', (req, res) => {
    console.log("🔍 TEST ROUTE HIT: /api/test")
    res.json({ success: true, message: 'API routing is working!', timestamp: new Date().toISOString() })
})

// Define API routes BEFORE server starts
console.log("🔍 Loading API routes...")
try {
    console.log("🔍 Mounting /api routes...")
    app.use('/api', require('./routes/pages'))
    console.log("✅ /api routes mounted")
    
    console.log("🔍 Mounting /api/auth routes...")
    app.use('/api/auth', require('./routes/auth'))
    console.log("✅ /api/auth routes mounted")
    
    console.log("🔍 Mounting /api/products routes...")
    app.use('/api/products', require('./routes/products'))
    console.log("✅ /api/products routes mounted")
    
    // Set database connection for controllers
    const authController = require('./controllers/authController');
    const cartController = require('./controllers/cartController');
    const categoriesController = require('./controllers/categoriesController');
    const productsController = require('./controllers/productsController');
    if (userDB) {
        authController.setDatabase(userDB);
        cartController.setDatabase(userDB);
        categoriesController.setDatabase(userDB);
        productsController.setDatabase(userDB);
    }
    
    console.log("✅ API routes loaded successfully")
} catch (routeError) {
    console.log("❌ Error loading routes:", routeError)
    console.error(routeError)
}

console.log("🔍 About to start server on port:", port)

const server = app.listen(port, () => {
    console.log("✅ Server started on port " + port)
    console.log("🚀 Server is ready to accept connections")
    console.log("🔗 Health endpoint: http://localhost:" + port + "/health")
    console.log("🔗 Test API endpoint: http://localhost:" + port + "/api/test")
    console.log("🌍 Railway URL: https://columbus-marketplace-backend-production.up.railway.app")
})

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