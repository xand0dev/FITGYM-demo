import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../constants/theme';

export default function ExerciseCard({ title, description, imageUrl, sets, reps, videoUrl }) {
  const COLORS = useTheme();
  const styles = getStyles(COLORS);
  const navigation = useNavigation();

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.image} 
      />
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="repeat" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>{sets} підходів</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="barbell" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>{reps} повторень</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.playButton} 
        onPress={() => navigation.navigate('ActiveWorkout', { 
          exercise: { title, description, imageUrl, sets, reps, videoUrl } 
        })}
      >
        <Ionicons name="play-circle" size={40} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
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
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  playButton: {
    padding: 10,
  },
});
