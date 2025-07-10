-- DATABASE SETUP SCRIPT FOR STUDENT MARKETPLACE
-- Run this script to create/update all tables for the peer-to-peer marketplace

-- First, ensure we're using the correct database
-- UPDATE THIS LINE with your actual database name:
-- USE your_database_name;

-- Categories table (what students can list items under)
CREATE TABLE IF NOT EXISTS Categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert categories for student marketplace
INSERT IGNORE INTO Categories (category_id, name, description) VALUES
(1, 'Electronics', 'Gaming, laptops, phones, tech gear'),
(2, 'Textbooks', 'Course books, study materials'),
(3, 'Clothing', 'Fashion, accessories, dorm clothes'), 
(4, 'Furniture', 'Dorm/apartment furniture, decor'),
(5, 'Sports & Recreation', 'Equipment, gear, tickets'),
(6, 'Food & Grocery', 'Snacks, meal plans, kitchen items'),
(7, 'School Supplies', 'Notebooks, pens, calculators'),
(8, 'Transportation', 'Bikes, skateboards, parking passes');

-- Update existing Products table to add missing columns if they don't exist
ALTER TABLE Products 
ADD COLUMN IF NOT EXISTS seller_id INT UNSIGNED AFTER product_id,
ADD COLUMN IF NOT EXISTS category_id INT UNSIGNED AFTER quantity,
ADD COLUMN IF NOT EXISTS condition_type ENUM('new', 'like_new', 'good', 'fair', 'poor') DEFAULT 'good' AFTER category_id,
ADD COLUMN IF NOT EXISTS status ENUM('active', 'sold', 'inactive') DEFAULT 'active' AFTER image_url,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add foreign keys if they don't exist
SET foreign_key_checks = 0;
ALTER TABLE Products 
ADD CONSTRAINT IF NOT EXISTS fk_products_seller FOREIGN KEY (seller_id) REFERENCES Users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT IF NOT EXISTS fk_products_category FOREIGN KEY (category_id) REFERENCES Categories(category_id);
SET foreign_key_checks = 1;

-- Update Cart table to use buyer_id instead of user_id
ALTER TABLE Cart 
CHANGE COLUMN user_id buyer_id INT UNSIGNED NOT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Update Wishlist table to use buyer_id instead of user_id  
ALTER TABLE Wishlist 
CHANGE COLUMN user_id buyer_id INT UNSIGNED NOT NULL;

-- Create Orders table with correct schema
CREATE TABLE IF NOT EXISTS Orders (
    order_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT UNSIGNED NOT NULL,
    total_amount DECIMAL(12, 2) UNSIGNED NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(100),
    delivery_method ENUM('pickup', 'delivery', 'mail') DEFAULT 'pickup',
    pickup_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id)
);

-- Create Order_items table
CREATE TABLE IF NOT EXISTS Order_items (
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    price DECIMAL(10, 2) UNSIGNED NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    PRIMARY KEY (order_id, product_id)
);

-- Create Messages table for student communication
CREATE TABLE IF NOT EXISTS Messages (
    message_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sender_id INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE SET NULL
);

-- Update existing products to have proper seller_id and category_id
-- This assumes user_id 1 exists as a default seller
UPDATE Products SET 
    seller_id = 1,
    category_id = 1 
WHERE seller_id IS NULL OR category_id IS NULL;

-- Add some sample student marketplace data
INSERT IGNORE INTO Products (product_id, seller_id, name, description, price, quantity, category_id, condition_type, image_url) VALUES
(7, 1, 'Used MacBook Pro', 'Great for coding and schoolwork, minor scratches', 800.00, 1, 1, 'good', '/macbook.jpg'),
(8, 1, 'Organic Chemistry Textbook', 'Klein 3rd Edition, highlighted but clean', 120.00, 1, 2, 'good', '/ochem.jpg'),
(9, 2, 'Dorm Room Microwave', 'Moving out, works perfectly', 35.00, 1, 4, 'like_new', '/microwave.jpg'),
(10, 2, 'Campus Parking Pass', 'Spring semester pass, transferring', 150.00, 1, 8, 'new', '/parking.jpg');

SELECT 'Database setup complete! All tables created/updated for student marketplace.' as Status;
