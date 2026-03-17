const db = require('../db');

const getCategories = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
        console.log(`[SUCCESS] Retrieved ${result.rows.length} categories`);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('[ERROR] Get categories:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    getCategories
};
