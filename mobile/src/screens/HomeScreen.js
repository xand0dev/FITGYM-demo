import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const navigation = useNavigation();
  
  const [waterAmount, setWaterAmount] = useState(0); // in ml
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [userName, setUserName] = useState('');
  const dailyGoal = 2500; // 2.5L

  // Chart data
  const chartData = {
    labels: ['Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    datasets: [
      {
        data: [72.5, 72.3, 72.1, 71.8, 71.9, 71.5, 71.2],
        color: (opacity = 1) => `rgba(224, 255, 79, ${opacity})`,
        strokeWidth: 3
      }
    ],
    legend: ["Зміна ваги (кг)"]
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadAll = async () => {
        setIsLoading(true);
        try {
          // Fetch logic for upcoming class & profile parallel
          const [scheduleRes, meRes] = await Promise.all([
            apiClient.get('/schedule/').catch(() => ({ data: [] })),
            apiClient.get('/me/').catch(() => ({ data: null }))
          ]);

          if (isActive) {
            // Schedule processing
            if (scheduleRes.data && scheduleRes.data.length > 0) {
              const now = new Date();
              const upcoming = scheduleRes.data.filter(session => new Date(session.start_at) > now);
              if (upcoming.length > 0) {
                setUpcomingClass(upcoming[0]);
              } else {
                setUpcomingClass(null);
              }
            }

            // Name
            if (meRes.data && meRes.data.full_name) {
              setUserName(meRes.data.full_name.split(' ')[0]);
            }
          }
        } catch (e) {
          console.log('Error dashboard data', e);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      loadAll();
      loadWater();

      return () => { isActive = false; };
    }, [])
  );
  
  const [isLoading, setIsLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброго ранку';
    if (hour < 18) return 'Доброго дня';
    return 'Доброго вечора';
  };

  const loadWater = async () => {
    try {
      const today = new Date().toDateString();
      const saved = await SecureStore.getItemAsync('waterTracker');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.date === today) {
          setWaterAmount(data.amount);
        } else {
          // New day, reset water
          setWaterAmount(0);
          saveWater(0, today);
        }
      }
    } catch (e) {
      console.log('Error loading water', e);
    }
  };

  const saveWater = async (amount, dateString) => {
    try {
      await SecureStore.setItemAsync('waterTracker', JSON.stringify({ amount, date: dateString }));
    } catch (e) {
      console.log('Error saving water', e);
    }
  };

  const addWater = (ml) => {
    const today = new Date().toDateString();
    const newAmount = waterAmount + ml;
    setWaterAmount(newAmount);
    saveWater(newAmount, today);
  };

  const resetWater = () => {
    const today = new Date().toDateString();
    setWaterAmount(0);
    saveWater(0, today);
  };

  const progressPercent = Math.min((waterAmount / dailyGoal) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()},{userName ? `\n${userName}!` : ' Чемпіоне!'} 👋</Text>
          <Text style={styles.subtitle}>Ось твій прогрес на сьогодні.</Text>
        </View>

        {/* --- QUICK ACTIONS --- */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Workouts')}>
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(224, 255, 79, 0.15)' }]}>
              <Ionicons name="calendar-outline" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Розклад</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Membership')}>
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(0, 191, 255, 0.15)' }]}>
              <Ionicons name="card-outline" size={26} color="#00bfff" />
            </View>
            <Text style={styles.actionText}>Абонемент</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Education')}>
             <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(255, 105, 180, 0.15)' }]}>
              <Ionicons name="book-outline" size={26} color="#ff69b4" />
            </View>
            <Text style={styles.actionText}>Довідник</Text>
          </TouchableOpacity>
        </View>

        {/* --- TODAY'S ACTION --- */}
        <TouchableOpacity style={styles.upcomingCard} onPress={() => {
            if(upcomingClass) {
              const startDate = new Date(upcomingClass.start_at);
              const parsedTime = startDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
              const parsedDate = startDate.toLocaleDateString('uk-UA');
              navigation.navigate('ClassDetails', { classItem: { ...upcomingClass, parsedTime, parsedDate }});
            } else {
              navigation.navigate('Workouts');
            }
          }} activeOpacity={0.8}>
           <View style={{flex: 1}}>
              <Text style={styles.upcomingBadgeText}>Найближче заняття</Text>
              <Text style={styles.upcomingTitle}>
                {upcomingClass ? upcomingClass.class_name : 'Наразі немає занять'}
              </Text>
              {upcomingClass && (
                 <Text style={styles.upcomingTime}>
                    Сьогодні о {new Date(upcomingClass.start_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                 </Text>
              )}
           </View>
           <View style={styles.upcomingIconCircle}>
              <Ionicons name="arrow-forward" size={24} color={Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a'} />
           </View>
        </TouchableOpacity>

        {/* --- WATER TRACKER --- */}
        <View style={styles.activityRow}>
           <View style={[styles.card, styles.halfCard]}>
              <Text style={styles.cardTitleSm}>Гідратація</Text>
              
              <View style={styles.ringCenterWrap}>
                <ProgressChart
                  data={{ data: [progressPercent / 100] }}
                  width={120}
                  height={120}
                  strokeWidth={14}
                  radius={45}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientToOpacity: 0,
                    color: (opacity = 1) => `rgba(0, 191, 255, ${opacity})`,
                  }}
                  hideLegend={true}
                  style={styles.ringChart}
                />
                <View style={styles.ringLabelWrap}>
                   <Ionicons name="water" size={28} color="#00bfff" />
                </View>
              </View>

              <Text style={[styles.waterAmount, {textAlign: 'center'}]}>{waterAmount} <Text style={styles.waterUnit}>/ {dailyGoal}</Text></Text>
              
              <View style={styles.waterButtonsRow}>
                <TouchableOpacity style={styles.waterBtn} onPress={() => addWater(250)}>
                  <Text style={styles.waterBtnText}>+250</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.waterBtn} onPress={() => addWater(500)}>
                  <Text style={styles.waterBtnText}>+500</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={resetWater} style={{alignItems: 'center', marginTop: 10}}>
                <Text style={{color: COLORS.muted, fontSize: 12}}>Скинути</Text>
              </TouchableOpacity>
           </View>
           
           <View style={{width: 15}} />
           
           <View style={[styles.card, styles.halfCard, {justifyContent: 'center', alignItems: 'center'}]}>
              <Text style={styles.cardTitleSm}>Активність</Text>
              <Ionicons name="flame" size={50} color={COLORS.primary} style={{opacity: 0.8, marginVertical: 20}} />
              <Text style={{color: COLORS.text, fontWeight: '800', fontSize: 24}}>350</Text>
              <Text style={{color: COLORS.muted, fontSize: 12}}>ккал спалено</Text>
           </View>
        </View>

        {/* --- WEIGHT PROGRESS CHART --- */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, { marginBottom: 15 }]}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="trending-down" size={24} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Твоя Вага</Text>
            </View>
          </View>
          
          <LineChart
            data={chartData}
            width={screenWidth - 80}
            height={220}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              decimalPlaces: 1,
              color: (opacity = 1) => COLORS.primary,
              labelColor: (opacity = 1) => COLORS.muted,
              style: { borderRadius: 16 },
              propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.primary }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }}
            withInnerLines={false}
            withOuterLines={false}
          />
        </View>



        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20 },
  header: { paddingTop: 40, paddingBottom: 25 },
  greeting: { color: COLORS.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: COLORS.muted, fontSize: 16, marginTop: 8 },
  
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  actionBtn: { alignItems: 'center', width: '30%' },
  actionIconWrap: { width: 65, height: 65, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },

  upcomingCard: { backgroundColor: COLORS.primary, borderRadius: 24, padding: 25, marginBottom: 25, flexDirection: 'row', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  upcomingBadgeText: { color: 'rgba(0,0,0,0.6)', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', marginBottom: 5, letterSpacing: 1 },
  upcomingTitle: { color: '#000', fontSize: 22, fontWeight: '900', marginBottom: 6 },
  upcomingTime: { color: 'rgba(0,0,0,0.8)', fontSize: 15, fontWeight: '700' },
  upcomingIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },

  activityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  halfCard: { flex: 1, marginBottom: 0, padding: 15 },
  
  card: { backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a', borderRadius: 24, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  cardTitleSm: { color: COLORS.text, fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  
  ringCenterWrap: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  ringChart: { margin: 0, padding: 0 },
  ringLabelWrap: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  
  waterAmount: { color: COLORS.text, fontSize: 22, fontWeight: '900', marginTop: 10, marginBottom: 15 },
  waterUnit: { fontSize: 14, color: COLORS.muted, fontWeight: 'bold' },
  
  waterButtonsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  waterBtn: { flex: 1, backgroundColor: 'rgba(0, 191, 255, 0.15)', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  waterBtnText: { color: '#00bfff', fontSize: 14, fontWeight: '800' }
});