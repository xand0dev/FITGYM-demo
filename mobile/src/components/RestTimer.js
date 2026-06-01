import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';

export default function RestTimer({ initialSeconds = 60, onComplete }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const COLORS = useTheme();
  const styles = getStyles(COLORS);

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isActive && seconds === 0) {
      clearInterval(interval);
      setIsActive(false);
      if (onComplete) onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = (time) => {
    setSeconds(time);
    setIsActive(true);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Таймер відпочинку</Text>
      <Text style={styles.timer}>{formatTime(seconds)}</Text>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.presetButton} onPress={() => resetTimer(30)}>
          <Text style={styles.presetText}>30с</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presetButton} onPress={() => resetTimer(60)}>
          <Text style={styles.presetText}>1хв</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presetButton} onPress={() => resetTimer(120)}>
          <Text style={styles.presetText}>2хв</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.mainButton} onPress={toggleTimer}>
        <Ionicons name={isActive ? "pause" : "play"} size={24} color="#ffffff" />
        <Text style={styles.mainButtonText}>{isActive ? "Пауза" : "Старт"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : 'transparent',
  },
  title: {
    color: COLORS.muted,
    fontSize: 16,
    marginBottom: 10,
  },
  timer: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  presetButton: {
    backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : 'transparent',
  },
  presetText: {
    color: COLORS.text,
    fontSize: 16,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    gap: 10,
  },
  mainButtonText: {
    color: '#ffffff', // White text on primary button
    fontSize: 18,
    fontWeight: 'bold',
  },
});
