import React from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ViewStyle,
} from 'react-native';

interface ContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    centered?: boolean;
}

const Container: React.FC<ContainerProps> = ({
    children,
    style,
    centered = false,
}) => {
    return (
        <KeyboardAvoidingView
            style={[styles.container, style]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={[styles.inner, centered && styles.centered]}>
                {children}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    inner: {
        flex: 1,
        paddingHorizontal: 30,
    },
    centered: {
        justifyContent: 'center',
    },
});

export default Container;
