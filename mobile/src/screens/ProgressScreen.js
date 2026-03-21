import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, SafeAreaView } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../constants/theme';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);

  const chartConfig = {
    backgroundGradientFrom: COLORS.card,
    backgroundGradientTo: COLORS.card,
    color: (opacity = 1) => COLORS.primary, // dynamically match primary, or just `rgba(255, 90, 95, ${opacity})`
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: (opacity = 1) => COLORS.muted,
  };

  const lineChartData = {
    labels: ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв'],
    datasets: [
      {
        data: [12000, 15000, 14000, 18000, 22000, 25000],
        color: (opacity = 1) => COLORS.primary,
        strokeWidth: 2
      }
    ],
    legend: ["Об'єм піднятої ваги (кг)"]
  };

  const barChartData = {
    labels: ["Пн", "Вв", "Ср", "Чт", "Пт", "Сб", "Нд"],
    datasets: [
      {
        data: [1, 0, 1, 1, 0, 1, 0] // Regularity (1 = trained, 0 = rest)
      }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Моя статистика</Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Прогрес ваги (останні 6 місяців)</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Регулярність (поточний тиждень)</Text>
          <BarChart
            style={styles.chart}
            data={barChartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => COLORS.text, // Dynamic color for bars based on text color
            }}
            verticalLabelRotation={0}
          />
        </View>
        
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Тренувань в місяць</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>25 т</Text>
            <Text style={styles.statLabel}>Тоннаж за місяць</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333'
  },
  chartTitle: {
    color: COLORS.muted,
    fontSize: 16,
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
  },
  chart: {
    borderRadius: 16,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333'
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});
