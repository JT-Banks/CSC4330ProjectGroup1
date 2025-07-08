-- Create Users table (essential for registration)
CREATE TABLE IF NOT EXISTS Users (
    user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- Create Products table
CREATE TABLE IF NOT EXISTS Products (
    product_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    description TEXT,
    store_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    category INT UNSIGNED NOT NULL,
    price DECIMAL(10, 2) UNSIGNED,
    rating INT UNSIGNED DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id)
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS Orders (
    order_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    total DECIMAL(12, 2) UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (order_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Insert a test user to verify registration works
INSERT IGNORE INTO Users (name, email, password) VALUES 
('Test User', 'test@lsu.edu', '$2a$08$test.hash.for.verification.purposes.only');

-- Show all tables to confirm creation
SHOW TABLES;

-- Show Users table structure
DESCRIBE Users;
