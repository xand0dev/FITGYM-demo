import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const navigation = useNavigation();
  
  const [waterAmount, setWaterAmount] = useState(0); // in ml
  const [upcomingClass, setUpcomingClass] = useState(null);
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

  useEffect(() => {
    loadWater();
    fetchUpcomingClass();
  }, []);

  const fetchUpcomingClass = async () => {
    try {
      const res = await apiClient.get('/schedule/');
      if (res.data && res.data.length > 0) {
        const now = new Date();
        const upcoming = res.data.filter(session => new Date(session.start_at) > now);
        if (upcoming.length > 0) {
          setUpcomingClass(upcoming[0]); // First upcoming class
        } else {
          setUpcomingClass(null);
        }
      }
    } catch (e) {
      console.log('Error fetching upcoming class for home screen', e);
    }
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
          <Text style={styles.greeting}>Привіт, Чемпіоне! 👋</Text>
          <Text style={styles.subtitle}>Ось твій прогрес на сьогодні.</Text>
        </View>

        {/* --- WATER TRACKER --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="water" size={24} color="#00bfff" />
              <Text style={styles.cardTitle}>Трекер Води</Text>
            </View>
            <TouchableOpacity onPress={resetWater}>
              <Ionicons name="refresh" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.waterInfo}>
            <Text style={styles.waterAmount}>{waterAmount} <Text style={styles.waterUnit}>/ {dailyGoal} мл</Text></Text>
            <Text style={styles.waterPercent}>{Math.round(progressPercent)}%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.waterButtonsRow}>
            <TouchableOpacity style={styles.waterBtn} onPress={() => addWater(250)}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.waterBtnText}>250 мл</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterBtn} onPress={() => addWater(500)}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.waterBtnText}>500 мл</Text>
            </TouchableOpacity>
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
              backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a',
              backgroundGradientFrom: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a',
              backgroundGradientTo: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a',
              decimalPlaces: 1,
              color: (opacity = 1) => COLORS.text === '#000000' ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => COLORS.muted,
              style: { borderRadius: 16 },
              propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.primary }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }}
          />
        </View>

        {/* --- TODAY'S ACTION --- */}
        <View style={[styles.card, { backgroundColor: COLORS.primary }]}>
           <Text style={[styles.cardTitle, { color: '#000' }]}>Найближче Заняття</Text>
           <Text style={{ color: '#000', marginTop: 5, fontSize: 16, fontWeight: '500' }}>
             {upcomingClass ? `${upcomingClass.class_name} о ${new Date(upcomingClass.start_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}` : 'Наразі немає запланованих занять'}
           </Text>
           <TouchableOpacity 
              style={styles.startBtn} 
              onPress={() => {
                if(upcomingClass) {
                  const startDate = new Date(upcomingClass.start_at);
                  const parsedTime = startDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
                  const parsedDate = startDate.toLocaleDateString('uk-UA');
                  navigation.navigate('ClassDetails', { classItem: { ...upcomingClass, parsedTime, parsedDate }});
                } else {
                  navigation.navigate('Workouts');
                }
              }}
            >
             <Text style={styles.startBtnText}>{upcomingClass ? 'Деталі та запис' : 'Дивитись розклад'}</Text>
             <Ionicons name="arrow-forward" size={20} color="#fff" />
           </TouchableOpacity>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20 },
  header: { paddingTop: 40, paddingBottom: 20 },
  greeting: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 16, marginTop: 5 },
  card: { backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  waterInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 15, marginBottom: 10 },
  waterAmount: { color: COLORS.text, fontSize: 32, fontWeight: '900' },
  waterUnit: { fontSize: 16, color: COLORS.muted, fontWeight: 'normal' },
  waterPercent: { color: '#00bfff', fontSize: 24, fontWeight: 'bold' },
  progressBarBg: { width: '100%', height: 12, backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#333', borderRadius: 6, marginBottom: 20, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#00bfff', borderRadius: 6 },
  waterButtonsRow: { flexDirection: 'row', gap: 10 },
  waterBtn: { flex: 1, backgroundColor: 'rgba(0, 191, 255, 0.2)', paddingVertical: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(0, 191, 255, 0.5)' },
  waterBtnText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' }, // Adjusted text color mapped to theme
  startBtn: { backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, marginTop: 15, gap: 10 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});