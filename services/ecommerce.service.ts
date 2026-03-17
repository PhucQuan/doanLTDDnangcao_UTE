import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.230.24:3000/api'; // Update with your actual IP

const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const reviewService = {
    getProductReviews: async (productId: number) => {
        const response = await axios.get(`${API_URL}/reviews/product/${productId}`);
        return response.data;
    },
    submitReview: async (reviewData: { product_id: number; rating: number; comment: string }) => {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/reviews`, reviewData, headers);
        return response.data;
    }
};

export const discoveryService = {
    toggleFavorite: async (productId: number) => {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/discovery/favorites/toggle`, { product_id: productId }, headers);
        return response.data;
    },
    getFavorites: async () => {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/discovery/favorites`, headers);
        return response.data;
    },
    trackProductView: async (productId: number) => {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/discovery/view`, { product_id: productId }, headers);
        return response.data;
    },
    getRecentlyViewed: async () => {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/discovery/recently-viewed`, headers);
        return response.data;
    },
    getProductMeta: async (productId: number) => {
        const response = await axios.get(`${API_URL}/discovery/product-meta/${productId}`);
        return response.data;
    }
};

export const voucherService = {
    getVouchers: async () => {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/vouchers`, headers);
        return response.data;
    },
    applyVoucher: async (code: string, orderAmount: number) => {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/vouchers/apply`, { code, orderAmount }, headers);
        return response.data;
    },
    getUserPoints: async () => {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/vouchers/points`, headers);
        return response.data;
    }
};
