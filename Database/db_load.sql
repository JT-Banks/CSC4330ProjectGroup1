CREATE DATABASE IF NOT EXISTS Columbus_Marketplace;
USE Columbus_Marketplace;

CREATE TABLE Users(
	user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name varchar(255),
	email varchar(255),
	password varchar(255),
	PRIMARY KEY(`user_id`)
);

CREATE TABLE Address(
	address_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	user_id INT UNSIGNED NOT NULL,
	address varchar(255),
	city varchar(255),
	country varchar(65),
	phone varchar(15),
	FOREIGN KEY(user_id) REFERENCES Users(user_id),
	PRIMARY KEY(`address_id`)
);

CREATE TABLE Payment(
    payment_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    payment_type varchar(255),
    provider varchar(255),
    account_no varchar(255),
    expiry_date DATE,
    FOREIGN KEY(user_id) REFERENCES Users(user_id),
    PRIMARY KEY(`payment_id`)
);

CREATE TABLE Products(
	product_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name varchar(255),
	description text,
	store_quantity INT UNSIGNED NOT NULL,
	category INT UNSIGNED NOT NULL, 
	price DECIMAL(6, 2) UNSIGNED,
    rating INT UNSIGNED,
    image_url varchar(255),
	PRIMARY KEY(`product_id`)
);

CREATE TABLE Orders(
    order_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    total DECIMAL(12, 2) UNSIGNED, -- MAX: 9999999999.99, MIN: 0, non-negative values
    created_at TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES Users(user_id),
    PRIMARY KEY(`order_id`)
);

CREATE TABLE Order_items(
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED,
    FOREIGN KEY(product_id) REFERENCES Products(product_id),
    FOREIGN KEY(order_id) REFERENCES Orders(order_id),
    PRIMARY KEY(`order_id`, `product_id`)
);

CREATE TABLE Price(
    price_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id INT UNSIGNED NOT NULL,
    original_price DECIMAL(12, 2) UNSIGNED,
    discount_id INT UNSIGNED,
    discounted_price DECIMAL(12, 2) UNSIGNED,
    FOREIGN KEY(product_id) REFERENCES Products(product_id),
    PRIMARY KEY(`price_id`)
);
