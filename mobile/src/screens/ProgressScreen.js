import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, ScrollView, SafeAreaView,
  TouchableOpacity, TextInput, Modal
} from 'react-native';
import Alert from '../utils/dialog';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import SkeletonLoader from '../components/SkeletonLoader';
import { getWeightLog, addWeightEntry, getLastN } from '../utils/weightStorage';

const screenWidth = Dimensions.get('window').width;

const DAY_LABELS = ['Нд', 'Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function ProgressScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [weightLog, setWeightLog] = useState([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [bookingsRes, wLog] = await Promise.all([
        apiClient.get('/my-bookings/').catch(() => ({ data: [] })),
        getWeightLog(),
      ]);
      setBookings(bookingsRes.data || []);
      setWeightLog(wLog);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleAddWeight = async () => {
    const val = parseFloat(weightInput.replace(',', '.'));
    if (!val || val < 20 || val > 300) {
      Alert.alert('Помилка', 'Введіть коректну вагу (20–300 кг)');
      return;
    }
    const updated = await addWeightEntry(val);
    setWeightLog(updated);
    setWeightInput('');
    setShowWeightModal(false);
  };

  // ── Aggregate bookings by weekday ──────────────────────────────────────────
  const dayCount = [0, 0, 0, 0, 0, 0, 0];
  bookings.forEach(b => {
    const start = b.session?.start_at;
    if (start) dayCount[new Date(start).getDay()]++;
  });
  // Re-order Mon–Sun for display
  const barData = [1, 2, 3, 4, 5, 6, 0].map(d => dayCount[d]);
  const barLabels = ['Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  const attendedCount = bookings.filter(b => b.status === 'attended' || b.status === 'booked').length;
  const totalCount = bookings.length;

  // ── Weight chart ───────────────────────────────────────────────────────────
  const last7 = getLastN(weightLog, 7);
  const weightValues = last7.length >= 2 ? last7.map(e => e.value) : [0, 0];
  const weightLabels = last7.length >= 2
    ? last7.map(e => e.date.slice(5)) // MM-DD
    : ['—', '—'];

  const chartConfig = {
    backgroundGradientFrom: COLORS.card,
    backgroundGradientTo: COLORS.card,
    color: (opacity = 1) => COLORS.primary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: () => COLORS.muted,
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 20, paddingTop: 40 }}>
          <SkeletonLoader width={screenWidth - 40} height={40} borderRadius={8} />
          <View style={{ height: 20 }} />
          <SkeletonLoader width={screenWidth - 40} height={220} borderRadius={16} />
          <View style={{ height: 20 }} />
          <SkeletonLoader width={screenWidth - 40} height={220} borderRadius={16} />
          <View style={{ height: 20 }} />
          <SkeletonLoader width={screenWidth - 40} height={80} borderRadius={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorWrap}>
          <Ionicons name="cloud-offline-outline" size={56} color={COLORS.muted} />
          <Text style={styles.errorText}>Не вдалося завантажити дані</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Спробувати знову</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Моя статистика</Text>
        </View>

        {/* Weight chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Динаміка ваги (кг)</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowWeightModal(true)}>
              <Ionicons name="add" size={18} color={COLORS.primary} />
              <Text style={styles.addBtnText}>Записати</Text>
            </TouchableOpacity>
          </View>
          {last7.length >= 2 ? (
            <LineChart
              data={{ labels: weightLabels, datasets: [{ data: weightValues, color: () => COLORS.primary, strokeWidth: 2 }] }}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons name="scale-outline" size={36} color={COLORS.muted} />
              <Text style={styles.emptyText}>Додайте перший запис ваги</Text>
            </View>
          )}
        </View>

        {/* Regularity bar chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Регулярність (за тижнями)</Text>
          <BarChart
            style={styles.chart}
            data={{ labels: barLabels, datasets: [{ data: barData }] }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{ ...chartConfig, color: () => COLORS.primary }}
            verticalLabelRotation={0}
            fromZero
          />
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{attendedCount}</Text>
            <Text style={styles.statLabel}>Тренувань всього</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Бронювань всього</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add weight modal */}
      <Modal visible={showWeightModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Записати вагу</Text>
            <TextInput
              style={styles.weightInput}
              placeholder="Наприклад: 72.5"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
              value={weightInput}
              onChangeText={setWeightInput}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowWeightModal(false)}>
                <Text style={styles.modalCancelText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleAddWeight}>
                <Text style={styles.modalConfirmText}>Зберегти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingTop: 40 },
  header: { marginBottom: 20 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },

  chartContainer: {
    marginBottom: 30,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  chartTitle: { color: COLORS.muted, fontSize: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  chart: { borderRadius: 16 },

  emptyChart: { height: 150, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyText: { color: COLORS.muted, fontSize: 14 },

  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: COLORS.primary, fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  statLabel: { color: COLORS.muted, fontSize: 12, textAlign: 'center' },

  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 40 },
  errorText: { color: COLORS.muted, fontSize: 16, textAlign: 'center' },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#fff', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28 },
  modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 20 },
  weightInput: {
    backgroundColor: COLORS.background,
    color: COLORS.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  modalCancelText: { color: COLORS.muted, fontWeight: '600' },
  modalConfirmBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontWeight: '700' },
});
