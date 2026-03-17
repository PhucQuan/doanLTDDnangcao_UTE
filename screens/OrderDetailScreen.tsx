import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Text, Card, Divider, Button, Portal, Dialog } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useOrderStore } from '../store/orderStore';

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailNavProp = StackNavigationProp<RootStackParamList>;

const OrderDetailScreen = () => {
    const navigation = useNavigation<OrderDetailNavProp>();
    const route = useRoute<OrderDetailRouteProp>();
    const { orderId } = route.params;

    const { currentOrder, loading, fetchOrderDetail, cancelOrder } = useOrderStore();
    const [visible, setVisible] = React.useState(false);

    useEffect(() => {
        fetchOrderDetail(orderId);
    }, [orderId]);

    const handleCancel = async () => {
        setVisible(false);
        const success = await cancelOrder(orderId);
        if (success) {
            alert('Đã cập nhật yêu cầu hủy đơn hàng.');
        }
    };

    if (loading && !currentOrder) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF8599" />
            </View>
        );
    }

    if (!currentOrder) {
        return (
            <View style={styles.centerContainer}>
                <Text>Không tìm thấy thông tin đơn hàng</Text>
            </View>
        );
    }

    // Xác định trạng thái timeline
    const statuses = [
        { id: 1, label: 'Đơn mới' },
        { id: 2, label: 'Xác nhận' },
        { id: 3, label: 'Đang chuẩn bị' },
        { id: 4, label: 'Đang giao' },
        { id: 5, label: 'Thành công' }
    ];

    const isCancelled = currentOrder.status === 6;

    const canCancel = !isCancelled && currentOrder.status < 4 && !currentOrder.cancel_request;

    return (
        <ScrollView style={styles.container}>
            {/* Timeline */}
            <View style={styles.timelineCard}>
                <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>

                {isCancelled ? (
                    <View style={styles.cancelledBox}>
                        <Text style={styles.cancelledText}>Đơn hàng đã hủy</Text>
                    </View>
                ) : (
                    <View style={styles.timelineRow}>
                        {statuses.map((s, index) => {
                            const isActive = currentOrder.status >= s.id;
                            const isLast = index === statuses.length - 1;

                            return (
                                <View key={s.id} style={styles.timelineStep}>
                                    <View style={[styles.timelineDot, isActive && styles.timelineDotActive]} />
                                    <Text style={[styles.timelineLabel, isActive && styles.timelineLabelActive]}>
                                        {s.label}
                                    </Text>
                                    {!isLast && (
                                        <View style={[styles.timelineLine, isActive && styles.timelineLineActive]} />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {currentOrder.cancel_request && !isCancelled && (
                    <Text style={styles.cancelRequestText}>* Đang chờ shop duyệt yêu cầu hủy</Text>
                )}
            </View>

            {/* Thông tin nhận hàng */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
                    <Text style={styles.infoText}><Text style={styles.bold}>Người nhận:</Text> {currentOrder.receiver_name}</Text>
                    <Text style={styles.infoText}><Text style={styles.bold}>Điện thoại:</Text> {currentOrder.receiver_phone}</Text>
                    <Text style={styles.infoText}><Text style={styles.bold}>Địa chỉ:</Text> {currentOrder.shipping_address}</Text>
                    {currentOrder.note && <Text style={styles.infoText}><Text style={styles.bold}>Ghi chú:</Text> {currentOrder.note}</Text>}
                </Card.Content>
            </Card>

            {/* Sản phẩm */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Sản phẩm ({currentOrder.items?.length || 0})</Text>
                    {currentOrder.items?.map((item, index) => (
                        <View key={index}>
                            <View style={styles.productRow}>
                                <Image source={{ uri: item.product_image }} style={styles.productImg} />
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>{item.product_name}</Text>
                                    <Text style={styles.productVariant}>Size: {item.size}  |  SL: {item.quantity}</Text>
                                    <Text style={styles.productPrice}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price))}
                                    </Text>
                                </View>
                            </View>
                            {index < currentOrder.items!.length - 1 && <Divider style={{ marginVertical: 10 }} />}
                        </View>
                    ))}
                </Card.Content>
            </Card>

            {/* Tổng tiền */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phương thức thanh toán</Text>
                        <Text style={styles.summaryValue}>COD</Text>
                    </View>
                    <Divider style={{ marginVertical: 10 }} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalValue}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(currentOrder.total_amount))}
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            {/* Hủy đơn */}
            {canCancel && (
                <View style={styles.actionContainer}>
                    <Button
                        mode="outlined"
                        style={styles.cancelBtn}
                        labelStyle={styles.cancelBtnText}
                        onPress={() => setVisible(true)}
                        loading={loading}
                    >
                        Yêu cầu hủy đơn hàng
                    </Button>
                </View>
            )}

            <View style={{ height: 30 }} />

            <Portal>
                <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                    <Dialog.Title>Hủy đơn hàng</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Bạn có thực sự muốn hủy đơn hàng này?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setVisible(false)} textColor="#666">Quay lại</Button>
                        <Button onPress={handleCancel} textColor="red">Đồng ý hủy</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 15,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    timelineCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    timelineRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 10,
        marginBottom: 5,
    },
    timelineStep: {
        alignItems: 'center',
        flex: 1,
        position: 'relative',
    },
    timelineDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#ddd',
        marginBottom: 8,
        zIndex: 2,
    },
    timelineDotActive: {
        backgroundColor: '#FF8599',
    },
    timelineLine: {
        position: 'absolute',
        top: 7,
        left: '50%',
        width: '100%',
        height: 2,
        backgroundColor: '#ddd',
        zIndex: 1,
    },
    timelineLineActive: {
        backgroundColor: '#FF8599',
    },
    timelineLabel: {
        fontSize: 10,
        color: '#888',
        textAlign: 'center',
    },
    timelineLabelActive: {
        color: '#FF8599',
        fontWeight: 'bold',
    },
    cancelledBox: {
        backgroundColor: '#FFEBEE',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelledText: {
        color: '#D32F2F',
        fontWeight: 'bold',
    },
    cancelRequestText: {
        color: '#F57C00',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 15,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 12,
        elevation: 2,
    },
    infoText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
        lineHeight: 22,
    },
    bold: {
        fontWeight: 'bold',
        color: '#333',
    },
    productRow: {
        flexDirection: 'row',
    },
    productImg: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    productVariant: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF8599',
        marginTop: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    actionContainer: {
        marginTop: 5,
    },
    cancelBtn: {
        borderColor: '#D32F2F',
    },
    cancelBtnText: {
        color: '#D32F2F',
    }
});

export default OrderDetailScreen;
