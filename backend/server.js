const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Routes
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const reviewRoutes = require('./routes/review.routes');
const discoveryRoutes = require('./routes/discovery.routes');
const voucherRoutes = require('./routes/voucher.routes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// ===================================
// API ROUTES
// ===================================

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/vouchers', voucherRoutes);

// ===================================
// START SERVER
// ===================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Also accessible at http://10.0.230.24:${PORT}`);
    console.log('✅ Security layers enabled (MVC Architecture):');
    console.log('  - Input Validation');
    console.log('  - Rate Limiting');
    console.log('  - Authentication (JWT)');
    console.log('  - Authorization (Role-based)');
});
