const mysql = require('mysql2')
require('dotenv').config()

// Simple script to create basic tables for Columbus Marketplace
let connection;

if (process.env.DATABASE_URL) {
    // Railway provides DATABASE_URL
    connection = mysql.createConnection(process.env.DATABASE_URL)
    console.log('🔗 Using Railway DATABASE_URL')
} else {
    // Local development
    connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE
    })
    console.log('🔗 Using local database connection')
}

const createTables = async () => {
    console.log('🚀 Creating Columbus Marketplace tables...')
    
    try {
        // Create Users table
        await new Promise((resolve, reject) => {
            connection.query(`
                CREATE TABLE IF NOT EXISTS Users(
                    user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                    name varchar(255),
                    email varchar(255),
                    password varchar(255),
                    PRIMARY KEY(user_id)
                )
            `, (err, result) => {
                if (err) {
                    console.log('⚠️  Users table:', err.message)
                } else {
                    console.log('✅ Users table created')
                }
                resolve()
            })
        })

        // Create Products table  
        await new Promise((resolve, reject) => {
            connection.query(`
                CREATE TABLE IF NOT EXISTS Products(
                    product_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                    name varchar(255),
                    description text,
                    store_quantity INT UNSIGNED NOT NULL,
                    category INT UNSIGNED NOT NULL, 
                    price DECIMAL(6, 2) UNSIGNED,
                    rating INT UNSIGNED,
                    image_url varchar(255),
                    PRIMARY KEY(product_id)
                )
            `, (err, result) => {
                if (err) {
                    console.log('⚠️  Products table:', err.message)
                } else {
                    console.log('✅ Products table created')
                }
                resolve()
            })
        })

        // Create Orders table
        await new Promise((resolve, reject) => {
            connection.query(`
                CREATE TABLE IF NOT EXISTS Orders(
                    order_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                    user_id INT UNSIGNED NOT NULL,
                    total DECIMAL(12, 2) UNSIGNED,
                    created_at TIMESTAMP,
                    FOREIGN KEY(user_id) REFERENCES Users(user_id),
                    PRIMARY KEY(order_id)
                )
            `, (err, result) => {
                if (err) {
                    console.log('⚠️  Orders table:', err.message)
                } else {
                    console.log('✅ Orders table created')
                }
                resolve()
            })
        })

        console.log('🎉 Database setup completed!')
        
    } catch (error) {
        console.log('❌ Setup error:', error)
    } finally {
        connection.end()
    }
}

createTables()
