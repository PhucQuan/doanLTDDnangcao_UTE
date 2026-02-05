-- Migration to create categories table and seed data
-- Run this SQL in your PostgreSQL database

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100),
    image VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Seed Data (Product Categories)
INSERT INTO categories (name, icon, image, description) VALUES 
('Smartphone', 'cellphone', 'https://cdn.tgdd.vn/Category/42/sieu-sale-11-11-220x48.png', 'Điện thoại thông minh các hãng'),
('Laptop', 'laptop', 'https://cdn.tgdd.vn/Category/44/laptop-dell-220x48-1.png', 'Máy tính xách tay'),
('Tablet', 'tablet', 'https://cdn.tgdd.vn/Category/522/ipad-pro-m4-11-inch-220x48.png', 'Máy tính bảng iPad, Samsung Galaxy Tab'),
('Accessory', 'headphones', 'https://cdn.tgdd.vn/Category/54/tai-nghe-chup-tai-2-220x48.png', 'Phụ kiện công nghệ'),
('Watch', 'watch', 'https://cdn.tgdd.vn/Category/7077/apple-watch-se-2023-220x48.png', 'Đồng hồ thông minh'),
('Audio', 'speaker', 'https://cdn.tgdd.vn/Category/2162/loa-jbl-220x48.png', 'Tai nghe, loa, âm thanh')
ON CONFLICT (name) DO NOTHING;
