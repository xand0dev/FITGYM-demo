import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Vibration } from 'react-native';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import useAppStore from '../store/useAppStore';

const { width } = Dimensions.get('window');

export default function ActiveWorkoutScreen() {
  const ObjectHasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  const COLORS = useTheme();
  const styles = getStyles(COLORS, ObjectHasOwn);
  const navigation = useNavigation();
  const { streak, updateStreak } = useAppStore();

  const [timer, setTimer] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(true);
  const [calories, setCalories] = useState(0);
  const [heartRate, setHeartRate] = useState(85); // Mock heart rate

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
        
        // Mock calorie burn (approx 10 cal / min)
        if (timer > 0 && timer % 6 === 0) {
          setCalories(c => c + 1);
        }
        
        // Mock heart rate fluctuation
        if (timer % 3 === 0) {
          setHeartRate(Math.floor(Math.random() * (165 - 110 + 1)) + 110);
        }

      }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    setIsActive(false);
    Vibration.vibrate([0, 100, 50, 100]);
    updateStreak(); // Reward the user for finishing a workout
    navigation.navigate('Main'); // Or navigate to a dedicated "Workout Summary" screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Активне тренування</Text>
        <View style={styles.pulseDot} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.timerWrapper}>
          <AnimatedCircularProgress
            size={width * 0.7}
            width={15}
            fill={(timer % 60) * (100 / 60)}
            tintColor={COLORS.primary}
            backgroundColor={ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#222'}
            rotation={0}
            lineCap="round"
          >
            {
              () => (
                <View style={styles.timerInner}>
                  <Text style={styles.timerText}>{formatTime(timer)}</Text>
                  <Text style={styles.timerLabel}>МИНУЛО</Text>
                </View>
              )
            }
          </AnimatedCircularProgress>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={32} color="#ff4500" />
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>ККАЛ</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="heart" size={32} color="#ff0044" />
            <Text style={styles.statValue}>{heartRate}</Text>
            <Text style={styles.statLabel}>BPM</Text>
          </View>
        </View>

        <View style={styles.musicCard}>
          <Ionicons name="musical-notes" size={24} color={COLORS.primary} />
          <View style={{marginLeft: 15, flex: 1}}>
             <Text style={styles.musicTitle}>PHONK WORKOUT MIX</Text>
             <Text style={styles.musicSub}>Spotify Sync (Mock)</Text>
          </View>
          <Ionicons name="play-circle" size={36} color={COLORS.text} />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.controlBtn, {backgroundColor: isActive ? '#ffaa00' : COLORS.primary}]} 
          onPress={() => {
            Vibration.vibrate(30);
            setIsActive(!isActive);
          }}
        >
          <Ionicons name={isActive ? "pause" : "play"} size={28} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishText}>ЗАВЕРШИТИ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (COLORS, ObjectHasOwn) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#222'
  },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff0044', position: 'absolute', right: 20 },

  content: { padding: 20, alignItems: 'center' },
  
  timerWrapper: {
    marginVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  timerInner: { alignItems: 'center' },
  timerText: { color: COLORS.text, fontSize: 50, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerLabel: { color: COLORS.muted, fontSize: 14, fontWeight: '800', letterSpacing: 2, marginTop: 5 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  statCard: { 
    backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a', 
    borderRadius: 24, padding: 20, alignItems: 'center', width: '48%', 
    borderWidth: 1, borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333'
  },
  statValue: { color: COLORS.text, fontSize: 32, fontWeight: '900', marginTop: 10 },
  statLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 5 },

  musicCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a',
    borderRadius: 20, padding: 20, width: '100%',
    borderWidth: 1, borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333'
  },
  musicTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  musicSub: { color: COLORS.muted, fontSize: 13, marginTop: 4 },

  footer: { 
    flexDirection: 'row', padding: 20, paddingBottom: 40, 
    borderTopWidth: 1, borderTopColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#222',
    backgroundColor: COLORS.background 
  },
  controlBtn: { 
    width: 60, height: 60, borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center', marginRight: 15 
  },
  finishBtn: { 
    flex: 1, backgroundColor: '#ff0044', borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center' 
  },
  finishText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 }
});
