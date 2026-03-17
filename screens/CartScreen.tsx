import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme, IconButton, Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useCartStore } from '../store/cartStore';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

const CartScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<CartScreenNavigationProp>();
    const { items, loading, fetchCart, updateQuantity, removeFromCart, getCartTotal } = useCartStore();

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (cartId: number, currentQty: number, increment: number) => {
        const newQty = currentQty + increment;
        if (newQty < 1) {
            handleRemoveItem(cartId);
            return;
        }
        await updateQuantity(cartId, newQty);
    };

    const handleRemoveItem = (cartId: number) => {
        Alert.alert(
            'Xóa sản phẩm',
            'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        await removeFromCart(cartId);
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemSize}>Size: {item.size}</Text>
                <Text style={styles.itemPrice}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price))}
                </Text>
            </View>
            <View style={styles.actionContainer}>
                <IconButton
                    icon="close"
                    size={20}
                    iconColor="#999"
                    style={styles.deleteBtn}
                    onPress={() => handleRemoveItem(item.cart_id)}
                />
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateQuantity(item.cart_id, item.quantity, -1)}
                    >
                        <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={[styles.qtyBtn, { backgroundColor: '#FF8599' }]}
                        onPress={() => handleUpdateQuantity(item.cart_id, item.quantity, 1)}
                    >
                        <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const cartTotal = getCartTotal();

    return (
        <View style={styles.container}>
            {items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <IconButton icon="cart-outline" size={80} iconColor="#ccc" />
                    <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
                    <Button
                        mode="contained"
                        style={styles.shopBtn}
                        onPress={() => navigation.navigate('Home')}
                    >
                        Tiếp tục mua sắm
                    </Button>
                </View>
            ) : (
                <>
                    <FlatList
                        data={items}
                        keyExtractor={item => item.cart_id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />

                    <View style={styles.footer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>Tạm tính:</Text>
                            <Text style={styles.summaryValue}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>Phí vận chuyển:</Text>
                            <Text style={styles.summaryValue}>Miễn phí</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalText}>Tổng cộng:</Text>
                            <Text style={styles.totalValue}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                            </Text>
                        </View>

                        <Button
                            mode="contained"
                            style={styles.checkoutBtn}
                            labelStyle={styles.checkoutBtnText}
                            onPress={() => navigation.navigate('Checkout')}
                            loading={loading}
                        >
                            Tiến hành thanh toán
                        </Button>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    listContent: {
        padding: 15,
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        marginBottom: 20,
    },
    shopBtn: {
        backgroundColor: '#FF8599',
        borderRadius: 25,
        paddingHorizontal: 20,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 12,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 2,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemSize: {
        fontSize: 12,
        color: '#888',
        marginBottom: 6,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FF8599',
    },
    actionContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '100%',
    },
    deleteBtn: {
        margin: 0,
        padding: 0,
        width: 24,
        height: 24,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        padding: 2,
        marginTop: 15,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: '#fff',
    },
    qtyBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    qtyText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 12,
    },
    footer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    divider: {
        marginVertical: 10,
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF8599',
    },
    checkoutBtn: {
        backgroundColor: '#333',
        borderRadius: 25,
        marginTop: 20,
        paddingVertical: 6,
    },
    checkoutBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    }
});

export default CartScreen;
