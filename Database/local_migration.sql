-- PEER-TO-PEER STUDENT MARKETPLACE DATABASE SCHEMA
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

-- Update existing Products table to add seller_id and new columns
ALTER TABLE Products 
ADD COLUMN IF NOT EXISTS seller_id INT UNSIGNED AFTER product_id,
ADD COLUMN IF NOT EXISTS condition_type ENUM('new', 'like_new', 'good', 'fair', 'poor') DEFAULT 'good' AFTER category,
ADD COLUMN IF NOT EXISTS status ENUM('active', 'sold', 'inactive') DEFAULT 'active' AFTER image_url,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER status,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Update the price column to be DECIMAL(10,2) UNSIGNED
ALTER TABLE Products MODIFY COLUMN price DECIMAL(10, 2) UNSIGNED NOT NULL;

-- Rename category to category_id for consistency
ALTER TABLE Products CHANGE COLUMN category category_id INT UNSIGNED NOT NULL;

-- Add foreign key constraints
ALTER TABLE Products ADD CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES Users(user_id) ON DELETE CASCADE;
ALTER TABLE Products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES Categories(category_id);

-- Update Cart table to use buyer_id instead of user_id
ALTER TABLE Cart 
ADD COLUMN IF NOT EXISTS buyer_id INT UNSIGNED AFTER cart_id,
ADD CONSTRAINT fk_cart_buyer FOREIGN KEY (buyer_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- Update Wishlist table to use buyer_id instead of user_id  
ALTER TABLE Wishlist
ADD COLUMN IF NOT EXISTS buyer_id INT UNSIGNED AFTER wishlist_id,
ADD CONSTRAINT fk_wishlist_buyer FOREIGN KEY (buyer_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- Update Orders table to use buyer_id and total_amount
ALTER TABLE Orders 
ADD COLUMN IF NOT EXISTS buyer_id INT UNSIGNED AFTER order_id,
CHANGE COLUMN total total_amount DECIMAL(12, 2) UNSIGNED NOT NULL,
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending' AFTER total_amount,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) AFTER status,
ADD COLUMN IF NOT EXISTS delivery_method ENUM('pickup', 'delivery', 'mail') DEFAULT 'pickup' AFTER payment_method,
ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(255) AFTER delivery_method,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER pickup_location,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
ADD CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES Users(user_id);

-- Update Order_items table
ALTER TABLE Order_items 
ADD COLUMN IF NOT EXISTS item_total DECIMAL(10, 2) UNSIGNED GENERATED ALWAYS AS (quantity * price) STORED AFTER price;

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

-- Insert sample users
INSERT IGNORE INTO Users (user_id, name, email, password) VALUES
(1, 'Alex Johnson', 'alex.johnson@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'),
(2, 'Sarah Davis', 'sarah.davis@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'),
(3, 'Mike Wilson', 'mike.wilson@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S');

-- Update existing products with seller_id
UPDATE Products SET seller_id = 1 WHERE product_id IN (1, 2);
UPDATE Products SET seller_id = 2 WHERE product_id > 2;

-- Insert additional sample products
INSERT IGNORE INTO Products (product_id, seller_id, name, description, price, category_id, condition_type, image_url) VALUES
(10, 1, 'Gaming Headphones', 'Barely used Sony headphones, perfect for dorm gaming!', 45.00, 1, 'like_new', '/headphones.jpg'),
(11, 1, 'Calculus Textbook', 'Stewart Calculus 8th Edition - no longer need it!', 80.00, 2, 'good', '/textbook.jpg'),
(12, 2, 'Mini Fridge', 'Perfect for dorm room, moving out sale', 75.00, 4, 'good', '/fridge.jpg'),
(13, 2, 'Campus Bike', 'Great for getting around campus quickly', 120.00, 8, 'good', '/bike.jpg'),
(14, 3, 'Study Lamp', 'Adjustable desk lamp, perfect for late-night studying', 25.00, 4, 'like_new', '/lamp.jpg');
