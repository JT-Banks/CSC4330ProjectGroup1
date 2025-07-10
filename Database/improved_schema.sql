-- IMPROVED E-COMMERCE DATABASE SCHEMA
-- This maintains existing tables but adds missing pieces for a solid e-commerce system

-- Categories table (referenced by Products.category)
CREATE TABLE IF NOT EXISTS Categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT IGNORE INTO Categories (category_id, name, description) VALUES
(1, 'Electronics', 'Gaming, study & tech gear'),
(2, 'Clothing', 'Campus fashion & accessories'), 
(3, 'Food & Grocery', 'Snacks and essentials'),
(4, 'Sports & Recreation', 'Campus activities and fitness'),
(5, 'School Merchandise', 'College pride and spirit gear');

-- Cart table (temporary storage while shopping)
CREATE TABLE IF NOT EXISTS Cart (
    cart_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Wishlist table (saved items for later)
CREATE TABLE IF NOT EXISTS Wishlist (
    wishlist_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Update Orders table to include order status and better timestamps
ALTER TABLE Orders 
ADD COLUMN status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
ADD COLUMN order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update Order_items to store price at time of purchase (crucial for order history)
ALTER TABLE Order_items 
ADD COLUMN price_at_purchase DECIMAL(10, 2) UNSIGNED NOT NULL,
ADD COLUMN item_total DECIMAL(10, 2) UNSIGNED GENERATED ALWAYS AS (quantity * price_at_purchase) STORED;

-- Add foreign key for Categories
ALTER TABLE Products 
ADD FOREIGN KEY (category) REFERENCES Categories(category_id);

-- Optional: Add some sample products if they don't exist
INSERT IGNORE INTO Products (product_id, name, description, store_quantity, category, price, rating, image_url) VALUES
(1, 'Gaming Headphones', 'Perfect for late-night gaming sessions in the dorm!', 15, 1, 89.99, 4, '/headphones.jpg'),
(2, 'Student Backpack', 'Essential for campus life!', 8, 2, 79.95, 5, '/backpack.jpg'),
(3, 'Healthy Snack - Bananas', 'Perfect study fuel!', 50, 3, 2.99, 4, '/banana.jpg'),
(4, 'Campus Recreation Canoe', 'Make the most of campus outdoor activities!', 3, 4, 899.99, 5, '/Canoe.jpg'),
(5, 'Gaming Controller', 'Essential for dorm gaming setup!', 12, 1, 59.99, 5, '/xboxController.jpg'),
(6, 'School Spirit Gear', 'Show your Tigers pride!', 25, 5, 24.99, 4, '/lsu_image.1.jpg');
