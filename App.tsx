import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';

// Custom Theme cho App đẹp hơn
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee', // Màu chủ đạo (Tím hiện đại)
    secondary: '#03dac6', // Hàm phụ (Xanh ngọc)
    background: '#f6f6f6', // Nền xám nhẹ dịu mắt
    surface: '#ffffff', // Nền card trắng
    error: '#B00020',
  },
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