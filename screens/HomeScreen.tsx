import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Avatar, Title, Paragraph, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../utils/constants';

// Định nghĩa kiểu cho User Data
interface UserData {
  name: string;
  phone: string;
  email?: string;
  role?: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const theme = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock Data cho danh sách đề tài (Sau này thế bằng API)
  const topics = [
    { id: 1, title: 'Lập trình di động React Native', icon: 'cellphone', progress: 0.8, color: '#4caf50' },
    { id: 2, title: 'Bảo mật API & Backend', icon: 'shield-check', progress: 0.6, color: '#2196f3' },
    { id: 3, title: 'Thiết kế UI/UX với Paper', icon: 'palette', progress: 0.4, color: '#ff9800' },
    { id: 4, title: 'Quản lý State & Redux', icon: 'database', progress: 0.2, color: '#9c27b0' },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Lỗi khi load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear(); // Xóa session
            navigation.replace('Login'); // Quay về Login
          }
        }
      ]
    );
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Title style={styles.userName}>{user?.name || 'Khách'}</Title>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar.Text
              size={50}
              label={getInitials(user?.name || '')}
              style={{ backgroundColor: theme.colors.secondary }}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        {/* User Info Card Overlay */}
        <Card style={styles.infoCard}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.infoItem}>
              <IconButton icon="phone" size={20} iconColor={theme.colors.primary} />
              <Text>{user?.phone || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.infoItem}>
              <IconButton icon="account-badge" size={20} iconColor={theme.colors.primary} />
              <Text style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{user?.role || 'USER'}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Main Content */}
      <View style={styles.content}>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Đề tài của tôi</Title>
          <Button mode="text" onPress={() => console.log('Xem tất cả')}>Xem tất cả</Button>
        </View>

        {/* Topic Grid */}
        <View style={styles.grid}>
          {topics.map((topic) => (
            <Card key={topic.id} style={styles.topicCard} mode="elevated">
              <Card.Content>
                <Avatar.Icon
                  size={40}
                  icon={topic.icon}
                  style={{ backgroundColor: topic.color, marginBottom: 10 }}
                  color="#fff"
                />
                <Title style={styles.topicTitle}>{topic.title}</Title>
                <Paragraph style={styles.topicProgress}>Tiến độ: {topic.progress * 100}%</Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Actions */}
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Profile')}
          style={[styles.logoutButton, { marginBottom: 10, backgroundColor: theme.colors.primary }]}
          icon="account"
        >
          Thông tin cá nhân
        </Button>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
          buttonColor={theme.colors.error}
        >
          Đăng xuất
        </Button>
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
  header: {
    paddingTop: 60,
    paddingBottom: 80, // Space for Card Overlay
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoCard: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    right: 20,
    elevation: 4,
    borderRadius: 15,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    marginTop: 50, // Space for Card Overlay
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicCard: {
    width: (width - 50) / 2, // 2 columns
    marginBottom: 15,
    borderRadius: 12,
  },
  topicTitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 5,
    lineHeight: 20,
  },
  topicProgress: {
    fontSize: 12,
    color: '#888',
  },
  logoutButton: {
    marginTop: 20,
    borderRadius: 10,
    paddingVertical: 5,
  },
});

export default HomeScreen;