const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for image uploads here to avoid circular dependency
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

// Import controller after upload is defined
const productsController = require('../controllers/productsController')

// Public routes
router.get('/', productsController.getProducts)
router.get('/:id', productsController.getProductById)

// Protected routes (require authentication)
router.post('/', 
  authController.verifyToken,
  upload.array('images', 5), // Handle up to 5 image uploads
  productsController.createProduct
)

router.put('/:id', 
  authController.verifyToken,
  productsController.updateProduct
)

router.delete('/:id', 
  authController.verifyToken,
  productsController.deleteProduct
)

router.get('/user/my-products', 
  authController.verifyToken,
  productsController.getUserProducts
)

module.exports = router
