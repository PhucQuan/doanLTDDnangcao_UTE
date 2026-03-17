const db = require('../db');

exports.getAvailableVouchers = async (req, res) => {
    const user_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT v.*, uv.is_used 
             FROM vouchers v 
             LEFT JOIN user_vouchers uv ON v.id = uv.voucher_id AND uv.user_id = $1 
             WHERE v.expiry_date IS NULL OR v.expiry_date > NOW()`,
            [user_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.applyVoucher = async (req, res) => {
    const { code, orderAmount } = req.body;
    const user_id = req.user.id;

    try {
        const voucherRes = await db.query(
            'SELECT * FROM vouchers WHERE code = $1',
            [code]
        );

        if (voucherRes.rows.length === 0) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        const voucher = voucherRes.rows[0];

        // Check ownership
        const ownershipRes = await db.query(
            'SELECT * FROM user_vouchers WHERE user_id = $1 AND voucher_id = $2 AND is_used = FALSE',
            [user_id, voucher.id]
        );

        if (ownershipRes.rows.length === 0) {
            return res.status(400).json({ message: 'You do not own this voucher or it has been used' });
        }

        // Check min order amount
        if (orderAmount < voucher.min_order_amount) {
            return res.status(400).json({ 
                message: `Minimum order amount for this voucher is ${voucher.min_order_amount}` 
            });
        }

        let discount = 0;
        if (voucher.discount_type === 'percentage') {
            discount = (orderAmount * voucher.discount_amount) / 100;
            if (voucher.max_discount && discount > voucher.max_discount) {
                discount = voucher.max_discount;
            }
        } else {
            discount = voucher.discount_amount;
        }

        res.json({
            message: 'Voucher applied successfully',
            discount,
            voucherId: voucher.id
        });
    } catch (error) {
        console.error('Error applying voucher:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUserPoints = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await db.query('SELECT points FROM users WHERE id = $1', [user_id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching points:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
