const db = require('../db');

// GET /api/profile
const getProfile = async (req, res) => {
    try {
        const result = await db.query('SELECT id, phone, name, email, avatar, role FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User không tồn tại' });
        }
        res.json({ success: true, data: { user: result.rows[0] } });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
    const { name, avatar } = req.body;
    try {
        const result = await db.query(
            'UPDATE users SET name = $1, avatar = $2 WHERE id = $3 RETURNING id, phone, name, email, avatar, role',
            [name, avatar, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User không tồn tại' });
        }
        res.json({ success: true, message: 'Cập nhật thông tin thành công', data: { user: result.rows[0] } });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// GET /api/users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const result = await db.query('SELECT id, phone, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, data: { users: result.rows } });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// DELETE /api/users/:id (Admin only)
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await db.query('DELETE FROM users WHERE id = $1', [userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User không tồn tại' });
        }
        res.json({ success: true, message: 'Xóa user thành công' });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAllUsers,
    deleteUser
};
