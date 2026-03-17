import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

import { voucherService } from '../services/ecommerce.service';

const CheckoutScreen = () => {
    const navigation = useNavigation<CheckoutScreenNavigationProp>();

    const { items, getCartTotal } = useCartStore();
    const { createOrder, loading } = useOrderStore();

    const [receiverName, setReceiverName] = useState('');
    const [receiverPhone, setReceiverPhone] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [note, setNote] = useState('');

    // New Commerce Features
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
    const [userPoints, setUserPoints] = useState(0);
    const [usePoints, setUsePoints] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    const cartTotal = getCartTotal();
    const finalTotal = cartTotal - discountAmount - (usePoints ? userPoints : 0);

    React.useEffect(() => {
        fetchCommerceData();
    }, []);

    const fetchCommerceData = async () => {
        try {
            const vList = await voucherService.getVouchers();
            setVouchers(vList.filter((v: any) => !v.is_used));
            
            const pRes = await voucherService.getUserPoints();
            setUserPoints(pRes.points || 0);
        } catch (err) {
            console.error('Commerce data error:', err);
        }
    };

    const handleApplyVoucher = (voucher: any) => {
        if (cartTotal < voucher.min_order_amount) {
            Alert.alert('Không đủ điều kiện', `Đơn hàng tối thiểu ${voucher.min_order_amount}đ để dùng mã này.`);
            return;
        }
        setSelectedVoucher(voucher);
        setDiscountAmount(Number(voucher.discount_amount));
    };

    const handleCheckout = async () => {
        if (!receiverName || !receiverPhone || !shippingAddress) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin giao hàng hợp lệ. Cảm ơn.');
            return;
        }

        if (items.length === 0) {
            Alert.alert('Lỗi', 'Giỏ hàng của bạn đang trống.');
            return;
        }

        const orderData = {
            total_amount: Math.max(0, finalTotal).toString(),
            shipping_address: shippingAddress,
            receiver_name: receiverName,
            receiver_phone: receiverPhone,
            payment_method: 'COD',
            note: note || '',
            voucher_id: selectedVoucher?.id,
            points_used: usePoints ? userPoints : 0
        };

        const mappedItems = items.map(i => ({
            product_id: i.id,
            name: i.name,
            image: i.image,
            category: i.category,
            price: i.price,
            quantity: i.quantity,
            size: i.size
        }));

        const newOrderId = await createOrder(orderData, mappedItems);

        if (newOrderId) {
            navigation.replace('OrderSuccess', { orderId: newOrderId });
        } else {
            Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi tạo đơn hàng.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.card}>
                    <Card.Title title="Thông tin giao hàng" titleStyle={styles.cardTitle} />
                    <Card.Content>
                        <TextInput
                            label="Họ và tên người nhận"
                            value={receiverName}
                            onChangeText={setReceiverName}
                            mode="outlined"
                            style={styles.input}
                            outlineColor="#ddd"
                            activeOutlineColor="#FF8599"
                        />
                        <TextInput
                            label="Số điện thoại"
                            value={receiverPhone}
                            onChangeText={setReceiverPhone}
                            keyboardType="phone-pad"
                            mode="outlined"
                            style={styles.input}
                            outlineColor="#ddd"
                            activeOutlineColor="#FF8599"
                        />
                        <TextInput
                            label="Địa chỉ giao hàng"
                            value={shippingAddress}
                            onChangeText={setShippingAddress}
                            multiline
                            numberOfLines={3}
                            mode="outlined"
                            style={styles.input}
                            outlineColor="#ddd"
                            activeOutlineColor="#FF8599"
                        />
                        <TextInput
                            label="Ghi chú (tuỳ chọn)"
                            value={note}
                            onChangeText={setNote}
                            multiline
                            numberOfLines={2}
                            mode="outlined"
                            style={styles.input}
                            outlineColor="#ddd"
                            activeOutlineColor="#FF8599"
                        />
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Title title="Mã giảm giá" titleStyle={styles.cardTitle} />
                    <Card.Content>
                        {vouchers.length === 0 ? (
                            <Text style={{ fontStyle: 'italic', color: '#999' }}>Bạn chưa có mã giảm giá nào</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {vouchers.map(v => (
                                    <TouchableOpacity 
                                        key={v.id} 
                                        style={[styles.voucherCard, selectedVoucher?.id === v.id && styles.voucherSelected]}
                                        onPress={() => handleApplyVoucher(v)}
                                    >
                                        <Text style={styles.voucherCode}>{v.code}</Text>
                                        <Text style={styles.voucherAmount}>Giảm {new Intl.NumberFormat('vi-VN').format(v.discount_amount)}đ</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Title title="Điểm tích luỹ" titleStyle={styles.cardTitle} />
                    <Card.Content>
                        <View style={styles.pointsRow}>
                            <View>
                                <Text style={styles.pointsBalance}>Số dư: {userPoints} điểm</Text>
                                <Text style={styles.pointsValue}>(1 điểm = 1đ)</Text>
                            </View>
                            <Button 
                                mode={usePoints ? "contained" : "outlined"} 
                                onPress={() => setUsePoints(!usePoints)}
                                color="#FF8599"
                                disabled={userPoints === 0}
                            >
                                {usePoints ? "Hủy dùng" : "Dùng điểm"}
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Title title="Phương thức thanh toán" titleStyle={styles.cardTitle} />
                    <Card.Content>
                        <View style={styles.paymentMethod}>
                            <View style={styles.radioSelected}><View style={styles.radioInner} /></View>
                            <Text style={styles.paymentText}>Thanh toán khi nhận hàng (COD)</Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tạm tính ({items.length} sản phẩm)</Text>
                            <Text style={styles.summaryValue}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                            </Text>
                        </View>
                        {discountAmount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Giảm giá Voucher</Text>
                                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                                    -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                                </Text>
                            </View>
                        )}
                        {usePoints && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Dùng điểm tích luỹ</Text>
                                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                                    -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userPoints)}
                                </Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Phí giao hàng</Text>
                            <Text style={styles.summaryValue}>Miễn phí</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                            <Text style={styles.totalValue}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.max(0, finalTotal))}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

            </ScrollView>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    style={styles.btn}
                    labelStyle={styles.btnText}
                    onPress={handleCheckout}
                    loading={loading}
                    disabled={loading || items.length === 0}
                >
                    ĐẶT HÀNG NGAY
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 12,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    radioSelected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FF8599',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF8599',
    },
    paymentText: {
        fontSize: 16,
        color: '#444',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    divider: {
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF8599',
    },
    footer: {
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    btn: {
        backgroundColor: '#333',
        borderRadius: 25,
        paddingVertical: 6,
    },
    btnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    voucherCard: {
        padding: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        marginRight: 10,
    },
    voucherSelected: {
        borderColor: '#FF8599',
        backgroundColor: '#FFF1F3',
    },
    voucherCode: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    voucherAmount: {
        fontSize: 12,
        color: '#666',
    },
    pointsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsBalance: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333'
    },
    pointsValue: {
        fontSize: 12,
        color: '#888'
    }
});

export default CheckoutScreen;
