-- Add icon field to Categories table and fix emoji display
-- Run this after student_marketplace_schema.sql

-- Add icon column to Categories table
ALTER TABLE Categories ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT '📦';

-- Update categories with proper emojis
UPDATE Categories SET icon = '💻' WHERE category_id = 1; -- Electronics
UPDATE Categories SET icon = '📚' WHERE category_id = 2; -- Textbooks  
UPDATE Categories SET icon = '👕' WHERE category_id = 3; -- Clothing
UPDATE Categories SET icon = '🪑' WHERE category_id = 4; -- Furniture
UPDATE Categories SET icon = '⚽' WHERE category_id = 5; -- Sports & Recreation
UPDATE Categories SET icon = '🍕' WHERE category_id = 6; -- Food & Grocery
UPDATE Categories SET icon = '✏️' WHERE category_id = 7; -- School Supplies
UPDATE Categories SET icon = '🚲' WHERE category_id = 8; -- Transportation
