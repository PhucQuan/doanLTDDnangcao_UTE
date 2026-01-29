import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { authAPI } from '../services/api';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [useOTP, setUseOTP] = useState<boolean>(true); // Toggle cho OTP

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const { name, phone, password, confirmPassword } = formData;

    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return false;
    }

    if (!phone || phone.length !== 10 || !phone.startsWith('0')) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registerData = {
        name: formData.name.trim(),
        phone: formData.phone,
        password: formData.password,
        email: formData.email.trim() || undefined,
      };

      console.log('🔵 Đang đăng ký với data:', registerData);
      console.log('🔵 Sử dụng OTP:', useOTP);

      if (useOTP) {
        // Đăng ký với OTP
        const response = await authAPI.registerWithOTP(registerData);
        console.log('✅ Response từ registerWithOTP:', response);

        if (response.success) {
          Alert.alert('Thành công', 'Mã OTP đã được gửi đến số điện thoại của bạn', [
            {
              text: 'OK',
              onPress: () => navigation.navigate('OTPVerification', {
                phone: formData.phone,
                type: 'register'
              })
            }
          ]);
        } else {
          console.log('❌ Đăng ký thất bại:', response.message);
          Alert.alert('Lỗi', response.message || 'Đăng ký thất bại');
        }
      } else {
        // Đăng ký không dùng OTP (theo yêu cầu)
        const response = await authAPI.register(registerData);
        console.log('✅ Response từ register:', response);

        if (response.success) {
          Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]);
        } else {
          console.log('❌ Đăng ký thất bại:', response.message);
          Alert.alert('Lỗi', response.message || 'Đăng ký thất bại');
        }
      }
    } catch (error: any) {
      console.log('❌ Lỗi exception:', error);
      console.log('❌ Error message:', error.message);
      console.log('❌ Error response:', error.response?.data);
      Alert.alert('Lỗi', error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>

          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Email (tùy chọn)"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry
            placeholderTextColor="#999"
          />

          {/* Toggle OTP */}
          <View style={styles.otpToggleContainer}>
            <Text style={styles.otpToggleLabel}>Sử dụng xác thực OTP:</Text>
            <TouchableOpacity
              style={[styles.toggleButton, useOTP && styles.toggleButtonActive]}
              onPress={() => setUseOTP(!useOTP)}
            >
              <Text style={[styles.toggleButtonText, useOTP && styles.toggleButtonTextActive]}>
                {useOTP ? 'BẬT' : 'TẮT'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>
                {useOTP ? 'Đăng ký với OTP' : 'Đăng ký'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  otpToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  otpToggleLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  toggleButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  toggleButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  toggleButtonText: {
    color: '#7f8c8d',
    fontWeight: 'bold',
    fontSize: 14,
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  registerButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkText: {
    color: '#3498db',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RegisterScreen;