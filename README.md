# Auth App - React Native TypeScript

Ứng dụng xác thực người dùng với React Native và TypeScript, hỗ trợ đăng ký, đăng nhập và quên mật khẩu.

## Tính năng

### Phiên bản có OTP (cho nhóm)
- ✅ **Đăng ký với OTP**: Xác thực số điện thoại qua OTP
- ✅ **Quên mật khẩu với OTP**: Khôi phục mật khẩu qua OTP
- ✅ **Đăng nhập**: Không sử dụng JWT (dùng sessionId)

### Phiên bản không OTP (cho cá nhân)
- ✅ **Đăng ký không OTP**: Đăng ký trực tiếp không cần xác thực
- ✅ **Đăng nhập không JWT**: Sử dụng sessionId thay vì JWT token

## Cấu trúc dự án

```
src/
├── screens/
│   ├── LoginScreen.tsx          # Màn hình đăng nhập
│   ├── RegisterScreen.tsx       # Màn hình đăng ký (có toggle OTP)
│   ├── OTPVerificationScreen.tsx # Màn hình xác thực OTP
│   ├── ForgotPasswordScreen.tsx # Màn hình quên mật khẩu
│   ├── ResetPasswordScreen.tsx  # Màn hình đặt lại mật khẩu
│   └── HomeScreen.tsx           # Màn hình chính
├── services/
│   └── api.ts                   # API services
└── types/
    └── index.ts                 # TypeScript interfaces
```

## API Endpoints

Cần cập nhật `BASE_URL` trong `src/services/api.ts` theo API của nhóm:

```typescript
const BASE_URL = 'https://your-group-api.com/api';
```

### Endpoints cần thiết:

1. **POST** `/auth/register` - Đăng ký không OTP
2. **POST** `/auth/register-otp` - Đăng ký với OTP
3. **POST** `/auth/verify-register-otp` - Xác thực OTP đăng ký
4. **POST** `/auth/login` - Đăng nhập
5. **POST** `/auth/forgot-password` - Gửi OTP quên mật khẩu
6. **POST** `/auth/verify-forgot-otp` - Xác thực OTP quên mật khẩu
7. **POST** `/auth/reset-password` - Đặt lại mật khẩu

## Cài đặt và chạy

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Chạy ứng dụng:**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Giao diện

- **Thiết kế hiện đại**: Sử dụng shadow, border radius, màu sắc hài hòa
- **Responsive**: Tương thích với các kích thước màn hình khác nhau
- **UX tốt**: Loading states, validation, error handling
- **Accessibility**: Placeholder colors, touch targets phù hợp

## Lưu trữ dữ liệu

- Sử dụng `AsyncStorage` để lưu thông tin user
- Không sử dụng JWT, thay vào đó dùng `sessionId`
- Tự động logout khi cần thiết

## Validation

- **Số điện thoại**: 10 số, bắt đầu bằng 0
- **Mật khẩu**: Tối thiểu 6 ký tự
- **OTP**: 6 số
- **Form validation**: Kiểm tra đầy đủ thông tin

## Customization

Có thể tùy chỉnh:
- Màu sắc trong `styles`
- API endpoints trong `api.ts`
- Validation rules trong các screen
- UI/UX theo yêu cầu cụ thể

## Lưu ý

- Đây là phiên bản **không sử dụng JWT** theo yêu cầu
- Có toggle để chọn đăng ký **có/không OTP**
- API cần được implement theo đúng interface đã định nghĩa
- Test trên thiết bị thật để đảm bảo UX tốt nhất