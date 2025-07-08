const mysql = require('mysql2/promise')

async function createMinimalTables() {
    console.log('🚀 Creating minimal tables for Railway...')
    
    let connection
    try {
        // Connect using Railway's database URL pattern
        const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL
        if (!dbUrl) {
            console.log('❌ No DATABASE_URL or MYSQL_URL found')
            return
        }
        
        console.log('🔗 Connecting to database...')
        connection = await mysql.createConnection(dbUrl)
        
        // Create just the Users table (essential for registration)
        console.log('📝 Creating Users table...')
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id)
            )
        `)
        
        console.log('✅ Users table created successfully!')
        
        // Test the connection
        const [rows] = await connection.execute('SHOW TABLES')
        console.log('📋 Tables in database:', rows.map(row => Object.values(row)[0]))
        
    } catch (error) {
        console.log('❌ Error:', error.message)
    } finally {
        if (connection) {
            await connection.end()
        }
    }
}

createMinimalTables()
