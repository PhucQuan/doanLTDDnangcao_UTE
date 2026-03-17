import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';

// Custom Theme cho App giày bóng rổ (Navy & Orange)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1A2A3A',    // Deep Navy (Chủ đạo: Sang trọng, thể thao mạnh mẽ)
    secondary: '#FF5722',  // Vibrant Orange (Giày rổ năng động)
    tertiary: '#FFFFFF',
    background: '#F0F2F5', // Xám sáng để card nổi lên
    surface: '#FFFFFF',    // Trắng tinh
    surfaceVariant: '#E9EEF2', // Xám bóng mờ cho Card
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    error: '#D32F2F',      // Màu đỏ nếu có lỗi
  },
  roundness: 12,           // Bo góc chung cho Material Component
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}