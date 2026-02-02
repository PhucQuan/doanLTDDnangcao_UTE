-- Migration to create products table and seed data
-- Run this SQL in your PostgreSQL database

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for search performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Seed Data (Mobile Phones & Accessories)
INSERT INTO products (name, description, price, category, image) VALUES 
('iPhone 15 Pro Max', 'Apple iPhone 15 Pro Max 256GB Titan Tự nhiên. Chip A17 Pro, khung viền titan.', 34990000, 'smartphone', 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg'),
('Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24 Ultra 5G 256GB. Quyền năng Galaxy AI, Zoom mắt thần bóng đêm.', 31990000, 'smartphone', 'https://cdn.tgdd.vn/Products/Images/42/307172/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg'),
('Xiaomi Redmi Note 13', 'Xiaomi Redmi Note 13 (6GB/128GB). Màn hình AMOLED 120Hz, Camera 108MP.', 4890000, 'smartphone', 'https://cdn.tgdd.vn/Products/Images/42/309831/xiaomi-redmi-note-13-gold-thumb-600x600.jpg'),
('iPhone 13', 'Apple iPhone 13 128GB. Thiết kế sang trọng, hiệu năng mạnh mẽ.', 13990000, 'smartphone', 'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-13-pink-thumb-600x600.jpg'),
('OPPO Reno11 F 5G', 'OPPO Reno11 F 5G 8GB/256GB. Chuyên gia chân dung, thiết kế vân đá.', 8990000, 'smartphone', 'https://cdn.tgdd.vn/Products/Images/42/320875/oppo-reno11-f-violet-thumb-600x600.jpg'),
('MacBook Air M1 2020', 'Laptop Apple MacBook Air 13 inch M1 2020 8-core CPU/8GB/256GB/7-core GPU', 18490000, 'laptop', 'https://cdn.tgdd.vn/Products/Images/44/231244/macbook-air-m1-2020-gray-600x600.jpg'),
('AirPods Pro 2', 'Tai nghe Bluetooth AirPods Pro (2nd Gen) MagSafe Charge (USB-C) Apple', 5990000, 'accessory', 'https://cdn.tgdd.vn/Products/Images/54/316135/airpods-pro-2-usb-c-thumb-600x600.jpg'),
('Sony WH-1000XM5', 'Tai nghe chụp tai Bluetooth Sony WH-1000XM5. Chống ồn đỉnh cao.', 7990000, 'accessory', 'https://cdn.tgdd.vn/Products/Images/54/281358/sony-wh-1000xm5-den-1-1.jpg'),
('Sạc dự phòng Anker', 'Pin sạc dự phòng 20000mAh 22.5W Anker PowerCore III Sense', 1200000, 'accessory', 'https://cdn.tgdd.vn/Products/Images/57/247656/pin-sac-du-phong-20000mah-22-5w-anker-powercore-iii-sense-a1366-thumb-600x600.jpeg'),
('iPad Air 5 M1', 'iPad Air 5 M1 WiFi 64GB. Sức mạnh chip M1, màn hình Liquid Retina.', 14990000, 'tablet', 'https://cdn.tgdd.vn/Products/Images/52/247517/ipad-air-5-m1-wifi-sao-600x600.jpg')
ON CONFLICT DO NOTHING;
