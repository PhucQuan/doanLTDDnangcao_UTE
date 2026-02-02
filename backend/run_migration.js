const fs = require('fs');
const path = require('path');
const db = require('./db');

const migrate = async () => {
    try {
        const fileName = process.argv[2];
        if (!fileName) {
            console.error('❌ Vui lòng cung cấp tên file SQL (VD: node run_migration.js migration.sql)');
            process.exit(1);
        }

        const filePath = path.join(__dirname, fileName);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File không tồn tại: ${filePath}`);
            process.exit(1);
        }

        console.log(`⏳ Đang chạy migration từ file: ${fileName}...`);

        const sql = fs.readFileSync(filePath, 'utf8');
        await db.query(sql);

        console.log('✅ Migration hoàn tất thành công!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration thất bại:', err);
        process.exit(1);
    }
};

migrate();
