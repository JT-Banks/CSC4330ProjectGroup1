const jwt = require('jsonwebtoken')
const { promisify } = require('util') 

let userDB = null;

console.log("🔍 CartController: Module loaded (database connection will be set by app.js)")

exports.setDatabase = (database) => {
    userDB = database;
    console.log("✅ CartController: Database connection set from app.js")
}

const requireAuth = async (req, res, next) => {
    try {
        let token = null
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Please log in to access this resource' })
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

        userDB.query('SELECT user_id, name, email FROM Users WHERE user_id = ?', [decoded.id], (error, result) => {
            if (error || !result || result.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid token' })
            }
            
            req.user = {
                id: result[0].user_id,
                name: result[0].name,
                email: result[0].email
            }
            next()
        })
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' })
    }
}

exports.getCart = [requireAuth, (req, res) => {
    userDB.query(`
        SELECT c.cart_id, c.quantity, c.created_at, c.updated_at,
               p.product_id, p.name, p.description, p.price, p.image_url, p.condition_type, p.status,
               p.quantity as available_quantity, u.name as seller_name, u.email as seller_email
        FROM Cart c 
        JOIN Products p ON c.product_id = p.product_id 
        JOIN Users u ON p.seller_id = u.user_id
        WHERE c.buyer_id = ? AND p.status = 'active'
    `, [req.user.id], (error, results) => {
        if (error) {
            console.error('Cart query error:', error);
            return res.status(500).json({ success: false, message: 'Database error', data: [] });
        }
        // Ensure results is always an array
        const cartData = Array.isArray(results) ? results : [];
        console.log('Cart data for user', req.user.id, ':', cartData.length, 'items');
        res.json({ success: true, data: cartData });
    });
}]

exports.addToCart = [requireAuth, (req, res) => {
    const { productId, quantity = 1 } = req.body;

    userDB.query(
        'INSERT INTO Cart (buyer_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
        [req.user.id, productId, quantity, quantity],
        (error) => {
            if (error) {
                console.error('Add to cart error:', error);
                return res.status(500).json({ success: false, message: 'Failed to add to cart' });
            }
            res.json({ success: true, message: 'Item added to cart' });
        }
    );
}]

exports.updateCart = [requireAuth, (req, res) => {
    const { productId, quantity } = req.body;

    userDB.query(
        'UPDATE Cart SET quantity = ? WHERE buyer_id = ? AND product_id = ?',
        [quantity, req.user.id, productId],
        (error) => {
            if (error) {
                console.error('Update cart error:', error);
                return res.status(500).json({ success: false, message: 'Failed to update cart' });
            }
            res.json({ success: true, message: 'Cart updated' });
        }
    );
}]

exports.removeFromCart = [requireAuth, (req, res) => {
    const { productId } = req.params;

    userDB.query(
        'DELETE FROM Cart WHERE buyer_id = ? AND product_id = ?',
        [req.user.id, productId],
        (error) => {
            if (error) {
                console.error('Remove from cart error:', error);
                return res.status(500).json({ success: false, message: 'Failed to remove from cart' });
            }
            res.json({ success: true, message: 'Item removed from cart' });
        }
    );
}]

exports.getWishlist = [requireAuth, (req, res) => {
    userDB.query(`
        SELECT w.wishlist_id, w.created_at,
               p.product_id, p.name, p.description, p.price, p.image_url, p.condition_type,
               p.quantity as available_quantity, u.name as seller_name
        FROM Wishlist w 
        JOIN Products p ON w.product_id = p.product_id 
        JOIN Users u ON p.seller_id = u.user_id
        WHERE w.buyer_id = ?
    `, [req.user.id], (error, results) => {
        if (error) {
            console.error('Wishlist query error:', error);
            return res.status(500).json({ success: false, message: 'Database error', data: [] });
        }
        // Ensure results is always an array
        const wishlistData = Array.isArray(results) ? results : [];
        console.log('Wishlist data for user', req.user.id, ':', wishlistData.length, 'items');
        res.json({ success: true, data: wishlistData });
    });
}]

exports.addToWishlist = [requireAuth, (req, res) => {
    const { productId } = req.body;

    userDB.query(
        'INSERT IGNORE INTO Wishlist (buyer_id, product_id) VALUES (?, ?)',
        [req.user.id, productId],
        (error, results) => {
            if (error) {
                console.error('Add to wishlist error:', error);
                return res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
            }
            if (results.affectedRows === 0) {
                return res.json({ success: true, message: 'Item already in wishlist' });
            }
            res.json({ success: true, message: 'Item added to wishlist' });
        }
    );
}]

