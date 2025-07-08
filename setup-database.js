const mysql = require('mysql2')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Create connection 
// Support both individual variables and Railway's DATABASE_URL format
let connection;

if (process.env.DATABASE_URL) {
    // Railway provides DATABASE_URL in format: mysql://user:password@host:port/database
    connection = mysql.createConnection(process.env.DATABASE_URL)
    console.log('🔗 Using DATABASE_URL connection for Railway')
} else {
    // Fallback to individual environment variables
    connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE, // Add database name for local connections
        multipleStatements: true
    })
    console.log('🔗 Using individual environment variables for local MySQL')
}

async function initializeDatabase() {
    console.log('🔄 Initializing Columbus Marketplace Database...')
    
    try {
        // Read the database schema
        const schemaPath = path.join(__dirname, 'Database', 'db_load.sql')
        const schema = fs.readFileSync(schemaPath, 'utf8')
        
        // Split the schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
        
        console.log(`📋 Found ${statements.length} SQL statements to execute`)
        
        // Execute each statement separately
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i]
            if (statement.trim()) {
                try {
                    await new Promise((resolve, reject) => {
                        connection.query(statement, (error, results) => {
                            if (error) {
                                console.log(`⚠️  Statement ${i + 1} warning:`, error.message)
                                resolve() // Continue even if some statements fail
                            } else {
                                console.log(`✅ Statement ${i + 1} executed successfully`)
                                resolve(results)
                            }
                        })
                    })
                } catch (error) {
                    console.log(`❌ Error executing statement ${i + 1}:`, error.message)
                }
            }
        }
        
        console.log('✅ Database schema setup completed!')
        loadSampleData()
        
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
                console.log('🚀 Can now start server with: npm start')
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
