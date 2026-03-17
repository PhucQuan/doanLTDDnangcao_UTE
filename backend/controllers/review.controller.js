const db = require('../db');

exports.createReview = async (req, res) => {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!product_id || !rating) {
        return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    try {
        // Check if user has already reviewed this product
        const existingReview = await db.query(
            'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
            [user_id, product_id]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Insert review
        await db.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4)',
            [user_id, product_id, rating, comment]
        );

        // Award points (e.g., 50 points per review)
        await db.query(
            'UPDATE users SET points = points + 50 WHERE id = $1',
            [user_id]
        );

        // Check if user should get a voucher (bonus logic)
        // For simplicity, let's say every 5th review gets a voucher
        const reviewCountRes = await db.query('SELECT COUNT(*) FROM reviews WHERE user_id = $1', [user_id]);
        const reviewCount = parseInt(reviewCountRes.rows[0].count);

        let voucherAwarded = null;
        if (reviewCount % 5 === 0) {
            const voucherRes = await db.query('SELECT id, code FROM vouchers WHERE code = $1', ['REVIEWTOP']);
            if (voucherRes.rows.length > 0) {
                const voucherId = voucherRes.rows[0].id;
                await db.query(
                    'INSERT INTO user_vouchers (user_id, voucher_id) VALUES ($1, $2)',
                    [user_id, voucherId]
                );
                voucherAwarded = voucherRes.rows[0].code;
            }
        }

        res.status(201).json({
            message: 'Review submitted successfully. You earned 50 points!',
            voucherAwarded
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getProductReviews = async (req, res) => {
    const { productId } = req.params;

    try {
        const reviews = await db.query(
            `SELECT r.*, u.name as user_name 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = $1 
             ORDER BY r.created_at DESC`,
            [productId]
        );

        res.json(reviews.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
