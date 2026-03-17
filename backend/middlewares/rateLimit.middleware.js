const rateLimit = require('express-rate-limit');

// Auth endpoints: 5 requests per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút' },
    handler: (req, res) => {
        console.log(`[RATE LIMIT] IP ${req.ip} exceeded auth limit`);
        res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút' });
    }
});

// Register endpoint: 3 requests per hour
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { success: false, message: 'Quá nhiều lần đăng ký, vui lòng thử lại sau 1 giờ' },
    handler: (req, res) => {
        console.log(`[RATE LIMIT] IP ${req.ip} exceeded register limit`);
        res.status(429).json({ success: false, message: 'Quá nhiều lần đăng ký, vui lòng thử lại sau 1 giờ' });
    }
});

module.exports = {
    authLimiter,
    registerLimiter
};
