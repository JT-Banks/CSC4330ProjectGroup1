-- Add Cart and Wishlist tables to the database

-- Cart table to store items users want to purchase
CREATE TABLE IF NOT EXISTS Cart (
    cart_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    PRIMARY KEY (cart_id),
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Wishlist table to store items users want to save for later
CREATE TABLE IF NOT EXISTS Wishlist (
    wishlist_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    PRIMARY KEY (wishlist_id),
    UNIQUE KEY unique_user_product_wishlist (user_id, product_id)
);
