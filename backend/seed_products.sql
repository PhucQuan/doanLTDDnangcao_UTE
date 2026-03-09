-- =============================================
-- SEED DATA: Giày bóng rổ demo
-- Chạy lệnh: psql -U postgres -d <tên_db> -f seed_products.sql
-- =============================================

-- Tạo bảng categories nếu chưa có
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng products nếu chưa có
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,0) NOT NULL,
    image VARCHAR(500),
    category VARCHAR(100),
    sales_count INTEGER DEFAULT 0,
    discount_percent INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm categories
INSERT INTO categories (name, icon) VALUES
('Bóng rổ', 'basketball'),
('Chạy bộ', 'run'),
('Lifestyle', 'shoe-formal'),
('Training', 'dumbbell'),
('Outdoor', 'hiking')
ON CONFLICT DO NOTHING;

-- Xóa sản phẩm cũ nếu muốn reset
-- DELETE FROM products;

-- Thêm 25 sản phẩm giày bóng rổ demo
-- (Đủ để lấy top 10 bán chạy + 20 giảm giá)
INSERT INTO products (name, description, price, image, category, sales_count, discount_percent, stock) VALUES

-- Top bán chạy (sales_count cao)
('Nike Air Jordan 1 Retro High OG', 'Giày bóng rổ huyền thoại Jordan 1, phong cách vượt thời gian. Đế Air giảm chấn tối ưu.', 3500000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Bóng rổ', 1250, 10, 50),

('Nike LeBron 21 "The Chosen One"', 'Giày signature của LeBron James. Đế Zoom Air phản hồi nhanh, ôm chân hoàn hảo.', 4200000, 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400', 'Bóng rổ', 980, 15, 30),

('Adidas Harden Vol. 7', 'Thiết kế dành riêng cho James Harden. Công nghệ Lightstrike cushioning siêu nhẹ.', 3800000, 'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=400', 'Bóng rổ', 870, 20, 45),

('Nike KD 16 Kevin Durant', 'Giày bóng rổ của talent KD. Zoom Strobel + Zoom Air unit tối ưu hiệu suất.', 4500000, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400', 'Bóng rổ', 760, 5, 25),

('Under Armour Curry 11', 'Giày của Stephen Curry. UA Flow công nghệ không cần đế ngoài, siêu bám sàn.', 3900000, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400', 'Bóng rổ', 720, 25, 60),

('Nike Zoom Freak 5 Giannis', 'Giày của Giannis Antetokounmpo. Zoom Air ở mũi và gót, tăng tốc độ phản ứng.', 3600000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Bóng rổ', 650, 30, 40),

('New Balance TWO WXY v3', 'Công nghệ FuelCell cushioning. Thiết kế low-cut linh hoạt trên sân.', 3200000, 'https://images.unsplash.com/photo-1584735175315-9d5df23be538?w=400', 'Bóng rổ', 590, 0, 35),

('Puma Stewie 2 "Pearl"', 'Giày signature của Breanna Stewart. Nhẹ và bám sàn tốt.', 2900000, 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=400', 'Bóng rổ', 510, 35, 55),

('Nike Air Jordan 36', 'Thế hệ Jordan mới nhất. Đế Eclipse Plate phản lực nhanh nhất từ trước đến nay.', 4800000, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400', 'Bóng rổ', 480, 0, 20),

('Adidas D.O.N. Issue 5', 'Giày của Donovan Mitchell. Boost cushioning thoải mái cả ngày trên sân.', 3100000, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400', 'Bóng rổ', 430, 20, 65),

-- Thêm sản phẩm cho bảng giảm giá
('Nike Air Jordan 4 Retro "Military Blue"', 'Classic Jordan 4 với màu Military Blue iconic. Air unit ở gót giảm chấn hoàn hảo.', 5200000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Bóng rổ', 320, 30, 15),

('Adidas Icon 7 Boost Mid', 'Đế Boost full-length, ôm chân tuyệt vời. Phiên bản mid-cut hỗ trợ mắt cá chân.', 2800000, 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400', 'Bóng rổ', 290, 35, 70),

('Reebok Question Mid "Answer"', 'Phong cách Allen Iverson huyền thoại. DMX cushioning tối ưu trên sàn.', 3300000, 'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=400', 'Bóng rổ', 250, 25, 30),

('Nike Hyperdunk X Low', 'Thiết kế low-cut nhẹ nhàng. Phù hợp cho cầu thủ chạy nhanh có phong cách tấn công.', 2600000, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400', 'Bóng rổ', 210, 20, 80),

('Under Armour HOVR Havoc 4', 'Công nghệ HOVR giảm chấn cực tốt. Cổ giày cao bảo vệ mắt cá khi xoay người.', 2400000, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400', 'Bóng rổ', 190, 15, 50),

('Jordan Zion 3 "Rising"', 'Giày của Zion Williamson. Zoom Air hỗ trợ cầu thủ nặng ký nhảy và đáp đất.', 3700000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Bóng rổ', 170, 30, 25),

('New Balance Kawhi "KAI 1"', 'Thiết kế ổn định và giảm chấn cao từ FuelCell. Dành cho cầu thủ 2 chiều.', 4100000, 'https://images.unsplash.com/photo-1584735175315-9d5df23be538?w=400', 'Bóng rổ', 150, 10, 30),

('Converse All Star Pro BB "Ox"', 'Phiên bản hiện đại của giày huyền thoại Converse. Full-length Lunarlon.', 2200000, 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=400', 'Bóng rổ', 130, 35, 45),

('Nike Air Max Impact 4', 'Air Max chuyên dụng cho bóng rổ. Thoải mái cả ngày, bám sàn tốt trong nhà.', 1900000, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400', 'Bóng rổ', 110, 20, 90),

('Adidas Pro Bounce 2019', 'Đế Bounce nhẹ nhàng và đàn hồi. Phù hợp cho người mới bắt đầu.', 1600000, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400', 'Bóng rổ', 95, 30, 100),

('Peak Lou Williams PK55', 'Giày ký kết Lou Williams. Đế PK Cushion thoải mái khi thi đấu dài hơi.', 1800000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Bóng rổ', 80, 25, 60),

('Li-Ning Way of Wade 10', 'Giày cao cấp của Dwyane Wade x Li-Ning. Đế Wade cùng mũi carbon fiber.', 3400000, 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400', 'Bóng rổ', 70, 15, 20),

('361° Big3 Pro', 'Đế QU!KFOAM cushioning phản hồi nhanh. Thiết kế hỗ trợ cầu thủ chơi dưới rổ.', 2100000, 'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=400', 'Bóng rổ', 55, 35, 75),

('Spalding Phantom Elite', 'Giày bóng rổ giá tốt, phù hợp tập luyện hàng ngày. Đế cao su bám sàn tốt.', 1200000, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400', 'Bóng rổ', 40, 20, 120),

('Nike Air Precision III', 'Lựa chọn entry-level tuyệt vời. Phù hợp chơi sân ngoài trời hoặc trong nhà.', 1500000, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400', 'Bóng rổ', 30, 10, 150);

SELECT 'Seed data inserted successfully! Total products: ' || COUNT(*) AS status FROM products;
SELECT 'Total categories: ' || COUNT(*) AS status FROM categories;
