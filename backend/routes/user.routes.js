const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

router.use(authenticateToken);

// Admin routes
router.get('/', authorizeRole('admin'), userController.getAllUsers);
router.delete('/:id', authorizeRole('admin'), userController.deleteUser);

module.exports = router;
