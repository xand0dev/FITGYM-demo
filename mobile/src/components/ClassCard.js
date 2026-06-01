import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../constants/theme';

export default function ClassCard({ session }) {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const navigation = useNavigation();

  // Parse dates
  const startDate = new Date(session.start_at);
  const parsedTime = startDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  const parsedDate = startDate.toLocaleDateString('uk-UA');

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ClassDetails', { 
        classItem: { ...session, parsedTime, parsedDate } 
      })}
    >
      <View style={styles.timeBox}>
        <Text style={styles.timeText} numberOfLines={1} adjustsFontSizeToFit>{parsedTime}</Text>
        <Text style={styles.dateText} numberOfLines={1} adjustsFontSizeToFit>{parsedDate}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{session.class_name}</Text>
        <Text style={styles.instructor}>
          <Ionicons name="person" size={12} /> {session.instructor_name || 'Вільний тренер'}
        </Text>
        <Text style={styles.room}>
          <Ionicons name="location" size={12} /> {session.room_name || 'Зал не вказано'}
        </Text>
      </View>
      <View style={styles.capacityBox}>
        <Ionicons name="people" size={16} color={COLORS.primary} />
        <Text style={styles.capacityText}>{session.capacity}</Text>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: Object.hasOwn(COLORS, 'border') ? 1 : 0,
    borderColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : 'transparent',
  },
  timeBox: {
    width: 85,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#333',
    paddingRight: 10,
    marginRight: 10,
  },
  timeText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  dateText: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  info: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  instructor: { fontSize: 14, color: COLORS.muted, marginBottom: 2 },
  room: { fontSize: 14, color: COLORS.muted },
  capacityBox: { alignItems: 'center', justifyContent: 'center', padding: 10 },
  capacityText: { color: COLORS.text, fontSize: 14, fontWeight: 'bold', marginTop: 4 },
});
