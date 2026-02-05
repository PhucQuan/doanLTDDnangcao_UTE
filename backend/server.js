const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key';

app.use(cors());
app.use(bodyParser.json());

// In-memory OTP Storage
let otpStorage = {}; // { phone: { otp, expires, type } }
let tempUsers = {}; // { phone: tempUserData }

// Helper
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ===================================
// LAYER 2: RATE LIMITING
// ===================================

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

// ===================================
// LAYER 1: INPUT VALIDATION
// ===================================

const validateRegister = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .isLength({ min: 10, max: 10 }).withMessage('Số điện thoại phải có 10 số')
        .matches(/^0[0-9]{9}$/).withMessage('Số điện thoại phải bắt đầu bằng số 0'),
    body('password')
        .trim()
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('name')
        .trim()
        .notEmpty().withMessage('Tên không được để trống')
        .isLength({ min: 2 }).withMessage('Tên phải có ít nhất 2 ký tự'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Email không hợp lệ')
];

const validateLogin = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .matches(/^0[0-9]{9}$/).withMessage('Số điện thoại không hợp lệ'),
    body('password')
        .trim()
        .notEmpty().withMessage('Mật khẩu không được để trống')
];

const validateForgotPassword = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .matches(/^0[0-9]{9}$/).withMessage('Số điện thoại không hợp lệ')
];

const validateResetPassword = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống'),
    body('newPassword')
        .trim()
        .notEmpty().withMessage('Mật khẩu mới không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
    body('token')
        .notEmpty().withMessage('Token không được để trống')
];

const validateUpdateProfile = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên không được để trống')
        .isLength({ min: 2 }).withMessage('Tên phải có ít nhất 2 ký tự'),
    body('avatar')
        .optional()
        .trim()
];

const validateChangePassword = [
    body('oldPassword')
        .notEmpty().withMessage('Mật khẩu cũ không được để trống'),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
];

const validateChangeContact = [
    body('newValue')
        .trim()
        .notEmpty().withMessage('Giá trị mới không được để trống')
];

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        console.log(`[VALIDATION ERROR] ${req.path}: ${firstError.msg}`);
        return res.status(400).json({
            success: false,
            message: firstError.msg,
            errors: errors.array()
        });
    }
    next();
};

// ===================================
// LAYER 3: AUTHENTICATION
// ===================================

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

// ===================================
// LAYER 4: AUTHORIZATION
// ===================================

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

// ===================================
// ROUTES
// ===================================

