const mysql = require('mysql2')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { promisify } = require('util')

//Database connection - will be set by app.js
let userDB = null;

console.log("🔍 ProductsController: Module loaded (database connection will be set by app.js)")

// Function to set database connection from app.js
exports.setDatabase = (database) => {
    userDB = database;
    console.log("✅ ProductsController: Database connection set from app.js")
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/products')
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  }
})

// Get all products with pagination and filters
const getProducts = async (req, res) => {
  try {
    if (!userDB) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      })
    }

    const query = promisify(userDB.query).bind(userDB)
    
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const offset = (page - 1) * limit
    
    const { category_id, condition, min_price, max_price, search } = req.query
    
    let queryString = `
      SELECT 
        p.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        u.name as seller_name,
        u.email as seller_email,
        GROUP_CONCAT(DISTINCT t.name) as tags,
        GROUP_CONCAT(DISTINCT pi.image_url) as images
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.category_id
      LEFT JOIN Users u ON p.seller_id = u.user_id
      LEFT JOIN Product_Tags pt ON p.product_id = pt.product_id
      LEFT JOIN Tags t ON pt.tag_id = t.tag_id
      LEFT JOIN Product_Images pi ON p.product_id = pi.product_id
      WHERE (p.is_active = 1 OR p.status = 'active')
    `
    
    const queryParams = []
    
    if (category_id) {
      queryString += ' AND p.category_id = ?'
      queryParams.push(category_id)
    }
    
    if (condition) {
      queryString += ' AND (p.condition = ? OR p.condition_type = ?)'
      queryParams.push(condition, condition)
    }
    
    if (min_price) {
      queryString += ' AND p.price >= ?'
      queryParams.push(min_price)
    }
    
    if (max_price) {
      queryString += ' AND p.price <= ?'
      queryParams.push(max_price)
    }
    
    if (search) {
      queryString += ' AND (p.title LIKE ? OR p.name LIKE ? OR p.description LIKE ?)'
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    queryString += ' GROUP BY p.product_id ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    queryParams.push(limit, offset)
    
    const products = await query(queryString, queryParams)
    
    // Process products to parse tags and images
    const processedProducts = products.map(product => ({
      ...product,
      tags: product.tags ? product.tags.split(',') : [],
      images: product.images ? product.images.split(',') : []
    }))
    
    res.json({
      success: true,
      data: processedProducts,
      pagination: {
        page,
        limit,
        total: processedProducts.length,
        totalPages: Math.ceil(processedProducts.length / limit),
        hasNext: processedProducts.length === limit,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('Error getting products:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    })
  }
}

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    if (!userDB) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      })
    }

    const query = promisify(userDB.query).bind(userDB)
    const { id } = req.params
    
    const queryString = `
      SELECT 
        p.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        u.name as seller_name,
        u.email as seller_email,
        GROUP_CONCAT(DISTINCT t.name) as tags,
        GROUP_CONCAT(DISTINCT pi.image_url) as images
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.category_id
      LEFT JOIN Users u ON p.seller_id = u.user_id
      LEFT JOIN Product_Tags pt ON p.product_id = pt.product_id
      LEFT JOIN Tags t ON pt.tag_id = t.tag_id
      LEFT JOIN Product_Images pi ON p.product_id = pi.product_id
      WHERE p.product_id = ? AND (p.is_active = 1 OR p.status = 'active')
      GROUP BY p.product_id
    `
    
    const products = await query(queryString, [id])
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }
    
    const product = {
      ...products[0],
      tags: products[0].tags ? products[0].tags.split(',') : [],
      images: products[0].images ? products[0].images.split(',') : []
    }
    
    res.json({
      success: true,
      data: product
    })
    
  } catch (error) {
    console.error('Error getting product:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    })
  }
}

// Create new product
const createProduct = async (req, res) => {
  try {
    if (!userDB) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      })
    }

    const query = promisify(userDB.query).bind(userDB)
    
    const { title, description, price, category_id, condition, tags } = req.body
    const seller_id = req.user.userId
    
    // Validate required fields
    if (!title || !description || !price || !category_id || !condition) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, price, category_id, condition'
      })
    }
    
    // Insert product
    const insertQuery = `
      INSERT INTO Products (title, name, description, price, category_id, \`condition\`, condition_type, seller_id, is_active, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'active', NOW())
    `
    
    const result = await query(insertQuery, [
      title, title, description, parseFloat(price), category_id, condition, condition, seller_id
    ])
    
    const productId = result.insertId
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageQueries = req.files.map(async (file) => {
        const imageUrl = `/uploads/products/${file.filename}`
        return query(
          'INSERT INTO Product_Images (product_id, image_url, is_primary, created_at) VALUES (?, ?, ?, NOW())',
          [productId, imageUrl, true]
        )
      })
      
      await Promise.all(imageQueries)
    }
    
    // Handle tags
    if (tags) {
      let tagIds = []
      
      if (typeof tags === 'string') {
        try {
          tagIds = JSON.parse(tags)
        } catch (e) {
          // If not JSON, treat as comma-separated string
          tagIds = tags.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        }
      } else if (Array.isArray(tags)) {
        tagIds = tags.map(id => parseInt(id)).filter(id => !isNaN(id))
      }
      
      if (tagIds.length > 0) {
        const tagQueries = tagIds.map(tagId => 
          query(
            'INSERT INTO Product_Tags (product_id, tag_id) VALUES (?, ?)',
            [productId, tagId]
          )
        )
        
        await Promise.all(tagQueries)
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product_id: productId,
        title,
        description,
        price: parseFloat(price),
        category_id: parseInt(category_id),
        condition,
        seller_id
      }
    })
    
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    })
  }
}

// Get user's products
const getUserProducts = async (req, res) => {
  try {
    if (!userDB) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      })
    }

    const query = promisify(userDB.query).bind(userDB)
    const userId = req.user.userId
    
    const queryString = `
      SELECT 
        p.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        GROUP_CONCAT(DISTINCT t.name) as tags,
        GROUP_CONCAT(DISTINCT pi.image_url) as images
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.category_id
      LEFT JOIN Product_Tags pt ON p.product_id = pt.product_id
      LEFT JOIN Tags t ON pt.tag_id = t.tag_id
      LEFT JOIN Product_Images pi ON p.product_id = pi.product_id
      WHERE p.seller_id = ? AND (p.is_active = 1 OR p.status = 'active')
      GROUP BY p.product_id
      ORDER BY p.created_at DESC
    `
    
    const products = await query(queryString, [userId])
    
    const processedProducts = products.map(product => ({
      ...product,
      tags: product.tags ? product.tags.split(',') : [],
      images: product.images ? product.images.split(',') : []
    }))
    
    res.json({
      success: true,
      data: processedProducts
    })
    
  } catch (error) {
    console.error('Error getting user products:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching your products',
      error: error.message
    })
  }
}

// Placeholder functions for future implementation
const updateProduct = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Update product feature coming soon'
  })
}

const deleteProduct = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Delete product feature coming soon'
  })
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  upload // Export multer middleware
}
