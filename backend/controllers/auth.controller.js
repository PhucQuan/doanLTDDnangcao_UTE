const jwt = require('jsonwebtoken');
const db = require('../db');
const { otpStorage, tempUsers } = require('../store/otpStore');
const { SECRET_KEY } = require('../middlewares/auth.middleware');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Register (No OTP)
const register = async (req, res) => {
    const { phone, password, name, email } = req.body;
    try {
        const checkUser = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Số điện thoại đã được đăng ký' });
        }

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
};

// 2. Register With OTP (Step 1)
const registerOTP = async (req, res) => {
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
};

// 3. Verify Register OTP
const verifyRegisterOTP = async (req, res) => {
    const { phone, otp } = req.body;
    const stored = otpStorage[phone];

    if (!stored || stored.type !== 'register') return res.status(400).json({ success: false, message: 'OTP không hợp lệ' });
    if (Date.now() > stored.expires) {
        delete otpStorage[phone];
        return res.status(400).json({ success: false, message: 'OTP hết hạn' });
    }
    if (stored.otp !== otp) return res.status(400).json({ success: false, message: 'OTP sai' });

    const userData = tempUsers[phone];
    if (!userData) return res.status(400).json({ success: false, message: 'Lỗi dữ liệu đăng ký' });

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
};

// 4. Login
const login = async (req, res) => {
    const { phone, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE phone = $1 AND password = $2', [phone, password]);

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Sai thông tin đăng nhập' });
        }

        const user = result.rows[0];
        const sessionId = `session_${Date.now()}`;
        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role || 'user' },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

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
};

// 5. Forgot Password
const forgotPassword = async (req, res) => {
    const { phone } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Số điện thoại không tồn tại' });

        const otp = generateOTP();
        otpStorage[phone] = { otp, expires: Date.now() + 300000, type: 'forgot' };

        console.log(`[OTP] Forgot Password for ${phone}: ${otp}`);
        res.json({ success: true, message: `OTP gửi đến ${phone}: ${otp}` });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 6. Verify Forgot OTP
const verifyForgotOTP = (req, res) => {
    const { phone, otp } = req.body;
    const stored = otpStorage[phone];

    if (!stored || stored.type !== 'forgot') return res.status(400).json({ success: false, message: 'OTP không hợp lệ' });
    if (Date.now() > stored.expires) {
        delete otpStorage[phone];
        return res.status(400).json({ success: false, message: 'OTP hết hạn' });
    }
    if (stored.otp !== otp) return res.status(400).json({ success: false, message: 'OTP sai' });

    delete otpStorage[phone];
    const resetToken = jwt.sign({ phone, type: 'reset_password' }, SECRET_KEY, { expiresIn: '15m' });

    res.json({ success: true, message: 'OTP chính xác', data: { resetToken } });
};

// 7. Reset Password
const resetPassword = async (req, res) => {
    const { phone, newPassword, token } = req.body;
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.phone !== phone || decoded.type !== 'reset_password') {
            return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
        }

        const result = await db.query('UPDATE users SET password = $1 WHERE phone = $2', [newPassword, phone]);
        if (result.rowCount === 0) return res.status(400).json({ success: false, message: 'User không tồn tại' });

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
        console.error('[ERROR]', err);
        return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
    }
};

// Change Password
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const userCheck = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        if (userCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'User không tồn tại' });
        if (userCheck.rows[0].password !== oldPassword) return res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác' });

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, req.user.id]);
        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Request Change Contact
const requestChangeContact = async (req, res) => {
    const { type, newValue } = req.body; // 'phone' or 'email'
    if (!['phone', 'email'].includes(type)) return res.status(400).json({ success: false, message: 'Loại thông tin không hợp lệ' });

    try {
        const check = await db.query(`SELECT id FROM users WHERE ${type} = $1`, [newValue]);
        if (check.rows.length > 0) return res.status(400).json({ success: false, message: `${type === 'phone' ? 'Số điện thoại' : 'Email'} đã được sử dụng` });

        const otp = generateOTP();
        otpStorage[req.user.id] = { otp, expires: Date.now() + 300000, type: `change_${type}`, newValue };

        console.log(`[OTP] Change ${type} for user ${req.user.id} to ${newValue}: ${otp}`);
        res.json({ success: true, message: `OTP gửi đến ${newValue}: ${otp}` });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Verify Change Contact
const verifyChangeContact = async (req, res) => {
    const { otp } = req.body;
    const stored = otpStorage[req.user.id];

    if (!stored || !stored.type.startsWith('change_')) return res.status(400).json({ success: false, message: 'OTP không hợp lệ hoặc đã hết hạn' });
    if (Date.now() > stored.expires) {
        delete otpStorage[req.user.id];
        return res.status(400).json({ success: false, message: 'OTP hết hạn' });
    }
    if (stored.otp !== otp) return res.status(400).json({ success: false, message: 'OTP sai' });

    const type = stored.type.replace('change_', '');
    const newValue = stored.newValue;

    try {
        await db.query(`UPDATE users SET ${type} = $1 WHERE id = $2`, [newValue, req.user.id]);
        delete otpStorage[req.user.id];
        res.json({
            success: true,
            message: `Cập nhật ${type === 'phone' ? 'số điện thoại' : 'email'} thành công`,
            data: { [type]: newValue }
        });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    register,
    registerOTP,
    verifyRegisterOTP,
    login,
    forgotPassword,
    verifyForgotOTP,
    resetPassword,
    changePassword,
    requestChangeContact,
    verifyChangeContact
};
