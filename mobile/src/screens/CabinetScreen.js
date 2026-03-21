import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Switch } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../constants/theme';
import useAppStore from '../store/useAppStore';
import apiClient from '../api/client';

export default function CabinetScreen() {
  const { logout, toggleTheme, theme } = useAppStore();
  const COLORS = useTheme();
  const styles = getStyles(COLORS);

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUri, setAvatarUri] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [meRes, bookingsRes] = await Promise.all([
        apiClient.get('/me/'),
        apiClient.get('/my-bookings/')
      ]);
      setProfile(meRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.log('Помилка завантаження профілю:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити дані профілю');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    Alert.alert('Підтвердження', 'Ви впевнені, що хочете скасувати запис?', [
      { text: 'Ні', style: 'cancel' },
      { text: 'Так', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/my-bookings/${bookingId}/`);
            setBookings(bookings.filter(b => b.id !== bookingId));
            Alert.alert('Успіх', 'Запис скасовано');
          } catch (error) {
            Alert.alert('Помилка', 'Не вдалося скасувати запис');
          }
      }}
    ]);
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Змінити фото',
      'Оберіть спосіб завантаження фото',
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Камера', onPress: takePhoto },
        { text: 'Галерея', onPress: pickImage }
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Помилка', 'Потрібен доступ до камери');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Помилка', 'Потрібен доступ до галереї');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Premium Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{profile?.full_name?.charAt(0) || 'U'}</Text>
            )}
            <View style={styles.editIconBadge}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{profile?.full_name || profile?.username}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.userStatus}>
                {profile?.active_membership ? `Абонемент: ${profile.active_membership.name}` : 'Базовий акаунт'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Записів</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile?.active_membership ? 'PRO' : '-'}</Text>
          <Text style={styles.statLabel}>Тариф</Text>
        </View>
      </View>

      {/* Bookings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Мої записи</Text>
        
        {bookings.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <Ionicons name="calendar-outline" size={40} color={COLORS.muted} style={{marginBottom: 10}} />
            <Text style={{color: COLORS.muted, fontSize: 16}}>Немає активних записів.</Text>
          </View>
        ) : (
          bookings.map(booking => {
            const date = new Date(booking.session.start_at);
            const formattedDate = `${date.toLocaleDateString('uk-UA')} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            return (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingTitle}>{booking.session.class_name}</Text>
                  <Text style={styles.bookingDate}>{formattedDate}</Text>
                </View>
                <View style={styles.bookingDetails}>
                  <Ionicons name="person-circle-outline" size={16} color={COLORS.muted} />
                  <Text style={styles.bookingTrainer}>{booking.session.instructor_name || 'Без тренера'}</Text>
                </View>
                <View style={styles.bookingStatus}>
                  <Ionicons name="checkmark-circle" size={16} color={booking.status === 'booked' ? COLORS.primary : COLORS.muted} />
                  <Text style={[styles.bookingTrainer, {color: booking.status === 'booked' ? COLORS.primary : COLORS.muted}]}>
                    Статус: {booking.status}
                  </Text>
                </View>
                {booking.status === 'booked' && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelBooking(booking.id)}>
                    <Text style={styles.cancelBtnText}>Скасувати запис</Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          })
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Налаштування</Text>
        
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name={theme === 'dark' ? "moon" : "sunny"} size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingText}>Темна тема</Text>
            <Switch 
              value={theme === 'dark'} 
              onValueChange={toggleTheme}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }} // adding transparency
              thumbColor={theme === 'dark' ? COLORS.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingText}>Сповіщення</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="language-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingText}>Мова (Українська)</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Вийти з акаунту</Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    padding: 24, 
    paddingTop: 60, 
    backgroundColor: COLORS.card, 
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 10
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  avatarContainer: {
    position: 'relative',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 25, 
    backgroundColor: COLORS.primary, 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.card
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#ffffff', fontSize: 32, fontWeight: '900' },
  editIconBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card
  },
  profileInfo: { flex: 1 },
  userName: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  statusBadge: { 
    backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : COLORS.primary + '20', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12, 
    alignSelf: 'flex-start' 
  },
  userStatus: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 15 },
  statBox: { 
    flex: 1, 
    backgroundColor: COLORS.cardBackground, 
    marginHorizontal: 8, 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center', 
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1, 
    borderColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : COLORS.border 
  },
  statValue: { color: COLORS.text, fontSize: 28, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 13, marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  
  section: { paddingHorizontal: 24, marginTop: 30 },
  sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 15 },
  
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed'
  },
  
  bookingCard: { 
    backgroundColor: COLORS.cardBackground, 
    padding: 18, 
    borderRadius: 16, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1, 
    borderColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : COLORS.border 
  },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bookingTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', flex: 1 },
  bookingDate: { color: COLORS.primary, fontSize: 14, fontWeight: '700', backgroundColor: COLORS.primary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  bookingDetails: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  bookingStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bookingTrainer: { color: COLORS.muted, fontSize: 14, fontWeight: '500' },
  
  cancelBtn: { marginTop: 16, paddingVertical: 12, alignItems: 'center', backgroundColor: COLORS.error + '15', borderRadius: 12 },
  cancelBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },

  settingsGroup: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: { flex: 1, color: COLORS.text, fontSize: 16, marginLeft: 15, fontWeight: '600' },
  settingDivider: {
    height: 1,
    backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : COLORS.border,
    marginLeft: 60,
    marginRight: 15
  },
  
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 25, 
    paddingVertical: 16, 
    backgroundColor: COLORS.error + '10', 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.error + '30'
  },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: '700', marginLeft: 10 }
});