const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validateUpdateProfile, validate } = require('../utils/validators');

router.use(authenticateToken);

router.get('/', userController.getProfile);
router.put('/', validateUpdateProfile, validate, userController.updateProfile);

module.exports = router;
