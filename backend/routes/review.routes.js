const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.post('/', authenticateToken, reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);

module.exports = router;
