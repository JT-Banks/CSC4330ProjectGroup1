const mysql = require('mysql2/promise');
require('dotenv').config();

async function addStudentMarketplaceFeatures() {
    console.log('🚀 Adding Student Marketplace Features to Local Database...');
    
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST || 'localhost',
            user: process.env.DATABASE_USER || 'columbus_app',
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE || 'Columbus_Marketplace'
        });

        console.log('✅ Connected to local database');

        // Step 1: Add Categories table
        console.log('📋 Creating Categories table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Categories (
                category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Step 2: Insert categories
        console.log('📋 Inserting categories...');
        await connection.execute(`
            INSERT IGNORE INTO Categories (category_id, name, description) VALUES
            (1, 'Electronics', 'Gaming, laptops, phones, tech gear'),
            (2, 'Textbooks', 'Course books, study materials'),
            (3, 'Clothing', 'Fashion, accessories, dorm clothes'), 
            (4, 'Furniture', 'Dorm/apartment furniture, decor'),
            (5, 'Sports & Recreation', 'Equipment, gear, tickets'),
            (6, 'Food & Grocery', 'Snacks, meal plans, kitchen items'),
            (7, 'School Supplies', 'Notebooks, pens, calculators'),
            (8, 'Transportation', 'Bikes, skateboards, parking passes')
        `);

        // Step 3: Add seller_id to Products table
        console.log('📋 Adding seller_id to Products table...');
        try {
            await connection.execute(`
                ALTER TABLE Products ADD COLUMN seller_id INT UNSIGNED DEFAULT 1 AFTER product_id
            `);
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') throw err;
            console.log('   - seller_id column already exists');
        }

        // Step 4: Add other missing columns to Products
        console.log('📋 Adding other columns to Products table...');
        try {
            await connection.execute(`
                ALTER TABLE Products 
                ADD COLUMN condition_type ENUM('new', 'like_new', 'good', 'fair', 'poor') DEFAULT 'good' AFTER category,
                ADD COLUMN status ENUM('active', 'sold', 'inactive') DEFAULT 'active' AFTER image_url
            `);
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') throw err;
            console.log('   - condition_type and status columns already exist');
        }

        // Step 5: Update Cart table to use buyer_id
        console.log('📋 Updating Cart table...');
        try {
            await connection.execute(`
                ALTER TABLE Cart ADD COLUMN buyer_id INT UNSIGNED AFTER cart_id
            `);
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') throw err;
            console.log('   - buyer_id column already exists');
        }

        // Step 6: Update Wishlist table to use buyer_id
        console.log('📋 Updating Wishlist table...');
        try {
            await connection.execute(`
                ALTER TABLE Wishlist ADD COLUMN buyer_id INT UNSIGNED AFTER wishlist_id
            `);
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') throw err;
            console.log('   - buyer_id column already exists');
        }

        // Step 7: Update Orders table
        console.log('📋 Updating Orders table...');
        try {
            await connection.execute(`
                ALTER TABLE Orders 
                ADD COLUMN buyer_id INT UNSIGNED AFTER order_id,
                CHANGE COLUMN total total_amount DECIMAL(12, 2) UNSIGNED NOT NULL,
                ADD COLUMN status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending' AFTER total_amount
            `);
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_BAD_FIELD_ERROR') throw err;
            console.log('   - Orders table columns already updated');
        }

        // Step 8: Add sample student users
        console.log('👥 Adding sample student users...');
        await connection.execute(`
            INSERT IGNORE INTO Users (user_id, name, email, password) VALUES
            (10, 'Alex Johnson', 'alex.johnson@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'),
            (11, 'Sarah Davis', 'sarah.davis@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'),
            (12, 'Mike Wilson', 'mike.wilson@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S')
        `);

        // Step 9: Update existing products with seller_id
        console.log('📦 Updating existing products with seller_id...');
        await connection.execute(`
            UPDATE Products SET seller_id = 10 WHERE seller_id IS NULL OR seller_id = 0
        `);

        console.log('✅ Student Marketplace features added successfully!');
        console.log('🎉 You can now test the peer-to-peer marketplace functionality!');

    } catch (error) {
        console.error('❌ Error updating database:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

addStudentMarketplaceFeatures();