exports.removeFromWishlist = [requireAuth, (req, res) => {
    const { productId } = req.params;

    userDB.query(
        'DELETE FROM Wishlist WHERE buyer_id = ? AND product_id = ?',
        [req.user.id, productId],
        (error) => {
            if (error) {
                console.error('Remove from wishlist error:', error);
                return res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
            }
            res.json({ success: true, message: 'Item removed from wishlist' });
        }
    );
}]

exports.checkout = [requireAuth, (req, res) => {
    // Start transaction to ensure data consistency
    userDB.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Transaction error' });
        }

        // First, get all cart items for this user
        userDB.query(`
            SELECT c.cart_id, c.quantity, c.product_id,
                   p.price, p.seller_id, p.name
            FROM Cart c 
            JOIN Products p ON c.product_id = p.product_id 
            WHERE c.buyer_id = ? AND p.status = 'active'
        `, [req.user.id], (error, cartItems) => {
            if (error) {
                return userDB.rollback(() => {
                    res.status(500).json({ success: false, message: 'Error fetching cart items' });
                });
            }

            if (cartItems.length === 0) {
                return userDB.rollback(() => {
                    res.status(400).json({ success: false, message: 'No items in cart to checkout' });
                });
            }

            // Calculate total amount
            const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Create an order
            userDB.query(
                'INSERT INTO Orders (buyer_id, total_amount, status) VALUES (?, ?, ?)',
                [req.user.id, totalAmount, 'pending'],
                (error, orderResult) => {
                    if (error) {
                        return userDB.rollback(() => {
                            res.status(500).json({ success: false, message: 'Error creating order' });
                        });
                    }

                    const orderId = orderResult.insertId;

                    // Insert order items and update product status
                    let completed = 0;
                    let hasError = false;

                    cartItems.forEach((item) => {
                        // Insert order item
                        userDB.query(
                            'INSERT INTO Order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                            [orderId, item.product_id, item.quantity, item.price],
                            (error) => {
                                if (error && !hasError) {
                                    hasError = true;
                                    return userDB.rollback(() => {
                                        res.status(500).json({ success: false, message: 'Error creating order items' });
                                    });
                                }

                                // Update product status to 'sold'
                                userDB.query(
                                    'UPDATE Products SET status = ? WHERE product_id = ?',
                                    ['sold', item.product_id],
                                    (error) => {
                                        if (error && !hasError) {
                                            hasError = true;
                                            return userDB.rollback(() => {
                                                res.status(500).json({ success: false, message: 'Error updating product status' });
                                            });
                                        }

                                        completed++;
                                        if (completed === cartItems.length && !hasError) {
                                            // Clear the cart
                                            userDB.query(
                                                'DELETE FROM Cart WHERE buyer_id = ?',
                                                [req.user.id],
                                                (error) => {
                                                    if (error) {
                                                        return userDB.rollback(() => {
                                                            res.status(500).json({ success: false, message: 'Error clearing cart' });
                                                        });
                                                    }

                                                    // Commit transaction
                                                    userDB.commit((err) => {
                                                        if (err) {
                                                            return userDB.rollback(() => {
                                                                res.status(500).json({ success: false, message: 'Transaction commit error' });
                                                            });
                                                        }

                                                        res.json({ 
                                                            success: true, 
                                                            message: 'Checkout successful',
                                                            orderId: orderId,
                                                            totalAmount: totalAmount
                                                        });
                                                    });
                                                }
                                            );
                                        }
                                    }
                                );
                            }
                        );
                    });
                }
            );
        });
    });
}]

exports.getOrders = [requireAuth, (req, res) => {
    userDB.query(`
        SELECT o.order_id, o.total_amount, o.status, o.created_at,
               oi.quantity, oi.price,
               p.product_id, p.name, p.image_url,
               seller.name as seller_name, seller.email as seller_email
        FROM Orders o
        JOIN Order_items oi ON o.order_id = oi.order_id
        JOIN Products p ON oi.product_id = p.product_id
        JOIN Users seller ON p.seller_id = seller.user_id
        WHERE o.buyer_id = ?
        ORDER BY o.created_at DESC
    `, [req.user.id], (error, results) => {
        if (error) {
            console.error('Orders query error:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Group by order_id
        const orders = {};
        results.forEach(row => {
            if (!orders[row.order_id]) {
                orders[row.order_id] = {
                    order_id: row.order_id,
                    total_amount: row.total_amount,
                    status: row.status,
                    created_at: row.created_at,
                    items: []
                };
            }
            orders[row.order_id].items.push({
                product_id: row.product_id,
                name: row.name,
                image_url: row.image_url,
                quantity: row.quantity,
                price: row.price,
                seller_name: row.seller_name,
                seller_email: row.seller_email
            });
        });

        res.json({ success: true, data: Object.values(orders) });
    });
}]
