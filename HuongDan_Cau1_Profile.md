# Hướng Dẫn Thực Hiện - Chức Năng Profile (Câu 1)

Tài liệu này báo cáo chi tiết các bước thực hiện chức năng Profile (Xem, Chỉnh sửa, Đổi mật khẩu, Đổi số điện thoại/Email có OTP).

## 1. Backend (API)
Các endpoint sau đã được xây dựng trong `server.js` để phục vụ chức năng Profile.

### 1.1 Xem thông tin Profile
- **URL**: `GET /api/profile`
- **Auth**: Yêu cầu Token (Header `Authorization: Bearer <token>`)
- **Logic**: Trả về thông tin user (id, name, phone, email, role, avatar) từ database dựa trên `req.user.id` giải mã từ token.

### 1.2 Cập nhật thông tin cơ bản
- **URL**: `PUT /api/profile`
- **Body**: `{ "name": "Nguyen Van A", "avatar": "https://..." }`
- **MC**: Cập nhật cột `name` và `avatar` trong bảng users.

### 1.3 Đổi mật khẩu
- **URL**: `POST /api/auth/change-password`
- **Body**: `{ "oldPassword": "...", "newPassword": "..." }`
- **Logic**:
  1. Kiểm tra mật khẩu cũ có khớp trong DB không.
  2. Nếu khớp, update mật khẩu mới.

### 1.4 Đổi Số điện thoại / Email (Quy trình OTP)
Đây là quy trình bảo mật 2 bước:

**Bước 1: Yêu cầu đổi (Gửi OTP)**
- **URL**: `POST /api/auth/request-change-contact`
- **Body**: `{ "type": "phone"|"email", "newValue": "..." }`
- **Logic**:
  1. Kiểm tra `newValue` đã tồn tại trong DB chưa (tránh trùng).
  2. Sinh mã OTP ngẫu nhiên (6 số).
  3. Lưu OTP vào bộ nhớ tạm (`otpStorage`) kèm thời gian hết hạn (5 phút).
  4. Trả về OTP (trong thực tế sẽ gửi SMS/Email, ở đây trả về response để test).

**Bước 2: Xác thực & Cập nhật**
- **URL**: `POST /api/auth/verify-change-contact`
- **Body**: `{ "otp": "..." }`
- **Logic**:
  1. Kiểm tra OTP có khớp và còn hạn không.
  2. Nếu đúng, thực hiện câu lệnh `UPDATE users SET phone/email = newValue`.
  3. Xóa OTP khỏi bộ nhớ.

## 2. Frontend (React Native)

### 2.1 Màn hình Profile (`ProfileScreen.tsx`)
- Hiển thị Avatar, Tên, SĐT, Email.
- Sử dụng `useFocusEffect` để tự động tải lại dữ liệu mỗi khi màn hình được focus (đảm bảo dữ liệu mới nhất sau khi edit).
- Các nút điều hướng đến các màn hình chức năng con.
- Nút Đăng xuất: Xóa token trong AsyncStorage và quay về Login.

### 2.2 Màn hình Chỉnh sửa (`EditProfileScreen.tsx`)
- Form nhập `Họ tên` và `Avatar URL`.
- Gọi API `PUT /api/profile` khi nhấn Lưu.
- Hiển thị Alert thông báo kết quả.

### 2.3 Màn hình Đổi mật khẩu (`ChangePasswordScreen.tsx`)
- Form nhập: Mật khẩu cũ, Mật khẩu mới, Xác nhận mật khẩu mới.
- Validate phía client: Độ dài > 6 ký tự, mật khẩu xác nhận phải khớp.
- Gọi API đổi mật khẩu và thông báo.

### 2.4 Màn hình Đổi SĐT/Email (`ChangeContactScreen.tsx`)
- **Flow**:
  - **Bước 1**: Nhập SĐT/Email mới -> Nhấn "Gửi OTP". Gọi API request.
  - **Bước 2**: Nhập mã OTP -> Nhấn "Xác nhận". Gọi API verify.
- Tái sử dụng màn hình cho cả đổi Phone và Email thông qua tham số `route.params.type`.

## 3. Kiểm thử (Demo)

1. **Đăng nhập** vào ứng dụng.
2. Vào tab **Profile (Thông tin cá nhân)**.
3. **Thử chức năng**:
   - Nhấn "Chỉnh sửa trang cá nhân" -> Đổi tên -> Lưu -> Quay lại thấy tên mới.
   - Nhấn "Đổi" ở dòng Số điện thoại -> Nhập số mới -> Lấy OTP (log server hoặc alert) -> Nhập OTP -> Thành công.
   - Nhấn "Đổi mật khẩu" -> Nhập đúng pass cũ và pass mới -> Thành công.
