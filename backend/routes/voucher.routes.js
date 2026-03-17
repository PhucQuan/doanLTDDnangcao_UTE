const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, voucherController.getAvailableVouchers);
router.post('/apply', authenticateToken, voucherController.applyVoucher);
router.get('/points', authenticateToken, voucherController.getUserPoints);

module.exports = router;
