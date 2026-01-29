import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ChangeContactScreen from '../screens/ChangeContactScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Main navigation component
 * Can be extended with AuthNavigator and MainNavigator for better organization
 */
const AppNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#3498db',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ title: 'Đăng nhập' }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ title: 'Đăng ký' }}
                />
                <Stack.Screen
                    name="OTPVerification"
                    component={OTPVerificationScreen}
                    options={{ title: 'Xác thực OTP' }}
                />
                <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPasswordScreen}
                    options={{ title: 'Quên mật khẩu' }}
                />
                <Stack.Screen
                    name="ResetPassword"
                    component={ResetPasswordScreen}
                    options={{ title: 'Đặt lại mật khẩu' }}
                />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        title: 'Trang chủ',
                        headerLeft: () => null, // Prevent going back to login
                    }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ title: 'Thông tin cá nhân' }}
                />
                <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                    options={{ title: 'Chỉnh sửa thông tin' }}
                />
                <Stack.Screen
                    name="ChangePassword"
                    component={ChangePasswordScreen}
                    options={{ title: 'Đổi mật khẩu' }}
                />
                <Stack.Screen
                    name="ChangeContact"
                    component={ChangeContactScreen}
                    options={({ route }) => ({ title: route.params.type === 'phone' ? 'Đổi số điện thoại' : 'Đổi Email' })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
