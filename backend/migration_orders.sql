-- Migration: Cart Items, Orders, Order Items
-- Run this after init.sql

-- Giỏ hàng
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    size VARCHAR(10) DEFAULT '40',
    UNIQUE(user_id, product_id, size)
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

-- Đơn hàng
-- status: 1=Đơn mới, 2=Đã xác nhận, 3=Đang chuẩn bị, 4=Đang giao, 5=Đã giao, 6=Đã hủy
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    total_amount DECIMAL(15,0) NOT NULL,
    shipping_address TEXT NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'COD',
    status INT DEFAULT 1,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancel_request BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Chi tiết đơn hàng (snapshot sản phẩm lúc mua)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    product_category VARCHAR(100),
    price DECIMAL(15,0) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    size VARCHAR(10) DEFAULT '40'
);
