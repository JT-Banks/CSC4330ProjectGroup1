-- Add Tags functionality to the student marketplace

-- Create Tags table
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

-- Create Product_Tags junction table for many-to-many relationship
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

-- Textbooks tags (including the requested Notes tag)
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
