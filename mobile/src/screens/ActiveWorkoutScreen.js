import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';
import RestTimer from '../components/RestTimer';

export default function ActiveWorkoutScreen({ route, navigation }) {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const { exercise } = route.params;
  
  // Array of booleans representing whether a set is completed
  const [setsCompleted, setSetsCompleted] = useState(Array(exercise.sets).fill(false));
  const [showRestTimer, setShowRestTimer] = useState(false);

  const toggleSet = (index) => {
    const newSets = [...setsCompleted];
    newSets[index] = !newSets[index];
    setSetsCompleted(newSets);

    // If marked as true (completed), show the rest timer
    if (newSets[index] === true) {
      setShowRestTimer(true);
    }
  };

  const openVideo = () => {
    if (exercise.videoUrl) {
      Linking.openURL(exercise.videoUrl);
    }
  };

  const allDone = setsCompleted.every(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Виконання</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: exercise.imageUrl || 'https://via.placeholder.com/400x200' }} style={styles.image} />
        
        <Text style={styles.title}>{exercise.title}</Text>
        <Text style={styles.description}>{exercise.description}</Text>

        {exercise.videoUrl && (
          <TouchableOpacity style={styles.videoBtn} onPress={openVideo}>
            <Ionicons name="logo-youtube" size={20} color="#ffffff" />
            <Text style={styles.videoBtnText}>Дивитися техніку (Відео)</Text>
          </TouchableOpacity>
        )}

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Підходи</Text>
            <Text style={styles.statValue}>{exercise.sets}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Повторення</Text>
            <Text style={styles.statValue}>{exercise.reps}</Text>
          </View>
        </View>

        {showRestTimer && !allDone && (
          <View style={{ marginTop: 20 }}>
            <RestTimer initialSeconds={60} onComplete={() => setShowRestTimer(false)} />
            <TouchableOpacity onPress={() => setShowRestTimer(false)} style={styles.closeTimerBtn}>
               <Text style={styles.closeTimerText}>Сховати таймер</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.setsContainer}>
          <Text style={styles.setsTitle}>Відмітьте підходи:</Text>
          {setsCompleted.map((isComplete, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.setRow, isComplete && styles.setRowCompleted]} 
              onPress={() => toggleSet(index)}
            >
              <Text style={[styles.setText, isComplete && styles.setTextCompleted]}>Підхід {index + 1}</Text>
              <View style={[styles.checkCircle, isComplete && styles.checkCircleCompleted]}>
                {isComplete && <Ionicons name="checkmark" size={18} color="#ffffff" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {allDone && (
          <View style={styles.successBox}>
            <Ionicons name="trophy" size={40} color="#ffaa00" />
            <Text style={styles.successTitle}>Вправа виконана!</Text>
            <TouchableOpacity style={styles.finishBtn} onPress={() => navigation.goBack()}>
               <Text style={styles.finishBtnText}>Повернутись до списку</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { padding: 5 },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  image: { width: '100%', height: 200, borderRadius: 15, marginBottom: 20 },
  title: { color: COLORS.primary, fontSize: 26, fontWeight: '900', marginBottom: 10 },
  description: { color: COLORS.muted, fontSize: 16, lineHeight: 22, marginBottom: 20 },
  videoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e52d27', padding: 12, borderRadius: 10, justifyContent: 'center', marginBottom: 20, gap: 10 },
  videoBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  statsCard: { flexDirection: 'row', backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1a1a1a', borderRadius: 15, padding: 20, justifyContent: 'space-around', borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  statItem: { alignItems: 'center' },
  statLabel: { color: COLORS.muted, fontSize: 14, marginBottom: 5 },
  statValue: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  closeTimerBtn: { marginTop: 10, alignItems: 'center' },
  closeTimerText: { color: COLORS.error, fontSize: 14, fontWeight: 'bold' },
  setsContainer: { marginTop: 30 },
  setsTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#141414', padding: 20, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  setRowCompleted: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  setText: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  setTextCompleted: { color: '#ffffff' }, // Always white on primary background
  checkCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  checkCircleCompleted: { borderColor: '#ffffff' },
  successBox: { marginTop: 30, alignItems: 'center', padding: 20, backgroundColor: 'rgba(255, 170, 0, 0.1)', borderRadius: 15, borderWidth: 1, borderColor: '#ffaa00' },
  successTitle: { color: '#ffaa00', fontSize: 22, fontWeight: 'bold', marginTop: 10, marginBottom: 20 },
  finishBtn: { backgroundColor: '#ffaa00', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  finishBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
