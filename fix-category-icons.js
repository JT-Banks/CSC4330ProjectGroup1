const mysql = require('mysql2/promise');

async function fixCategoryIcons() {
  let connection;
  
  try {
    // Create connection using environment variables
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST || 'localhost',
      user: process.env.DATABASE_USER || 'columbus_app',
      password: process.env.DATABASE_PASSWORD || 'columbus_pass123',
      database: process.env.DATABASE || 'Columbus_Marketplace'
    });

    console.log('🔗 Connected to database...');

    // Add icon column if it doesn't exist
    try {
      await connection.execute(`ALTER TABLE Categories ADD COLUMN icon VARCHAR(10) DEFAULT '📦'`);
      console.log('✅ Added icon column to Categories table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Icon column already exists');
      } else {
        throw error;
      }
    }

    // Update categories with proper emojis
    const updates = [
      { id: 1, icon: '💻', name: 'Electronics' },
      { id: 2, icon: '📚', name: 'Textbooks' },
      { id: 3, icon: '👕', name: 'Clothing' },
      { id: 4, icon: '🪑', name: 'Furniture' },
      { id: 5, icon: '⚽', name: 'Sports & Recreation' },
      { id: 6, icon: '🍕', name: 'Food & Grocery' },
      { id: 7, icon: '✏️', name: 'School Supplies' },
      { id: 8, icon: '🚲', name: 'Transportation' }
    ];

    for (const update of updates) {
      await connection.execute(
        'UPDATE Categories SET icon = ? WHERE category_id = ?',
        [update.icon, update.id]
      );
      console.log(`✅ Updated ${update.name} with ${update.icon}`);
    }

    // Verify the updates
    const [rows] = await connection.execute('SELECT category_id, name, icon FROM Categories ORDER BY category_id');
    console.log('\n📋 Current Categories:');
    rows.forEach(row => {
      console.log(`${row.category_id}. ${row.icon} ${row.name}`);
    });

    console.log('\n🎉 Category icons fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing category icons:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixCategoryIcons();
