const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Products
router.get('/', productController.getProducts);
router.get('/best-selling', productController.getBestSellingProducts);
router.get('/discounted', productController.getDiscountedProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
