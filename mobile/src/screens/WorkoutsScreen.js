import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Vibration } from 'react-native';
import { useTheme } from '../constants/theme';
import ClassCard from '../components/ClassCard';
import RestTimer from '../components/RestTimer';
import HIITTimer from '../components/HIITTimer';
import TempoTrainer from '../components/TempoTrainer';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorView from '../components/ErrorView';
import apiClient from '../api/client';

export default function WorkoutsScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const [activeTab, setActiveTab] = useState('schedule');
  const [allSchedule, setAllSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate next 14 days
  const datesArray = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d;
  });

  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchSchedule();
    }
  }, [activeTab]);

  const fetchSchedule = async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      setHasError(false);
      const res = await apiClient.get('/schedule/');
      const now = new Date();
      const valid = res.data.filter(session => new Date(session.start_at) > now);
      setAllSchedule(valid);
    } catch (e) {
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredSchedule = allSchedule.filter(session => {
    // extract YYYY-MM-DD local time manually or from ISO
    const sDate = new Date(session.start_at);
    sDate.setMinutes(sDate.getMinutes() - sDate.getTimezoneOffset());
    return sDate.toISOString().split('T')[0] === selectedDate;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Групові заняття</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('schedule')} style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>Розклад</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('timers')} style={[styles.tab, activeTab === 'timers' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'timers' && styles.activeTabText]}>Таймери</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'schedule' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.calendarContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {datesArray.map((d, i) => {
                const dateStr = d.toISOString().split('T')[0];
                const isSelected = selectedDate === dateStr;
                const dayName = d.toLocaleDateString('uk-UA', { weekday: 'short' }).toUpperCase();
                const dayNum = d.getDate();
                return (
                  <TouchableOpacity 
                     key={i} 
                     style={[styles.dateCard, isSelected && styles.dateCardActive]}
                     onPress={() => {
                       Vibration.vibrate(30);
                       setSelectedDate(dateStr);
                     }}
                     activeOpacity={0.7}
                  >
                    <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{dayName}</Text>
                    <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{dayNum}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {hasError ? (
            <ErrorView onRetry={() => fetchSchedule()} />
          ) : isLoading ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
               {[1, 2, 3].map(i => (
                 <View key={i} style={{ backgroundColor: Object.hasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1A1A1A', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                       <SkeletonLoader width={100} height={20} />
                       <SkeletonLoader width={50} height={20} />
                    </View>
                    <SkeletonLoader width={200} height={24} style={{ marginBottom: 10 }} />
                    <SkeletonLoader width={120} height={16} style={{ marginBottom: 15 }} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                       <SkeletonLoader width={40} height={40} borderRadius={20} />
                       <View style={{ justifyContent: 'center', gap: 5 }}>
                          <SkeletonLoader width={80} height={14} />
                          <SkeletonLoader width={60} height={12} />
                       </View>
                    </View>
                 </View>
               ))}
            </View>
          ) : (
            <FlatList
              data={filteredSchedule}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <ClassCard session={item} />}
              contentContainerStyle={styles.listContainer}
              ListHeaderComponent={() => (
                 <Text style={styles.subtitle}>Розклад на вибраний день</Text>
              )}
              ListEmptyComponent={() => (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: COLORS.muted }}>На цей день немає запланованих занять</Text>
                </View>
              )}
              refreshing={isRefreshing}
              onRefresh={() => fetchSchedule(true)}
            />
          )}
        </View>
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
  
  calendarContainer: { marginBottom: 10, paddingBottom: 5 },
  dateCard: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 18, backgroundColor: Object.hasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : '#1A1A1A', marginRight: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  dateCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  dayName: { color: COLORS.muted, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  dayNameActive: { color: 'rgba(255,255,255,0.8)' },
  dayNum: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  dayNumActive: { color: '#ffffff' },

  subtitle: { color: COLORS.text, fontSize: 20, fontWeight: '600', marginTop: 10, marginBottom: 15 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
});
