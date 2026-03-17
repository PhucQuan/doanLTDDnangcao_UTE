import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Text, useTheme, Card, IconButton } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Product } from '../types/product';
import config from '../utils/config';

type CategoryProductsRouteProp = RouteProp<RootStackParamList, 'CategoryProducts'>;
type CategoryProductsNavigationProp = StackNavigationProp<RootStackParamList, 'CategoryProducts'>;

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 2 - 20;

const CategoryProductsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<CategoryProductsNavigationProp>();
    const route = useRoute<CategoryProductsRouteProp>();
    const { category } = route.params;

    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchProducts = async (pageNumber: number) => {
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const limit = 10;
            const response = await fetch(`${config.API_URL}/api/products?category=${encodeURIComponent(category)}&page=${pageNumber}&limit=${limit}`);
            const data = await response.json();

            if (data.success) {
                if (pageNumber === 1) {
                    setProducts(data.data);
                } else {
                    setProducts(prev => [...prev, ...data.data]);
                }

                if (data.data.length < limit || data.pagination?.page >= data.pagination?.totalPages) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchProducts(1);
    }, [category]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage);
        }
    };

    const navigateToDetail = (productId: number) => {
        navigation.navigate('ProductDetail', { productId });
    };

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.cardContainer} onPress={() => navigateToDetail(item.id)}>
            <Card style={styles.card}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                    <View style={styles.tagContainer}>
                        {item.id % 2 === 0 ? (
                            <Text style={[styles.tag, { backgroundColor: '#FF8599' }]}>HOT</Text>
                        ) : (
                            <Text style={[styles.tag, { backgroundColor: '#FF8599' }]}>NEW</Text>
                        )}
                    </View>
                    <IconButton
                        icon="heart-outline"
                        iconColor="#FF8599"
                        size={20}
                        style={styles.favoriteBtn}
                        onPress={() => { }}
                    />
                </View>
                <Card.Content style={styles.cardContent}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price))}
                        </Text>
                        <TouchableOpacity style={styles.addBtn} onPress={() => navigateToDetail(item.id)}>
                            <Text style={styles.addBtnText}>ADD</Text>
                        </TouchableOpacity>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    if (loading && page === 1) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF8599" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>Không có sản phẩm nào trong danh mục này.</Text>
                    </View>
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator size="small" color="#FF8599" />
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
        padding: 20,
        height: Dimensions.get('window').height * 0.6,
    },
    listContent: {
        padding: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 0,
    },
    cardContainer: {
        width: ITEM_WIDTH,
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 2,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: ITEM_WIDTH,
        backgroundColor: '#f0f0f0',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '80%',
        height: '80%',
    },
    tagContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    tag: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FFE5EA',
        margin: 5,
    },
    cardContent: {
        padding: 12,
        paddingTop: 8,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        height: 40,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    addBtn: {
        backgroundColor: '#FF8599',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    addBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    }
});

export default CategoryProductsScreen;
