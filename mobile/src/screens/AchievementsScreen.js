import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../api/client';
import SecureStore from '../utils/storage';

export default function AchievementsScreen() {
  const ObjectHasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  const COLORS = useTheme();
  const styles = getStyles(COLORS, ObjectHasOwn);
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    bookingsCount: 0,
    hasPro: false,
    waterAmount: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [meRes, bookingsRes] = await Promise.all([
        apiClient.get('/me/').catch(() => ({ data: null })),
        apiClient.get('/my-bookings/').catch(() => ({ data: { results: [] } }))
      ]);

      let waterVal = 0;
      const savedWater = await SecureStore.getItemAsync('waterTracker');
      if (savedWater) {
        const data = JSON.parse(savedWater);
        if (data.date === new Date().toDateString()) waterVal = data.amount;
      }

      setStats({
        bookingsCount: bookingsRes.data.results ? bookingsRes.data.results.length : bookingsRes.data.length,
        hasPro: meRes.data?.active_membership ? true : false,
        waterAmount: waterVal
      });
    } catch (e) {
      console.log('Error loading achievements', e);
    } finally {
      setIsLoading(false);
    }
  };

  const ACHIEVEMENTS = [
    {
      id: 1,
      title: 'Перший Крок',
      desc: 'Зробіть свій перший запис на тренування.',
      icon: 'footsteps',
      unlocked: stats.bookingsCount > 0,
      progress: stats.bookingsCount > 0 ? 1 : 0,
      total: 1
    },
    {
      id: 2,
      title: 'Залізна Воля',
      desc: 'Відвідайте як мінімум 5 тренувань.',
      icon: 'barbell',
      unlocked: stats.bookingsCount >= 5,
      progress: Math.min(stats.bookingsCount, 5),
      total: 5
    },
    {
      id: 3,
      title: 'Водний Баланс',
      desc: 'Випийте 2.5 літра води за сьогодні.',
      icon: 'water',
      unlocked: stats.waterAmount >= 2500,
      progress: Math.min(stats.waterAmount, 2500),
      total: 2500
    },
    {
      id: 4,
      title: 'PRO Атлет',
      desc: 'Придбайте PRO абонемент для безліміту.',
      icon: 'star',
      unlocked: stats.hasPro,
      progress: stats.hasPro ? 1 : 0,
      total: 1
    }
  ];

  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;

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
        <Text style={styles.headerTitle}>Мої Досягнення</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.statsOverview}>
          <Text style={styles.overviewCount}>{unlockedCount}</Text>
          <Text style={styles.overviewText}>з {ACHIEVEMENTS.length} відкритих нагород</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.grid}>
          {ACHIEVEMENTS.map(item => (
            <View key={item.id} style={[styles.badgeCard, !item.unlocked && styles.badgeCardLocked]}>
              <View style={[styles.iconWrap, item.unlocked ? styles.iconWrapUnlocked : styles.iconWrapLocked]}>
                <Ionicons name={item.icon} size={36} color={item.unlocked ? '#000' : COLORS.muted} />
              </View>
              <Text style={[styles.badgeTitle, !item.unlocked && {color: COLORS.muted}]}>{item.title}</Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>{item.desc}</Text>
              
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>{item.progress} / {item.total}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const getStyles = (COLORS, ObjectHasOwn) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#222'
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  content: { padding: 20 },
  
  statsOverview: { backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1A1A1A', borderRadius: 24, padding: 25, marginBottom: 25, alignItems: 'center', borderWidth: 1, borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  overviewCount: { color: COLORS.primary, fontSize: 48, fontWeight: '900', letterSpacing: -2 },
  overviewText: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginBottom: 20 },
  progressBarBg: { width: '100%', height: 10, borderRadius: 5, backgroundColor: '#333', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: { width: '48%', backgroundColor: ObjectHasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#141414', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary + '50', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  badgeCardLocked: { borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333', shadowOpacity: 0, opacity: 0.7 },
  
  iconWrap: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  iconWrapUnlocked: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15 },
  iconWrapLocked: { backgroundColor: '#222' },
  
  badgeTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 5 },
  badgeDesc: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginBottom: 10, lineHeight: 16, height: 32 },
  
  progressRow: { backgroundColor: '#111', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  progressText: { color: COLORS.primary, fontSize: 12, fontWeight: '800' }
});
