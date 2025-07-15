-- Sample data for Student Marketplace
-- Insert sample users (students)
INSERT IGNORE INTO Users (name, email, password) VALUES 
('Alex Johnson', 'alex.johnson@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'), -- password: password123
('Sarah Davis', 'sarah.davis@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'), -- password: password123
('Mike Wilson', 'mike.wilson@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'), -- password: password123
('Emma Rodriguez', 'emma.rodriguez@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'), -- password: password123
('David Chen', 'david.chen@student.edu', '$2b$12$LQv3c1yqBwEHxE6IHKtMOu1u5sAjlJXQXPNcL7z5P1sVKOFKh1q0S'); -- password: password123

-- Insert sample products that students are selling
INSERT IGNORE INTO Products (seller_id, name, description, price, quantity, category_id, condition_type, image_url) VALUES 
-- Electronics
(1, 'Gaming Headphones', 'Barely used Sony headphones, perfect for dorm gaming! Great sound quality and comfortable for long study sessions.', 45.00, 1, 1, 'like_new', '/headphones.jpg'),
(2, 'Xbox Wireless Controller', 'Latest Xbox wireless controller with enhanced grip and precision. Compatible with Xbox Series X|S and PC gaming.', 45.00, 1, 1, 'good', '/xboxController.jpg'),

-- Textbooks and Academic Materials
(1, 'Calculus Textbook', 'Stewart Calculus 8th Edition - no longer need it! All homework problems solved in margins (in pencil).', 80.00, 1, 2, 'good', '/textbook.jpg'),
(3, 'Physics Lab Manual', 'Complete lab manual for Physics 2020. All experiments documented with solutions.', 25.00, 1, 2, 'good', NULL),
(4, 'Business Statistics Notes', 'Comprehensive course notes from STAT 3000. Includes all lectures and example problems.', 15.00, 1, 2, 'like_new', NULL),

-- Clothing
(2, 'Winter Jacket', 'Barely worn North Face jacket, perfect for cold campus walks. Size Medium.', 60.00, 1, 3, 'like_new', NULL),
(3, 'Athletic Shorts', 'Nike athletic shorts, great for gym or casual wear. Size Large.', 20.00, 2, 3, 'good', NULL),

-- Furniture
(2, 'Mini Fridge', 'Perfect for dorm room, moving out sale. Clean and works perfectly, kept my drinks cold all year!', 75.00, 1, 4, 'good', '/fridge.jpg'),
(4, 'Study Lamp', 'Adjustable desk lamp, perfect for late-night studying. LED bulb included.', 25.00, 1, 4, 'like_new', '/lamp.jpg'),
(1, 'Desk Chair', 'Comfortable rolling chair, great for studying. Minor wear but fully functional.', 40.00, 1, 4, 'fair', NULL),

-- Sports & Recreation
(3, 'Adventure Canoe', 'Lightweight canoe perfect for lake and river adventures. Seats 2-3 people comfortably with excellent stability.', 450.00, 1, 5, 'good', '/Canoe.jpg'),
(4, 'Campus Bike', 'Great for getting around campus quickly. Has a basket and lock included.', 120.00, 1, 5, 'good', '/bike.jpg'),
(5, 'Tennis Racket', 'Wilson tennis racket in excellent condition. Perfect for campus courts.', 35.00, 1, 5, 'like_new', NULL),

-- Food & Grocery
(1, 'Fresh Bananas', 'Organic bananas from local farm, perfect for smoothies or healthy snacks. Rich in potassium.', 3.00, 10, 6, 'new', '/banana.jpg'),
(2, 'Coffee Maker', 'Single-serve coffee maker, perfect for dorm room. Barely used.', 30.00, 1, 6, 'like_new', NULL),

