import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    phone: string;
    email?: string;
    fullName?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
}

/**
 * Custom hook for managing authentication state
 */
export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        loading: true,
        isAuthenticated: false,
    });

    // Load user from storage on mount
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');

            if (userJson && token) {
                const user = JSON.parse(userJson);
                setAuthState({
                    user,
                    token,
                    loading: false,
                    isAuthenticated: true,
                });
            } else {
                setAuthState({
                    user: null,
                    token: null,
                    loading: false,
                    isAuthenticated: false,
                });
            }
        } catch (error) {
            console.error('Error loading user:', error);
            setAuthState({
                user: null,
                token: null,
                loading: false,
                isAuthenticated: false,
            });
        }
    };

    const login = async (user: User, token: string) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('token', token);
            setAuthState({
                user,
                token,
                loading: false,
                isAuthenticated: true,
            });
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('sessionId');
            setAuthState({
                user: null,
                token: null,
                loading: false,
                isAuthenticated: false,
            });
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    };

    const updateUser = async (updatedUser: User) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setAuthState((prev) => ({
                ...prev,
                user: updatedUser,
            }));
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };

    return {
        ...authState,
        login,
        logout,
        updateUser,
        refresh: loadUser,
    };
};

export default useAuth;
