# HƯỚNG DẪN BÀI TẬP A04: XÂY DỰNG TRANG CHỦ & LƯU TRỮ

**Sinh viên thực hiện:** [Tên Của Bạn]
**MSSV:** [Mã Số SV Của Bạn]
**Môn học:** Lập trình di động nâng cao
**Hạn nộp:** 12h30 ngày 29/01/2026

---

## MỤC 3: XÂY DỰNG GIAO DIỆN VỚI REACT NATIVE PAPER VÀ NAVIGATION

### 1. Cài đặt thư viện
Để xây dựng giao diện đẹp chuẩn Material Design, tôi sử dụng thư viện `react-native-paper`:

```bash
npm install react-native-paper react-native-safe-area-context react-native-vector-icons
```

### 2. Cấu hình Theme (App.tsx)
Tôi bọc toàn bộ ứng dụng trong `PaperProvider` và tùy chỉnh theme màu sắc cho hiện đại:

```javascript
// App.tsx
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee', // Màu tím hiện đại
    secondary: '#03dac6', // Màu xanh ngọc
    background: '#f6f6f6',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
           {/* ... Stack Navigator ... */}
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

### 3. Thiết kế Màn hình Home (HomeScreen.tsx)
Sử dụng các components cao cấp của Paper:
- `Avatar.Text`: Hiển thị avatar người dùng.
- `Card`: Hiển thị thông tin tài khoản và danh sách đề tài.
- `Title`, `Paragraph`: Typography chuẩn.
- `Button`: Nút bấm đẹp mắt.

[CHÈN ẢNH CHỤP MÀN HÌNH HOME TẠI ĐÂY]

---

## MỤC 4: LƯU TRỮ TÀI KHOẢN (REALM/ASYNC STORAGE) & HIỂN THỊ

Yêu cầu sử dụng Realm hoặc tương đương. Trong bài này, tôi sử dụng `AsyncStorage` để lưu phiên đăng nhập (User Session), đây là giải pháp phổ biến và tối ưu cho React Native khi chỉ cần lưu thông tin profile đơn giản.

### 1. Lưu thông tin khi Đăng nhập (LoginScreen.tsx)
Sau khi API trả về token và user info, tôi lưu vào Storage:

```javascript
// LoginScreen.tsx
if (response.success) {
  // Lưu thông tin user vào Storage
  await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
  await AsyncStorage.setItem('token', response.data.token);
  
  navigation.replace('Home'); // Chuyển sang Home
}
```

### 2. Hiển thị thông tin tại Trang Chủ (HomeScreen.tsx)
Tại màn hình Home, tôi dùng `useEffect` để load dữ liệu từ Storage ra state và hiển thị:

```javascript
// HomeScreen.tsx
useEffect(() => {
  loadUserData();
}, []);

const loadUserData = async () => {
  const storedUser = await AsyncStorage.getItem('user');
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
};

// Render
<Title>{user?.name}</Title>
<Text>{user?.role}</Text>
```

### 3. Đăng xuất
Xóa toàn bộ Storage và quay về màn Login:

```javascript
const handleLogout = async () => {
  await AsyncStorage.clear();
  navigation.replace('Login');
};
```

---

## KẾT QUẢ ĐẠT ĐƯỢC

1. **Giao diện**: Đẹp, hiện đại, Responsive trên cả iOS và Android nhờ `react-native-paper`.
2. **Chức năng**:
   - Đăng nhập thành công -> Lưu session -> Vào Home.
   - Trang chủ hiển thị đúng Tên, SĐT, Role của người dùng.
   - Đăng xuất -> Xóa session -> Về Login.
3. **Điều hướng**: Sử dụng `React Navigation` mượt mà.

---
**Hết.**
