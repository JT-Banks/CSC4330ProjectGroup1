const mysql = require('mysql2')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Create connection without specifying database initially
// Support both individual variables and Railway's DATABASE_URL format
let connection;

if (process.env.DATABASE_URL) {
    // Railway provides DATABASE_URL in format: mysql://user:password@host:port/database
    connection = mysql.createConnection(process.env.DATABASE_URL)
} else {
    // Fallback to individual environment variables
    connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        multipleStatements: true
    })
}

async function initializeDatabase() {
    console.log('🔄 Initializing Columbus Marketplace Database...')
    
    try {
        // Read and execute the database schema
        const schemaPath = path.join(__dirname, 'Database', 'db_load.sql')
        const schema = fs.readFileSync(schemaPath, 'utf8')
        
        connection.query(schema, (error, results) => {
            if (error) {
                // If tables already exist, that's OK - just proceed to load sample data
                if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log('ℹ️  Database tables already exist, proceeding to load sample data...')
                    loadSampleData()
                } else {
                    console.log('❌ Error creating database schema:', error)
                    return
                }
            } else {
                console.log('✅ Database schema created successfully!')
                // Now connect to the specific database and load sample data
                loadSampleData()
            }
        })
        
    } catch (error) {
        console.log('❌ Error reading schema file:', error)
    }
}

function loadSampleData() {
    // Close the current connection and reconnect to the specific database
    connection.end()
    
    // Create new connection using the same logic as before
    let dbConnection;
    
    if (process.env.DATABASE_URL) {
        // Railway provides DATABASE_URL in format: mysql://user:password@host:port/database
        dbConnection = mysql.createConnection(process.env.DATABASE_URL)
    } else {
        // Fallback to individual environment variables
        dbConnection = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE,
            multipleStatements: true
        })
    }
    
    try {
        const sampleDataPath = path.join(__dirname, 'Database', 'sample_data.sql')
        const sampleData = fs.readFileSync(sampleDataPath, 'utf8')
        
        dbConnection.query(sampleData, (error, results) => {
            if (error) {
                console.log('❌ Error loading sample data:', error)
            } else {
                console.log('✅ Sample data loaded successfully!')
                console.log('🎉 Database initialization complete!')
                console.log('')
                console.log('📋 Database Summary:')
                console.log('   - Database: Columbus_Marketplace')
                console.log('   - Tables: Users, Products, Orders, etc.')
                console.log('   - Sample users and products added')
                console.log('')
                console.log('🚀 You can now start your server with: npm start')
            }
            dbConnection.end()
        })
        
    } catch (error) {
        console.log('❌ Error reading sample data file:', error)
        dbConnection.end()
    }
}

// Start the initialization
connection.connect((error) => {
    if (error) {
        console.log('❌ Database connection failed:', error.code)
        console.log('Please ensure MySQL is running and credentials are correct')
        console.log('Host:', process.env.DATABASE_HOST)
        console.log('User:', process.env.DATABASE_USER)
        return
    }
    
    console.log('✅ Connected to MySQL server')
    initializeDatabase()
})
