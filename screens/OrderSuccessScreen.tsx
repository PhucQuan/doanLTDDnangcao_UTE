import React, { useState } from 'react';
import { View, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { reviewService } from '../services/ecommerce.service';

type OrderSuccessRouteProp = RouteProp<RootStackParamList, 'OrderSuccess'>;
type OrderSuccessNavProp = StackNavigationProp<RootStackParamList>;

const OrderSuccessScreen = () => {
    const navigation = useNavigation<OrderSuccessNavProp>();
    const route = useRoute<OrderSuccessRouteProp>();
    const { orderId } = route.params;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitReview = async () => {
        try {
            setSubmitting(true);
            // In a real app we'd need the product ID. 
            // For now, let's assume we review the first item or a dummy ID for demo.
            await reviewService.submitReview({
                product_id: 1, // Placeholder
                rating,
                comment
            });
            Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá! Bạn đã nhận được 50 điểm.');
            setRating(0);
            setComment('');
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể gửi đánh giá lúc này.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>🎉</Text>
                </View>

                <Text style={styles.title}>Tuyệt vời!</Text>
                <Text style={styles.subtitle}>
                    Đơn hàng <Text style={styles.boldText}>#{orderId}</Text> của bạn đã được đặt thành công.
                </Text>
                <Text style={styles.description}>
                    Cảm ơn bạn đã mua sắm tại cửa hàng. Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng của bạn.
                </Text>

                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        style={styles.btnPrimary}
                        labelStyle={styles.btnPrimaryText}
                        onPress={() => navigation.replace('OrderDetail', { orderId })}
                    >
                        Theo dõi đơn hàng
                    </Button>

                    <Button
                        mode="outlined"
                        style={styles.btnSecondary}
                        labelStyle={styles.btnSecondaryText}
                        onPress={() => navigation.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                        })}
                    >
                        Về trang chủ
                    </Button>
                </View>

                <Divider style={{ width: '100%', marginVertical: 30 }} />
                
                <Text style={styles.reviewPrompt}>Đánh giá sản phẩm để nhận ngay 50 điểm!</Text>
                
                <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Text style={[styles.star, rating >= star && styles.starSelected]}>
                                {rating >= star ? '★' : '☆'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    placeholder="Chia sẻ cảm nhận của bạn..."
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={3}
                    style={styles.commentInput}
                />

                <Button 
                    mode="contained" 
                    onPress={handleSubmitReview} 
                    loading={submitting} 
                    disabled={rating === 0 || submitting}
                    style={styles.btnReview}
                >
                    Gửi đánh giá
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFE5EA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    iconText: {
        fontSize: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 10,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#FF8599',
    },
    description: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    buttonContainer: {
        width: '100%',
    },
    btnPrimary: {
        backgroundColor: '#FF8599',
        borderRadius: 25,
        paddingVertical: 8,
        marginBottom: 15,
    },
    btnPrimaryText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnSecondary: {
        borderColor: '#FF8599',
        borderWidth: 1.5,
        borderRadius: 25,
        paddingVertical: 8,
    },
    btnSecondaryText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF8599',
    },
    reviewPrompt: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    star: {
        fontSize: 40,
        color: '#ddd',
        marginHorizontal: 5,
    },
    starSelected: {
        color: '#FFD700',
    },
    commentInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        textAlignVertical: 'top',
    },
    btnReview: {
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        width: '100%',
    }
});

export default OrderSuccessScreen;
