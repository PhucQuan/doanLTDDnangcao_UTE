# Hướng Dẫn Thực Hiện - Chức Năng Tìm Kiếm, Lọc & Xem Chi Tiết

Tài liệu này hướng dẫn chi tiết các bước đã thực hiện để xây dựng chức năng Tìm kiếm, Lọc và Xem Chi Tiết sản phẩm.

## 1. Cấu trúc CSDL (Backend)
Đã thêm bảng `products` vào file SQL migration để lưu trữ thông tin sản phẩm.

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Dữ liệu mẫu đã được thêm vào bao gồm Điện thoại, Laptop và Phụ kiện.

## 2. Backend (Node.js/Express)
Cập nhật file `server.js` để thêm 2 API endpoint mới:

### 2.1 API Tìm kiếm & Lọc
- **URL**: `GET /api/products`
- **Query Params**:
  - `q`: Từ khóa tìm kiếm (theo tên hoặc mô tả).
  - `category`: Lọc theo danh mục (smartphone, laptop, accessory).
  - `minPrice`, `maxPrice`: Lọc theo khoảng giá.
  - `sort`: Sắp xếp (`price_asc`, `price_desc`).
- **Logic**: Sử dụng SQL `LIKE` cho tìm kiếm và `ORDER BY` cho sắp xếp.

### 2.2 API Chi tiết sản phẩm
- **URL**: `GET /api/products/:id`
- **Logic**: Truy vấn bảng products theo `id`.

## 3. Frontend (React Native)

### 3.1 Cập nhật Navigation
- Đã thêm màn hình `ProductDetailScreen` vào `AppNavigator` và khai báo type trong `types/navigation.ts`.

### 3.2 HomeScreen (Trang chủ)
- **SearchBar**: Thêm thanh tìm kiếm sử dụng component `Searchbar` của React Native Paper.
- **Filter Chips**: Thêm các nút bấm (Chip) để lọc nhanh theo Category.
- **Filter Menu**: Thêm menu để chọn kiểu sắp xếp (Giá tăng/giảm dần).
- **Product List**: Sử dụng `FlatList` 2 cột để hiển thị danh sách sản phẩm lấy từ API.

### 3.3 ProductDetailScreen (Chi tiết)
- Nhận `productId` từ tham số điều hướng.
- Gọi API `/api/products/:id` để lấy thông tin chi tiết.
- Hiển thị ảnh, tên, giá, ngày tạo và mô tả sản phẩm.

## 4. Cách chạy & Kiểm thử

1.  **Backend**:
    - Đảm bảo database đã chạy migration mới nhất.
    - Start server: `node server.js`

2.  **Frontend**:
    - Chạy ứng dụng: `npm run android`
    - Tại màn hình Trang chủ:
        - Gõ từ khóa vào thanh tìm kiếm -> Danh sách cập nhật.
        - Chọn category "Điện thoại" -> Chỉ hiện điện thoại.
        - Bấm vào một sản phẩm -> Chuyển sang trang chi tiết.
        - Tại trang chi tiết -> Bấm "Quay lại" -> Về trang chủ.
