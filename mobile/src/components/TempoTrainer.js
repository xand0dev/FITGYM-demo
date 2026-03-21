import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';

export default function TempoTrainer() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const [eccentric, setEccentric] = useState('3'); // down phase
  const [pause, setPause] = useState('1'); // pause bottom
  const [concentric, setConcentric] = useState('1'); // up phase
  
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('eccentric'); // eccentric, pause, concentric
  const [timeLeft, setTimeLeft] = useState(parseInt(eccentric));

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (currentPhase === 'eccentric') {
        setCurrentPhase('pause');
        setTimeLeft(parseInt(pause, 10));
      } else if (currentPhase === 'pause') {
        setCurrentPhase('concentric');
        setTimeLeft(parseInt(concentric, 10));
      } else if (currentPhase === 'concentric') {
        // Complete one rep -> Start over
        setCurrentPhase('eccentric');
        setTimeLeft(parseInt(eccentric, 10));
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentPhase]);

  const toggleTimer = () => {
    if (!isActive && currentPhase === 'eccentric' && timeLeft === parseInt(eccentric)) {
      // Starting fresh
      setTimeLeft(parseInt(eccentric, 10));
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setCurrentPhase('eccentric');
    setTimeLeft(parseInt(eccentric, 10));
  };

  const getPhaseText = () => {
    if (currentPhase === 'eccentric') return "СПУСК";
    if (currentPhase === 'pause') return "ПАУЗА";
    if (currentPhase === 'concentric') return "ПІДЙОМ";
    return "";
  };

  const getPhaseColor = () => {
    if (currentPhase === 'eccentric') return '#ffbf00'; // orange
    if (currentPhase === 'pause') return '#ff3333'; // red
    if (currentPhase === 'concentric') return '#33cc33'; // green
    return COLORS.primary;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Метроном (Темп)</Text>
      
      {!isActive && currentPhase === 'eccentric' && timeLeft === parseInt(eccentric, 10) ? (
        <View style={styles.setupContainer}>
           <Text style={{color: COLORS.muted, textAlign: 'center', marginBottom: 15, fontSize: 12}}>Спуск - Пауза - Підйом</Text>
           <View style={{flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20}}>
             <TextInput style={styles.input} keyboardType="numeric" value={eccentric} onChangeText={setEccentric} />
             <Text style={styles.separator}>-</Text>
             <TextInput style={styles.input} keyboardType="numeric" value={pause} onChangeText={setPause} />
             <Text style={styles.separator}>-</Text>
             <TextInput style={styles.input} keyboardType="numeric" value={concentric} onChangeText={setConcentric} />
           </View>
        </View>
      ) : (
        <View style={styles.activeContainer}>
          <View style={[styles.phaseCircle, { borderColor: getPhaseColor() }]}>
            <Text style={styles.phaseLabel}>{getPhaseText()}</Text>
            <Text style={styles.timer}>{timeLeft}</Text>
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
  title: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  setupContainer: { width: '100%', marginBottom: 10 },
  input: { backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#141414', borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333', color: COLORS.text, width: 60, height: 60, borderRadius: 30, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
  separator: { color: COLORS.muted, fontSize: 24, alignSelf: 'center' },
  activeContainer: { alignItems: 'center', marginVertical: 10 },
  phaseCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 6, alignItems: 'center', justifyContent: 'center' },
  phaseLabel: { color: COLORS.muted, fontSize: 14, letterSpacing: 1, marginBottom: 5 },
  timer: { color: COLORS.text, fontSize: 56, fontWeight: 'bold' },
  controls: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  mainButton: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, gap: 10 },
  mainButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  resetButton: { backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#333', padding: 12, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : 'transparent' }
});
