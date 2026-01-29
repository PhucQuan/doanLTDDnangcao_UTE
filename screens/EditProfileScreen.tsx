import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authAPI as api } from '../services/api';

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await api.getProfile();
            if (response.data) {
                const { name, avatar } = response.data.user;
                setName(name);
                setAvatar(avatar || '');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải thông tin');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Tên không được để trống');
            return;
        }

        setLoading(true);
        try {
            await api.updateProfile({ name, avatar });
            Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Nhập họ và tên"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Avatar (URL)</Text>
                <TextInput
                    style={styles.input}
                    value={avatar}
                    onChangeText={setAvatar}
                    placeholder="Nhập URL hình ảnh"
                    autoCapitalize="none"
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#bdc3c7',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditProfileScreen;
