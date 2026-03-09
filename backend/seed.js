// =============================================
// Seed script: chạy lệnh node seed.js
// =============================================
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function seed() {
    const client = await pool.connect();
    try {
        console.log('🔗 Đang kết nối database...');

        // Tạo bảng categories
        await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Tạo bảng products
        await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,0) NOT NULL,
        image VARCHAR(500),
        category VARCHAR(100),
        sales_count INTEGER DEFAULT 0,
        discount_percent INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Thêm các cột còn thiếu nếu bảng cũ chưa có
        const alterColumns = [
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0`,
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0`,
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS image VARCHAR(500)`,
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100)`,
        ];
        for (const sql of alterColumns) {
            try { await client.query(sql); } catch (e) { /* column exists */ }
        }

        console.log('✅ Tables created/updated.');

        // Xóa data cũ
        await client.query('DELETE FROM products');
        await client.query('DELETE FROM categories');
        console.log('🗑️  Old data cleared.');

        // Thêm categories
        await client.query(`
      INSERT INTO categories (name, icon) VALUES
      ('Bóng rổ', 'basketball'),
      ('Chạy bộ', 'run'),
      ('Lifestyle', 'shoe-formal'),
      ('Training', 'dumbbell'),
      ('Outdoor', 'hiking');
    `);
        console.log('✅ Categories seeded.');

        // Thêm 25 sản phẩm giày bóng rổ
        const products = [
            // Top 10 bán chạy (sales_count cao)
            ['Nike Air Jordan 1 Retro High OG "Chicago"', 'Giày bóng rổ huyền thoại Jordan 1 màu Chicago. Đế Air giảm chấn tối ưu, cổ cao bảo vệ mắt cá.', 3500000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 'Bóng rổ', 1250, 10],
            ['Nike LeBron 21 "The Chosen One"', 'Giày signature của LeBron James. Zoom Air phản hồi nhanh, ôm chân hoàn hảo cho cầu thủ to con.', 4200000, 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=500&q=80', 'Bóng rổ', 980, 15],
            ['Adidas Harden Vol. 7 "Harden Be Legendary"', 'Thiết kế dành riêng cho James Harden. Lightstrike cushioning siêu nhẹ, spin move thoải mái.', 3800000, 'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=500&q=80', 'Bóng rổ', 870, 20],
            ['Nike KD 16 "Kevin Durant PE"', 'Giày bóng rổ của Kevin Durant. Zoom Strobel + Zoom Air unit tối ưu hiệu suất trên sân.', 4500000, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=500&q=80', 'Bóng rổ', 760, 5],
            ['Under Armour Curry 11 "Golden"', 'Giày của Stephen Curry. UA Flow không cần đế ngoài, siêu bám sàn, phù hợp shooting guard.', 3900000, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80', 'Bóng rổ', 720, 25],
            ['Nike Zoom Freak 5 "Giannis"', 'Giày của Giannis Antetokounmpo. Zoom Air ở mũi và gót, bàn chân rộng vẫn thoải mái.', 3600000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 'Bóng rổ', 650, 30],
            ['New Balance TWO WXY v3', 'Công nghệ FuelCell cushioning. Thiết kế low-cut linh hoạt, phù hợp cầu thủ tốc độ.', 3200000, 'https://images.unsplash.com/photo-1584735175315-9d5df23be538?w=500&q=80', 'Bóng rổ', 590, 0],
            ['Puma Stewie 2 "Pearl Edition"', 'Giày signature của Breanna Stewart. Nhẹ và bám sàn tốt, phù hợp cả nam và nữ.', 2900000, 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=500&q=80', 'Bóng rổ', 510, 35],
            ['Nike Air Jordan 36 Low', 'Thế hệ Jordan mới nhất phiên bản low. Eclipse Plate phản lực nhanh nhất lịch sử Jordan.', 4800000, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&q=80', 'Bóng rổ', 480, 0],
            ['Adidas D.O.N. Issue 5', 'Giày của Donovan Mitchell. Boost cushioning thoải mái cả ngày, phù hợp chơi nhiều vị trí.', 3100000, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80', 'Bóng rổ', 430, 20],
            ['Nike Air Jordan 4 "Military Blue"', 'Classic Jordan 4 màu Military Blue iconic. Air unit gót và chất liệu suede sang trọng.', 5200000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 'Bóng rổ', 320, 30],
            ['Adidas Exhibit B Mid', 'Đế Boost full-length, ôm chân tuyệt vời. Phiên bản mid-cut hỗ trợ mắt cá chân tốt.', 2800000, 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=500&q=80', 'Bóng rổ', 290, 35],
            ['Reebok Question Mid', 'Phong cách Allen Iverson huyền thoại. DMX cushioning tối ưu, thiết kế retro classic.', 3300000, 'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=500&q=80', 'Bóng rổ', 250, 25],
            ['Nike Hyperdunk X Low', 'Thiết kế low-cut nhẹ nhàng. Phù hợp cầu thủ chạy nhanh, phong cách tấn công linh hoạt.', 2600000, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=500&q=80', 'Bóng rổ', 210, 20],
            ['Under Armour HOVR Havoc 4', 'Công nghệ HOVR giảm chấn. Cổ cao bảo vệ mắt cá khi xoay người đột ngột.', 2400000, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80', 'Bóng rổ', 190, 15],
            ['Jordan Zion 3 "Rising"', 'Giày của Zion Williamson. Zoom Air siêu chịu lực cho cầu thủ nặng ký nhảy và đáp đất mạnh.', 3700000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 'Bóng rổ', 170, 30],
            ['New Balance Kawhi KAI 1', 'FuelCell cushioning ổn định và giảm chấn cao. Dành cho cầu thủ 2 chiều hoàn hảo.', 4100000, 'https://images.unsplash.com/photo-1584735175315-9d5df23be538?w=500&q=80', 'Bóng rổ', 150, 10],
            ['Converse All Star Pro BB', 'Phiên bản hiện đại của giày huyền thoại Converse. Lunarlon cushioning thoải mái.', 2200000, 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=500&q=80', 'Bóng rổ', 130, 35],
            ['Nike Air Max Impact 4', 'Air Max chuyên dụng cho bóng rổ. Thoải mái cả ngày, bám sàn tốt cả trong nhà lẫn ngoài trời.', 1900000, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&q=80', 'Bóng rổ', 110, 20],
            ['Adidas Pro Bounce 2019', 'Đế Bounce nhẹ nhàng và đàn hồi. Lựa chọn hoàn hảo cho người mới bắt đầu chơi bóng rổ.', 1600000, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80', 'Bóng rổ', 95, 30],
            ['Peak Lou Williams PK55', 'Giày ký kết Lou Williams. PK Cushion êm ái khi thi đấu dài hơi, đế cao su siêu bám.', 1800000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 'Bóng rổ', 80, 25],
            ['Li-Ning Way of Wade 10', 'Giày cao cấp của Dwyane Wade x Li-Ning. Mũi carbon fiber bật nhanh, đế Wade siêu bền.', 3400000, 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=500&q=80', 'Bóng rổ', 70, 15],
            ['361 Big3 Pro Competition', 'QU!KFOAM cushioning phản hồi nhanh. Thiết kế ổn định hỗ trợ cầu thủ chơi dưới rổ.', 2100000, 'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=500&q=80', 'Bóng rổ', 55, 35],
            ['Spalding Momentum Elite', 'Giày bóng rổ tập luyện giá tốt. Đế cao su bám sàn tốt, phù hợp sân gỗ và sân xi măng.', 1200000, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=500&q=80', 'Bóng rổ', 40, 20],
            ['Nike Air Precision III', 'Entry-level tuyệt vời cho học sinh sinh viên. Thoải mái cả ngày, phù hợp mọi sân bóng rổ.', 1500000, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80', 'Bóng rổ', 30, 10],
        ];

        for (const p of products) {
            await client.query(
                `INSERT INTO products (name, description, price, image, category, sales_count, discount_percent) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                p
            );
        }

        console.log(`✅ Đã thêm ${products.length} sản phẩm giày bóng rổ!`);
        console.log('🎉 Seed hoàn tất!');

    } catch (err) {
        console.error('❌ Lỗi seed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
