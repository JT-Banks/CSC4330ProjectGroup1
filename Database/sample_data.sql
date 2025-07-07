-- Sample data for Columbus Marketplace
-- Insert sample users
INSERT INTO Users (name, email, password) VALUES 
('John Doe', 'john.doe@columbus.edu', '$2a$08$test.hashed.password.here'),
('Jane Smith', 'jane.smith@columbus.edu', '$2a$08$test.hashed.password.here'),
('Mike Johnson', 'mike.johnson@columbus.edu', '$2a$08$test.hashed.password.here');

-- Insert sample products matching your images
INSERT INTO Products (name, description, store_quantity, category, price, rating, image_url) VALUES 
('Gaming Headphones', 'High-quality gaming headphones with surround sound and noise cancellation. Perfect for long gaming sessions and online meetings.', 15, 1, 89.99, 4, '/headphones.jpg'),
('Outdoor Backpack', 'Durable and spacious backpack perfect for hiking, camping, and outdoor adventures. Multiple compartments and water-resistant material.', 8, 2, 79.95, 5, '/backpack.jpg'),
('Fresh Bananas', 'Organic bananas, perfect for smoothies, baking, or a healthy snack. Rich in potassium and natural energy.', 50, 3, 2.99, 4, '/banana.jpg'),
('Adventure Canoe', 'Lightweight canoe perfect for lake and river adventures. Seats 2-3 people comfortably with excellent stability.', 3, 4, 899.99, 5, '/Canoe.jpg'),
('Xbox Wireless Controller', 'Latest Xbox wireless controller with enhanced grip and precision. Compatible with Xbox Series X|S and PC gaming.', 12, 1, 59.99, 5, '/xboxController.jpg'),
('LSU Merchandise', 'Official LSU branded merchandise for true Tigers fans. Show your school spirit with this premium quality item.', 25, 5, 24.99, 4, '/lsu_image.1.jpg');

-- Insert sample categories (if you want to add a categories table later)
-- Note: For now, category is just an INT in Products table
-- 1 = Electronics, 2 = Outdoor Gear, 3 = Food & Grocery, 4 = Sports & Recreation, 5 = School Merchandise

-- Insert sample addresses
INSERT INTO Address (user_id, address, city, country, phone) VALUES 
(1, '123 College St', 'Columbus', 'USA', '555-0101'),
(2, '456 University Ave', 'Columbus', 'USA', '555-0102'),
(3, '789 Campus Dr', 'Columbus', 'USA', '555-0103');

-- Insert sample payment methods
INSERT INTO Payment (user_id, payment_type, provider, account_no, expiry_date) VALUES 
(1, 'Credit Card', 'Visa', '****1234', '2026-12-31'),
(2, 'Credit Card', 'Mastercard', '****5678', '2025-09-30'),
(3, 'Debit Card', 'Visa', '****9012', '2027-03-31');

-- Insert sample orders
INSERT INTO Orders (user_id, total, created_at) VALUES 
(1, 149.98, NOW() - INTERVAL 7 DAY),
(2, 79.95, NOW() - INTERVAL 3 DAY),
(1, 89.99, NOW() - INTERVAL 1 DAY);

-- Insert sample order items
INSERT INTO Order_items (order_id, product_id, quantity) VALUES 
(1, 1, 1), -- Gaming Headphones
(1, 5, 1), -- Xbox Controller
(2, 2, 1), -- Backpack
(3, 1, 1); -- Gaming Headphones

-- Insert sample pricing (if you want to use the Price table for discounts)
INSERT INTO Price (product_id, original_price, discount_id, discounted_price) VALUES 
(1, 99.99, NULL, 89.99), -- Gaming Headphones on sale
(2, 79.95, NULL, 79.95), -- Backpack regular price
(3, 3.49, NULL, 2.99),   -- Bananas on sale
(4, 899.99, NULL, 899.99), -- Canoe regular price
(5, 64.99, NULL, 59.99), -- Xbox Controller on sale
(6, 24.99, NULL, 24.99); -- LSU Merchandise regular price
