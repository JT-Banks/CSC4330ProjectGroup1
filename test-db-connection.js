const mysql = require('mysql2')
require('dotenv').config()

console.log('🔍 Testing Database Connection...')
console.log('📋 Environment Variables:')
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')
console.log('  DATABASE_HOST:', process.env.DATABASE_HOST || '❌ Missing')
console.log('  DATABASE_USER:', process.env.DATABASE_USER || '❌ Missing')
console.log('  DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? '✅ Set' : '❌ Missing')
console.log('  DATABASE:', process.env.DATABASE || '❌ Missing')
console.log('')

// Test connection
let connection;

if (process.env.DATABASE_URL) {
    console.log('🔗 Using DATABASE_URL connection...')
    connection = mysql.createConnection(process.env.DATABASE_URL)
} else if (process.env.DATABASE_HOST) {
    console.log('🔗 Using individual variables connection...')
    connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE
    })
} else {
    console.log('❌ No database configuration found!')
    process.exit(1)
}

connection.connect((error) => {
    if (error) {
        console.log('❌ Database connection failed:')
        console.log('  Error Code:', error.code)
        console.log('  Error Message:', error.message)
        console.log('  Host:', error.address)
        console.log('  Port:', error.port)
    } else {
        console.log('✅ Database connection successful!')
        console.log('🎉 Database is working correctly!')
    }
    connection.end()
    process.exit(error ? 1 : 0)
})
