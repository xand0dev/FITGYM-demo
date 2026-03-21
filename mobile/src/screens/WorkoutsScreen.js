import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../constants/theme';
import ExerciseCard from '../components/ExerciseCard';
import RestTimer from '../components/RestTimer';
import HIITTimer from '../components/HIITTimer';
import TempoTrainer from '../components/TempoTrainer';

const MOCK_EXERCISES = [
  { id: '1', title: 'Жим лежачи', description: 'Базова вправа на грудні м\'язи. Опускайте штангу до рівня сосків і витискайте вгору, не відриваючи таз.', sets: 4, reps: 10, imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop', videoUrl: 'https://www.youtube.com/watch?v=tuwHzzPdaGc' },
  { id: '2', title: 'Присідання зі штангою', description: 'Базова вправа на ноги. Тримайте спину рівною, присідайте до паралелі стегон з підлогою або нижче.', sets: 4, reps: 12, imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop', videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8' },
  { id: '3', title: 'Станова тяга', description: 'Вправа для розвитку м\'язів спини та ніг. Рух починається з розгинання ніг, потім розгинання спини.', sets: 3, reps: 8, imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop', videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q' },
];

export default function WorkoutsScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const [activeTab, setActiveTab] = useState('exercises'); // exercises, timers

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Мої тренування</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('exercises')} style={[styles.tab, activeTab === 'exercises' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'exercises' && styles.activeTabText]}>Вправи</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('timers')} style={[styles.tab, activeTab === 'timers' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'timers' && styles.activeTabText]}>Таймери</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'exercises' ? (
        <FlatList
          data={MOCK_EXERCISES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExerciseCard {...item} />}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
             <Text style={styles.subtitle}>Вправи на сьогодні</Text>
          )}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          <Text style={styles.subtitle}>Інструменти часу</Text>
          <RestTimer initialSeconds={60} />
          <HIITTimer />
          <TempoTrainer />
          <View style={{height: 40}} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 40 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  tabsContainer: { paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#222', alignItems: 'center' },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontWeight: '600', fontSize: 16 },
  activeTabText: { color: COLORS.text, fontWeight: 'bold' },
  subtitle: { color: COLORS.text, fontSize: 20, fontWeight: '600', marginTop: 10, marginBottom: 15 }, // changed from #fff to COLORS.text for white theme compatibility
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
});
