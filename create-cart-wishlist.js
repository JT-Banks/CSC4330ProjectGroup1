const mysql = require('mysql2/promise');
require('dotenv').config();

async function createCartAndWishlistTables() {
    console.log('🚀 Creating Cart and Wishlist tables...');
    
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST || 'localhost',
            user: process.env.DATABASE_USER || 'columbus_app',
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE || 'Columbus_Marketplace'
        });

        console.log('✅ Connected to local database');

        // Create Cart table
        console.log('📋 Creating Cart table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Cart (
                cart_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                buyer_id INT UNSIGNED NOT NULL,
                product_id INT UNSIGNED NOT NULL,
                quantity INT UNSIGNED NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (buyer_id) REFERENCES Users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
                UNIQUE KEY unique_buyer_product (buyer_id, product_id)
            )
        `);

        // Create Wishlist table
        console.log('📋 Creating Wishlist table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Wishlist (
                wishlist_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                buyer_id INT UNSIGNED NOT NULL,
                product_id INT UNSIGNED NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (buyer_id) REFERENCES Users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
                UNIQUE KEY unique_buyer_product (buyer_id, product_id)
            )
        `);

        console.log('✅ Cart and Wishlist tables created successfully!');

    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

createCartAndWishlistTables();
