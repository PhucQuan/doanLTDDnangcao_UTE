# HƯỚNG DẪN THỰC HIỆN CÁC CHỨC NĂNG REACT NATIVE
## Đồ án Lập Trình Di Động Nâng Cao - UTE

---

**Sinh viên thực hiện:** [Tên sinh viên]  
**Mã số sinh viên:** [MSSV]  
**Lớp:** [Lớp]  
**Ngày thực hiện:** 22/01/2026  
**GitHub Repository:** https://github.com/PhucQuan/doanLTDDnangcao_UTE.git

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Cài đặt môi trường](#2-cài-đặt-môi-trường)
3. [Cấu trúc dự án](#3-cấu-trúc-dự-án)
4. [Hướng dẫn thực hiện từng chức năng](#4-hướng-dẫn-thực-hiện-từng-chức-năng)
5. [Quy trình hoạt động (Flow)](#5-quy-trình-hoạt-động-flow)
6. [Kết luận](#6-kết-luận)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Yêu cầu đề bài
- **Register dùng OTP**: Đăng ký tài khoản với tính năng xác thực số điện thoại qua mã OTP.
- **Login không dùng JWT**: Xây dựng cơ chế đăng nhập sử dụng Session ID thay vì JWT Token truyền thống.
- **Forget Password có dùng OTP**: Cho phép người dùng khôi phục mật khẩu thông qua xác thực OTP gửi về số điện thoại.
- **Register không dùng OTP**: Hỗ trợ tùy chọn đăng ký nhanh không cần xác thực (theo yêu cầu cá nhân).
- **Giao diện tùy chỉnh**: Thiết kế UI/UX hiện đại, thân thiện, không sử dụng template có sẵn.

### 1.2 Công nghệ sử dụng
- **Development Platform**: React Native (Expo CLI)
- **Language**: TypeScript (để đảm bảo chặt chẽ về dữ liệu)
- **State Management**: React Hooks (useState, useEffect)
- **Navigation**: React Navigation v6 (Stack Navigator)
- **Networking**: Axios (kết nối API Backend)
- **Local Storage**: AsyncStorage (lưu trữ phiên đăng nhập)

### 1.3 Tính năng đã hoàn thiện
✅ Đăng ký tài khoản (hỗ trợ cả 2 chế độ: có OTP và không OTP).  
✅ Đăng nhập hệ thống (cơ chế Session ID).  
✅ Quên mật khẩu (gửi OTP và đặt lại mật khẩu mới).  
✅ Tự động đăng nhập (nếu phiên làm việc chưa hết hạn).  
✅ Xử lý lỗi và thông báo người dùng (Validation).

---

## 2. CÀI ĐẶT MÔI TRƯỜNG

Để chạy dự án, cần chuẩn bị các công cụ sau:
- Node.js (phiên bản ổn định mới nhất).
- Expo Go (trên điện thoại Android/iOS) để chạy thử nghiệm.
- Các thư viện phụ thuộc: React Navigation, Axios, Async Storage.

Quá trình chạy ứng dụng:
1.  Khởi động Backend Server (Kết nối cơ sở dữ liệu).
2.  Khởi động Expo Development Server (sử dụng chế độ Tunnel để đảm bảo kết nối ổn định).
3.  Quét mã QR trên ứng dụng Expo Go để trải nghiệm.

---

## 3. CẤU TRÚC DỰ ÁN

Dự án được tổ chức theo cấu trúc thư mục rõ ràng để dễ dàng quản lý và mở rộng:

- **screens/**: Chứa toàn bộ các màn hình giao diện của ứng dụng (Đăng nhập, Đăng ký, OTP, Trang chủ...).
- **services/**: Chứa các file cấu hình gọi API và xử lý logic kết nối Backend.
- **types/**: Định nghĩa các kiểu dữ liệu (Interface) cho TypeScript (User, AuthResponse...).
- **components/**: Các thành phần giao diện dùng chung (nếu có).
- **assets/**: Lưu trữ hình ảnh, font chữ, icon.
- **backend/**: Mã nguồn server Node.js và cấu hình cơ sở dữ liệu.

---

## 4. HƯỚNG DẪN THỰC HIỆN TỪNG CHỨC NĂNG

### 4.1 Chức năng Đăng ký (Register)
Chức năng đăng ký được thiết kế linh hoạt với hai chế độ hoạt động, người dùng có thể chuyển đổi qua lại bằng nút gạt (Switch):

1.  **Chế độ Không dùng OTP (Mặc định)**:
    - Người dùng nhập thông tin (Họ tên, SĐT, Mật khẩu).
    - Hệ thống kiểm tra dữ liệu đầu vào (Validation).
    - Gọi API đăng ký trực tiếp.
    - Thành công sẽ chuyển hướng về màn hình Đăng nhập.

2.  **Chế độ Dùng OTP (Xác thực thực tế)**:
    - Khi người dùng bật chế độ này, quy trình sẽ thực hiện thêm bước xác thực.
    - Sau khi nhập thông tin, hệ thống gửi mã OTP giả lập (hoặc thực) về máy.
    - Chuyển hướng sang màn hình **Nhập OTP**.
    - Chỉ khi nhập đúng OTP, tài khoản mới được tạo trong cơ sở dữ liệu.

### 4.2 Chức năng Đăng nhập (Login)
Đây là chức năng quan trọng tuân thủ yêu cầu **"Không dùng JWT"**:

- Người dùng nhập Số điện thoại và Mật khẩu.
- Hệ thống gửi yêu cầu lên Server.
- Nếu thông tin đúng, Server trả về thông tin User và một mã **Session ID** (định danh phiên làm việc).
- Ứng dụng lưu **Session ID** vào bộ nhớ máy (AsyncStorage) thay vì lưu Token.
- Các lần mở ứng dụng sau, hệ thống sẽ kiểm tra Session ID này để tự động đăng nhập.

### 4.3 Chức năng Quên mật khẩu (Forgot Password)
Quy trình khôi phục mật khẩu được bảo mật chặt chẽ qua 3 bước:

1.  **Yêu cầu**: Người dùng nhập số điện thoại đã đăng ký. Hệ thống kiểm tra số điện thoại có tồn tại hay không.
2.  **Xác thực**: Một mã OTP được gửi đến số điện thoại. Người dùng phải nhập đúng mã này trong thời gian quy định (ví dụ: 5 phút).
3.  **Đặt lại**: Sau khi xác thực thành công, ứng dụng cấp phép chuyển sang màn hình **Đặt lại mật khẩu**. Tại đây, người dùng nhập mật khẩu mới và xác nhận để cập nhật vào hệ thống.

---

## 5. QUY TRÌNH HOẠT ĐỘNG (FLOW)

### 5.1 Validation (Kiểm tra dữ liệu)
Trước khi gửi bất kỳ dữ liệu nào lên Server, ứng dụng luôn thực hiện kiểm tra kỹ lưỡng tại phía Client:
- **Số điện thoại**: Phải đủ 10 số và bắt đầu bằng số 0.
- **Mật khẩu**: Yêu cầu độ dài tối thiểu (ví dụ: 6 ký tự).
- **Nhập lại mật khẩu**: Phải khớp hoàn toàn với mật khẩu gốc.
- **Họ tên**: Không được để trống.

### 5.2 Xử lý lỗi (Error Handling)
Hệ thống được thiết kế để thông báo lỗi rõ ràng cho người dùng:
- Lỗi kết nối mạng (Network Error).
- Lỗi sai OTP hoặc OTP hết hạn.
- Lỗi số điện thoại đã tồn tại khi đăng ký.
- Lỗi sai mật khẩu khi đăng nhập.

### 5.3 Giao diện (UI/Design)
Giao diện được xây dựng thủ công với các tiêu chí:
- **Màu sắc chủ đạo**: Xanh dương (Blue) tạo cảm giác tin cậy, kết hợp nền trắng sạch sẽ.
- **Bố cục**: Dạng cột (Column), các ô nhập liệu (Input) có bo góc mềm mại, đổ bóng nhẹ (Shadow) để tạo chiều sâu.
- **Trải nghiệm**: Hiển thị vòng xoay (Loading Indicator) khi đang xử lý dữ liệu để người dùng biết hệ thống đang hoạt động.

---

## 6. KẾT LUẬN

### 6.1 Tổng kết
Dự án đã hoàn thành trọn vẹn các yêu cầu của đồ án môn học. Ứng dụng hoạt động ổn định trên cả môi trường giả lập và thiết bị thực tế. Các luồng xử lý (Register, Login, OTP) diễn ra mượt mà và logic.

### 6.2 Ưu điểm
- Cấu trúc code rõ ràng, dễ bảo trì nhờ TypeScript.
- Đáp ứng đúng các yêu cầu đặc thù (Non-JWT, OTP Toggle).
- Quy trình kiểm thử (Testing) đã được thực hiện kỹ càng.

### 6.3 Hướng phát triển
- Tích hợp SMS Gateway thực tế để gửi tin nhắn OTP.
- Bổ sung thêm tính năng cập nhật thông tin cá nhân (Avatar, Email).
- Nâng cấp giao diện với các hiệu ứng chuyển động (Animation) phức tạp hơn.

---

**Kết thúc báo cáo**