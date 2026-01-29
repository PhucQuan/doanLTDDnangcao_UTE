/**
 * Validation utilities for form inputs
 */

export const validators = {
    /**
     * Validate Vietnamese phone number (10 digits, starts with 0)
     */
    phone: (phone: string): { valid: boolean; message?: string } => {
        if (!phone) {
            return { valid: false, message: 'Số điện thoại không được để trống' };
        }
        if (phone.length !== 10) {
            return { valid: false, message: 'Số điện thoại phải có 10 số' };
        }
        if (!phone.startsWith('0')) {
            return { valid: false, message: 'Số điện thoại phải bắt đầu bằng số 0' };
        }
        if (!/^\d+$/.test(phone)) {
            return { valid: false, message: 'Số điện thoại chỉ được chứa số' };
        }
        return { valid: true };
    },

    /**
     * Validate password strength
     */
    password: (password: string): { valid: boolean; message?: string } => {
        if (!password) {
            return { valid: false, message: 'Mật khẩu không được để trống' };
        }
        if (password.length < 6) {
            return { valid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
        }
        return { valid: true };
    },

    /**
     * Validate email format
     */
    email: (email: string): { valid: boolean; message?: string } => {
        if (!email) {
            return { valid: false, message: 'Email không được để trống' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, message: 'Email không hợp lệ' };
        }
        return { valid: true };
    },

    /**
     * Validate OTP (6 digits)
     */
    otp: (otp: string): { valid: boolean; message?: string } => {
        if (!otp) {
            return { valid: false, message: 'Mã OTP không được để trống' };
        }
        if (otp.length !== 6) {
            return { valid: false, message: 'Mã OTP phải có 6 số' };
        }
        if (!/^\d+$/.test(otp)) {
            return { valid: false, message: 'Mã OTP chỉ được chứa số' };
        }
        return { valid: true };
    },

    /**
     * Validate name
     */
    name: (name: string): { valid: boolean; message?: string } => {
        if (!name || name.trim().length === 0) {
            return { valid: false, message: 'Tên không được để trống' };
        }
        if (name.trim().length < 2) {
            return { valid: false, message: 'Tên phải có ít nhất 2 ký tự' };
        }
        return { valid: true };
    },
};

export default validators;
