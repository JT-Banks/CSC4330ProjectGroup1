-- MIGRATION TO STUDENT-TO-STUDENT MARKETPLACE
-- Updates existing tables to support peer-to-peer selling

-- Step 1: Add Categories table
CREATE TABLE IF NOT EXISTS Categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO Categories (category_id, name, description) VALUES
(1, 'Electronics', 'Gaming, laptops, phones, tech gear'),
(2, 'Textbooks', 'Course books, study materials'),
(3, 'Clothing', 'Fashion, accessories, dorm clothes'), 
(4, 'Furniture', 'Dorm/apartment furniture, decor'),
(5, 'Sports & Recreation', 'Equipment, gear, tickets'),
(6, 'Food & Grocery', 'Snacks, meal plans, kitchen items'),
(7, 'School Supplies', 'Notebooks, pens, calculators'),
(8, 'Transportation', 'Bikes, skateboards, parking passes');

-- Step 2: Update Products table for student marketplace
ALTER TABLE Products 
ADD COLUMN IF NOT EXISTS seller_id INT UNSIGNED NOT NULL AFTER product_id,
ADD COLUMN IF NOT EXISTS condition_type ENUM('new', 'like_new', 'good', 'fair', 'poor') DEFAULT 'good' AFTER price,
ADD COLUMN IF NOT EXISTS status ENUM('active', 'sold', 'inactive') DEFAULT 'active' AFTER image_url,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER status,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Rename store_quantity to quantity (more appropriate for individual items)
ALTER TABLE Products CHANGE COLUMN store_quantity quantity INT UNSIGNED NOT NULL DEFAULT 1;

-- Add foreign keys
ALTER TABLE Products ADD FOREIGN KEY (seller_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- Step 3: Create Cart table  
CREATE TABLE IF NOT EXISTS Cart (
    cart_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_buyer_product (buyer_id, product_id)
);

-- Step 4: Create Wishlist table
CREATE TABLE IF NOT EXISTS Wishlist (
    wishlist_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_buyer_product (buyer_id, product_id)
);

-- Step 5: Update Orders table for peer-to-peer transactions
ALTER TABLE Orders 
ADD COLUMN IF NOT EXISTS seller_id INT UNSIGNED NOT NULL AFTER user_id,
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending' AFTER total,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) AFTER status,
ADD COLUMN IF NOT EXISTS delivery_method ENUM('pickup', 'delivery', 'mail') DEFAULT 'pickup' AFTER payment_method,
ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(255) AFTER delivery_method,
ADD COLUMN IF NOT EXISTS order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER pickup_location,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER order_date;

-- Rename user_id to buyer_id for clarity
ALTER TABLE Orders CHANGE COLUMN user_id buyer_id INT UNSIGNED NOT NULL;

-- Add foreign key for seller
ALTER TABLE Orders ADD FOREIGN KEY (seller_id) REFERENCES Users(user_id);

-- Step 6: Update Order_items table
ALTER TABLE Order_items 
ADD COLUMN IF NOT EXISTS price_at_purchase DECIMAL(10, 2) UNSIGNED NOT NULL AFTER quantity,
ADD COLUMN IF NOT EXISTS item_total DECIMAL(10, 2) UNSIGNED GENERATED ALWAYS AS (quantity * price_at_purchase) STORED AFTER price_at_purchase;

-- Step 7: Sample student-posted products (update existing ones to have sellers)
UPDATE Products SET seller_id = 1 WHERE product_id IN (1, 2);
UPDATE Products SET seller_id = 2 WHERE product_id IN (3, 4);  
UPDATE Products SET seller_id = 3 WHERE product_id IN (5, 6);

-- Update sample products to be more student-marketplace appropriate
UPDATE Products SET 
    name = 'Gaming Headphones - Barely Used',
    description = 'Sony headphones, perfect for dorm gaming! Moving out sale.',
    price = 45.00,
    quantity = 1,
    condition_type = 'like_new',
    status = 'active'
WHERE product_id = 1;

UPDATE Products SET 
    name = 'Durable Backpack',
    description = 'Great condition backpack, used for one semester.',
    price = 35.00,
    quantity = 1,
    condition_type = 'good',
    status = 'active'
WHERE product_id = 2;
