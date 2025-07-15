const mysql = require('mysql2')

// Database configuration
const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'columbus_app',
    password: process.env.DATABASE_PASSWORD || 'columbus_pass123',
    database: process.env.DATABASE || 'Columbus_Marketplace',
    port: process.env.DATABASE_PORT || 3306
}

console.log('🔧 Adding Course Notes and other tags...')

// Create connection
const connection = mysql.createConnection(dbConfig)

// Just add the tags using the existing table structure
const tagsToAdd = [
    // Textbooks tags (including Course Notes) - category_id = 2
    ['Course Notes', 2],
    ['Study Guides', 2],
    ['Solution Manuals', 2],
    ['Lab Manuals', 2],
    ['Math', 2],
    ['Science', 2],
    ['Engineering', 2],
    ['Business', 2],
    ['Literature', 2],
    
    // Electronics tags - category_id = 1
    ['Gaming', 1],
    ['Laptops', 1],
    ['Phones', 1],
    ['Cables', 1],
    
    // Clothing tags - category_id = 3
    ['Casual', 3],
    ['Formal', 3],
    ['Athletic', 3],
    ['Winter', 3],
    
    // Furniture tags - category_id = 4
    ['Desk', 4],
    ['Chair', 4],
    ['Storage', 4],
    ['Decor', 4],
    
    // Sports & Recreation tags - category_id = 5
    ['Fitness', 5],
    ['Outdoor', 5],
    ['Team Sports', 5],
    ['Individual Sports', 5],
    
    // Food & Grocery tags - category_id = 6
    ['Snacks', 6],
    ['Kitchen', 6],
    ['Meal Plans', 6],
    ['Healthy', 6],
    
    // School Supplies tags - category_id = 7
    ['Writing', 7],
    ['Notebooks', 7],
    ['Tech Supplies', 7],
    ['Art Supplies', 7],
    
    // Transportation tags - category_id = 8
    ['Bicycles', 8],
    ['Parking', 8],
    ['Skateboards', 8],
    ['Public Transit', 8]
]

// Insert all tags
const sql = 'INSERT IGNORE INTO Tags (name, category_id) VALUES ?'

connection.query(sql, [tagsToAdd], (error, results) => {
    if (error) {
        console.error('❌ Error adding tags:', error)
    } else {
        console.log(`✅ Added ${results.affectedRows} new tags`)
        
        // Check for Course Notes specifically
        connection.query('SELECT * FROM Tags WHERE name = "Course Notes"', (error, results) => {
            if (error) {
                console.error('❌ Error checking Course Notes:', error)
            } else if (results.length > 0) {
                console.log('📝 Course Notes tag added successfully:', results[0])
            } else {
                console.log('❌ Course Notes tag not found')
            }
            
            // Show total tags count
            connection.query('SELECT COUNT(*) as total FROM Tags', (error, results) => {
                if (error) {
                    console.error('❌ Error counting tags:', error)
                } else {
                    console.log(`🏷️  Total tags in database: ${results[0].total}`)
                }
                
                connection.end()
                console.log('🚀 Tags setup complete!')
            })
        })
    }
})

connection.on('error', (error) => {
    console.error('❌ Database connection error:', error)
    process.exit(1)
})
