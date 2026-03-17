-- Migration to add loyalty system and reviews

-- Update users table to include points
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id) -- One review per user per product
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
);

-- Create viewed_products table
CREATE TABLE IF NOT EXISTS viewed_products (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_amount DECIMAL(15,0) NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'fixed', -- 'fixed' or 'percentage'
    min_order_amount DECIMAL(15,0) DEFAULT 0,
    max_discount DECIMAL(15,0),
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_vouchers table (to track owned vouchers)
CREATE TABLE IF NOT EXISTS user_vouchers (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voucher_id INT NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed some initial vouchers
INSERT INTO vouchers (code, description, discount_amount, discount_type, min_order_amount)
VALUES 
('WELCOME10', 'Welcome discount for new members', 10000, 'fixed', 50000),
('REVIEWTOP', 'Review reward discount', 20000, 'fixed', 100000)
ON CONFLICT (code) DO NOTHING;
