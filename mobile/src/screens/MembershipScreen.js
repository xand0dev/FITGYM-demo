import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Vibration, Platform, Dimensions } from 'react-native';
import Alert from '../utils/dialog';
import { useTheme } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import useAppStore from '../store/useAppStore';
import { getMonthsWord, formatCurrency, cleanPlanName } from '../utils/formatters';

const { width } = Dimensions.get('window');

export default function MembershipScreen() {
  const ObjectHasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  const COLORS = useTheme();
  const styles = getStyles(COLORS, ObjectHasOwn);
  const navigation = useNavigation();
  
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // VIP Checkout State
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0=confirm, 1=processing, 2=success
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Спочатку — профіль, щоб дізнатися gym_id для фільтру тарифів
      const userRes = await apiClient.get('/me/');
      const gymId = userRes.data?.gym_id;
      const plansUrl = gymId ? `/membership-types/?gym_id=${gymId}` : '/membership-types/';
      const plansRes = await apiClient.get(plansUrl);
      setPlans(plansRes.data);
      setUserInfo(userRes.data);
    } catch (e) {
      console.log('Error fetching memberships', e);
      Alert.alert('Помилка', 'Не вдалося завантажити тарифи');
    } finally {
      setIsLoading(false);
    }
  };

  // Бейдж: "БЕЗЛІМ" для тарифів без часового обмеження, інакше — діапазон годин
  const formatTariffBadge = (item) => {
    const period = `${item.period_months} ${getMonthsWord(item.period_months)}`;
    if (item.time_limit_start && item.time_limit_end) {
      const from = String(item.time_limit_start).slice(0, 5);
      const to = String(item.time_limit_end).slice(0, 5);
      return `${period} · ${from}–${to}`;
    }
    return `${period} БЕЗЛІМ`;
  };

  const startCheckout = (planId, planName, planPrice) => {
    setSelectedPlan({ id: planId, name: planName, price: planPrice });
    setCheckoutStep(0);
    setCheckoutModalVisible(true);
    Vibration.vibrate(20);
  };

  const processPayment = async () => {
    setCheckoutStep(1); // Set to Processing
    Vibration.vibrate(30);
    
    // Simulate bank/network delay for premium UX feel
    setTimeout(async () => {
      try {
        await apiClient.post('/apply/', {
          name: userInfo?.full_name || userInfo?.username || 'Клієнт',
          phone: userInfo?.contact || '+380',
          membership_type: selectedPlan.id
        });
        
        setCheckoutStep(2); // Set to Success
        Vibration.vibrate([0, 50, 50, 50]); // Success pattern
        
        // Auto-close modal after 2.5 seconds
        setTimeout(() => {
          setCheckoutModalVisible(false);
          navigation.goBack();
          // Alert just to ensure the user knows it's completely done
          setTimeout(() => Alert.alert('Вітаємо!', `Ваш тариф "${selectedPlan.name}" активовано! Меню розблоковано.`), 500);
        }, 2500);
        
      } catch (error) {
        setCheckoutModalVisible(false);
        const errDesc = error.response?.data?.detail || error.message;
        Alert.alert('Помилка', `Платіж не пройшов. Причина: ${errDesc}`);
      }
    }, 2000);
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
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const formattedPrice = formatCurrency(item.amount);
          const cleanName = cleanPlanName(item.name);

          return (
          <View style={styles.planCard}>
            {/* Top Badge */}
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{formatTariffBadge(item)}</Text>
            </View>
            
            {/* Title */}
            <Text style={styles.planName} numberOfLines={1} adjustsFontSizeToFit>{cleanName}</Text>
            
            {/* Price Block */}
            <View style={styles.priceContainer}>
              <Text style={styles.planPrice}>{formattedPrice}</Text>
              <Text style={styles.currencyText}> ₴</Text>
            </View>
            
            {/* Divider */}
            <View style={styles.planDivider} />
            
            {/* Description */}
            <Text style={styles.planDesc}>{item.description}</Text>
            
            <TouchableOpacity style={styles.applyBtn} onPress={() => startCheckout(item.id, item.name, formattedPrice)}>
              <Text style={styles.applyBtnText}>Обрати тариф</Text>
            </TouchableOpacity>
          </View>
        )}}
      />

      {/* VIP Checkout Modal */}
      <Modal visible={checkoutModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.bottomSheet}>
            {checkoutStep === 0 && (
              <View style={styles.sheetContent}>
                <Ionicons name="card" size={40} color={COLORS.text} style={{marginBottom: 15}} />
                <Text style={styles.sheetTitle}>Підтвердження Оплати</Text>
                
                <View style={styles.receiptContainer}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptText}>Тариф: {selectedPlan?.name}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptText, {fontWeight: 'bold', fontSize: 18}]}>До сплати:</Text>
                    <Text style={styles.receiptPrice}>{selectedPlan?.price} ₴</Text>
                  </View>
                </View>

                <View style={styles.paymentMethodRow}>
                  <Ionicons name="card-outline" size={28} color={COLORS.muted} style={{marginRight: 10}} />
                  <Text style={styles.paymentMethodText}>Mastercard / Visa / Apple Pay</Text>
                </View>

                <TouchableOpacity style={styles.payBtn} onPress={processPayment}>
                   <Text style={styles.payBtnText}>Оплатити {selectedPlan?.price} ₴</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelLinkBtn} onPress={() => setCheckoutModalVisible(false)}>
                   <Text style={styles.cancelLinkText}>Скасувати</Text>
                </TouchableOpacity>
              </View>
            )}

            {checkoutStep === 1 && (
              <View style={[styles.sheetContent, {alignItems: 'center', paddingVertical: 60}]}>
                <ActivityIndicator size="large" color={COLORS.primary} style={{transform: [{scale: 1.5}], marginBottom: 30}} />
                <Text style={styles.sheetTitle}>Зв'язок з банком...</Text>
                <Text style={styles.sheetSubtitle}>Будь ласка, зачекайте. Не закривайте додаток.</Text>
              </View>
            )}

            {checkoutStep === 2 && (
              <View style={[styles.sheetContent, {alignItems: 'center', paddingVertical: 50}]}>
                <View style={styles.successCircle}>
                  <Ionicons name="checkmark" size={60} color="#fff" />
                </View>
                <Text style={[styles.sheetTitle, {marginTop: 20}]}>Оплата успішна!</Text>
                <Text style={styles.sheetSubtitle}>Дякуємо за покупку. Акаунт оновлено.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (COLORS, ObjectHasOwn) => StyleSheet.create({
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
    borderBottomColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#222'
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  
  planCard: {
    backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1A1A1A',
    padding: 24,
    borderRadius: 28,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5
  },
  badgeContainer: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16
  },
  badgeText: { color: COLORS.primary, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  
  planName: { color: COLORS.text, fontSize: 32, fontWeight: '900', marginBottom: 10, lineHeight: 36 },
  
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  planPrice: { color: COLORS.text, fontSize: 44, fontWeight: '900', letterSpacing: -1 },
  currencyText: { color: COLORS.muted, fontSize: 24, fontWeight: '700', marginLeft: 4 },
  
  planDivider: { height: 1, backgroundColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333', marginBottom: 20 },
  
  planDesc: { color: COLORS.muted, fontSize: 16, marginBottom: 30, lineHeight: 24 },
  
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  applyBtnText: { color: '#000', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },

  // Modal Styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1A1A1A', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: Platform.OS === 'ios' ? 40 : 30, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 },
  sheetContent: { width: '100%' },
  sheetTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900', marginBottom: 20 },
  sheetSubtitle: { color: COLORS.muted, fontSize: 16, textAlign: 'center', marginTop: 10 },
  
  receiptContainer: { backgroundColor: ObjectHasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#111', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  receiptPrice: { color: COLORS.primary, fontSize: 20, fontWeight: '900' },
  divider: { height: 1, backgroundColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333', marginVertical: 15 },
  
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', padding: 15, borderRadius: 12, marginBottom: 30 },
  paymentMethodText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  payBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 15 },
  payBtnText: { color: '#000', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  
  cancelLinkBtn: { paddingVertical: 10, alignItems: 'center' },
  cancelLinkText: { color: COLORS.muted, fontSize: 16, fontWeight: '700' },
  
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#00C851', justifyContent: 'center', alignItems: 'center', shadowColor: '#00C851', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }
});
