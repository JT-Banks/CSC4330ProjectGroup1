const mysql = require('mysql2/promise')

let db;

if (process.env.DATABASE_URL) {
    console.log("🔍 Database Config: Using Railway DATABASE_URL")
    db = mysql.createConnection(process.env.DATABASE_URL)
} else {
    // Fallback for local development
    console.log("🔍 Database Config: Using individual environment variables for local development")
    db = mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE || 'Columbus_Marketplace'
    })
}

module.exports = db
