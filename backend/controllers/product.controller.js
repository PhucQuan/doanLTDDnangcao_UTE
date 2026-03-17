const db = require('../db');

// GET /api/products
const getProducts = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

        let baseQuery = ' FROM products WHERE 1=1';
        let params = [];
        let paramCount = 1;

        if (q) {
            baseQuery += ` AND (LOWER(name) LIKE $${paramCount} OR LOWER(description) LIKE $${paramCount})`;
            params.push(`%${q.toLowerCase()}%`);
            paramCount++;
        }

        if (category) {
            baseQuery += ` AND LOWER(category) = LOWER($${paramCount})`;
            params.push(category);
            paramCount++;
        }

        if (minPrice) {
            baseQuery += ` AND price >= $${paramCount}`;
            params.push(minPrice);
            paramCount++;
        }

        if (maxPrice) {
            baseQuery += ` AND price <= $${paramCount}`;
            params.push(maxPrice);
            paramCount++;
        }

        // Get total count first
        const countResult = await db.query(`SELECT COUNT(*)` + baseQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);

        // Build main query
        let query = `SELECT *` + baseQuery;

        if (sort === 'price_asc') {
            query += ' ORDER BY price ASC';
        } else if (sort === 'price_desc') {
            query += ' ORDER BY price DESC';
        } else {
            query += ' ORDER BY created_at DESC';
        }

        // Pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        res.json({
            success: true,
            data: result.rows,
            pagination: {
                totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (err) {
        console.error('[ERROR] Search products:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// GET /api/products/best-selling
const getBestSellingProducts = async (req, res) => {
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
};

// GET /api/products/discounted
const getDiscountedProducts = async (req, res) => {
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
};

// GET /api/products/:id
const getProductById = async (req, res) => {
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
};

module.exports = {
    getProducts,
    getBestSellingProducts,
    getDiscountedProducts,
    getProductById
};