// 1. Register (No OTP)
app.post('/api/auth/register', registerLimiter, validateRegister, validate, async (req, res) => {
    const { phone, password, name, email } = req.body;

    try {
        // Check if user exists
        const checkUser = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Số điện thoại đã được đăng ký' });
        }

        // Insert new user
        const result = await db.query(
            'INSERT INTO users (phone, password, name, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [phone, password, name, email || null, 'user']
        );
        const newUser = result.rows[0];

        const sessionId = `session_${Date.now()}`;
        const token = jwt.sign(
            { id: newUser.id, phone: newUser.phone, role: newUser.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        console.log(`[SUCCESS] User registered: ${phone}`);

        res.json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user: { id: newUser.id, phone: newUser.phone, name: newUser.name, email: newUser.email, role: newUser.role },
                sessionId,
                token
            }
        });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 2. Register With OTP (Step 1: Send OTP)
app.post('/api/auth/register-otp', registerLimiter, validateRegister, validate, async (req, res) => {
    const { phone, password, name, email } = req.body;

    try {
        const checkUser = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Số điện thoại đã được đăng ký' });
        }

        const otp = generateOTP();
        otpStorage[phone] = { otp, expires: Date.now() + 300000, type: 'register' };
        tempUsers[phone] = { phone, password, name, email: email || null };

        console.log(`[OTP] Register for ${phone}: ${otp}`);

        res.json({ success: true, message: `OTP gửi đến ${phone}: ${otp}` });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 3. Verify Register OTP (Step 2: Verify & Create User)
app.post('/api/auth/verify-register-otp', async (req, res) => {
    const { phone, otp } = req.body;
    const stored = otpStorage[phone];

    if (!stored || stored.type !== 'register') {
        return res.status(400).json({ success: false, message: 'OTP không hợp lệ' });
    }
    if (Date.now() > stored.expires) {
        delete otpStorage[phone];
        return res.status(400).json({ success: false, message: 'OTP hết hạn' });
    }
    if (stored.otp !== otp) {
        return res.status(400).json({ success: false, message: 'OTP sai' });
    }

    const userData = tempUsers[phone];
    if (!userData) {
        return res.status(400).json({ success: false, message: 'Lỗi dữ liệu đăng ký' });
    }

    try {
        const result = await db.query(
            'INSERT INTO users (phone, password, name, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userData.phone, userData.password, userData.name, userData.email, 'user']
        );
        const newUser = result.rows[0];

        delete otpStorage[phone];
        delete tempUsers[phone];

        const sessionId = `session_${Date.now()}`;
        const token = jwt.sign(
            { id: newUser.id, phone: newUser.phone, role: newUser.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        console.log(`[SUCCESS] User registered with OTP: ${phone}`);

        res.json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user: { id: newUser.id, phone: newUser.phone, name: newUser.name, email: newUser.email, role: newUser.role },
                sessionId,
                token
            }
        });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 4. Login
app.post('/api/auth/login', authLimiter, validateLogin, validate, async (req, res) => {
    const { phone, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE phone = $1 AND password = $2', [phone, password]);

        if (result.rows.length === 0) {
            console.log(`[AUTH FAILED] Login attempt failed for ${phone}`);
            return res.status(400).json({ success: false, message: 'Sai thông tin đăng nhập' });
        }

        const user = result.rows[0];
        const sessionId = `session_${Date.now()}`;
        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role || 'user' },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        console.log(`[SUCCESS] User logged in: ${phone}`);

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: { id: user.id, phone: user.phone, name: user.name, email: user.email, role: user.role || 'user' },
                sessionId,
                token
            }
        });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 5. Forgot Password (Step 1: Send OTP)
app.post('/api/auth/forgot-password', authLimiter, validateForgotPassword, validate, async (req, res) => {
    const { phone } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Số điện thoại không tồn tại' });
        }

        const otp = generateOTP();
        otpStorage[phone] = { otp, expires: Date.now() + 300000, type: 'forgot' };

        console.log(`[OTP] Forgot Password for ${phone}: ${otp}`);

        res.json({ success: true, message: `OTP gửi đến ${phone}: ${otp}` });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// 6. Verify Forgot OTP (Step 2: Verify and Return Token)
app.post('/api/auth/verify-forgot-otp', (req, res) => {
    const { phone, otp } = req.body;
    const stored = otpStorage[phone];

    if (!stored || stored.type !== 'forgot') {
        return res.status(400).json({ success: false, message: 'OTP không hợp lệ' });
    }
    if (Date.now() > stored.expires) {
        delete otpStorage[phone];
        return res.status(400).json({ success: false, message: 'OTP hết hạn' });
    }
    if (stored.otp !== otp) {
        return res.status(400).json({ success: false, message: 'OTP sai' });
    }

    delete otpStorage[phone];

    const resetToken = jwt.sign({ phone, type: 'reset_password' }, SECRET_KEY, { expiresIn: '15m' });

    res.json({
        success: true,
        message: 'OTP chính xác',
        data: { resetToken }
    });
});

// 7. Reset Password
app.post('/api/auth/reset-password', validateResetPassword, validate, async (req, res) => {
    const { phone, newPassword, token } = req.body;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.phone !== phone || decoded.type !== 'reset_password') {
            return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
        }

        const result = await db.query('UPDATE users SET password = $1 WHERE phone = $2', [newPassword, phone]);

        if (result.rowCount === 0) {
            return res.status(400).json({ success: false, message: 'User không tồn tại' });
        }

        console.log(`[SUCCESS] Password reset for ${phone}`);

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });

    } catch (err) {
        console.error('[ERROR]', err);
        return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
    }
});

// ===================================
// PROTECTED ROUTES (Authentication Required)
// ===================================

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT id, phone, name, email, avatar, role FROM users WHERE id = $1', [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User không tồn tại' });
        }

        res.json({
            success: true,
            data: { user: result.rows[0] }
        });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Update user profile
