import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Product } from '../types/product';
import config from '../utils/config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

const BestSellingProducts: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBestSellingProducts();
    }, []);

    const fetchBestSellingProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.API_URL}/api/products/best-selling`);
            const data = await response.json();

            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Lỗi khi load best-selling products:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
    };

    const formatSalesCount = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    const renderProduct = ({ item, index }: { item: Product; index: number }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            style={styles.productItem}
        >
            <Card style={styles.productCard}>
                <Card.Cover source={{ uri: item.image }} style={styles.productImage} />

                {/* Sales Badge */}
                <View style={[styles.salesBadge, { backgroundColor: theme.colors.error }]}>
                    <Text style={styles.badgeText}>🔥 {formatSalesCount(item.sales_count || 0)} sold</Text>
                </View>

                {/* Ranking Badge */}
                {index < 3 && (
                    <View style={[styles.rankBadge, { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }]}>
                        <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                )}

                <Card.Content style={styles.productContent}>
                    <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.sectionTitle}>🔥 Sản phẩm bán chạy</Text>
                <Text style={styles.subtitle}>Top 10 được yêu thích nhất</Text>
            </View>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProduct}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
    },
    headerContainer: {
        marginHorizontal: 15,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 15,
    },
    productItem: {
        marginRight: 12,
    },
    productCard: {
        width: CARD_WIDTH,
        borderRadius: 12,
        elevation: 4,
        backgroundColor: '#fff',
    },
    productImage: {
        height: 140,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    salesBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        elevation: 2,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    rankBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    rankText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    productContent: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        minHeight: 70,
    },
    productName: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 6,
        color: '#333',
    },
    productPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#d32f2f',
    },
});

export default BestSellingProducts;
