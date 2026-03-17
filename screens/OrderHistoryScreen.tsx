import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, useTheme, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useOrderStore, Order } from '../store/orderStore';

type OrderHistoryNavProp = StackNavigationProp<RootStackParamList>;

const getStatusColor = (status: number) => {
    switch (status) {
        case 1: return { bg: '#E3F2FD', text: '#1976D2', label: 'Mới đặt' };
        case 2: return { bg: '#E8F5E9', text: '#388E3C', label: 'Đã xác nhận' };
        case 3: return { bg: '#FFF3E0', text: '#F57C00', label: 'Đang chuẩn bị' };
        case 4: return { bg: '#E1F5FE', text: '#0288D1', label: 'Đang giao' };
        case 5: return { bg: '#E8F5E9', text: '#2E7D32', label: 'Thành công' };
        case 6: return { bg: '#FFEBEE', text: '#D32F2F', label: 'Đã hủy' };
        default: return { bg: '#F5F5F5', text: '#757575', label: 'Chưa rõ' };
    }
};

const OrderHistoryScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<OrderHistoryNavProp>();
    const isFocused = useIsFocused();
    const { orders, loading, fetchOrders } = useOrderStore();

    useEffect(() => {
        if (isFocused) {
            fetchOrders();
        }
    }, [isFocused]);

    const renderItem = ({ item }: { item: Order }) => {
        const statusInfo = getStatusColor(item.status);

        return (
            <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.orderId}>#Đơn hàng {item.id}</Text>
                        <Chip textStyle={{ color: statusInfo.text, fontSize: 12 }} style={{ backgroundColor: statusInfo.bg }}>
                            {statusInfo.label}
                        </Chip>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.date}>{new Date(item.created_at).toLocaleString('vi-VN')}</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.itemsCount}>Thanh toán (COD)</Text>
                            <Text style={styles.totalAmount}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.total_amount))}
                            </Text>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    if (loading && orders.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF8599" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} colors={['#FF8599']} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 15,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cardContent: {
        padding: 15,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemsCount: {
        fontSize: 14,
        color: '#666',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF8599',
    }
});

export default OrderHistoryScreen;
