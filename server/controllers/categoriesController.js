const mysql = require("mysql2")

// Database connection - will be set by app.js
let userDB = null;

console.log("🔍 CategoriesController: Module loaded (database connection will be set by app.js)")

// Function to set database connection from app.js
exports.setDatabase = (database) => {
    userDB = database;
    console.log("✅ CategoriesController: Database connection set from app.js")
}

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        if (!userDB) {
            console.log("❌ No database connection available for categories")
            return res.status(503).json({
                success: false,
                message: 'Database service unavailable. Please try again later.'
            })
        }

        userDB.query('SELECT * FROM Categories ORDER BY name ASC', (error, results) => {
            if (error) {
                console.log("❌ Get categories error:", error)
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch categories'
                })
            }

            res.status(200).json({
                success: true,
                data: results
            })
        })

    } catch (error) {
        console.log("❌ Categories general error:", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// Get all tags, optionally filtered by category
exports.getTags = async (req, res) => {
    try {
        if (!userDB) {
            console.log("❌ No database connection available for tags")
            return res.status(503).json({
                success: false,
                message: 'Database service unavailable. Please try again later.'
            })
        }

        const categoryId = req.query.category_id
        let query = 'SELECT t.*, c.name as category_name FROM Tags t LEFT JOIN Categories c ON t.category_id = c.category_id'
        let params = []

        if (categoryId) {
            query += ' WHERE t.category_id = ?'
            params.push(categoryId)
        }

        query += ' ORDER BY t.name ASC'

        userDB.query(query, params, (error, results) => {
            if (error) {
                console.log("❌ Get tags error:", error)
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch tags'
                })
            }

            res.status(200).json({
                success: true,
                data: results
            })
        })

    } catch (error) {
        console.log("❌ Tags general error:", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// Get products by category or tag
exports.getProductsByCategory = async (req, res) => {
    try {
        if (!userDB) {
            console.log("❌ No database connection available")
            return res.status(503).json({
                success: false,
                message: 'Database service unavailable. Please try again later.'
            })
        }

        const categoryId = req.params.categoryId
        const tagIds = req.query.tags ? req.query.tags.split(',') : []

        let query = `
            SELECT DISTINCT p.*, 
                   c.name as category_name, c.icon as category_icon, c.color as category_color,
                   GROUP_CONCAT(DISTINCT t.name) as tags
            FROM Products p
            LEFT JOIN Categories c ON p.category_id = c.category_id
            LEFT JOIN Product_Tags pt ON p.product_id = pt.product_id
            LEFT JOIN Tags t ON pt.tag_id = t.tag_id
        `
        
        let whereConditions = []
        let params = []

        if (categoryId && categoryId !== 'all') {
            whereConditions.push('p.category_id = ?')
            params.push(categoryId)
        }

        if (tagIds.length > 0) {
            const tagPlaceholders = tagIds.map(() => '?').join(',')
            whereConditions.push(`p.product_id IN (
                SELECT DISTINCT pt2.product_id 
                FROM Product_Tags pt2 
                WHERE pt2.tag_id IN (${tagPlaceholders})
            )`)
            params.push(...tagIds)
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ')
        }

        query += ' GROUP BY p.product_id ORDER BY p.name ASC'

        userDB.query(query, params, (error, results) => {
            if (error) {
                console.log("❌ Get products by category error:", error)
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch products'
                })
            }

            // Process the results to convert tags string to array
            const processedResults = results.map(product => ({
                ...product,
                tags: product.tags ? product.tags.split(',') : []
            }))

            res.status(200).json({
                success: true,
                data: processedResults
            })
        })

    } catch (error) {
        console.log("❌ Products by category general error:", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// Add tags to a product
exports.addProductTags = async (req, res) => {
    try {
        if (!userDB) {
            console.log("❌ No database connection available")
            return res.status(503).json({
                success: false,
                message: 'Database service unavailable. Please try again later.'
            })
        }

        const { productId, tagIds } = req.body

        if (!productId || !tagIds || !Array.isArray(tagIds)) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and tag IDs array are required'
            })
        }

        // First, remove existing tags for this product
        userDB.query('DELETE FROM Product_Tags WHERE product_id = ?', [productId], (deleteError) => {
            if (deleteError) {
                console.log("❌ Delete existing product tags error:", deleteError)
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update product tags'
                })
            }

            // If no tags to add, return success
            if (tagIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Product tags updated successfully'
                })
            }

            // Insert new tags
            const values = tagIds.map(tagId => [productId, tagId])
            const placeholders = values.map(() => '(?, ?)').join(', ')
            const flatValues = values.flat()

            userDB.query(
                `INSERT INTO Product_Tags (product_id, tag_id) VALUES ${placeholders}`,
                flatValues,
                (insertError) => {
                    if (insertError) {
                        console.log("❌ Insert product tags error:", insertError)
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to add product tags'
                        })
                    }

                    res.status(200).json({
                        success: true,
                        message: 'Product tags updated successfully'
                    })
                }
            )
        })

    } catch (error) {
        console.log("❌ Add product tags general error:", error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
