-- MIGRATION: Fix Products table column name from 'category' to 'category_id'
-- This fixes the database schema mismatch in production

-- Check if the old 'category' column exists and rename it to 'category_id'
-- This is safe because it preserves all data

-- Step 1: Check if we need to rename the column
-- If 'category' exists and 'category_id' doesn't exist, rename it
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Products' 
    AND COLUMN_NAME = 'category'
);

-- Step 2: If the old column exists, rename it
SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE Products CHANGE COLUMN category category_id INT UNSIGNED NOT NULL',
    'SELECT "Column already correct" as status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Ensure foreign key constraint exists (in case it was missing)
-- Drop existing constraint if it exists, then recreate it
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Products' 
    AND COLUMN_NAME = 'category_id'
    AND REFERENCED_TABLE_NAME = 'Categories'
);

-- Only add foreign key if it doesn't exist
SET @fk_sql = IF(@fk_exists = 0,
    'ALTER TABLE Products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES Categories(category_id)',
    'SELECT "Foreign key already exists" as status'
);

PREPARE fk_stmt FROM @fk_sql;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

-- Verification query
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'Products' 
AND COLUMN_NAME IN ('category', 'category_id')
ORDER BY COLUMN_NAME;
