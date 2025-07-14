const mysql = require('mysql2');
require('dotenv').config();

console.log('🔄 Starting database migration to fix category column...');

// Create connection to production database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Connect to database
connection.connect((err) => {
    if (err) {
        console.error('❌ Failed to connect to database:', err);
        process.exit(1);
    }
    
    console.log('✅ Connected to database successfully');
    
    // Check if we need to migrate
    checkAndMigrate();
});

function checkAndMigrate() {
    // First, check what columns exist in Products table
    const checkQuery = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'Products' 
        AND COLUMN_NAME IN ('category', 'category_id')
    `;
    
    connection.query(checkQuery, [process.env.DB_NAME], (err, results) => {
        if (err) {
            console.error('❌ Error checking table structure:', err);
            connection.end();
            return;
        }
        
        const columns = results.map(row => row.COLUMN_NAME);
        console.log('📋 Found columns:', columns);
        
        if (columns.includes('category') && !columns.includes('category_id')) {
            console.log('🔄 Need to rename category to category_id');
            renameCategoryColumn();
        } else if (columns.includes('category_id')) {
            console.log('✅ Column category_id already exists - no migration needed');
            connection.end();
        } else {
            console.log('❌ Neither category nor category_id found - this is unexpected');
            connection.end();
        }
    });
}

function renameCategoryColumn() {
    console.log('🔄 Renaming column from category to category_id...');
    
    const renameQuery = `
        ALTER TABLE Products 
        CHANGE COLUMN category category_id INT UNSIGNED NOT NULL
    `;
    
    connection.query(renameQuery, (err) => {
        if (err) {
            console.error('❌ Error renaming column:', err);
            connection.end();
            return;
        }
        
        console.log('✅ Successfully renamed column to category_id');
        addForeignKeyConstraint();
    });
}

function addForeignKeyConstraint() {
    console.log('🔄 Adding foreign key constraint...');
    
    // First drop any existing constraint
    const dropConstraintQuery = `
        ALTER TABLE Products 
        DROP FOREIGN KEY IF EXISTS fk_products_category
    `;
    
    connection.query(dropConstraintQuery, (err) => {
        // Ignore error if constraint doesn't exist
        console.log('🔄 Dropped existing constraint (if any)');
        
        // Add new constraint
        const addConstraintQuery = `
            ALTER TABLE Products 
            ADD CONSTRAINT fk_products_category 
            FOREIGN KEY (category_id) REFERENCES Categories(category_id)
        `;
        
        connection.query(addConstraintQuery, (err) => {
            if (err) {
                console.error('❌ Error adding foreign key constraint:', err);
            } else {
                console.log('✅ Successfully added foreign key constraint');
            }
            
            // Verify the final structure
            verifyMigration();
        });
    });
}

function verifyMigration() {
    console.log('🔍 Verifying migration...');
    
    const verifyQuery = `
        SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE,
            COLUMN_KEY
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'Products' 
        AND COLUMN_NAME = 'category_id'
    `;
    
    connection.query(verifyQuery, [process.env.DB_NAME], (err, results) => {
        if (err) {
            console.error('❌ Error verifying migration:', err);
        } else if (results.length > 0) {
            console.log('✅ Migration verified successfully:');
            console.table(results);
        } else {
            console.log('❌ Migration verification failed - category_id column not found');
        }
        
        connection.end();
        console.log('🎉 Migration script completed');
    });
}

// Handle errors
connection.on('error', (err) => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
});
