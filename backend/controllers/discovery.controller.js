const db = require('../db');

// --- Favorites Logic ---
exports.toggleFavorite = async (req, res) => {
    const { product_id } = req.body;
    const user_id = req.user.id;

    if (!product_id) return res.status(400).json({ message: 'Product ID required' });

    try {
        const check = await db.query('SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2', [user_id, product_id]);
        
        if (check.rows.length > 0) {
            await db.query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2', [user_id, product_id]);
            return res.json({ message: 'Removed from favorites', isFavorite: false });
        } else {
            await db.query('INSERT INTO favorites (user_id, product_id) VALUES ($1, $2)', [user_id, product_id]);
            return res.json({ message: 'Added to favorites', isFavorite: true });
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getFavorites = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await db.query(
            'SELECT p.* FROM products p JOIN favorites f ON p.id = f.product_id WHERE f.user_id = $1',
            [user_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- Recently Viewed Logic ---
exports.trackView = async (req, res) => {
    const { product_id } = req.body;
    const user_id = req.user.id;

    if (!product_id) return res.status(400).json({ message: 'Product ID required' });

    try {
        await db.query('INSERT INTO viewed_products (user_id, product_id) VALUES ($1, $2)', [user_id, product_id]);
        res.json({ message: 'View tracked' });
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getRecentlyViewed = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await db.query(
            `SELECT DISTINCT ON (p.id) p.*, vp.viewed_at 
             FROM products p 
             JOIN viewed_products vp ON p.id = vp.product_id 
             WHERE vp.user_id = $1 
             ORDER BY p.id, vp.viewed_at DESC 
             LIMIT 10`,
            [user_id]
        );
        res.json(result.rows.sort((a, b) => new Date(b.viewed_at) - new Date(a.viewed_at)));
    } catch (error) {
        console.error('Error fetching recently viewed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- Similar Products & Stats ---
exports.getProductDiscovery = async (req, res) => {
    const { productId } = req.params;

    try {
        // 1. Get similar products (same category)
        const productRes = await db.query('SELECT category FROM products WHERE id = $1', [productId]);
        if (productRes.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        
        const category = productRes.rows[0].category;
        const similar = await db.query(
            'SELECT * FROM products WHERE category = $1 AND id != $2 LIMIT 6',
            [category, productId]
        );

        // 2. Stats (buyer count and review count)
        const stats = await db.query(
            `SELECT 
                (SELECT COUNT(DISTINCT order_id) FROM order_items WHERE product_id = $1) as buy_count,
                (SELECT COUNT(*) FROM reviews WHERE product_id = $1) as review_count`,
            [productId]
        );

        res.json({
            similarProducts: similar.rows,
            stats: stats.rows[0]
        });
    } catch (error) {
        console.error('Error fetching discovery data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
