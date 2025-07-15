const mysql = require('mysql2')

// Database configuration
const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'columbus_app',
    password: process.env.DATABASE_PASSWORD || 'columbus_pass123',
    database: process.env.DATABASE || 'Columbus_Marketplace',
    port: process.env.DATABASE_PORT || 3306
}

console.log('🔧 Fixing Tags table and adding Course Notes...')

// Create connection
const connection = mysql.createConnection(dbConfig)

// SQL statements to fix and populate tags
const sqlStatements = [
    // Add missing columns to Tags table
    `ALTER TABLE Tags 
     ADD COLUMN IF NOT EXISTS description TEXT,
     ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#6366f1'`,
    
    // Insert Textbooks tags (including Course Notes)
    `INSERT IGNORE INTO Tags (name, category_id) VALUES
    ('Course Notes', 2),
    ('Study Guides', 2),
    ('Solution Manuals', 2),
    ('Lab Manuals', 2),
    ('Math', 2),
    ('Science', 2),
    ('Engineering', 2),
    ('Business', 2),
    ('Literature', 2)`,
    
    // Insert Electronics tags
    `INSERT IGNORE INTO Tags (name, category_id) VALUES
    ('Gaming', 1),
    ('Laptops', 1),
    ('Phones', 1),
    ('Cables', 1)`,
    
    // Insert other category tags
    `INSERT IGNORE INTO Tags (name, category_id) VALUES
    ('Casual', 3),
    ('Formal', 3),
    ('Athletic', 3),
    ('Winter', 3),
    ('Desk', 4),
    ('Chair', 4),
    ('Storage', 4),
    ('Decor', 4),
    ('Fitness', 5),
    ('Outdoor', 5),
    ('Team Sports', 5),
    ('Individual Sports', 5),
    ('Snacks', 6),
    ('Kitchen', 6),
    ('Meal Plans', 6),
    ('Healthy', 6),
    ('Writing', 7),
    ('Notebooks', 7),
    ('Tech Supplies', 7),
    ('Art Supplies', 7),
    ('Bicycles', 8),
    ('Parking', 8),
    ('Skateboards', 8),
    ('Public Transit', 8)`
]

// Function to execute statements sequentially
async function executeMigration() {
    try {
        for (let i = 0; i < sqlStatements.length; i++) {
            const statement = sqlStatements[i]
            console.log(`🔄 Executing statement ${i + 1}/${sqlStatements.length}...`)
            
            await new Promise((resolve, reject) => {
                connection.execute(statement, (error, results) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(results)
                    }
                })
            })
        }
        
        console.log('✅ All migration statements executed successfully!')
        
        // Test the tags
        const tagCount = await new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as tag_count FROM Tags', (error, results) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results[0].tag_count)
                }
            })
        })
        
        // Show Course Notes specifically
        const courseNotes = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM Tags WHERE name = "Course Notes"', (error, results) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
        
        console.log(`🏷️  Total tags created: ${tagCount}`)
        console.log('📝 Course Notes tag:', courseNotes[0] || 'Not found')
        console.log('🚀 Database migration complete!')
        
    } catch (error) {
        console.error('❌ Error during migration:', error)
    } finally {
        connection.end()
    }
}

// Run the migration
executeMigration()
