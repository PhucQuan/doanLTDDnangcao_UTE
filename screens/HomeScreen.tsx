import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import { Text, Avatar, Title, useTheme, Searchbar, Card, ActivityIndicator, Chip, IconButton, Badge } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Product } from '../types/product';
import config from '../utils/config';
import { useCartStore } from '../store/cartStore';

import CategoryList from '../components/CategoryList';
import BestSellingProducts from '../components/BestSellingProducts';
import DiscountedProducts from '../components/DiscountedProducts';

interface UserData {
  name: string;
  phone: string;
  email?: string;
  role?: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme = useTheme();

  const [user, setUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search state
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const { getCartCount, fetchCart } = useCartStore();

  useEffect(() => {
    loadUserData();
    fetchCart();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchCart();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Lỗi khi load user:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất', style: 'destructive', onPress: async () => {
          await AsyncStorage.clear();
          navigation.replace('Login');
        }
      }
    ]);
  };

  // Logic gọi API để lọc/tìm kiếm sản phẩm
  const executeSearch = async (query: string, category: string | null) => {
    if (!query.trim() && !category) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setLoadingSearch(true);
    try {
      let url = `${config.API_URL}/api/products?`;
      if (query.trim()) url += `q=${encodeURIComponent(query)}&`;
      if (category) url += `category=${encodeURIComponent(category)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error('Lỗi khi search:', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    executeSearch(searchQuery, selectedCategory);
  };

  const onChangeCategory = (cat: string | null) => {
    setSelectedCategory(cat);
    executeSearch(searchQuery, cat);
  };

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Trở lại sân bóng,</Text>
            <Title style={styles.userName}>{user?.name || 'Vận động viên'}</Title>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
              <IconButton icon="cart-outline" iconColor="#fff" size={24} style={{ margin: 0 }} />
              {getCartCount() > 0 && (
                <Badge style={styles.badge} size={18}>{getCartCount()}</Badge>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarBorder}>
              <Avatar.Text
                size={40}
                label={getInitials(user?.name || '')}
                style={{ backgroundColor: theme.colors.secondary }}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Tên đôi giày, kích thước, hiệu..."
          placeholderTextColor="#90A4AE"
          iconColor="#B0BEC5"
          onChangeText={(txt) => {
            setSearchQuery(txt);
            if (!txt && !selectedCategory) setIsSearching(false);
          }}
          value={searchQuery}
          onSubmitEditing={handleSearchSubmit}
          onIconPress={handleSearchSubmit}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Main Content - ScrollView */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Lọc danh mục dùng thư mục chung */}
        <CategoryList selectedCategory={selectedCategory} onSelectCategory={onChangeCategory} />

        {isSearching ? (
          /* =================== KẾT QUẢ TÌM KIẾM =================== */
          <View style={styles.searchResultContainer}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>KẾT QUẢ TÌM KIẾM</Text>
              <Chip icon="close" onPress={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setIsSearching(false);
              }} textStyle={{ fontSize: 12 }}>Bỏ lọc</Chip>
            </View>

            {loadingSearch ? (
              <ActivityIndicator size="large" color={theme.colors.secondary} style={styles.loaderSpacing} />
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào trên sân!</Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {searchResults.map(item => (
                  <TouchableOpacity
                    key={item.id.toString()}
                    style={styles.gridItem}
                    onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                  >
                    <Card style={styles.searchCard}>
                      <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
                      <Card.Content style={styles.cardContent}>
                        <Text numberOfLines={2} style={styles.cardTitle}>{item.name}</Text>
                        <Text style={[styles.cardPrice, { color: theme.colors.secondary }]}>{formatPrice(item.price)}</Text>
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* =================== MẶC ĐỊNH (HOME) =================== */
          <View>
            <BestSellingProducts />
            <DiscountedProducts />
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ... Design mới cho HomeScreen
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 5,
  },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBtn: {
    marginRight: 15,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF8599',
    color: '#fff',
    fontWeight: 'bold',
  },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', textTransform: 'uppercase' },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  avatarBorder: {
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 24, padding: 2,
  },
  searchBar: {
    borderRadius: 14, backgroundColor: '#fff', height: 50, elevation: 4,
  },
  searchInput: { fontSize: 15, paddingVertical: 0 },
  content: { flex: 1, paddingTop: 10 },

  /* Styling Ket qua */
  searchResultContainer: { paddingHorizontal: 20, marginTop: 10 },
  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  searchTitle: { fontSize: 18, fontWeight: '900', color: '#1A2A3A' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 15, fontStyle: 'italic' },
  loaderSpacing: { marginTop: 40 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '47%', marginBottom: 15 },
  searchCard: { backgroundColor: '#fff', borderRadius: 12, elevation: 3, overflow: 'hidden' },
  cardImage: { height: 130, borderRadius: 0 },
  cardContent: { padding: 10 },
  cardTitle: { fontSize: 13, color: '#333', marginBottom: 5, minHeight: 35, lineHeight: 18, fontWeight: '600' },
  cardPrice: { fontSize: 15, fontWeight: '900' }
});

export default HomeScreen;
