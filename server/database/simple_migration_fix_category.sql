-- Simple migration to fix category column name
-- Run this on your production database

-- Rename the column from 'category' to 'category_id'
ALTER TABLE Products CHANGE COLUMN category category_id INT UNSIGNED NOT NULL;

-- Ensure foreign key constraint exists
ALTER TABLE Products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES Categories(category_id);
