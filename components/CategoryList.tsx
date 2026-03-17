import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator, Avatar } from 'react-native-paper';
import { Category } from '../types/category';
import config from '../utils/config';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

interface CategoryListProps {
    onSelectCategory?: (categoryName: string | null) => void;
    selectedCategory?: string | null;
}

type CategoryNavigationProp = StackNavigationProp<RootStackParamList>;

const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory, selectedCategory }) => {
    const theme = useTheme();
    const navigation = useNavigation<CategoryNavigationProp>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.API_URL}/api/categories`);
            const data = await response.json();

            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Lỗi khi load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderCategory = ({ item }: { item: Category }) => {
        const isSelected = selectedCategory === item.name.toLowerCase();

        return (
            <TouchableOpacity
                onPress={() => {
                    if (onSelectCategory) {
                        onSelectCategory(isSelected ? null : item.name.toLowerCase());
                    } else {
                        navigation.navigate('CategoryProducts', { category: item.name });
                    }
                }}
                style={styles.categoryItem}
            >
                <Card
                    style={[
                        styles.categoryCard,
                        isSelected && { backgroundColor: theme.colors.primary, elevation: 6 }
                    ]}
                >
                    <View style={styles.categoryContent}>
                        {item.icon && (
                            <Avatar.Icon
                                size={40}
                                icon={item.icon}
                                style={[
                                    styles.categoryIcon,
                                    isSelected
                                        ? { backgroundColor: 'rgba(255,255,255,0.3)' }
                                        : { backgroundColor: theme.colors.primaryContainer }
                                ]}
                                color={isSelected ? '#fff' : theme.colors.primary}
                            />
                        )}
                        <Text
                            style={[
                                styles.categoryName,
                                isSelected && { color: '#fff', fontWeight: 'bold' }
                            ]}
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCategory}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 15,
        marginBottom: 12,
        color: '#333',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 15,
    },
    categoryItem: {
        marginRight: 12,
    },
    categoryCard: {
        borderRadius: 16,
        elevation: 3,
        backgroundColor: '#fff',
    },
    categoryContent: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 90,
    },
    categoryIcon: {
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 12,
        textAlign: 'center',
        color: '#555',
    },
});

export default CategoryList;
