const mysql = require("mysql2")
const fs = require('fs')
const path = require('path')

// Database connection - will be set by app.js
let userDB = null;

// Function to set database connection from app.js
exports.setDatabase = (database) => {
    userDB = database;
    console.log("✅ SetupController: Database connection set from app.js")
}

// Setup cart and wishlist tables
exports.setupTables = (req, res) => {
    if (!userDB) {
        console.log("❌ No database connection available for setup")
        return res.status(503).json({
            success: false,
            message: 'Database service unavailable'
        })
    }

    console.log("🔍 Setting up cart and wishlist tables...")

    const createCartTable = `
        CREATE TABLE IF NOT EXISTS Cart (
            cart_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id INT UNSIGNED NOT NULL,
            product_id INT UNSIGNED NOT NULL,
            quantity INT UNSIGNED NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
            PRIMARY KEY (cart_id),
            UNIQUE KEY unique_user_product (user_id, product_id)
        )
    `

    const createWishlistTable = `
        CREATE TABLE IF NOT EXISTS Wishlist (
            wishlist_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id INT UNSIGNED NOT NULL,
            product_id INT UNSIGNED NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
            PRIMARY KEY (wishlist_id),
            UNIQUE KEY unique_user_product_wishlist (user_id, product_id)
        )
    `

    // Create Cart table
    userDB.query(createCartTable, (error) => {
        if (error) {
            console.log("❌ Cart table creation error:", error)
            return res.status(500).json({
                success: false,
                message: 'Failed to create Cart table',
                error: error.message
            })
        }

        console.log("✅ Cart table created successfully")

        // Create Wishlist table
        userDB.query(createWishlistTable, (error) => {
            if (error) {
                console.log("❌ Wishlist table creation error:", error)
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create Wishlist table',
                    error: error.message
                })
            }

            console.log("✅ Wishlist table created successfully")

            res.json({
                success: true,
                message: 'Cart and Wishlist tables created successfully'
            })
        })
    })
}
