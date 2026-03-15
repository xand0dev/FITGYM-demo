import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../api/client';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [classesData, setClassesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/schedule/');
      setClassesData(response.data);
    } catch (error) {
      console.log('Помилка завантаження розкладу:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Фільтрація по сутності ClassSession
  const filteredData = classesData.filter(item => {
    const searchString = searchQuery.toLowerCase();
    const className = item.class_name ? item.class_name.toLowerCase() : '';
    const instructorName = item.instructor_name ? item.instructor_name.toLowerCase() : '';
    
    return className.includes(searchString) || instructorName.includes(searchString);
  });

  const renderItem = ({ item }) => {
    const startDate = new Date(item.start_at);
    const endDate = new Date(item.end_at);
    
    const timeString = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    const dateString = startDate.toLocaleDateString('uk-UA');

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ClassDetails', { classItem: { ...item, parsedTime: timeString, parsedDate: dateString } })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.class_name}</Text>
          <View style={styles.intensityBadge}>
             {/* Замість інтенсивності виводимо місткість для прикладу або просто тег */}
            <Text style={styles.intensityText}>Місць: {item.capacity}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>{dateString} {timeString}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={COLORS.muted} />
            <Text style={styles.infoText}>{item.instructor_name || 'Без тренера'}</Text>
          </View>
          {item.room_name && (
            <View style={[styles.infoRow, { marginTop: 5 }]}>
              <Ionicons name="location-outline" size={16} color={COLORS.muted} />
              <Text style={styles.infoText}>{item.room_name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Привіт, Спортсмене!</Text>
        <Text style={styles.subtitle}>Твоє наступне тренування чекає.</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Пошук тренувань або тренера..."
          placeholderTextColor={COLORS.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>Розклад занять</Text>
      
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {classesData.length === 0 ? 'Розклад порожній (немає зв\'язку з БД або сесій).' : 'Занять не знайдено.'}
            </Text>
          }
          refreshing={isLoading}
          onRefresh={fetchSchedule}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.card },
  greeting: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: COLORS.primary, fontSize: 14, marginTop: 5, fontWeight: '600' },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, color: COLORS.text, fontSize: 16 },
  
  sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', flex: 1 },
  intensityBadge: { backgroundColor: 'rgba(230, 0, 0, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, marginLeft: 10 },
  intensityText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  
  cardBody: { flexDirection: 'column' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoText: { color: COLORS.muted, fontSize: 14, fontWeight: '500' },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: 40, fontSize: 16 }
});