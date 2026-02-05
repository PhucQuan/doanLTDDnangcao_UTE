-- Migration to enhance products table with sales and discount tracking
-- Run this SQL in your PostgreSQL database

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON products(sales_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_discount_percent ON products(discount_percent DESC);

-- Update existing products with sample sales_count and discount_percent
-- This simulates realistic sales data

UPDATE products SET sales_count = 1523, discount_percent = 15.0 WHERE name = 'iPhone 15 Pro Max';
UPDATE products SET sales_count = 1342, discount_percent = 20.0 WHERE name = 'Samsung Galaxy S24 Ultra';
UPDATE products SET sales_count = 2847, discount_percent = 25.0 WHERE name = 'Xiaomi Redmi Note 13';
UPDATE products SET sales_count = 987, discount_percent = 30.0 WHERE name = 'iPhone 13';
UPDATE products SET sales_count = 1654, discount_percent = 18.0 WHERE name = 'OPPO Reno11 F 5G';
UPDATE products SET sales_count = 756, discount_percent = 12.0 WHERE name = 'MacBook Air M1 2020';
UPDATE products SET sales_count = 2234, discount_percent = 22.0 WHERE name = 'AirPods Pro 2';
UPDATE products SET sales_count = 834, discount_percent = 10.0 WHERE name = 'Sony WH-1000XM5';
UPDATE products SET sales_count = 1876, discount_percent = 35.0 WHERE name = 'Sạc dự phòng Anker';
UPDATE products SET sales_count = 654, discount_percent = 8.0 WHERE name = 'iPad Air 5 M1';

-- Add more sample products with different discount levels
INSERT INTO products (name, description, price, category, image, sales_count, discount_percent) VALUES 
('Samsung Galaxy Z Fold 5', 'Samsung Galaxy Z Fold 5 512GB. Điện thoại gập cao cấp, màn hình Dynamic AMOLED 2X.', 44990000, 'smartphone', 'https://cdn.tgdd.vn/Products/Images/42/309816/samsung-galaxy-z-fold5-kem-256gb-thumb-600x600.jpg', 432, 28.0),
('AirPods 3', 'Tai nghe Bluetooth Apple AirPods 3 Lightning Charge. Âm thanh không gian, chống nước IPX4.', 4590000, 'accessory', 'https://cdn.tgdd.vn/Products/Images/54/289781/airpods-3-lightning-thumb-1-600x600.jpg', 1987, 16.0),
('iPad Gen 10', 'iPad Gen 10 2022 10.9 inch WiFi 64GB. Màn hình Liquid Retina, chip A14 Bionic.', 10990000, 'tablet', 'https://cdn.tgdd.vn/Products/Images/52/285930/ipad-gen-10-2022-blue-thumb-600x600.jpg', 876, 14.0),
('Apple Watch Series 9', 'Apple Watch Series 9 GPS 41mm. Màn hình luôn bật, chip S9 mạnh mẽ.', 10990000, 'watch', 'https://cdn.tgdd.vn/Products/Images/7077/316554/apple-watch-s9-lte-41mm-vien-nhom-day-silicone-thumb-600x600.jpg', 543, 11.0),
('Samsung Galaxy Buds2 Pro', 'Tai nghe Bluetooth Samsung Galaxy Buds2 Pro. Chống ồn thông minh, âm thanh Hi-Fi.', 3990000, 'accessory', 'https://cdn.tgdd.vn/Products/Images/54/289781/airpods-3-lightning-thumb-1-600x600.jpg', 1543, 24.0),
('Dell XPS 13', 'Laptop Dell XPS 13 9315 i5 1230U/8GB/512GB/Win11. Thiết kế mỏng nhẹ, màn hình InfinityEdge.', 26990000, 'laptop', 'https://cdn.tgdd.vn/Products/Images/44/289099/dell-xps-13-9315-i5-71003775-glr-1-600x600.jpg', 234, 19.0),
('JBL Flip 6', 'Loa Bluetooth JBL Flip 6. Chống nước IP67, âm bass mạnh mẽ, pin 12 giờ.', 2990000, 'audio', 'https://cdn.tgdd.vn/Products/Images/2162/247842/loa-bluetooth-jbl-flip-6-den-thumb-1-600x600.jpg', 1234, 27.0),
('Xiaomi Pad 6', 'Xiaomi Pad 6 8GB/128GB. Màn hình 11 inch 144Hz, chip Snapdragon 870.', 7990000, 'tablet', 'https://cdn.tgdd.vn/Products/Images/52/306176/xiaomi-pad-6-xam-thumb-600x600.jpg', 765, 21.0),
('Realme 11 Pro', 'Realme 11 Pro 5G 8GB/256GB. Camera 100MP, sạc nhanh 67W, thiết kế da thuần chay.', 8990000, 'smartphone', 'https://cdn.tgdd.vn/Products/Images/42/307217/realme-11-pro-xanh-thumb-1-600x600.jpg', 1432, 23.0),
('Logitech G502', 'Chuột Gaming Logitech G502 Hero. Cảm biến Hero 25K, 11 nút lập trình được.', 1290000, 'accessory', 'https://cdn.tgdd.vn/Products/Images/86/195230/chuot-gaming-logitech-g502-hero-den-thumb-600x600.jpg', 2134, 32.0)
ON CONFLICT DO NOTHING;
