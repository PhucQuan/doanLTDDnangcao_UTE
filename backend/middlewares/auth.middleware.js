const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.log(`[AUTH FAILED] No token provided from ${req.ip}`);
        return res.status(401).json({ success: false, message: 'Token không được cung cấp' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.log(`[AUTH FAILED] Invalid token from ${req.ip}: ${err.message}`);
            return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
        }
        req.user = user;
        next();
    });
};

const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user.role || !roles.includes(req.user.role)) {
            console.log(`[AUTHZ DENIED] User ${req.user.id} (role: ${req.user.role}) tried to access ${req.path}`);
            return res.status(403).json({
                success: false,
                message: 'Không có quyền thực hiện hành động này'
            });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRole,
    SECRET_KEY
};
