import { create } from 'zustand';
import { authAPI } from '../services/api';
import { Product } from '../types/product';

export interface CartItem extends Product {
    cart_id: number;
    quantity: number;
    size: string;
}

interface CartStore {
    items: CartItem[];
    loading: boolean;
    error: string | null;
    fetchCart: () => Promise<void>;
    addToCart: (productId: number, quantity?: number, size?: string) => Promise<boolean>;
    updateQuantity: (cartId: number, quantity: number) => Promise<void>;
    removeFromCart: (cartId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getCartTotal: () => number;
    getCartCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    loading: false,
    error: null,

    fetchCart: async () => {
        set({ loading: true, error: null });
        try {
            // Using a raw fetch here since authAPI doesn't have cart yet to avoid circular logic
            // In a real app we'd add it to services/api.ts
            const response = await fetch('http://10.0.2.2:3000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                // Map the response to CartItem
                const itemsStr = data.data.map((item: any) => ({
                    ...item,
                    id: item.product_id, // Map product_id to id for Product interface compatibility
                    cart_id: item.id
                }));
                set({ items: itemsStr, loading: false });
            } else {
                set({ error: data.message, loading: false });
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    addToCart: async (productId: number, quantity = 1, size = '40') => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('http://10.0.2.2:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('token')}`
                },
                body: JSON.stringify({ product_id: productId, quantity, size })
            });
            const data = await response.json();
            if (data.success) {
                // Refresh cart
                get().fetchCart();
                return true;
            } else {
                set({ error: data.message, loading: false });
                return false;
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    updateQuantity: async (cartId: number, quantity: number) => {
        if (quantity < 1) return;
        set({ loading: true, error: null });
        try {
            const response = await fetch(`http://10.0.2.2:3000/api/cart/${cartId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('token')}`
                },
                body: JSON.stringify({ quantity })
            });
            const data = await response.json();
            if (data.success) {
                set({
                    items: get().items.map(item =>
                        item.cart_id === cartId ? { ...item, quantity } : item
                    ),
                    loading: false
                });
            } else {
                set({ error: data.message, loading: false });
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    removeFromCart: async (cartId: number) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`http://10.0.2.2:3000/api/cart/${cartId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                set({
                    items: get().items.filter(item => item.cart_id !== cartId),
                    loading: false
                });
            } else {
                set({ error: data.message, loading: false });
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    clearCart: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('http://10.0.2.2:3000/api/cart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                set({ items: [], loading: false });
            } else {
                set({ error: data.message, loading: false });
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    getCartTotal: () => {
        return get().items.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
    },

    getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    }
}));
