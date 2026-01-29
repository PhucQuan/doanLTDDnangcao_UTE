export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface UpdateProfileRequest {
  name: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangeContactRequest {
  type: 'phone' | 'email';
  newValue: string;
}

export interface VerifyChangeContactRequest {
  otp: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  name: string;
  email?: string;
}

export interface OTPRequest {
  phone: string;
  otp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthResponse {
  user: User;
  sessionId?: string; // Không dùng JWT, dùng sessionId
  token?: string;     // JWT (cho requirement về nhà)
}