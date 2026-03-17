const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discovery.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.post('/favorites/toggle', authenticateToken, discoveryController.toggleFavorite);
router.get('/favorites', authenticateToken, discoveryController.getFavorites);

router.post('/view', authenticateToken, discoveryController.trackView);
router.get('/recently-viewed', authenticateToken, discoveryController.getRecentlyViewed);

router.get('/product-meta/:productId', discoveryController.getProductDiscovery);

module.exports = router;
