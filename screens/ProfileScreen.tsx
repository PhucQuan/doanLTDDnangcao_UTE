import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { authAPI as api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await api.getProfile();
            if (response.data) {
                setUser(response.data.user);
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải thông tin');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const handleLogout = async () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                },
            ]
        );
    };

    if (!user && loading) {
        return (
            <View style={styles.center}>
                <Text>Đang tải...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.center}>
                <Text>Không có dữ liệu người dùng</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={fetchProfile} />
            }
        >
            <View style={styles.header}>
                {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.role}>{user.phone}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <Text style={styles.value}>{user.name}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Số điện thoại</Text>
                    <Text style={styles.value}>{user.phone}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ChangeContact', { type: 'phone' })}>
                        <Text style={styles.editLink}>Đổi</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user.email || 'Chưa cập nhật'}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ChangeContact', { type: 'email' })}>
                        <Text style={styles.editLink}>Đổi</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bảo mật</Text>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={styles.menuText}>Chỉnh sửa trang cá nhân</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePassword')}>
                    <Text style={styles.menuText}>Đổi mật khẩu</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
                    <Text style={[styles.menuText, styles.logoutText]}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 20,
        marginBottom: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    avatarPlaceholder: {
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    role: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    value: {
        fontSize: 16,
        color: '#666',
        marginRight: 10,
    },
    editLink: {
        color: '#3498db',
        fontWeight: 'bold',
    },
    menuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    logoutButton: {
        borderBottomWidth: 0,
    },
    logoutText: {
        color: 'red',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
