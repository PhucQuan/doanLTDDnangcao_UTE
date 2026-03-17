const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authLimiter, registerLimiter } = require('../middlewares/rateLimit.middleware');
const {
    validateRegister, validateLogin, validateForgotPassword, validateResetPassword,
    validateChangePassword, validateChangeContact, validate
} = require('../utils/validators');

// Public auth routes
router.post('/register', registerLimiter, validateRegister, validate, authController.register);
router.post('/register-otp', registerLimiter, validateRegister, validate, authController.registerOTP);
router.post('/verify-register-otp', authController.verifyRegisterOTP);
router.post('/login', authLimiter, validateLogin, validate, authController.login);
router.post('/forgot-password', authLimiter, validateForgotPassword, validate, authController.forgotPassword);
router.post('/verify-forgot-otp', authController.verifyForgotOTP);
router.post('/reset-password', validateResetPassword, validate, authController.resetPassword);

// Protected auth routes
router.post('/change-password', authenticateToken, validateChangePassword, validate, authController.changePassword);
router.post('/request-change-contact', authenticateToken, validateChangeContact, validate, authController.requestChangeContact);
router.post('/verify-change-contact', authenticateToken, authController.verifyChangeContact);

module.exports = router;
