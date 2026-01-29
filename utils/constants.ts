/**
 * App-wide constants
 */

export const COLORS = {
    primary: '#3498db',
    secondary: '#95a5a6',
    success: '#27ae60',
    danger: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db',
    light: '#f8f9fa',
    dark: '#2c3e50',
    white: '#ffffff',
    border: '#e1e8ed',
    placeholder: '#999',
    disabled: '#bdc3c7',
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
};

export const FONT_SIZES = {
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 24,
    xxlarge: 32,
};

export const SPACING = {
    xs: 5,
    sm: 10,
    md: 15,
    lg: 20,
    xl: 30,
};

export const BORDER_RADIUS = {
    small: 8,
    medium: 12,
    large: 16,
    round: 999,
};

export const SHADOW = {
    small: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 8,
    },
};

export const VALIDATION = {
    PHONE_LENGTH: 10,
    OTP_LENGTH: 6,
    MIN_PASSWORD_LENGTH: 6,
    MIN_NAME_LENGTH: 2,
};

export const MESSAGES = {
    SUCCESS: {
        LOGIN: 'Đăng nhập thành công!',
        REGISTER: 'Đăng ký thành công!',
        OTP_SENT: 'Mã OTP đã được gửi!',
        PASSWORD_RESET: 'Đặt lại mật khẩu thành công!',
    },
    ERROR: {
        NETWORK: 'Lỗi kết nối mạng',
        INVALID_CREDENTIALS: 'Số điện thoại hoặc mật khẩu không đúng',
        REQUIRED_FIELDS: 'Vui lòng nhập đầy đủ thông tin',
        INVALID_PHONE: 'Số điện thoại không hợp lệ',
        INVALID_OTP: 'Mã OTP không hợp lệ',
        GENERIC: 'Đã có lỗi xảy ra',
    },
};

export default {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    BORDER_RADIUS,
    SHADOW,
    VALIDATION,
    MESSAGES,
};
