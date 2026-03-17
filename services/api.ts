import axios, { AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { LoginRequest, RegisterRequest, OTPRequest, ApiResponse, AuthResponse } from '../types';
import { mockAuthAPI } from './mockApi'; // Import mock API

// Tự động chọn IP đúng tùy môi trường
const getBaseURL = () => {
  if (Platform.OS === 'web') return 'http://localhost:3000/api';       // Expo Web (browser)
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api';   // Android Emulator
  return 'http://192.168.1.2:3000/api';                                // Điện thoại thật (iOS/Android qua WiFi)
};
const BASE_URL = getBaseURL();

// Toggle để sử dụng mock API (true = mock, false = real API)
const USE_MOCK_API = false;

import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },

  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('❌ Network Error - Cannot connect to server');
      console.error('👉 Check if server is running at:', BASE_URL);
      console.error('👉 Check if phone/emulator is on same network');
    }
    return Promise.reject(error);
  }
);

// API Services
export const authAPI = {
  // Đăng ký tài khoản (không dùng OTP theo yêu cầu)
  register: async (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    if (USE_MOCK_API) {
      return mockAuthAPI.register(userData);
    }

    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng ký với OTP
  registerWithOTP: async (userData: RegisterRequest): Promise<ApiResponse> => {
    if (USE_MOCK_API) {
      return mockAuthAPI.registerWithOTP(userData);
    }

    try {
      const response: AxiosResponse<ApiResponse> = await api.post('/auth/register-otp', userData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Xác thực OTP cho đăng ký
  verifyRegisterOTP: async (phone: string, otp: string): Promise<ApiResponse<AuthResponse>> => {
    if (USE_MOCK_API) {
      return mockAuthAPI.verifyRegisterOTP(phone, otp);
    }

    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/verify-register-otp', { phone, otp });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng nhập (không dùng JWT theo yêu cầu)
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    if (USE_MOCK_API) {
      return mockAuthAPI.login(credentials);
    }

    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Quên mật khẩu - gửi OTP
  forgotPassword: async (phone: string): Promise<ApiResponse> => {
    if (USE_MOCK_API) {
      return mockAuthAPI.forgotPassword(phone);
    }

    try {
      const response: AxiosResponse<ApiResponse> = await api.post('/auth/forgot-password', { phone });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Xác thực OTP cho quên mật khẩu
  verifyForgotPasswordOTP: async (phone: string, otp: string): Promise<ApiResponse<{ resetToken: string }>> => {
    if (USE_MOCK_API) {
      return mockAuthAPI.verifyForgotPasswordOTP(phone, otp);
    }

    try {
      const response: AxiosResponse<ApiResponse<{ resetToken: string }>> = await api.post('/auth/verify-forgot-otp', { phone, otp });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (phone: string, newPassword: string, token: string): Promise<ApiResponse> => {
    if (USE_MOCK_API) {
      return mockAuthAPI.resetPassword(phone, newPassword, token);
    }

    try {
      const response: AxiosResponse<ApiResponse> = await api.post('/auth/reset-password', {
        phone,
        newPassword,
        token
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Get Profile
  getProfile: async (): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.get('/profile');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Update Profile
  updateProfile: async (data: { name: string; avatar?: string }): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.put('/profile', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Change Password
  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await api.post('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Request Change Contact
  requestChangeContact: async (type: 'phone' | 'email', newValue: string): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await api.post('/auth/request-change-contact', { type, newValue });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Verify Change Contact
  verifyChangeContact: async (otp: string): Promise<ApiResponse<any>> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.post('/auth/verify-change-contact', { otp });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;