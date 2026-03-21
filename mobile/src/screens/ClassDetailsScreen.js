import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../api/client';

export default function ClassDetailsScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { classItem } = route.params;
  const [isBooking, setIsBooking] = useState(false);

  const handleBook = async () => {
    try {
      setIsBooking(true);
      await apiClient.post('/book/', { session: classItem.id });
      Alert.alert('Успіх', 'Успішно заброньовано!');
      navigation.goBack();
    } catch (error) {
      const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      Alert.alert('Помилка', `Не вдалося забронювати: ${msg}`);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text === '#000000' ? '#ffffff' : COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Деталі тренування</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.content}>
        <View style={styles.tagWrap}>
          <Text style={styles.tag}>{classItem.room_name || 'Без залу'}</Text>
        </View>
        <Text style={styles.title}>{classItem.class_name}</Text>
        
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={COLORS.primary} />
            <View>
              <Text style={styles.infoLabel}>Час</Text>
              <Text style={styles.infoValue}>{classItem.parsedDate} {classItem.parsedTime}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
            <View>
              <Text style={styles.infoLabel}>Тренер</Text>
              <Text style={styles.infoValue}>{classItem.instructor_name || 'Вільний'}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="flame" size={20} color={COLORS.primary} />
            <View>
              <Text style={styles.infoLabel}>К-ть місць</Text>
              <Text style={styles.infoValue}>{classItem.capacity}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.bookBtn, isBooking && { opacity: 0.7 }]} 
          onPress={handleBook}
          disabled={isBooking}
        >
          {isBooking ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.bookBtnText}>ЗАБРОНЮВАТИ МІСЦЕ</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#222'
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  
  content: { padding: 20, flex: 1 },
  tagWrap: { alignSelf: 'flex-start', backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 15 },
  tag: { color: '#888888', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }, // always grey on dark badge
  title: { color: COLORS.text, fontSize: 32, fontWeight: '900', marginBottom: 30, letterSpacing: -1 },
  
  infoBox: { backgroundColor: COLORS.card, borderRadius: 15, padding: 20, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', marginBottom: 30 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  infoLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  infoValue: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', marginVertical: 15 },
  
  descTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { color: COLORS.muted, fontSize: 15, lineHeight: 24 },
  
  footer: { padding: 20, paddingBottom: 40, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#222' },
  bookBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 10, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  bookBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 1 } // always white text on primary red
});
