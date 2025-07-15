-- PEER-TO-PEER STUDENT MARKETPLACE DATABASE SCHEMA

-- Users table: Students who can sell and buy
CREATE TABLE IF NOT EXISTS Users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '📦',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert categories for student marketplace
INSERT IGNORE INTO Categories (category_id, name, description, icon) VALUES
(1, 'Electronics', 'Gaming, laptops, phones, tech gear', '💻'),
(2, 'Textbooks', 'Course books, study materials', '📚'),
(3, 'Clothing', 'Fashion, accessories, dorm clothes', '👕'), 
(4, 'Furniture', 'Dorm/apartment furniture, decor', '🪑'),
(5, 'Sports & Recreation', 'Equipment, gear, tickets', '⚽'),
(6, 'Food & Grocery', 'Snacks, meal plans, kitchen items', '🍕'),
(7, 'School Supplies', 'Notebooks, pens, calculators', '✏️'),
(8, 'Transportation', 'Bikes, skateboards, parking passes', '🚲');

-- Tags table: For detailed product categorization and filtering
CREATE TABLE IF NOT EXISTS Tags (
    tag_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INT UNSIGNED,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL,
    UNIQUE KEY unique_category_tag (name, category_id)
);

-- Product_Tags junction table: Many-to-many relationship between products and tags
CREATE TABLE IF NOT EXISTS Product_Tags (
    product_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
);

-- Insert useful tags for each category

-- Electronics tags
INSERT IGNORE INTO Tags (name, description, category_id, color) VALUES
('Gaming', 'Gaming equipment and accessories', 1, '#3b82f6'),
('Laptops', 'Laptops and computers', 1, '#1e40af'),
('Phones', 'Mobile phones and accessories', 1, '#0ea5e9'),
('Cables', 'Charging cables and adapters', 1, '#64748b');

-- Textbooks tags (including Course Notes for student note trading)
INSERT IGNORE INTO Tags (name, description, category_id, color) VALUES
('Course Notes', 'Student notes from classes', 2, '#10b981'),
('Study Guides', 'Study materials and guides', 2, '#059669'),
('Solution Manuals', 'Solutions to textbook problems', 2, '#047857'),
('Lab Manuals', 'Laboratory guides and materials', 2, '#065f46'),
('Math', 'Mathematics textbooks and materials', 2, '#7c3aed'),
('Science', 'Science textbooks and materials', 2, '#9333ea'),
('Engineering', 'Engineering textbooks and materials', 2, '#a855f7'),
('Business', 'Business and economics materials', 2, '#d946ef'),
('Literature', 'English and literature books', 2, '#ec4899');

-- Clothing tags
INSERT IGNORE INTO Tags (name, description, category_id, color) VALUES
('Casual', 'Everyday casual wear', 3, '#f59e0b'),
('Formal', 'Formal and professional attire', 3, '#d97706'),
('Athletic', 'Sports and workout clothing', 3, '#ea580c'),
('Winter', 'Winter clothes and coats', 3, '#dc2626');

-- Furniture tags
INSERT IGNORE INTO Tags (name, description, category_id, color) VALUES
('Desk', 'Study desks and tables', 4, '#8b5cf6'),
('Chair', 'Chairs and seating', 4, '#7c3aed'),
('Storage', 'Storage solutions and organizers', 4, '#6d28d9'),
('Decor', 'Room decoration and accessories', 4, '#5b21b6');

-- Sports & Recreation tags
INSERT IGNORE INTO Tags (name, description, category_id, color) VALUES
('Fitness', 'Gym and fitness equipment', 5, '#ef4444'),
('Outdoor', 'Outdoor recreation equipment', 5, '#dc2626'),
('Team Sports', 'Equipment for team sports', 5, '#b91c1c'),
('Individual Sports', 'Equipment for individual sports', 5, '#991b1b');

-- Food & Grocery tags
INSERT IGNORE INTO Tags (name, description, category_id, color) VALUES
('Snacks', 'Snacks and quick foods', 6, '#f97316'),
('Kitchen', 'Kitchen appliances and tools', 6, '#ea580c'),
('Meal Plans', 'Dining plan related items', 6, '#c2410c'),
('Healthy', 'Healthy food options', 6, '#9a3412');

