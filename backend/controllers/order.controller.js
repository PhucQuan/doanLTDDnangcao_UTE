const db = require('../db');

// POST /api/orders
const createOrder = async (req, res) => {
    const { total_amount, shipping_address, receiver_name, receiver_phone, note, payment_method = 'COD', items, voucher_id, points_used = 0 } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    try {
        await db.query('BEGIN');

        // 1. Validate and handle points
        if (points_used > 0) {
            const userRes = await db.query('SELECT points FROM users WHERE id = $1', [req.user.id]);
            if (userRes.rows[0].points < points_used) {
                throw new Error('Insufficient points');
            }
            await db.query('UPDATE users SET points = points - $1 WHERE id = $2', [points_used, req.user.id]);
        }

        // 2. Validate and handle voucher
        if (voucher_id) {
            const voucherRes = await db.query(
                'UPDATE user_vouchers SET is_used = TRUE, used_at = NOW() WHERE user_id = $1 AND voucher_id = $2 AND is_used = FALSE RETURNING id',
                [req.user.id, voucher_id]
            );
            if (voucherRes.rows.length === 0) {
                throw new Error('Voucher invalid or already used');
            }
        }

        // 3. Create order
        const orderResult = await db.query(
            `INSERT INTO orders (user_id, total_amount, shipping_address, receiver_name, receiver_phone, payment_method, note) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.id, total_amount, shipping_address, receiver_name, receiver_phone, payment_method, note]
        );
        const orderId = orderResult.rows[0].id;

        for (let item of items) {
            await db.query(
                `INSERT INTO order_items (order_id, product_id, product_name, product_image, product_category, price, quantity, size) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [orderId, item.product_id, item.name, item.image, item.category, item.price, item.quantity, item.size]
            );
        }

        await db.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
        await db.query('COMMIT');

        res.json({ success: true, data: orderResult.rows[0], message: 'Đặt hàng thành công' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('[ERROR] Create order:', err.message);
        res.status(400).json({ success: false, message: err.message || 'Lỗi khi đặt hàng' });
    }
};

// GET /api/orders
const getOrders = async (req, res) => {
    try {
        const query = `
            SELECT * FROM orders 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await db.query(query, [req.user.id]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('[ERROR] Get orders:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const orderResult = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const itemsResult = await db.query('SELECT * FROM order_items WHERE order_id = $1', [id]);

        res.json({
            success: true,
            data: {
                ...orderResult.rows[0],
                items: itemsResult.rows
            }
        });
    } catch (err) {
        console.error('[ERROR] Get order detail:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// PATCH /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (order.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const currentOrder = order.rows[0];
        const now = new Date();
        const createdDate = new Date(currentOrder.created_at);
        const diffMinutes = Math.floor((now.getTime() - createdDate.getTime()) / 60000);

        if (currentOrder.status >= 3 || diffMinutes > 30) {
            await db.query('UPDATE orders SET cancel_request = TRUE WHERE id = $1', [id]);
            return res.json({ success: true, message: 'Đã gửi yêu cầu hủy đơn hàng cho Shop' });
        }

        await db.query(
            'UPDATE orders SET status = 6, cancelled_at = NOW() WHERE id = $1 RETURNING *',
            [id]
        );
        res.json({ success: true, message: 'Đã hủy đơn hàng thành công' });
    } catch (err) {
        console.error('[ERROR] Cancel order:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// PATCH /api/orders/:id/status (Admin)
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng' });
    } catch (err) {
        console.error('[ERROR] Update order status:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus
};
