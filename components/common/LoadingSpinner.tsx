import React from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet,
    Text,
} from 'react-native';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    text?: string;
}

/**
 * Reusable loading spinner component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    color = '#3498db',
    text,
}) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text style={styles.text}>{text}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        color: '#2c3e50',
    },
});

export default LoadingSpinner;
