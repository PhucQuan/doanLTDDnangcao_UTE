import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { authAPI as api } from '../services/api';

type ChangeContactScreenRouteProp = RouteProp<RootStackParamList, 'ChangeContact'>;

const ChangeContactScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<ChangeContactScreenRouteProp>();
    const { type } = route.params; // 'phone' or 'email'

    const [newValue, setNewValue] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Input value, 2: Input OTP
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!newValue.trim()) {
            Alert.alert('Lỗi', `Vui lòng nhập ${type === 'phone' ? 'số điện thoại' : 'email'} mới`);
            return;
        }

        setLoading(true);
        try {
            const response = await api.requestChangeContact(type, newValue);
            Alert.alert('OTP đã gửi', response.message);
            setStep(2);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Gửi OTP thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập OTP');
            return;
        }

        setLoading(true);
        try {
            await api.verifyChangeContact(otp);
            Alert.alert('Thành công', 'Cập nhật thành công', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Xác thực OTP thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {step === 1
                    ? `Nhập ${type === 'phone' ? 'số điện thoại' : 'email'} mới`
                    : 'Nhập mã OTP xác nhận'}
            </Text>

            {step === 1 ? (
                <View style={styles.formGroup}>
                    <TextInput
                        style={styles.input}
                        value={newValue}
                        onChangeText={setNewValue}
                        placeholder={type === 'phone' ? 'Nhập số điện thoại mới' : 'Nhập email mới'}
                        keyboardType={type === 'phone' ? 'phone-pad' : 'email-address'}
                        autoCapitalize="none"
                    />
                </View>
            ) : (
                <View style={styles.formGroup}>
                    <TextInput
                        style={styles.input}
                        value={otp}
                        onChangeText={setOtp}
                        placeholder="Nhập mã OTP gồm 6 số"
                        keyboardType="number-pad"
                    />
                </View>
            )}

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={step === 1 ? handleSendOTP : handleVerifyOTP}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Đang xử lý...' : (step === 1 ? 'Gửi OTP' : 'Xác nhận')}
                </Text>
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    formGroup: {
        marginBottom: 20,
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

export default ChangeContactScreen;
