/**
 * Helper functions for common tasks
 */

/**
 * Format phone number (0123456789 -> 012-345-6789)
 */
export const formatPhone = (phone: string): string => {
    if (phone.length !== 10) return phone;
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
};

/**
 * Sleep/delay function
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

/**
 * Format time
 */
export const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T>(json: string, defaultValue: T): T => {
    try {
        return JSON.parse(json);
    } catch {
        return defaultValue;
    }
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/**
 * Check if string is empty or whitespace
 */
export const isEmpty = (str: string | null | undefined): boolean => {
    return !str || str.trim().length === 0;
};

export default {
    formatPhone,
    sleep,
    capitalize,
    formatDate,
    formatTime,
    safeJsonParse,
    debounce,
    isEmpty,
};