app.put('/api/profile', authenticateToken, validateUpdateProfile, validate, async (req, res) => {
    const { name, avatar } = req.body;

    try {
        const result = await db.query(
            'UPDATE users SET name = $1, avatar = $2 WHERE id = $3 RETURNING id, phone, name, email, avatar, role',
            [name, avatar, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User không tồn tại' });
        }

        console.log(`[SUCCESS] User ${req.user.id} updated profile`);

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: { user: result.rows[0] }
        });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Change Password
app.post('/api/auth/change-password', authenticateToken, validateChangePassword, validate, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        // Verify old password
        const userCheck = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User không tồn tại' });
        }

        if (userCheck.rows[0].password !== oldPassword) {
            return res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác' });
        }

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, req.user.id]);

        console.log(`[SUCCESS] User ${req.user.id} changed password`);

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Request Change Contact (Phone or Email) - Send OTP
app.post('/api/auth/request-change-contact', authenticateToken, validateChangeContact, validate, async (req, res) => {
    const { type, newValue } = req.body; // type: 'phone' or 'email'

    if (!['phone', 'email'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Loại thông tin không hợp lệ' });
    }

    try {
        // Check if already exists
        const check = await db.query(`SELECT id FROM users WHERE ${type} = $1`, [newValue]);
        if (check.rows.length > 0) {
            return res.status(400).json({ success: false, message: `${type === 'phone' ? 'Số điện thoại' : 'Email'} đã được sử dụng` });
        }

        const otp = generateOTP();
        otpStorage[req.user.id] = { otp, expires: Date.now() + 300000, type: `change_${type}`, newValue };

        console.log(`[OTP] Change ${type} for user ${req.user.id} to ${newValue}: ${otp}`);

        res.json({ success: true, message: `OTP gửi đến ${newValue}: ${otp}` });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Verify Change Contact OTP and Update
app.post('/api/auth/verify-change-contact', authenticateToken, async (req, res) => {
    const { otp } = req.body;
    const stored = otpStorage[req.user.id];

    if (!stored || !stored.type.startsWith('change_')) {
        return res.status(400).json({ success: false, message: 'OTP không hợp lệ hoặc đã hết hạn' });
    }

    if (Date.now() > stored.expires) {
        delete otpStorage[req.user.id];
        return res.status(400).json({ success: false, message: 'OTP hết hạn' });
    }

    if (stored.otp !== otp) {
        return res.status(400).json({ success: false, message: 'OTP sai' });
    }

    const type = stored.type.replace('change_', ''); // 'phone' or 'email'
    const newValue = stored.newValue;

    try {
        await db.query(`UPDATE users SET ${type} = $1 WHERE id = $2`, [newValue, req.user.id]);

        delete otpStorage[req.user.id];

        console.log(`[SUCCESS] User ${req.user.id} changed ${type} to ${newValue}`);

        res.json({
            success: true,
            message: `Cập nhật ${type === 'phone' ? 'số điện thoại' : 'email'} thành công`,
            data: { [type]: newValue }
        });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ===================================
// PUBLIC ROUTES (No Auth Required for Browse)
// ===================================

// GET /api/products - Search & Filter
// Query: q (keyword), category, minPrice, maxPrice, sort (price_asc, price_desc)
app.get('/api/products', async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, sort } = req.query;

        let query = 'SELECT * FROM products WHERE 1=1';
        let params = [];
        let paramCount = 1;

        if (q) {
            query += ` AND (LOWER(name) LIKE $${paramCount} OR LOWER(description) LIKE $${paramCount})`;
            params.push(`%${q.toLowerCase()}%`);
            paramCount++;
        }

        if (category) {
            query += ` AND category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        if (minPrice) {
            query += ` AND price >= $${paramCount}`;
            params.push(minPrice);
            paramCount++;
        }

        if (maxPrice) {
            query += ` AND price <= $${paramCount}`;
            params.push(maxPrice);
            paramCount++;
        }

        if (sort === 'price_asc') {
            query += ' ORDER BY price ASC';
        } else if (sort === 'price_desc') {
            query += ' ORDER BY price DESC';
        } else {
            query += ' ORDER BY created_at DESC';
        }

        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });

    } catch (err) {
        console.error('[ERROR] Search products:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// GET /api/products/:id - Product Details
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        res.json({ success: true, data: result.rows[0] });

    } catch (err) {
        console.error('[ERROR] Get product detail:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ===================================
// NEW ENDPOINTS - E-commerce Features
// ===================================

// GET /api/categories - Get all categories for horizontal display
app.get('/api/categories', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY name ASC');

        console.log(`[SUCCESS] Retrieved ${result.rows.length} categories`);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error('[ERROR] Get categories:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// GET /api/products/best-selling - Get top 10 best-selling products
app.get('/api/products/best-selling', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM products ORDER BY sales_count DESC LIMIT 10'
        );

        console.log(`[SUCCESS] Retrieved ${result.rows.length} best-selling products`);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error('[ERROR] Get best-selling products:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// GET /api/products/discounted - Get 20 products with highest discount
app.get('/api/products/discounted', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM products WHERE discount_percent > 0 ORDER BY discount_percent DESC LIMIT 20'
        );

        console.log(`[SUCCESS] Retrieved ${result.rows.length} discounted products`);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error('[ERROR] Get discounted products:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});


// ===================================
// ADMIN-ONLY ROUTES (Authorization Required)
// ===================================

// Get all users (Admin only)
app.get('/api/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const result = await db.query('SELECT id, phone, name, email, role, created_at FROM users ORDER BY created_at DESC');

        console.log(`[SUCCESS] Admin ${req.user.id} retrieved all users`);

        res.json({
            success: true,
            data: { users: result.rows }
        });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await db.query('DELETE FROM users WHERE id = $1', [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User không tồn tại' });
        }

        console.log(`[SUCCESS] Admin ${req.user.id} deleted user ${userId}`);

        res.json({ success: true, message: 'Xóa user thành công' });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ===================================
// START SERVER
// ===================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Also accessible at http://10.0.230.24:${PORT}`);
    console.log('✅ Security layers enabled:');
    console.log('  - Input Validation');
    console.log('  - Rate Limiting');
    console.log('  - Authentication (JWT)');
    console.log('  - Authorization (Role-based)');
});
