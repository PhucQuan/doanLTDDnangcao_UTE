import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Title, Paragraph, useTheme, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Product } from '../types/product';
import config from '../utils/config';
import { useCartStore } from '../store/cartStore';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavProp = StackNavigationProp<RootStackParamList>;

import { discoveryService, reviewService } from '../services/ecommerce.service';

const ProductDetailScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<ProductDetailNavProp>();
    const route = useRoute<ProductDetailRouteProp>();
    const { productId } = route.params;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSize, setSelectedSize] = useState('40');
    
    // New States
    const [isFavorite, setIsFavorite] = useState(false);
    const [discoveryData, setDiscoveryData] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);

    const { addToCart, loading: cartLoading } = useCartStore();

    useEffect(() => {
        fetchProductDetail();
        fetchDiscoveryAndReviews();
        trackView();
    }, [productId]);

    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.API_URL}/api/products/${productId}`);
            const data = await response.json();

            if (data.success) {
                setProduct(data.data);
            } else {
                setError(data.message || 'Không thể tải thông tin sản phẩm');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const fetchDiscoveryAndReviews = async () => {
        try {
            const meta = await discoveryService.getProductMeta(productId);
            setDiscoveryData(meta);

            const revs = await reviewService.getProductReviews(productId);
            setReviews(revs);
            
            // Check if favorite (fetch list and check)
            const favs = await discoveryService.getFavorites();
            setIsFavorite(favs.some((f: any) => f.id === productId));
        } catch (err) {
            console.error('Error fetching meta/reviews:', err);
        }
    };

    const trackView = async () => {
        try {
            await discoveryService.trackProductView(productId);
        } catch (err) { /* ignore */ }
    };

    const handleToggleFavorite = async () => {
        try {
            const res = await discoveryService.toggleFavorite(productId);
            setIsFavorite(res.isFavorite);
        } catch (err) {
            alert('Cần đăng nhập để thực hiện');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={styles.errorContainer}>
                <Text style={{ color: theme.colors.error, marginBottom: 20 }}>{error || 'Sản phẩm không tồn tại'}</Text>
                <Button mode="contained" onPress={() => navigation.goBack()} style={{ backgroundColor: '#FF8599' }}>
                    Quay lại
                </Button>
            </View>
        );
    }

    const sizes = ['38', '39', '40', '41', '42', '43'];

    const handleAddToCart = async () => {
        const success = await addToCart(product.id, 1, selectedSize);
        if (success) {
            navigation.navigate('Cart');
        } else {
            alert('Không thể thêm vào giỏ hàng');
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Image
                source={{ uri: product.image }}
                style={styles.image}
                resizeMode="cover"
            />
            
            <TouchableOpacity 
                style={styles.favoriteBtn} 
                onPress={handleToggleFavorite}
            >
                <Chip icon={isFavorite ? "heart" : "heart-outline"} style={{ backgroundColor: isFavorite ? '#FFEBEE' : '#fff' }}>
                    {isFavorite ? "Favorite" : "Add to Fav"}
                </Chip>
            </TouchableOpacity>

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Chip style={styles.categoryChip} icon="tag">{product.category}</Chip>
                    <View style={styles.statsRow}>
                        <Text style={styles.statText}>🛒 {discoveryData?.stats?.buy_count || 0} sold</Text>
                        <Text style={[styles.statText, { marginLeft: 10 }]}>⭐ {reviews.length} reviews</Text>
                    </View>
                </View>

                <Title style={styles.title}>{product.name}</Title>

                <Text style={styles.price}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(product.price))}
                </Text>

                <Divider style={styles.divider} />

                <Title style={styles.sectionTitle}>Chọn Size</Title>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sizeContainer}>
                    {sizes.map(size => (
                        <TouchableOpacity
                            key={size}
                            style={[
                                styles.sizeBtn,
                                selectedSize === size && styles.sizeBtnSelected
                            ]}
                            onPress={() => setSelectedSize(size)}
                        >
                            <Text style={[
                                styles.sizeText,
                                selectedSize === size && styles.sizeTextSelected
                            ]}>
                                {size}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Divider style={styles.divider} />

                <Title style={styles.sectionTitle}>Mô tả sản phẩm</Title>
                <Paragraph style={styles.description}>{product.description || 'Sản phẩm chính hãng với thiết kế hiện đại, êm ái, phù hợp cho vận động mạnh.'}</Paragraph>

                <Button
                    mode="contained"
                    icon="cart"
                    style={styles.addCartBtn}
                    labelStyle={styles.addCartBtnText}
                    onPress={handleAddToCart}
                    loading={cartLoading}
                    disabled={cartLoading}
                >
                    Add to Cart
                </Button>

                <Divider style={styles.divider} />

                {/* Similar Products Section */}
                {discoveryData?.similarProducts?.length > 0 && (
                    <>
                        <Title style={styles.sectionTitle}>Sản phẩm tương tự</Title>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            {discoveryData.similarProducts.map((p: any) => (
                                <TouchableOpacity 
                                    key={p.id} 
                                    style={styles.similarProductCard}
                                    onPress={() => navigation.push('ProductDetail', { productId: p.id })}
                                >
                                    <Image source={{ uri: p.image }} style={styles.similarImage} />
                                    <Text numberOfLines={1} style={styles.similarText}>{p.name}</Text>
                                    <Text style={styles.similarPrice}>{new Intl.NumberFormat('vi-VN').format(p.price)}đ</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <Divider style={styles.divider} />
                    </>
                )}

                {/* Reviews Section */}
                <Title style={styles.sectionTitle}>Đánh giá ({reviews.length})</Title>
                {reviews.length === 0 ? (
                    <Paragraph style={{ fontStyle: 'italic', color: '#999' }}>Chưa có đánh giá nào cho sản phẩm này.</Paragraph>
                ) : (
                    reviews.map((rev: any) => (
                        <View key={rev.id} style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewUser}>{rev.user_name}</Text>
                                <Text style={styles.reviewRating}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</Text>
                            </View>
                            <Paragraph style={styles.reviewComment}>{rev.comment}</Paragraph>
                            <Text style={styles.reviewDate}>{new Date(rev.created_at).toLocaleDateString()}</Text>
                        </View>
                    ))
                )}
                <View style={{ height: 50 }} />
            </View>
        </ScrollView>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#eee',
    },
    contentContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -20, // Overlap image
        minHeight: 500,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryChip: {
        backgroundColor: '#e0e0e0',
    },
    date: {
        color: '#888',
        fontSize: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333'
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#FF8599'
    },
    divider: {
        marginVertical: 15,
        backgroundColor: '#eee'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#555'
    },
    sizeContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    sizeBtn: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    sizeBtnSelected: {
        backgroundColor: '#FF8599',
    },
    sizeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
    },
    sizeTextSelected: {
        color: '#fff',
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        color: '#666',
        marginBottom: 30,
    },
    addCartBtn: {
        backgroundColor: '#FF8599',
        paddingVertical: 8,
        borderRadius: 25,
        marginTop: 10,
    },
    addCartBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    similarProductCard: {
        width: 120,
        marginRight: 15,
        backgroundColor: '#f9f9f9',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee'
    },
    similarImage: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginBottom: 5,
    },
    similarText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333'
    },
    similarPrice: {
        fontSize: 12,
        color: '#FF8599',
        fontWeight: 'bold'
    },
    reviewItem: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    reviewUser: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333'
    },
    reviewRating: {
        color: '#FFD700',
        fontSize: 14,
    },
    reviewComment: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    reviewDate: {
        fontSize: 11,
        color: '#999',
        marginTop: 5,
    }
});

export default ProductDetailScreen;
