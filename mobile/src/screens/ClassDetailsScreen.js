import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, ScrollView, Dimensions, Platform, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../api/client';

const { width, height } = Dimensions.get('window');

const getHeroImage = (className) => {
  if (!className) return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop';
  const name = className.toLowerCase();
  if (name.includes('йог') || name.includes('yoga')) return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop';
  if (name.includes('крос')) return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop';
  if (name.includes('сайкл') || name.includes('cycl')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop';
  if (name.includes('бокс')) return 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop'; // fallback
};

export default function ClassDetailsScreen() {
  const ObjectHasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  const COLORS = useTheme();
  const styles = getStyles(COLORS, ObjectHasOwn);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { classItem } = route.params;
  const [isBooking, setIsBooking] = useState(false);

  const handleBook = async () => {
    Vibration.vibrate([0, 40, 40, 40]);
    try {
      setIsBooking(true);
      await apiClient.post('/book/', { session: classItem.id });
      Alert.alert('Успіх', 'Успішно заброньовано!');
      navigation.goBack();
    } catch (error) {
      const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      Alert.alert('Помилка', `Не вдалося забронювати: ${msg}`);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        <ImageBackground 
          source={{ uri: getHeroImage(classItem.class_name) }}
          style={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <TouchableOpacity style={styles.backBtnWrapper} onPress={() => navigation.goBack()}>
              <View style={styles.blurCircle}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View style={styles.contentSheet}>
          <View style={styles.tagWrap}>
            <Text style={styles.tag}>{classItem.room_name || 'Основний зал'}</Text>
          </View>
          
          <Text style={styles.title}>{classItem.class_name}</Text>
          
          <View style={styles.instructorCard}>
             <View style={styles.instructorAvatar}>
               <Text style={styles.instructorInitials}>
                 {classItem.instructor_name ? classItem.instructor_name.charAt(0) : 'F'}
               </Text>
             </View>
             <View>
               <Text style={styles.instructorLabel}>Тренер</Text>
               <Text style={styles.instructorName}>{classItem.instructor_name || 'Команда FITGYM'}</Text>
             </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={styles.statIconBox}><Ionicons name="calendar-outline" size={24} color={COLORS.primary} /></View>
              <Text style={styles.statValue}>{classItem.parsedDate}</Text>
              <Text style={styles.statLabel}>Дата</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statIconBox}><Ionicons name="time-outline" size={24} color={COLORS.primary} /></View>
              <Text style={styles.statValue}>{classItem.parsedTime}</Text>
              <Text style={styles.statLabel}>Час</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statIconBox}><Ionicons name="people-outline" size={24} color={COLORS.primary} /></View>
              <Text style={styles.statValue}>{classItem.capacity} місць</Text>
              <Text style={styles.statLabel}>Всього</Text>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Про заняття</Text>
          <Text style={styles.descriptionText}>
             Запрошуємо вас на {classItem.class_name ? classItem.class_name.toLowerCase() : 'це тренування'}. Це чудова можливість покращити свою форму та досягти неймовірних результатів під керівництвом {classItem.instructor_name || 'наших професіоналів'}. Не забудьте взяти воду та рушник!
          </Text>

        </View>
      </ScrollView>

      {/* Floating Action Button Footer */}
      <View style={styles.fabContainer}>
         <TouchableOpacity 
            style={[styles.fabBtn, isBooking && { opacity: 0.7 }]}
            onPress={handleBook}
            disabled={isBooking}
         >
           {isBooking ? (
             <ActivityIndicator color={COLORS.background} />
           ) : (
             <Text style={styles.fabBtnText}>ЗАБРОНЮВАТИ МІСЦЕ</Text>
           )}
         </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (COLORS, ObjectHasOwn) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroImage: { width: '100%', height: height * 0.45, justifyContent: 'space-between' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  backBtnWrapper: { alignSelf: 'flex-start' },
  blurCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  
  contentSheet: { flex: 1, backgroundColor: COLORS.background, marginTop: -40, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25 },
  tagWrap: { alignSelf: 'flex-start', backgroundColor: ObjectHasOwn(COLORS, 'darkerCard') ? COLORS.darkerCard : COLORS.primary + '20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 15 },
  tag: { color: COLORS.primary, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: COLORS.text, fontSize: 34, fontWeight: '900', marginBottom: 25, letterSpacing: -1 },
  
  instructorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1A1A1A', padding: 15, borderRadius: 20, marginBottom: 30, borderWidth: 1, borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  instructorAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  instructorInitials: { color: '#000', fontSize: 20, fontWeight: '900' },
  instructorLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  instructorName: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: ObjectHasOwn(COLORS, 'cardBackground') ? COLORS.cardBackground : '#1A1A1A', paddingVertical: 20, borderRadius: 20, marginHorizontal: 5, borderWidth: 1, borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#333' },
  statIconBox: { marginBottom: 10 },
  statValue: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  
  sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 15 },
  descriptionText: { color: COLORS.muted, fontSize: 16, lineHeight: 24 },
  
  fabContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 25, backgroundColor: COLORS.background, borderTopWidth: 1, borderColor: ObjectHasOwn(COLORS, 'border') ? COLORS.border : '#222' },
  fabBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  fabBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});
