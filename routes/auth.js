const express = require('express')
const authController = require('../controllers/auth')
const router = express.Router()

//Control to pass to pages to auth(authentication)
router.post('/register', authController.register) //register page

router.post('/login', authController.login) //login page

router.get('/logout', authController.logout) //logout page

/*Will need to retrieve a table...possibly multiple tables...
Table structure ATM for products should be >>
product = {             
    productCode,
    productName,    
    productPrice,  
    productQuantity,
    discountId, 
    productDesc
}

products relational to discount/sale table >>
discount/sale = {
    discountId,
    productName,
    productDiscountedPrice
}

finally, price table which two above depend on >>

price = {
    productOriginalPrice,
    productDiscountPrice,
    discountId
}
*/
//router.post('/product', authController.product) //product page

module.exports = router 