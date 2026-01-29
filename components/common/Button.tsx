import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'link';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    style,
    textStyle,
}) => {
    const getButtonStyle = () => {
        if (disabled || loading) return styles.disabledButton;
        switch (variant) {
            case 'secondary':
                return styles.secondaryButton;
            case 'link':
                return styles.linkButton;
            default:
                return styles.primaryButton;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'link':
                return styles.linkText;
            default:
                return styles.buttonText;
        }
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    primaryButton: {
        backgroundColor: '#3498db',
        paddingVertical: 18,
        borderRadius: 12,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    secondaryButton: {
        backgroundColor: '#95a5a6',
        paddingVertical: 18,
        borderRadius: 12,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    linkButton: {
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },
    disabledButton: {
        backgroundColor: '#bdc3c7',
        paddingVertical: 18,
        borderRadius: 12,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#3498db',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default Button;
