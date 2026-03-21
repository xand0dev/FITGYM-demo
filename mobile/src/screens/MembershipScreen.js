import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import useAppStore from '../store/useAppStore';

export default function MembershipScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const navigation = useNavigation();
  
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // To auto-fill user info for the application
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [plansRes, userRes] = await Promise.all([
        apiClient.get('/membership-types/'),
        apiClient.get('/me/')
      ]);
      setPlans(plansRes.data);
      setUserInfo(userRes.data);
    } catch (e) {
      console.log('Error fetching memberships', e);
      Alert.alert('Помилка', 'Не вдалося завантажити тарифи');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (planId, planName) => {
    Alert.alert(
      'Оформлення абонемента',
      `Бажаєте залишити заявку на покупку тарифу "${planName}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        { 
          text: 'Підтвердити', 
          onPress: async () => {
            try {
              // Creating MembershipApplication
              await apiClient.post('/apply/', {
                name: userInfo?.full_name || userInfo?.username || 'Клієнт',
                phone: userInfo?.contact || '+380',
                membership_type: planId
              });
              Alert.alert('Успіх', 'Заявку успішно відправлено. Менеджер зв\'яжеться з вами найближчим часом.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося створити заявку.');
              console.log(error);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text === '#000000' ? '#ffffff' : COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Купити Абонемент</Text>
        <View style={{width: 40}} />
      </View>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{item.name}</Text>
              <Text style={styles.planPrice}>{item.amount} ₴</Text>
            </View>
            <Text style={styles.planPeriod}>{item.period_months} місяців</Text>
            <Text style={styles.planDesc}>{item.description}</Text>
            
            <TouchableOpacity style={styles.applyBtn} onPress={() => handleApply(item.id, item.name)}>
              <Text style={styles.applyBtnText}>Залишити заявку</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
  
  planCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333',
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  planName: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
  planPrice: { color: COLORS.primary, fontSize: 22, fontWeight: 'bold' },
  planPeriod: { color: COLORS.muted, fontSize: 14, marginBottom: 15 },
  planDesc: { color: COLORS.text, fontSize: 15, marginBottom: 20, lineHeight: 22 },
  
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
