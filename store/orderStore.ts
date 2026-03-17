import { create } from 'zustand';
import { authAPI } from '../services/api';
import config from '../utils/config';

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_name: string;
    product_image: string;
    product_category: string;
    price: string;
    quantity: number;
    size: string;
}

export interface Order {
    id: number;
    user_id: number;
    total_amount: string;
    shipping_address: string;
    receiver_name: string;
    receiver_phone: string;
    payment_method: string;
    status: number;
    note: string | null;
    created_at: string;
    confirmed_at: string | null;
    cancelled_at: string | null;
    cancel_request: boolean;
    items?: OrderItem[];
}

interface OrderStore {
    orders: Order[];
    currentOrder: Order | null;
    loading: boolean;
    error: string | null;
    fetchOrders: () => Promise<void>;
    fetchOrderDetail: (orderId: number) => Promise<void>;
    createOrder: (orderData: Partial<Order>, items: any[]) => Promise<number | null>;
    cancelOrder: (orderId: number) => Promise<boolean>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,

    fetchOrders: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`${config.API_URL}/api/orders`, {
                headers: {
                    'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                set({ orders: data.data, loading: false });
            } else {
                set({ error: data.message, loading: false });
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchOrderDetail: async (orderId: number) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`${config.API_URL}/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                set({ currentOrder: data.data, loading: false });
            } else {
                set({ error: data.message, loading: false });
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    createOrder: async (orderData: Partial<Order>, items: any[]) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`${config.API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('token')}`
                },
                body: JSON.stringify({ ...orderData, items })
            });
            const data = await response.json();
            if (data.success) {
                set({ loading: false });
                return data.data.id;
            } else {
                set({ error: data.message, loading: false });
                return null;
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return null;
        }
    },

    cancelOrder: async (orderId: number) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`${config.API_URL}/api/orders/${orderId}/cancel`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                // Tải lại danh sách sau khi hủy
                get().fetchOrders();
                if (get().currentOrder?.id === orderId) {
                    get().fetchOrderDetail(orderId);
                }
                set({ loading: false });
                return true;
            } else {
                set({ error: data.message, loading: false });
                return false;
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    }
}));