-- School Supplies tags
INSERT IGNORE INTO Tags (name, description, category_id, color) VALUES
('Writing', 'Pens, pencils, and writing supplies', 7, '#06b6d4'),
('Notebooks', 'Notebooks and binders', 7, '#0891b2'),
('Tech Supplies', 'Calculators and tech supplies', 7, '#0e7490'),
('Art Supplies', 'Art and design supplies', 7, '#155e75');

-- Transportation tags
INSERT IGNORE INTO Tags (name, description, category_id, color) VALUES
('Bicycles', 'Bikes and cycling equipment', 8, '#22c55e'),
('Parking', 'Parking passes and permits', 8, '#16a34a'),
('Skateboards', 'Skateboards and accessories', 8, '#15803d'),
('Public Transit', 'Bus passes and transit items', 8, '#166534');

-- Products table: Items that STUDENTS are selling
CREATE TABLE IF NOT EXISTS Products (
    product_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id INT UNSIGNED NOT NULL,  -- Student who owns/sells this item
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,  -- How many they have (usually 1 for used items)
    category_id INT UNSIGNED NOT NULL,
    condition_type ENUM('new', 'like_new', 'good', 'fair', 'poor') DEFAULT 'good',
    image_url VARCHAR(255),
    status ENUM('active', 'sold', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- Cart table: Items students want to BUY from other students
CREATE TABLE IF NOT EXISTS Cart (
    cart_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT UNSIGNED NOT NULL,     -- Student who wants to buy
    product_id INT UNSIGNED NOT NULL,   -- Item they want to buy
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_buyer_product (buyer_id, product_id)
);

-- Wishlist table: Items students wish they had
CREATE TABLE IF NOT EXISTS Wishlist (
    wishlist_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_buyer_product (buyer_id, product_id)
);

-- Orders table: When a student buys from another student
CREATE TABLE IF NOT EXISTS Orders (
    order_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT UNSIGNED NOT NULL,     -- Student purchasing
    total_amount DECIMAL(12, 2) UNSIGNED NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(100),        -- Venmo, PayPal, cash, etc.
    delivery_method ENUM('pickup', 'delivery', 'mail') DEFAULT 'pickup',
    pickup_location VARCHAR(255),       -- Dorm, library, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id)
);

-- Order_items table: Specific items in each transaction
CREATE TABLE IF NOT EXISTS Order_items (
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    price DECIMAL(10, 2) UNSIGNED NOT NULL,  -- Price when bought
    item_total DECIMAL(10, 2) UNSIGNED GENERATED ALWAYS AS (quantity * price) STORED,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    PRIMARY KEY (order_id, product_id)
);

-- Messages table: Students can message each other about items
CREATE TABLE IF NOT EXISTS Messages (
    message_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sender_id INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED,            -- Optional: if about specific item
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE SET NULL
);

-- Sample users (students who can sell and buy)
INSERT IGNORE INTO Users (user_id, name, email, password) VALUES
(1, 'Alex Johnson', 'alex.johnson@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'), -- password: password123
(2, 'Sarah Davis', 'sarah.davis@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'), -- password: password123
(3, 'Mike Wilson', 'mike.wilson@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'); -- password: password123

-- Sample student-posted products
INSERT IGNORE INTO Products (product_id, seller_id, name, description, price, quantity, category_id, condition_type, image_url) VALUES
(1, 1, 'Gaming Headphones', 'Barely used Sony headphones, perfect for dorm gaming! Great sound quality and comfortable for long study sessions.', 45.00, 1, 1, 'like_new', '/headphones.jpg'),
(2, 1, 'Calculus Textbook', 'Stewart Calculus 8th Edition - no longer need it! All homework problems solved in margins (in pencil).', 80.00, 1, 2, 'good', '/textbook.jpg'),
(3, 2, 'Mini Fridge', 'Perfect for dorm room, moving out sale. Clean and works perfectly, kept my drinks cold all year!', 75.00, 1, 4, 'good', '/fridge.jpg'),
(4, 2, 'Campus Bike', 'Great for getting around campus quickly. Has a basket and lock included.', 120.00, 1, 8, 'good', '/bike.jpg'),
(5, 3, 'Study Lamp', 'Adjustable desk lamp, perfect for late-night studying. LED bulb included.', 25.00, 1, 4, 'like_new', '/lamp.jpg');
