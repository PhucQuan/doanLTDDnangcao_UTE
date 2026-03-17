const db = require('../db');

// GET /api/cart
const getCart = async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.product_id, c.quantity, c.size, 
                   p.name, p.price, p.image, p.category 
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = $1
            ORDER BY c.id DESC
        `;
        const result = await db.query(query, [req.user.id]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('[ERROR] Get cart:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// POST /api/cart
const addToCart = async (req, res) => {
    const { product_id, quantity = 1, size = '40' } = req.body;
    try {
        const check = await db.query(
            'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3',
            [req.user.id, product_id, size]
        );

        if (check.rows.length > 0) {
            const newQty = check.rows[0].quantity + quantity;
            const result = await db.query(
                'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
                [newQty, check.rows[0].id]
            );
            res.json({ success: true, data: result.rows[0], message: 'Đã cập nhật số lượng' });
        } else {
            const result = await db.query(
                'INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES ($1, $2, $3, $4) RETURNING *',
                [req.user.id, product_id, quantity, size]
            );
            res.json({ success: true, data: result.rows[0], message: 'Đã thêm vào giỏ hàng' });
        }
    } catch (err) {
        console.error('[ERROR] Add to cart:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// PUT /api/cart/:id
const updateCartItem = async (req, res) => {
    const { quantity } = req.body;
    const { id } = req.params;
    try {
        const result = await db.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [quantity, id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ' });
        }
        res.json({ success: true, data: result.rows[0], message: 'Cập nhật số lượng thành công' });
    } catch (err) {
        console.error('[ERROR] Update cart:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// DELETE /api/cart/:id
const deleteCartItem = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ' });
        }
        res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
    } catch (err) {
        console.error('[ERROR] Delete cart item:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
    try {
        await db.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
        res.json({ success: true, message: 'Đã làm sạch giỏ hàng' });
    } catch (err) {
        console.error('[ERROR] Clear cart:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    deleteCartItem,
    clearCart
};
