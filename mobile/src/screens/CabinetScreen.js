import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import useAppStore from '../store/useAppStore';
import apiClient from '../api/client';

export default function CabinetScreen() {
  const logout = useAppStore((state) => state.logout);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.full_name?.charAt(0) || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{profile?.full_name || profile?.username}</Text>
            <Text style={styles.userStatus}>
              {profile?.active_membership ? `Абонемент: ${profile.active_membership.name}` : 'Немає активного абонемента'}
            </Text>
          </View>
        </View>
      </View>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Мої записи</Text>
        
        {bookings.length === 0 ? (
          <Text style={{color: COLORS.muted}}>Немає активних записів.</Text>
        ) : (
          bookings.map(booking => {
            const date = new Date(booking.session.start_at);
            const formattedDate = `${date.toLocaleDateString('uk-UA')} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            return (
              <View key={booking.id} style={{marginBottom: 15}}>
                <View style={styles.bookingCard}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
                    <Text style={styles.bookingTitle}>{booking.session.class_name}</Text>
                    <Text style={styles.bookingDate}>{formattedDate}</Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                    <Ionicons name="person" size={14} color={COLORS.muted} />
                    <Text style={styles.bookingTrainer}>{booking.session.instructor_name || 'Без тренера'}</Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4}}>
                    <Ionicons name="checkmark-circle" size={14} color={booking.status === 'booked' ? COLORS.primary : COLORS.muted} />
                    <Text style={styles.bookingTrainer}>Статус: {booking.status}</Text>
                  </View>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Налаштування</Text>
        
        <TouchableOpacity style={styles.settingRow}>
          <Ionicons name="moon-outline" size={20} color={COLORS.text} />
          <Text style={styles.settingText}>Темна тема</Text>
          <View style={styles.toggleActive} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={[styles.settingText, { color: COLORS.error }]}>Вийти з акаунту</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: '#222' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatar: { width: 60, height: 60, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 10 },
  avatarText: { color: COLORS.text, fontSize: 24, fontWeight: '900' },
  userName: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  userStatus: { color: COLORS.primary, fontSize: 13, fontWeight: '600', marginTop: 3 },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, marginTop: 10 },
  statBox: { flex: 1, backgroundColor: '#141414', marginHorizontal: 5, padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  statValue: { color: COLORS.text, fontSize: 24, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 12, marginTop: 5, fontWeight: '500' },
  
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  
  bookingCard: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333' },
  bookingTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  bookingDate: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold' },
  bookingTrainer: { color: COLORS.muted, fontSize: 14 },
  
  cancelBtn: { marginTop: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333', borderRadius: 10 },
  cancelBtnText: { color: COLORS.error, fontWeight: 'bold' },

  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  settingText: { flex: 1, color: COLORS.text, fontSize: 16, marginLeft: 15, fontWeight: '500' },
  toggleActive: { width: 40, height: 22, backgroundColor: COLORS.primary, borderRadius: 11, borderWidth: 2, borderColor: '#000' }
});