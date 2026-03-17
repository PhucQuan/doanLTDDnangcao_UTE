import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator, Badge, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Product } from '../types/product';
import config from '../utils/config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // 2 columns with spacing

const DiscountedProducts: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDiscountedProducts();
    }, []);

    const fetchDiscountedProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.API_URL}/api/products/discounted`);
            const data = await response.json();

            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Lỗi khi load discounted products:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
    };

    const calculateOriginalPrice = (price: string | number, discountPercent: number) => {
        const currentPrice = Number(price);
        const originalPrice = currentPrice / (1 - discountPercent / 100);
        return originalPrice;
    };

    const renderProduct = ({ item }: { item: Product }) => {
        const discountPercent = item.discount_percent || 0;
        const originalPrice = calculateOriginalPrice(item.price, discountPercent);

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                style={styles.productItem}
            >
                <Card style={styles.productCard}>
                    <Card.Cover source={{ uri: item.image }} style={styles.productImage} />

                    {/* Discount Badge */}
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{discountPercent}%</Text>
                    </View>

                    <Card.Content style={styles.productContent}>
                        <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>

                        <View style={styles.priceContainer}>
                            <Text style={styles.currentPrice}>{formatPrice(item.price)}</Text>
                            {discountPercent > 0 && (
                                <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
                            )}
                        </View>

                        {/* Category Chip */}
                        {item.category && (
                            <Chip
                                icon="tag"
                                textStyle={styles.chipText}
                                style={styles.categoryChip}
                                compact
                            >
                                {item.category}
                            </Chip>
                        )}
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.sectionTitle}>⚡ Giảm giá sốc</Text>
                <Text style={styles.subtitle}>Tiết kiệm lên đến 35%</Text>
            </View>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={renderProduct}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false} // Disable scroll since it's inside ScrollView
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    headerContainer: {
        marginHorizontal: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1A2A3A',
        textTransform: 'uppercase'
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    productItem: {
        marginBottom: 15,
    },
    productCard: {
        width: CARD_WIDTH,
        borderRadius: 12,
        elevation: 3,
        backgroundColor: '#fff',
    },
    productImage: {
        height: 120,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ff3b30',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        elevation: 4,
    },
    discountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    productContent: {
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    productName: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 6,
        color: '#333',
        minHeight: 36,
    },
    priceContainer: {
        marginBottom: 8,
    },
    currentPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 2,
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    categoryChip: {
        alignSelf: 'flex-start',
        height: 24,
        backgroundColor: '#f0f0f0',
    },
    chipText: {
        fontSize: 10,
        marginVertical: 0,
    },
});

export default DiscountedProducts;