-- School Supplies
(3, 'Graphing Calculator', 'TI-84 Plus CE calculator for math and science courses. All functions work perfectly.', 85.00, 1, 7, 'good', NULL),
(5, 'Art Supply Set', 'Complete drawing set with pencils, erasers, and sketchpad. Great for art classes.', 40.00, 1, 7, 'like_new', NULL),

-- Transportation
(4, 'Skateboard', 'Complete skateboard setup, great for campus transportation. Some wear but rides smoothly.', 50.00, 1, 8, 'fair', NULL),
(5, 'Bike Helmet', 'Safety first! Barely used bike helmet, perfect for campus cycling.', 25.00, 1, 8, 'like_new', NULL);

-- Sample Product-Tag associations
INSERT IGNORE INTO Product_Tags (product_id, tag_id) VALUES 
-- Gaming Headphones - Gaming tag
(1, 1),
-- Xbox Controller - Gaming tag  
(2, 1),
-- Calculus Textbook - Math tag
(3, 9),
-- Physics Lab Manual - Science tag
(4, 10),
-- Business Notes - Course Notes tag (the one students requested!)
(5, 5),
-- Winter Jacket - Winter tag
(6, 17),
-- Athletic Shorts - Athletic tag
(7, 16),
-- Adventure Canoe - Outdoor tag
(10, 22),
-- Campus Bike - Bicycles tag
(11, 29),
-- Graphing Calculator - Tech Supplies tag
(15, 27),
-- Art Supply Set - Art Supplies tag
(16, 28),
-- Skateboard - Skateboards tag
(17, 31);

-- Sample cart items (students wanting to buy from other students)
INSERT IGNORE INTO Cart (buyer_id, product_id, quantity) VALUES 
(2, 1, 1), -- Sarah wants Alex's gaming headphones
(3, 3, 1), -- Mike wants Alex's calculus textbook
(4, 8, 1), -- Emma wants Sarah's mini fridge
(5, 11, 1), -- David wants Emma's campus bike
(1, 6, 1); -- Alex wants Sarah's winter jacket

-- Sample wishlist items
INSERT IGNORE INTO Wishlist (buyer_id, product_id) VALUES 
(1, 2), -- Alex wishes for Sarah's Xbox controller
(2, 10), -- Sarah wishes for Mike's canoe
(3, 15), -- Mike wishes for Mike's calculator
(4, 16), -- Emma wishes for David's art supplies
(5, 17); -- David wishes for Emma's skateboard

-- Sample orders (completed purchases between students)
INSERT IGNORE INTO Orders (buyer_id, total_amount, status, payment_method, delivery_method, pickup_location) VALUES 
(2, 45.00, 'completed', 'Venmo', 'pickup', 'Student Union'),
(3, 80.00, 'completed', 'Cash', 'pickup', 'Library'),
(4, 75.00, 'pending', 'PayPal', 'pickup', 'Dorm Lobby'),
(5, 120.00, 'confirmed', 'Venmo', 'pickup', 'Rec Center');

-- Sample order items
INSERT IGNORE INTO Order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 1, 45.00), -- Sarah bought Alex's gaming headphones
(2, 3, 1, 80.00), -- Mike bought Alex's calculus textbook  
(3, 8, 1, 75.00), -- Emma buying Sarah's mini fridge
(4, 11, 1, 120.00); -- David buying Emma's campus bike

-- Sample messages between students
INSERT IGNORE INTO Messages (sender_id, receiver_id, product_id, message) VALUES 
(2, 1, 1, 'Hi! Is the gaming headset still available? Can we meet at the Student Union?'),
(1, 2, 1, 'Yes it is! Student Union works great. How about 3pm today?'),
(3, 1, 3, 'Does the calculus book include the solutions manual?'),
(1, 3, 3, 'No separate manual, but I wrote solutions in pencil that you can erase if needed.'),
(4, 2, 8, 'Is the mini fridge energy efficient? My dorm has strict power limits.'),
(5, 4, 11, 'Can I test ride the bike before buying? Want to make sure it fits.');
