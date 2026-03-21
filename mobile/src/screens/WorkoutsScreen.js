import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../constants/theme';
import ClassCard from '../components/ClassCard';
import RestTimer from '../components/RestTimer';
import HIITTimer from '../components/HIITTimer';
import TempoTrainer from '../components/TempoTrainer';
import apiClient from '../api/client';

export default function WorkoutsScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const [activeTab, setActiveTab] = useState('schedule'); // schedule, timers
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchSchedule();
    }
  }, [activeTab]);

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/schedule/');
      // Відфільтровуємо минулі заняття
      const now = new Date();
      const upcoming = res.data.filter(session => new Date(session.start_at) > now);
      setSchedule(upcoming);
    } catch (e) {
      console.log('Error fetching schedule', e?.response?.data || e.message);
    } finally {
      setIsLoading(false);
    }
  };

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
        isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={schedule}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ClassCard session={item} />}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={() => (
               <Text style={styles.subtitle}>Актуальний розклад</Text>
            )}
            ListEmptyComponent={() => (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: COLORS.muted }}>Немає запланованих занять</Text>
              </View>
            )}
            refreshing={isLoading}
            onRefresh={fetchSchedule}
          />
        )
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
  subtitle: { color: COLORS.text, fontSize: 20, fontWeight: '600', marginTop: 10, marginBottom: 15 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
});
