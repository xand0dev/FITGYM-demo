import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';
import SecureStore from '../utils/storage';

export default function HIITTimer() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const [workTime, setWorkTime] = useState('40');
  const [restTime, setRestTime] = useState('20');
  const [rounds, setRounds] = useState('4');
  
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const saved = await SecureStore.getItemAsync('hiitPreset');
      if (saved) {
        const { w, r, rnds } = JSON.parse(saved);
        setWorkTime(w);
        setRestTime(r);
        setRounds(rnds);
      }
    } catch (e) {
      console.log('Error loading preset', e);
    }
  };

  const savePreset = async () => {
    try {
      await SecureStore.setItemAsync('hiitPreset', JSON.stringify({ w: workTime, r: restTime, rnds: rounds }));
      Alert.alert('Збережено', 'Пресет HIIT збережено локально');
    } catch (e) {
      console.log('Error saving preset', e);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Phase end logic
      if (isWorkPhase) {
        setIsWorkPhase(false);
        setTimeLeft(parseInt(restTime, 10));
      } else {
        if (currentRound < parseInt(rounds, 10)) {
          setCurrentRound(prev => prev + 1);
          setIsWorkPhase(true);
          setTimeLeft(parseInt(workTime, 10));
        } else {
          // Finished
          setIsActive(false);
          Alert.alert('Тренування завершено!', 'Чудова робота! 🚀');
        }
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWorkPhase, currentRound]);

  const toggleTimer = () => {
    if (!isActive && timeLeft === 0 && currentRound === 1) {
      setTimeLeft(parseInt(workTime, 10));
      setIsWorkPhase(true);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsWorkPhase(true);
    setCurrentRound(1);
    setTimeLeft(parseInt(workTime, 10));
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HIIT Таймер</Text>
      
      {!isActive && timeLeft === 0 && currentRound === 1 ? (
        <View style={styles.setupContainer}>
          <View style={styles.inputRow}>
            <Text style={styles.label}>Робота (с)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={workTime} onChangeText={setWorkTime} />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.label}>Відпочинок (с)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={restTime} onChangeText={setRestTime} />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.label}>Раунди</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={rounds} onChangeText={setRounds} />
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={savePreset}>
            <Text style={styles.saveBtnText}>Зберегти пресет</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.activeContainer}>
          <Text style={styles.roundText}>Раунд {currentRound} / {rounds}</Text>
          <View style={[styles.phaseCircle, { borderColor: isWorkPhase ? COLORS.primary : '#00bfff' }]}>
            <Text style={styles.phaseLabel}>{isWorkPhase ? 'РОБОТА' : 'ВІДПОЧИНОК'}</Text>
            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.mainButton} onPress={toggleTimer}>
          <Ionicons name={isActive ? "pause" : "play"} size={24} color="#ffffff" />
          <Text style={styles.mainButtonText}>{isActive ? "Пауза" : "Старт"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
          <Ionicons name="refresh" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { backgroundColor: COLORS.card, padding: 20, borderRadius: 16, alignItems: 'center', marginVertical: 10, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : 'transparent' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  setupContainer: { width: '100%', marginBottom: 20 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { color: COLORS.muted, fontSize: 16 },
  input: { backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#141414', borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', color: COLORS.text, width: 80, padding: 10, borderRadius: 8, textAlign: 'center' },
  saveBtn: { marginTop: 10, alignItems: 'center', padding: 10 },
  saveBtnText: { color: 'dodgerblue', fontSize: 14, fontWeight: 'bold' },
  activeContainer: { alignItems: 'center', marginVertical: 20 },
  roundText: { color: COLORS.muted, fontSize: 16, marginBottom: 15 },
  phaseCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: 8, alignItems: 'center', justifyContent: 'center' },
  phaseLabel: { color: COLORS.muted, fontSize: 14, letterSpacing: 2, marginBottom: 5 },
  timer: { color: COLORS.text, fontSize: 48, fontWeight: 'bold' },
  controls: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  mainButton: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, gap: 10 },
  mainButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  resetButton: { backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#333', padding: 12, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : 'transparent' }
});
