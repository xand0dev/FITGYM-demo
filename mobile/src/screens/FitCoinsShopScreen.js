import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Vibration } from 'react-native';
import Alert from '../utils/dialog';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useAppStore from '../store/useAppStore';

const { width } = Dimensions.get('window');

const REWARDS = [
  { id: 1, title: 'Протеїновий Батончик', price: 150, icon: 'nutrition', color: '#ff8c00' },
  { id: 2, title: 'Американо (Бар)', price: 200, icon: 'cafe', color: '#8b4513' },
  { id: 3, title: 'Релакс Масаж (15 хв)', price: 1000, icon: 'body', color: '#4169e1' },
  { id: 4, title: 'Знижка 15% на Мерч', price: 1500, icon: 'shirt', color: '#ff1493' },
];

export default function FitCoinsShopScreen() {
  const ObjectHasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  const COLORS = useTheme();
  const styles = getStyles(COLORS, ObjectHasOwn);
  const navigation = useNavigation();
  const { fitCoins, addFitCoins } = useAppStore();

  const handlePurchase = (reward) => {
    if (fitCoins >= reward.price) {
      Alert.alert(
        "Підтвердження",
        `Бажаєте витратити ${reward.price} FC на "${reward.title}"?`,
        [
          { text: "Скасувати", style: "cancel" },
          { 
            text: "Купити", 
            style: "default",
            onPress: () => {
              addFitCoins(-reward.price);
              Vibration.vibrate([0, 50, 50, 50]);
              Alert.alert('Успіх!', 'Покажіть цей екран на рецепції для отримання нагороди.');
            }
          }
        ]
      );
    } else {
      Vibration.vibrate(100);
      Alert.alert(
        "Недостатньо FC",
        `Вам потрібно ще ${reward.price - fitCoins} FC. Продовжуйте тренуватися!`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Магазин Нагород</Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>ТВІЙ БАЛАНС</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
             <Ionicons name="server" size={40} color="#ffd700" style={styles.coinIcon} />
             <Text style={styles.balanceValue}>{fitCoins}</Text>
             <Text style={styles.balanceCurrency}> FC</Text>
          </View>
          <Text style={styles.balanceDesc}>Отримуй FitCoins за кожне тренування та випиту воду. Обмінюй їх на реальні призи!</Text>
        </View>

        <Text style={styles.sectionTitle}>Доступні нагороди</Text>

        <View style={styles.rewardsGrid}>
          {REWARDS.map(reward => (
            <TouchableOpacity 
               key={reward.id} 
               style={styles.rewardCard}
               activeOpacity={0.8}
               onPress={() => handlePurchase(reward)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: `${reward.color}20` }]}>
                <Ionicons name={reward.icon} size={32} color={reward.color} />
              </View>
              <Text style={styles.rewardTitle} numberOfLines={2}>{reward.title}</Text>
              
              <View style={styles.priceTag}>
                 <Ionicons name="server" size={14} color="#ffd700" style={{marginRight: 4}} />
                 <Text style={styles.priceText}>{reward.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (COLORS, ObjectHasOwn) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  
  content: { padding: 20 },
  
  balanceContainer: {
    backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a',
    borderRadius: 24, padding: 30, alignItems: 'center',
    borderWidth: 1, borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333',
    marginBottom: 30,
    shadowColor: '#ffd700', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10
  },
  balanceLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  coinIcon: { marginRight: 10, shadowColor: '#ffd700', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.8, shadowRadius: 10 },
  balanceValue: { color: COLORS.text, fontSize: 48, fontWeight: '900' },
  balanceCurrency: { color: '#ffd700', fontSize: 24, fontWeight: '800', alignSelf: 'flex-bottom', marginBottom: 8 },
  balanceDesc: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginTop: 15, lineHeight: 20 },

  sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 20 },
  
  rewardsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  rewardCard: {
    width: (width - 40 - 15) / 2, // 2 columns, 20 padding sides, 15 gap
    backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a',
    borderRadius: 20, padding: 20, marginBottom: 15, alignItems: 'center',
    borderWidth: 1, borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333'
  },
  iconWrapper: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15
  },
  rewardTitle: {
    color: COLORS.text, fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 15, minHeight: 40
  },
  priceTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12
  },
  priceText: { color: '#ffd700', fontSize: 14, fontWeight: '800' }
});
