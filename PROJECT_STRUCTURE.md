# Cấu trúc thư mục dự án

## 📁 Cấu trúc tổng quan

```
auth-app-new/
├── App.tsx                      # Entry point
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── babel.config.js              # Babel config
│
├── assets/                      # Tài nguyên tĩnh
│   ├── images/                  # Hình ảnh
│   ├── fonts/                   # Fonts tùy chỉnh
│   └── icons/                   # Icons
│
├── components/                  # ✅ Component tái sử dụng
│   ├── common/                  # Component chung
│   │   ├── Button.tsx          # Button component
│   │   ├── Input.tsx           # Input component
│   │   └── LoadingSpinner.tsx  # Loading component
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components
│   │   └── Container.tsx       # Container wrapper
│   └── index.ts                 # Export tất cả components
│
├── screens/                     # ✅ Các màn hình
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── OTPVerificationScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── ResetPasswordScreen.tsx
│   └── HomeScreen.tsx
│
├── navigation/                  # ✅ Điều hướng
│   └── AppNavigator.tsx        # Main navigator
│
├── services/                    # ✅ API services
│   ├── api.ts                  # API calls
│   └── mockApi.ts              # Mock API
│
├── hooks/                       # ✅ Custom hooks
│   └── useAuth.ts              # Auth hook
│
├── utils/                       # ✅ Tiện ích
│   ├── constants.ts            # Constants (colors, fonts, etc)
│   ├── validators.ts           # Validation functions
│   ├── helpers.ts              # Helper functions
│   └── index.ts                # Export utilities
│
├── types/                       # ✅ TypeScript types
│   ├── index.ts
│   └── navigation.ts
│
└── backend/                     # Backend riêng
    ├── server.js
    ├── db.js
    └── package.json
```

## 🎯 Cách sử dụng các component và utilities

### 1. Sử dụng Components

```tsx
import { Button, Input, Container } from '../components';

// Trong screen của bạn
<Container centered>
  <Input 
    label="Số điện thoại"
    placeholder="Nhập số điện thoại"
    value={phone}
    onChangeText={setPhone}
    keyboardType="phone-pad"
  />
  
  <Button 
    title="Đăng nhập"
    onPress={handleLogin}
    loading={loading}
  />
</Container>
```

### 2. Sử dụng Validators

```tsx
import { validators } from '../utils';

const handleSubmit = () => {
  const phoneValidation = validators.phone(phone);
  if (!phoneValidation.valid) {
    Alert.alert('Lỗi', phoneValidation.message);
    return;
  }
  
  const passwordValidation = validators.password(password);
  if (!passwordValidation.valid) {
    Alert.alert('Lỗi', passwordValidation.message);
    return;
  }
  
  // Tiếp tục xử lý...
};
```

### 3. Sử dụng Constants

```tsx
import { COLORS, MESSAGES } from '../utils';

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
  },
  text: {
    color: COLORS.dark,
  },
});

Alert.alert('Thành công', MESSAGES.SUCCESS.LOGIN);
```

### 4. Sử dụng useAuth Hook

```tsx
import { useAuth } from '../hooks/useAuth';

const MyScreen = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async () => {
    const response = await authAPI.login(credentials);
    if (response.success && response.data) {
      await login(response.data.user, response.data.token);
      navigation.navigate('Home');
    }
  };
  
  return (
    <View>
      {isAuthenticated ? (
        <Text>Xin chào, {user?.fullName}</Text>
      ) : (
        <Text>Vui lòng đăng nhập</Text>
      )}
    </View>
  );
};
```

### 5. Sử dụng AppNavigator (OPTIONAL)

Nếu muốn tách navigation ra khỏi `App.tsx`:

```tsx
// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
```

## 📝 Lưu ý

- ✅ **Code hiện tại của bạn VẪN HOẠT ĐỘNG BÌNH THƯỜNG**
- ✅ Các file mới là **TEMPLATE** để bạn sử dụng khi cần
- ✅ Bạn có thể **từ từ refactor** code để sử dụng các component mới
- ✅ Tất cả file đều **tương thích** với code hiện tại

## 🚀 Bước tiếp theo (Tùy chọn)

1. **Refactor LoginScreen** để sử dụng component mới
2. **Sử dụng validators** thay vì validation thủ công
3. **Tách navigation** sang AppNavigator
4. **Thêm state management** (Redux/Zustand) nếu cần

## 📚 Tài liệu tham khảo

- [React Navigation](https://reactnavigation.org/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Best Practices](https://reactnative.dev/docs/getting-started)
